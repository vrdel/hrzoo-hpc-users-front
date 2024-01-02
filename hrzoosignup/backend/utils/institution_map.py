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
