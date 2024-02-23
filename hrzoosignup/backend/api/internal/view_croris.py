from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.authentication import SessionAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from django.core.cache import cache
from django.contrib.auth import get_user_model

import asyncio
import json
import datetime
import logging

from backend.croris.core import CroRISCore

from aiohttp import client_exceptions, http_exceptions

logger = logging.getLogger('hrzoosignup.views')


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
                croris = CroRISCore(oib)
                croris.fetch()
                user = get_user_model().objects.get(id=self.request.user.id)
                user.croris_first_name = croris.person_info.get('first_name', '')
                user.croris_last_name = croris.person_info.get('last_name', '')
                user.croris_mail = croris.person_info.get('email', '')
                user.croris_mbz = croris.person_info.get('mbz', '')
                user.save()

                if not target_oib:
                    # frontend is calling every 15 min
                    # we set here eviction after 20 min
                    cache.set(f'{oib}_croris', {
                              'person_info': croris.person_info,
                              'projects_lead_info': croris.projects_lead_info,
                              'projects_lead_users': croris.projects_lead_users,
                              'projects_associate_info': croris.projects_associate_info,
                              'projects_associate_ids': croris.projects_associate_ids},
                              20 * 60)

                return Response({
                    'data': {
                        'person_info': croris.person_info,
                        'projects_lead_info': croris.projects_lead_info,
                        'projects_lead_users': croris.projects_lead_users,
                        'projects_associate_info': croris.projects_associate_info,
                        'projects_associate_ids': croris.projects_associate_ids,
                    },
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
