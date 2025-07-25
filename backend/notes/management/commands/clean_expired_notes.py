from django.core.management.base import BaseCommand
from notes.models import Note

class Command(BaseCommand):
    help = 'Cleans up expired notes from the database'

    def handle(self, *args, **options):
        deleted_count = Note.clean_expired_notes()
        self.stdout.write(self.style.SUCCESS(f'Successfully deleted {deleted_count} expired notes'))