from django.db import models
from django.contrib.auth.models import User
from encrypted_model_fields.fields import EncryptedCharField, EncryptedTextField

class Note(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    title = EncryptedCharField(max_length=255)
    content = EncryptedTextField()
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()

    def __str__(self):
        return str(self.id)  