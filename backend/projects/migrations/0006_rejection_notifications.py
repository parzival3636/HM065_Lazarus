# Generated migration for rejection notifications

from django.db import migrations, models
import django.db.models.deletion
from django.conf import settings


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('projects', '0005_feedback_rating'),
    ]

    operations = [
        migrations.CreateModel(
            name='RejectionNotification',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=200)),
                ('message', models.TextField()),
                ('is_read', models.BooleanField(default=False)),
                ('sent_at', models.DateTimeField(auto_now_add=True)),
                ('application', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='rejection_notification', to='projects.projectapplication')),
                ('developer', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='rejection_notifications', to=settings.AUTH_USER_MODEL)),
                ('project', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='rejection_notifications', to='projects.project')),
            ],
            options={
                'ordering': ['-sent_at'],
            },
        ),
    ]
