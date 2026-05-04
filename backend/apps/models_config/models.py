from django.db import models


class AIModel(models.Model):
    nom = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)
    rpm_limit = models.IntegerField(default=5)
    tpm_limit = models.IntegerField(default=250000)
    rpd_limit = models.IntegerField(default=20)
    actif = models.BooleanField(default=True)
    supports_vision = models.BooleanField(default=False)
    description = models.TextField(blank=True)

    class Meta:
        db_table = 'models'

    def __str__(self):
        return self.nom
