import datetime
import json

import requests


class PortfeljException(Exception):
    def __init__(self, msg):
        self.msg = msg

    def __str__(self):
        return f"Portfelj: {str(self.msg)}"


class Portfelj:
    def __init__(self, url, token):
        self.url = url
        self.token = token

    def send(self, usluga, pokazatelj, vrijednost, boja="sivo"):
        header = {
            "X-Requested-With": "XMLHttpRequest",
            "Content-Type": "application/json"
        }
        data = {
            "oznaka-usluge": usluga,
            "oznaka-pokazatelja": pokazatelj,
            "semafor": boja,
            "aktualna-vrijednost": vrijednost,
            "datum-mjerenja": format(datetime.date.today(), "%d.%m.%Y."),
            "token": self.token
        }

        try:
            response = requests.post(
                self.url, data=json.dumps(data), headers=header
            )

            if response.status_code != 200:
                message = f"{response.status_code} {response.reason}"


                try:
                    if isinstance(response.json()["message"], dict):
                        msglist = []
                        for key, value in response.json()["message"].items():
                            msglist.append(response.json()["message"][key][0])

                        message_list = ", ".join(msglist)
                        message = f"{message}: {message_list}"

                    else:
                        message = f"{message}: {response.json()['message']}"

                except Exception:
                    pass

                raise PortfeljException(
                    f'Error sending data: {usluga}: {pokazatelj}: {message}'
                )

        except requests.exceptions.RequestException as e:
            raise PortfeljException(
                f"Error sending data: {usluga}: {pokazatelj}: {str(e)}"
            )
