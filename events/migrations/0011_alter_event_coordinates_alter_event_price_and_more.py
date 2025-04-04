# Generated by Django 5.1.5 on 2025-02-10 11:04

import django.contrib.gis.db.models.fields
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("events", "0010_alter_event_slug"),
    ]

    operations = [
        migrations.AlterField(
            model_name="event",
            name="coordinates",
            field=django.contrib.gis.db.models.fields.PointField(null=True, srid=4326),
        ),
        migrations.AlterField(
            model_name="event",
            name="price",
            field=models.IntegerField(default=0),
        ),
        migrations.AlterField(
            model_name="event",
            name="status",
            field=models.CharField(
                choices=[
                    ("pending", "pending"),
                    ("approved", "approved"),
                    ("rejected", "rejected"),
                ],
                default="pending",
            ),
        ),
    ]
