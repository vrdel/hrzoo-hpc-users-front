from .models import UserProject
from backend import models
from backend.caching import invalidation
from backend.utils.gen_username import gen_username
from django.conf import settings
from django.db.models.signals import post_delete, post_save, pre_delete, pre_save
from django.dispatch import receiver
import logging

logger = logging.getLogger('hrzoosignup.tasks')
cache_logger = logging.getLogger('backend.caching.signals')


def generate_username(sender, instance, created, **kwargs):
    if kwargs['raw']:
        return

    if not instance.user.person_username and instance.project.state.name == 'approve':
        new_username = gen_username(instance.user.first_name, instance.user.last_name)
        instance.user.person_username = new_username
        logger.info(f"Generated username {new_username} for {instance.user.username}")
        instance.user.save()
        invalidation.user_changed()


# post_save.connect(generate_username, sender=UserProject)


@receiver(post_save, sender=settings.AUTH_USER_MODEL,
          dispatch_uid='backend.invalidate_user_saved')
@receiver(post_delete, sender=settings.AUTH_USER_MODEL,
          dispatch_uid='backend.invalidate_user_deleted')
def invalidate_user_responses(sender, instance, **kwargs):
    # Fixture imports run offline and must not contact the cache.
    if kwargs.get('raw'):
        return
    # Includes staff command/admin edits and authentication profile updates.
    if (kwargs.get('signal') is post_save
            and not getattr(instance, '_cache_user_changed', True)):
        return
    cache_logger.debug('Cache invalidation triggered: model=User event=%s',
                 'save' if kwargs.get('signal') is post_save else 'delete')
    invalidation.user_changed()


# Cover ordinary saves, admin writes, cascades, and legacy commands through the
# same domain API. Bulk inserts/updates still require explicit invalidation.
_MODEL_EVENTS = {
    models.User: invalidation.user_changed,
    models.Project: invalidation.project_extension_changed,
    models.UserProject: invalidation.membership_changed,
    models.UserProjectHistory: invalidation.membership_history_changed,
    models.SSHPublicKey: invalidation.ssh_key_changed,
    models.ProjectExtend: invalidation.project_extension_changed,
    models.StaffComment: invalidation.staff_comment_changed,
    models.Role: invalidation.user_changed,
    models.State: invalidation.project_extension_changed,
    models.ProjectType: invalidation.project_extension_changed,
    models.ResourceUsage: None,
}
_USAGE_MODELS = (models.User, models.Project, models.UserProject,
                 models.ResourceUsage, models.Role, models.State, models.ProjectType)


def _affected_accounts(sender, instance):
    if sender not in _USAGE_MODELS:
        return ()
    if sender in (models.Role, models.State, models.ProjectType):
        return tuple(models.User.objects.values_list('username', flat=True))
    if sender is models.User:
        if instance.pk is None:
            return (instance.username,)
        project_ids = set(models.UserProject.objects.filter(
            user_id=instance.pk).values_list('project_id', flat=True))
        project_ids.update(models.ResourceUsage.objects.filter(
            user_id=instance.pk).values_list('project_id', flat=True))
        return (instance.username,) + invalidation.usage_accounts(
            user_ids=(instance.pk,), project_ids=project_ids)
    if sender is models.Project:
        return invalidation.usage_accounts(project_ids=(instance.pk,))
    return invalidation.usage_accounts(
        user_ids=(instance.user_id,), project_ids=(instance.project_id,))


def _user_cache_changed(instance, update_fields, using):
    if instance._state.adding:
        return True
    # These authentication fields are not part of any shared cached response.
    # last_login remains live in the uncached session/user-detail responses.
    fields = [field.attname for field in instance._meta.concrete_fields
              if not field.primary_key and field.name not in {'last_login', 'password'}
              and field.attname not in instance.get_deferred_fields()
              and (update_fields is None or field.name in update_fields
                   or field.attname in update_fields)]
    if not fields:
        return False
    previous = models.User.objects.using(using).filter(pk=instance.pk).values(*fields).first()
    changed = fields if previous is None else [
        field for field in fields if previous[field] != getattr(instance, field)]
    if changed:
        # Field names only: no identifiers, profile values, or credentials.
        cache_logger.debug('Cache-relevant user fields changed: %s', ','.join(sorted(changed)))
    return bool(changed)


def capture_cache_dependents(sender, instance, **kwargs):
    # Instances can be saved repeatedly and later deleted; never reuse the
    # dependency snapshot or change decision from an earlier save.
    instance._cache_usage_accounts = ()
    if sender is models.User:
        instance._cache_user_changed = True
    if kwargs.get('raw'):
        return
    if sender is models.User:
        instance._cache_user_changed = (
            kwargs.get('signal') is not pre_save
            or _user_cache_changed(instance, kwargs.get('update_fields'), kwargs.get('using'))
        )
        if not instance._cache_user_changed:
            cache_logger.debug('Cache invalidation skipped: model=User unchanged profile or authentication-only save')
            return
    accounts = _affected_accounts(sender, instance)
    if (kwargs.get('signal') is pre_save and instance.pk
            and sender in (models.User, models.UserProject, models.ResourceUsage)):
        previous = sender.objects.filter(pk=instance.pk).first()
        if previous is not None:
            accounts += _affected_accounts(sender, previous)
    instance._cache_usage_accounts = tuple(set(accounts))


def invalidate_model_responses(sender, instance, **kwargs):
    # loaddata (including fastloaddata's ordinary records) uses raw saves.
    if kwargs.get('raw'):
        return
    event = _MODEL_EVENTS[sender]
    # User aggregate responses are already covered by the receiver above.
    if event is not None and sender is not models.User:
        cache_logger.debug('Cache invalidation triggered: model=%s event=%s', sender.__name__,
                     'save' if kwargs.get('signal') is post_save else 'delete')
        event()
    accounts = getattr(instance, '_cache_usage_accounts', ())
    if accounts:
        cache_logger.debug('Usage cache invalidation triggered: model=%s accounts=%d',
                     sender.__name__, len(accounts))
        invalidation.usage_changed(accounts)


for model in _MODEL_EVENTS:
    for signal in (pre_save, pre_delete):
        signal.connect(capture_cache_dependents, sender=model, weak=False,
                       dispatch_uid=f'backend.cache_capture.{model._meta.label}')
    for signal in (post_save, post_delete):
        signal.connect(invalidate_model_responses, sender=model, weak=False,
                       dispatch_uid=f'backend.cache_invalidate.{model._meta.label}')
