from django.conf import settings

class InstitutionMap(object):
    def __init__(self):
        self.mappings = settings.MAP_INSTITUTIONS
