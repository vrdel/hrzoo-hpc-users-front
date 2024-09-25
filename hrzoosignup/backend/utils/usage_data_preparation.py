import copy
import datetime

import pandas as pd
from backend import models
from django.utils import timezone


def _calculate_processor_hour(data, key):
    try:
        return round(int(data[key]) * int(data["walltime"]) / 3600., 4)

    except ValueError:
        return 0


def _calculate_gpuh(data):
    return _calculate_processor_hour(data=data, key="ngpus")


def _calculate_cpuh(data):
    return _calculate_processor_hour(data=data, key="ncpus")


def _prepare_job_data(data):
    job_data = copy.deepcopy(data)

    job_data.pop("project")
    job_data.pop("user")
    job_data.pop("end_time")

    return job_data.to_json()


class Usage:
    def __init__(self, data):
        self.df = pd.DataFrame.from_records(data)
        self.users, self.missing_users = self._users(
            self.df["user"].unique()
        )
        self.projects, self.missing_projects = self._projects(
            self.df["project"].unique()
        )

    def create_dataframe(self):
        self.df["cpuh"] = self.df.apply(
            lambda row: _calculate_cpuh(row), axis=1
        )
        self.df["gpuh"] = self.df.apply(
            lambda row: _calculate_gpuh(row), axis=1
        )
        self.df["end_time"] = self.df.apply(
            lambda row: timezone.make_aware(datetime.datetime.fromtimestamp(
                int(row["end_time"])
            ), timezone=timezone.get_current_timezone()),
            axis=1
        )
        self.df["job_data"] = self.df.apply(
            lambda row: _prepare_job_data(row), axis=1
        )

        df = self.df[
            (~self.df.user.isin(self.missing_users)) *
            (~self.df.project.isin(self.missing_projects))
        ]

        return df

    @staticmethod
    def _users(users):
        missing_users = set()
        users_dict = dict()
        for user in users:
            try:
                users_dict.update({
                    user: models.User.objects.get(person_username=user)
                })

            except models.User.DoesNotExist:
                try:
                    users_dict.update({
                        user: models.User.objects.get(person_uniqueid=user)
                    })

                except models.User.DoesNotExist:
                    missing_users.add(user)
                    continue

        return users_dict, missing_users

    @staticmethod
    def _projects(projects):
        missing_projects = set()
        projects_dict = dict()
        for project in projects:
            try:
                projects_dict.update({
                    project: models.Project.objects.get(identifier=project)
                })

            except models.Project.DoesNotExist:
                missing_projects.add(project)
                continue

        return projects_dict, missing_projects
