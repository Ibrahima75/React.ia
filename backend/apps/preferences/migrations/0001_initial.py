from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('authentication', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='UserPreference',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('theme', models.CharField(choices=[('dark', 'Dark'), ('light', 'Light')], default='dark', max_length=10)),
                ('langue', models.CharField(choices=[('fr', 'Français'), ('en', 'English')], default='fr', max_length=5)),
                ('tts_enabled', models.BooleanField(default=False)),
                ('stt_enabled', models.BooleanField(default=True)),
                ('user', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='preferences', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'db_table': 'user_preferences',
            },
        ),
    ]
