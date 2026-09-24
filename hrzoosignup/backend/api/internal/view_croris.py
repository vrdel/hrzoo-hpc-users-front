from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from backend.caching import entries, store
from django.contrib.auth import get_user_model

from copy import deepcopy

import asyncio
import json
import logging

from backend.croris.core import CroRISCore
from backend.models import Project

from aiohttp import client_exceptions, http_exceptions

logger = logging.getLogger('hrzoosignup.views')


def with_current_approvals(snapshot):
    # Do not modify the remote snapshot (or legacy snapshots with derived flags).
    data = deepcopy(snapshot)
    projects = data['projects_lead_info'] + data['projects_associate_info']
    ids = [project['croris_id'] for project in projects if project.get('croris_id')]
    approved = set(Project.objects.filter(
        croris_id__in=ids, state__name__in=('submit', 'approve')
    ).values_list('croris_id', flat=True))
    for project in projects:
        project['is_approved'] = project.get('croris_id') in approved
    return data


class CroRISInfo(APIView):
    def get(self, request, **kwargs):
        target_oib = kwargs.get('target_oib', None)

        if target_oib:
            if not (request.user.is_staff or request.user.is_superuser):
                err_response = {
                    'status': {
                        'code': status.HTTP_401_UNAUTHORIZED,
                        'message': '{} - Not allowed to view the CroRIS details of user'.format(request.user.username)
                    }
                }
                return Response(err_response, status=status.HTTP_401_UNAUTHORIZED)

            oib = kwargs.get('target_oib')
        else:
            oib = request.user.person_oib

        try:
            if oib:
                def fetch_snapshot():
                    croris = CroRISCore(oib)
                    croris.fetch()
                    return {
                        'person_info': croris.person_info,
                        'projects_lead_info': croris.projects_lead_info,
                        'projects_lead_users': croris.projects_lead_users,
                        'projects_associate_info': croris.projects_associate_info,
                        'projects_associate_ids': croris.projects_associate_ids,
                    }

                snapshot = store.remember(entries.CRORIS_PERSON, fetch_snapshot, oib=oib)
                if not target_oib:
                    user = get_user_model().objects.get(id=request.user.id)
                    changed_fields = []
                    for field, remote in (('first_name', 'first_name'), ('last_name', 'last_name'),
                                          ('mail', 'email'), ('mbz', 'mbz')):
                        field = f'croris_{field}'
                        value = snapshot['person_info'].get(remote, '')
                        if getattr(user, field) != value:
                            setattr(user, field, value)
                            changed_fields.append(field)
                    # Each tab reads this profile; unchanged reads must not
                    # trigger save signals that evict shared response caches.
                    if changed_fields:
                        user.save(update_fields=changed_fields)
                data = with_current_approvals(snapshot)

                return Response({
                    'data': data,
                    'status': {
                        'code': status.HTTP_200_OK,
                        'message': 'Successfully fetched the data from CroRIS'
                    }
                })
            elif not oib:
                return Response({
                    'status': {
                        'code': status.HTTP_200_OK,
                        'message': 'Could not get authentication info from database'
                    }
                })

        except (client_exceptions.ServerTimeoutError, asyncio.TimeoutError) as exc:
            err_response = {
                'status': {
                    'code': status.HTTP_408_REQUEST_TIMEOUT,
                    'message': 'Could not get data from CroRIS - {}'.format(repr(exc))
                }
            }
            logger.error(err_response)
            return Response(err_response, status=status.HTTP_200_OK)

        except (client_exceptions.ClientError, http_exceptions.HttpProcessingError) as exc:
            err_response = {
                'status': {
                    'code': status.HTTP_500_INTERNAL_SERVER_ERROR,
                    'message': 'Could not parse data from CroRIS - {}'.format(repr(exc))
                }
            }
            logger.error(err_response)
            return Response(err_response, status=status.HTTP_200_OK)

        except (json.JSONDecodeError, TypeError) as exc:
            err_response = {
                'status': {
                    'code': status.HTTP_500_INTERNAL_SERVER_ERROR,
                    'message': 'Could not parse JSON data from CroRIS - {}'.format(repr(exc))
                }
            }
            logger.error(err_response)
            return Response(err_response, status=status.HTTP_200_OK)
