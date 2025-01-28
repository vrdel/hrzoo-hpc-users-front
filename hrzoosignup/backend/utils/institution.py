from django.conf import settings
from backend.models import CrorisInstitutions


async def long_name(short_name):
    try:
        inst_croris = await CrorisInstitutions.objects.aget(name_short=short_name)
        return inst_croris.name_long
    except CrorisInstitutions.DoesNotExist:
        return short_name


class InstitutionMap(object):
    def __init__(self):
        self.mappings = settings.MAP_INSTITUTIONS

    def all_from(self):
        return set([mapping['from'] for mapping in self.mappings])

    def get(self, from_institution):
        for mapping in self.mappings:
            if from_institution == mapping['from']:
                return mapping['to']

    def check_replace(self, from_institution):
        if from_institution in self.all_from():
            return self.get(from_institution)
        else:
            return from_institution
