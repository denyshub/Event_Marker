from django.contrib.auth.models import User
from django.contrib.gis.db import models
from django.utils.text import slugify


class Category(models.Model):
    name = models.CharField(max_length=255)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name_plural = "Categories"


class Event(models.Model):
    STATUS_CHOICES = [
        ("pending", "pending"),
        ("approved", "approved"),
        ("rejected", "rejected"),
    ]
    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True, blank=True, null=True)
    description = models.TextField()
    date = models.DateTimeField()
    price = models.IntegerField(default=0)
    location = models.CharField(max_length=255)
    coordinates = models.PointField(null=True)
    category = models.ForeignKey(
        "Category", on_delete=models.SET_NULL, related_name="events", null=True
    )
    status = models.CharField(choices=STATUS_CHOICES, default="pending")
    organizer = models.ForeignKey(User, on_delete=models.CASCADE, related_name="events")

    website = models.CharField(max_length=255, null=True, blank=True)
    image = models.ImageField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} ({self.get_status_display()})"

    def generate_unique_slug(self):
        base_slug = slugify(self.title)
        slug = base_slug
        counter = 1
        while Event.objects.filter(slug=slug).exists():
            slug = f"{base_slug}-{counter}"
            counter += 1
        return slug

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = self.generate_unique_slug()
        super().save(*args, **kwargs)

    class Meta:
        indexes = [
            models.Index(fields=["coordinates"]),
        ]
