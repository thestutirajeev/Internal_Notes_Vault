from django.db import models
from django.contrib.auth.models import User
from encrypted_model_fields.fields import EncryptedCharField, EncryptedTextField
from django.utils import timezone

class NoteManager(models.Manager):
    def get_queryset(self):
        return super().get_queryset().filter(expires_at__gt=timezone.now())

class Note(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    title = EncryptedCharField(max_length=255)
    content = EncryptedTextField()
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()

    objects = NoteManager()  # Use custom manager to filter out expired notes by default

    def __str__(self):
        return str(self.id)

    @classmethod
    def clean_expired_notes(cls):
        cls.objects.filter(expires_at__lte=timezone.now()).delete()