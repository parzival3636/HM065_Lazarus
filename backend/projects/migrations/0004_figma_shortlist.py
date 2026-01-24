# Generated migration for Figma shortlist feature

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
from django.utils import timezone
from datetime import timedelta


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('projects', '0003_project_submission_deadline_projectassignment_and_more'),
    ]

    operations = [
        # Update ProjectApplication status choices
        migrations.AlterField(
            model_name='projectapplication',
            name='status',
            field=models.CharField(
                choices=[
                    ('pending', 'Pending'),
                    ('shortlisted', 'Shortlisted'),
                    ('figma_pending', 'Figma Submission Pending'),
                    ('figma_submitted', 'Figma Submitted'),
                    ('rejected', 'Rejected'),
                    ('selected', 'Selected')
                ],
                default='pending',
                max_length=20
            ),
        ),
        
        # Create FigmaShortlist model
        migrations.CreateModel(
            name='FigmaShortlist',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('shortlisted_at', models.DateTimeField(auto_now_add=True)),
                ('figma_deadline', models.DateTimeField()),
                ('figma_url', models.URLField(blank=True, null=True)),
                ('figma_description', models.TextField(blank=True)),
                ('submitted_at', models.DateTimeField(blank=True, null=True)),
                ('clip_score', models.FloatField(blank=True, null=True)),
                ('clip_rank', models.IntegerField(blank=True, null=True)),
                ('evaluated_at', models.DateTimeField(blank=True, null=True)),
                ('application', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='figma_shortlist', to='projects.projectapplication')),
                ('developer', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='figma_shortlists', to=settings.AUTH_USER_MODEL)),
                ('project', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='figma_shortlists', to='projects.project')),
            ],
            options={
                'ordering': ['-clip_score'],
            },
        ),
    ]
