import json
import asyncio
import logging

from asgiref.sync import sync_to_async
from django.conf import settings

from backend.httpq.excep import HZSIHttpError
from backend.httpq.httpconn import SessionWithRetry
from backend.utils.various import contains_exception


logger = logging.getLogger('hrzoosignup.tasks')

class FetchCrorisInstitution(object):
    def __init__(self):
        # self.headers = {'Accept': 'application/json'}
        auth = (settings.CRORIS_USER, settings.CRORIS_PASSWORD)
        self.session = SessionWithRetry(logger, auth=auth,
                                        handle_session_close=True)

    async def run(self):
        try:
            coros = []
            coros.append(
                self.session.http_get(settings.API_INSTITUTIONACTIVE)
            )
            coros.append(
                self.session.http_get(settings.API_INSTITUTIONINACTIVE)
            )
            response = await asyncio.gather(*coros, return_exceptions=True)

            exc_raised, exc = contains_exception(response)

            if exc_raised:
                raise exc
            else:
                try:
                    inac = response[0]
                    act = response[1]
                    inactive_instits = json.loads(inac)['_embedded']['ustanove']
                    active_instits = json.loads(act)['_embedded']['ustanove']

                    logger.info(f"Synced {len(inactive_instits)} inactive institutions")
                    logger.info(f"Synced {len(active_instits)} active institutions")

                    return inactive_instits, active_instits

                except Exception as exc:
                    logger.error(f"Error while syncing institutions from CroRIS: {repr(exc)}")

        finally:
            await self.session.close()
