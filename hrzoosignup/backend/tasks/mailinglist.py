import json
import asyncio
import logging

from django.conf import settings

from backend.httpq.excep import HZSIHttpError
from backend.httpq.httpconn import SessionWithRetry
from backend.utils.various import contains_exception


logger = logging.getLogger('hrzoosignup.cron')


class ListSubscribe(object):
    def __init__(self, users, cron=False):
        self.headers = dict()
        self.headers['Content-Type'] = 'application/x-www-form-urlencoded'
        self.users = users
        self.cron = cron

    async def maillist_id(self, headers):
        headers = dict()

        response = await self.session.http_get('{}/lists/{}'.format(
            settings.MAILINGLIST_SERVER, settings.MAILINGLIST_NAME),
            headers=headers
        )

        if response:
            list_id = json.loads(response)['list_id']

            return list_id
        else:
            return False

    async def subscribe_maillist(self, email, username, list_id):
        try:
            headers = dict()
            subscribe_payload = dict(list_id=list_id, subscriber=email,
                                     pre_verified=True, pre_confirmed=True)
            response = await self.session.http_post(
                '{}/members'.format(settings.MAILINGLIST_SERVER),
                headers=headers, data=subscribe_payload
            )

            if response.status >= 200 and response.status < 300:
                return (True, response)
            else:
                return (False, response)

        except HZSIHttpError as exc:
            errormsg = ('{}').format(str(exc))
            raise HZSIHttpError('Failed subscribing user %s on %s: %s' % (username,
                                                                          settings.MAILINGLIST_NAME,
                                                                          errormsg))

    async def run(self):
        auth = settings.MAILINGLIST_CREDENTIALS.split(':')
        self.session = SessionWithRetry(logger, auth=auth, handle_session_close=True)

        try:
            list_id = await self.maillist_id(self.headers)
        except HZSIHttpError as exc:
            raise HZSIHttpError(f"Error fetch mailing list id {repr(exc)}")

        coros = []

        for user in self.users:
            coros.append(self.subscribe_maillist(user.person_mail, user.username, list_id))

        response = await asyncio.gather(*coros, return_exceptions=True)
        exc_raised, exc = contains_exception(response)

        ret_msg = None

        if exc_raised:
            await self.session.close()
            raise exc
        else:
            nu = 0
            for res in response:
                if res[0]:
                    self.users[nu].mailinglist_subscribe = True
                    ret_msg = f"User {self.users[nu].username} subscribed to {settings.MAILINGLIST_NAME}"
                    await self.users[nu].asave()
                    await self.session.close()
                else:
                    if res[1].status == 409:
                        ret_msg = f"User {self.users[nu].username} already subscribed to {settings.MAILINGLIST_NAME}, setting flag to True"
                        self.users[nu].mailinglist_subscribe = True
                        await self.users[nu].asave()
                        await self.session.close()
                    else:
                        await self.session.close()
                        raise HZSIHttpError(f"Error subscribing user {self.users[nu].username} to {settings.MAILINGLIST_NAME}: {repr(res[1])}")
                nu += 1

        return ret_msg


class ListUnsubscribe(object):
    def __init__(self, users, cron=False, django_stdout=None):
        self.headers = dict()
        self.headers['Content-Type'] = 'application/x-www-form-urlencoded'
        self.users = users
        self.cron = cron
        self.std = django_stdout

    async def maillist_id(self, headers):
        headers = dict()

        response = await self.session.http_get('{}/lists/{}'.format(
            settings.MAILINGLIST_SERVER, settings.MAILINGLIST_NAME),
            headers=headers
        )

        if response:
            list_id = json.loads(response)['list_id']

            return list_id
        else:
            return False

    async def unsubscribe_maillist(self, email, username, list_id):
        try:
            response = await self.session.http_delete(
                '{}/lists/{}/member/{}'.format(settings.MAILINGLIST_SERVER, list_id, email),
            )

            if response.status >= 200 and response.status < 300:
                return (True, response)
            else:
                return (False, response)

        except HZSIHttpError as exc:
            errormsg = ('{}').format(str(exc))
            raise HZSIHttpError('Failed unsubscribing user %s on %s: %s' % (username,
                                                                            settings.MAILINGLIST_NAME,
                                                                            errormsg))

            return (False, exc)

    async def run(self):
        auth = settings.MAILINGLIST_CREDENTIALS.split(':')
        self.session = SessionWithRetry(logger, auth=auth, handle_session_close=True)

        try:
            list_id = await self.maillist_id(self.headers)
        except HZSIHttpError as exc:
            self.std.stdout.write(self.std.style.NOTICE(f"Error fetch mailing list id {repr(exc)}"))
            if self.cron:
                logger.error(f"Error fetch mailing list id {repr(exc)}")
            raise SystemExit(1)

        coros = []

        for user in self.users:
            coros.append(self.unsubscribe_maillist(user.person_mail, user.username, list_id))

        response = await asyncio.gather(*coros, return_exceptions=True)
        exc_raised, exc = contains_exception(response)

        ret_msg = None

        if exc_raised:
            await self.session.close()
            raise exc
        else:
            nu = 0
            for res in response:
                if res[0]:
                    self.users[nu].mailinglist_subscribe = False
                    ret_msg = f"User {self.users[nu].username} unsubscribed from {settings.MAILINGLIST_NAME}"
                    await self.users[nu].asave()
                    await self.session.close()
                else:
                    if res[1].status == 409:
                        ret_msg = f"User {self.users[nu].username} already unsubscribed from {settings.MAILINGLIST_NAME}, setting flag to False"
                        self.users[nu].mailinglist_subscribe = False
                        await self.users[nu].asave()
                        await self.session.close()
                    else:
                        await self.session.close()
                        raise HZSIHttpError(f"Error unsubscribing user {self.users[nu].username} from {settings.MAILINGLIST_NAME}: {repr(res[1])}")
                nu += 1

        return ret_msg
