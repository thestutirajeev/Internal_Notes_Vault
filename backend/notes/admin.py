from django.contrib import admin
from .models import Note

@admin.register(Note)
class NoteAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'created_at', 'expires_at')  # Exclude title and content
    list_filter = ('user', 'created_at', 'expires_at')
    readonly_fields = ('id', 'user', 'created_at', 'expires_at')  # Make all visible fields read-only
    exclude = ('title', 'content')  # Explicitly exclude encrypted fields from display
