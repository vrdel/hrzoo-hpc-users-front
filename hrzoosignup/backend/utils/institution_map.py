from django.conf import settings

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
