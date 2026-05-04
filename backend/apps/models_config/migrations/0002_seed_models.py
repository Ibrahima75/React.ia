from django.db import migrations


def seed_models(apps, schema_editor):
    AIModel = apps.get_model('models_config', 'AIModel')
    AIModel.objects.bulk_create([
        AIModel(
            nom='Gemini 1.5 Flash',
            slug='gemini-flash',
            rpm_limit=15,
            tpm_limit=1000000,
            rpd_limit=1500,
            actif=True,
            supports_vision=True,
            description='Modèle rapide de Google. Gratuit avec limites généreuses.',
        ),
        AIModel(
            nom='GPT-3.5 Turbo',
            slug='gpt-3.5',
            rpm_limit=3,
            tpm_limit=40000,
            rpd_limit=200,
            actif=True,
            supports_vision=False,
            description='Modèle OpenAI classique. Offre gratuite limitée.',
        ),
        AIModel(
            nom='Claude Haiku',
            slug='claude-haiku',
            rpm_limit=5,
            tpm_limit=25000,
            rpd_limit=50,
            actif=True,
            supports_vision=False,
            description="Modèle Anthropic léger et rapide.",
        ),
    ], ignore_conflicts=True)


class Migration(migrations.Migration):

    dependencies = [
        ('models_config', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(seed_models, migrations.RunPython.noop),
    ]
