from django.db import migrations


def replace_models(apps, schema_editor):
    AIModel = apps.get_model('models_config', 'AIModel')
    AIModel.objects.filter(slug__in=['gpt-3.5', 'claude-haiku']).delete()
    AIModel.objects.filter(slug='gemini-flash').update(
        nom='Gemini 2.5 Flash',
        description='Modèle rapide de Google. Gratuit avec limites généreuses.',
    )
    AIModel.objects.bulk_create([
        AIModel(
            nom='DeepSeek Chat',
            slug='deepseek',
            rpm_limit=10,
            tpm_limit=100000,
            rpd_limit=500,
            actif=True,
            supports_vision=False,
            description='Modèle DeepSeek, très performant et gratuit.',
        ),
        AIModel(
            nom='Groq Llama 3.1',
            slug='groq',
            rpm_limit=30,
            tpm_limit=6000,
            rpd_limit=1000,
            actif=True,
            supports_vision=False,
            description='Llama 3.1 via Groq, ultra rapide et gratuit.',
        ),
    ], ignore_conflicts=True)


class Migration(migrations.Migration):

    dependencies = [
        ('models_config', '0002_seed_models'),
    ]

    operations = [
        migrations.RunPython(replace_models, migrations.RunPython.noop),
    ]
