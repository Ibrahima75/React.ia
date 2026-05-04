from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name='AIModel',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('nom', models.CharField(max_length=100)),
                ('slug', models.SlugField(unique=True)),
                ('rpm_limit', models.IntegerField(default=5)),
                ('tpm_limit', models.IntegerField(default=250000)),
                ('rpd_limit', models.IntegerField(default=20)),
                ('actif', models.BooleanField(default=True)),
                ('supports_vision', models.BooleanField(default=False)),
                ('description', models.TextField(blank=True)),
            ],
            options={
                'db_table': 'models',
            },
        ),
    ]
