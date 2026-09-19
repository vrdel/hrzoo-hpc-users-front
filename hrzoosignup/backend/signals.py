from .models import UserProject
from backend import cache_invalidation, models
from backend.utils.gen_username import gen_username
from django.conf import settings
from django.db.models.signals import post_delete, post_save, pre_delete, pre_save
from django.dispatch import receiver
import logging

logger = logging.getLogger('hrzoosignup.tasks')


def generate_username(sender, instance, created, **kwargs):
    if kwargs['raw']:
        return

    if not instance.user.person_username and instance.project.state.name == 'approve':
        new_username = gen_username(instance.user.first_name, instance.user.last_name)
        instance.user.person_username = new_username
        logger.info(f"Generated username {new_username} for {instance.user.username}")
        instance.user.save()
        cache_invalidation.user_changed()


# post_save.connect(generate_username, sender=UserProject)


@receiver(post_save, sender=settings.AUTH_USER_MODEL,
          dispatch_uid='backend.invalidate_user_saved')
@receiver(post_delete, sender=settings.AUTH_USER_MODEL,
          dispatch_uid='backend.invalidate_user_deleted')
def invalidate_user_responses(sender, instance, **kwargs):
    # Includes staff command/admin edits and authentication profile updates.
    cache_invalidation.user_changed()


# Cover ordinary saves, admin writes, cascades, and legacy commands through the
# same domain API. Bulk inserts/updates still require explicit invalidation.
_MODEL_EVENTS = {
    models.User: cache_invalidation.user_changed,
    models.Project: cache_invalidation.project_extension_changed,
    models.UserProject: cache_invalidation.membership_changed,
    models.UserProjectHistory: cache_invalidation.membership_history_changed,
    models.SSHPublicKey: cache_invalidation.ssh_key_changed,
    models.ProjectExtend: cache_invalidation.project_extension_changed,
    models.StaffComment: cache_invalidation.staff_comment_changed,
    models.Role: cache_invalidation.user_changed,
    models.State: cache_invalidation.project_extension_changed,
    models.ProjectType: cache_invalidation.project_extension_changed,
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
        return (instance.username,) + cache_invalidation.usage_accounts(
            user_ids=(instance.pk,), project_ids=project_ids)
    if sender is models.Project:
        return cache_invalidation.usage_accounts(project_ids=(instance.pk,))
    return cache_invalidation.usage_accounts(
        user_ids=(instance.user_id,), project_ids=(instance.project_id,))


def capture_cache_dependents(sender, instance, **kwargs):
    if kwargs.get('raw'):
        return
    accounts = _affected_accounts(sender, instance)
    if (kwargs.get('signal') is pre_save and instance.pk
            and sender in (models.User, models.UserProject, models.ResourceUsage)):
        previous = sender.objects.filter(pk=instance.pk).first()
        if previous is not None:
            accounts += _affected_accounts(sender, previous)
    instance._cache_usage_accounts = tuple(set(accounts))


def invalidate_model_responses(sender, instance, **kwargs):
    event = _MODEL_EVENTS[sender]
    # User aggregate responses are already covered by the receiver above.
    if event is not None and sender is not models.User:
        event()
    accounts = getattr(instance, '_cache_usage_accounts', ())
    if accounts:
        cache_invalidation.usage_changed(accounts)


for model in _MODEL_EVENTS:
    for signal in (pre_save, pre_delete):
        signal.connect(capture_cache_dependents, sender=model, weak=False,
                       dispatch_uid=f'backend.cache_capture.{model._meta.label}')
    for signal in (post_save, post_delete):
        signal.connect(invalidate_model_responses, sender=model, weak=False,
                       dispatch_uid=f'backend.cache_invalidate.{model._meta.label}')
