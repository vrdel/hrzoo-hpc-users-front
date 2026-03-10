import copy
import datetime
import json
import math

import pandas as pd
from backend import models
from django.conf import settings
from django.utils import timezone

RESOURCES_TAGS_MAPPING = {
    "supek": ["BIGMEM", "CPU", "GPU", "GPU-BIGMEM"],
    "cloud": ["CLOUD", "CLOUD-BIGMEM", "CLOUD-GPU"],
    "padobran": ["PADOBRAN"],
    "jupyter": ["JUPYTER"],
    "galaxy": ["PADOBRAN"]
}


def _calculate_processor_hour(data, key):
    try:
        if "walltime" in data:
            return round(int(data[key]) * int(data["walltime"]) / 3600., 4)

        else:
            if int(data["started_at"]) >= int(data["start_time"]):
                start_time = int(data["started_at"])

            else:
                start_time = int(data["start_time"])

            if data["ended_at"] and not math.isnan(int(data["ended_at"])) and (
                    int(data["ended_at"]) <= int(data["end_time"])
            ):
                end_time = int(data["ended_at"])

            else:
                end_time = int(data["end_time"])

            walltime = end_time - start_time

            return round(int(data[key]) * walltime / 3600., 4)

    except (ValueError, KeyError):
        return 0


def _calculate_gpuh(data):
    return _calculate_processor_hour(data=data, key="ngpus")


def _calculate_cpuh(data):
    return _calculate_processor_hour(data=data, key="ncpus")


def _calculate_cloud_cpuh(data):
    return _calculate_processor_hour(data=data, key="vcpus")


def _prepare_job_data(data):
    job_data = copy.deepcopy(data)

    job_data.pop("project")
    job_data.pop("user")

    if "end_time" in job_data:
        job_data.pop("end_time")

    return job_data.to_json()


class Usage:
    def __init__(self, data, resource, chunk_size):
        self.data = data
        self.resource = resource
        self.chunk_size = chunk_size

        self.projects_mapping = dict()
        for proj in models.Project.objects.all():
            original_identifier = proj.identifier
            new_identifier = original_identifier
            for field in settings.PROJECT_IDENTIFIER_MAP:
                if field["from"] in new_identifier:
                    new_identifier = new_identifier.replace(
                        field["from"], field["to"]
                    )

                else:
                    continue

            self.projects_mapping.update({
                new_identifier: original_identifier
            })

        self.users = dict()
        self.missing_users = list()
        self.projects = dict()
        self.missing_projects = list()

    def _split_into_chunks(self, n_chunks):
        avg = math.ceil(len(self.data) / float(n_chunks))
        chunks = list()
        last = 0

        while last < len(self.data):
            chunks.append(self.data[last:last + avg])
            last += avg

        return chunks

    def create_dataframe(self, chunk):
        df = pd.DataFrame.from_records(chunk)

        if "project" not in df:
            df["project"] = df.apply(lambda row: None, axis=1)

        if "user" not in df:
            df["user"] = df.apply(lambda row: None, axis=1)

        users, missing_users = self._users(df["user"].unique())
        projects, missing_projects = self._projects(df["project"].unique())

        self.users.update(users)
        self.missing_users.extend(missing_users)
        self.projects.update(projects)
        self.missing_projects.extend(missing_projects)

        if self.resource not in ["jupyter", "cloud"]:
            df["cpuh"] = df.apply(lambda row: _calculate_cpuh(row), axis=1)

        if self.resource == "cloud":
            df["cpuh"] = df.apply(
                lambda row: _calculate_cloud_cpuh(row), axis=1
            )

        if self.resource in ["supek", "cloud"]:
            df["gpuh"] = df.apply(lambda row: _calculate_gpuh(row), axis=1)
            df["ngpus"] = df.apply(
                lambda row: row["ngpus"] if "ngpus" in row else None,
                axis=1
            )

        df["end_time"] = df.apply(
            lambda row: timezone.make_aware(datetime.datetime.fromtimestamp(
                int(row["end_time"])
            ), timezone=timezone.get_current_timezone()),
            axis=1
        )

        df["job_data"] = df.apply(
            lambda row: _prepare_job_data(row), axis=1
        )

        df = df[
            (~df.user.isin(self.missing_users)) *
            (~df.project.isin(self.missing_projects))
        ]

        return df

    @staticmethod
    def _users(users):
        missing_users = set()
        users_dict = dict()
        for user in users:
            if user:
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

    def _projects(self, projects):
        missing_projects = set()
        projects_dict = dict()

        for project in projects:
            if project:
                if project in self.projects_mapping:
                    projects_dict.update({
                        project: models.Project.objects.get(
                            identifier=self.projects_mapping[project]
                        )
                    })

                else:
                    missing_projects.add(project)
                    continue

        return projects_dict, missing_projects

    def save(self):
        n_rows = len(self.data)
        n_chunks = math.ceil(n_rows / self.chunk_size)
        chunks = self._split_into_chunks(n_chunks)

        for chunk in chunks:
            df = self.create_dataframe(chunk)

            model_instances = list()

            for record in df.to_dict("records"):
                project = None
                if record["project"]:
                    project = models.Project.objects.get(
                        identifier=self.projects_mapping[record["project"]]
                    )

                else:
                    user_projects = models.UserProject.objects.filter(
                        user=self.users[record["user"]]
                    ).order_by("-date_joined")

                    for user_project in user_projects:
                        tags = [
                            item["value"] for item in
                            user_project.project.staff_resources_type
                        ]
                        project_end = user_project.project.bogus_end or user_project.project.date_end
                        if len(
                            set(tags).intersection(
                                set(RESOURCES_TAGS_MAPPING[self.resource])
                            )
                        ) > 0 and record["end_time"].date() <= project_end:
                            project = user_project.project
                            break

                if project:
                    model_instances.append(
                        models.ResourceUsage(
                            user=self.users[record["user"]] if record["user"]
                            else None,
                            project=project,
                            end_time=record["end_time"],
                            resource_name=self.resource,
                            accounting_record=json.loads(record["job_data"])
                        )
                    )

            models.ResourceUsage.objects.bulk_create(model_instances)
