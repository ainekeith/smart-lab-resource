from django.core.management.base import BaseCommand
from django.contrib.sites.models import Site

class Command(BaseCommand):
    help = 'Creates or updates the default site'

    def handle(self, *args, **options):
        site, created = Site.objects.get_or_create(
            id=1,
            defaults={
                'domain': 'localhost:8000',
                'name': 'localhost'
            }
        )
        
        if created:
            self.stdout.write(self.style.SUCCESS('Successfully created default site'))
        else:
            self.stdout.write(self.style.SUCCESS('Default site already exists')) 