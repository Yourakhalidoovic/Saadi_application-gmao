from django.db import models

# Create your models here.
class MaintenanceItem(models.Model):
    TYPE_CHOICES = [
        ('computer', 'Computer'),
        ('printer', 'Printer'),
        ('telephone', 'Telephone'),
        ('enduleur', 'Enduleur'),
        ('smartphone', 'Smartphone'),
        ('autre', 'Autre'),
    ]
    
    STATUS_CHOICES = [
        ('operational', 'Operational'),
        ('maintenance', 'Maintenance'),
    ]

    type = models.CharField(max_length=50, choices=TYPE_CHOICES)
    name = models.CharField(max_length=100)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES)
    client = models.CharField(max_length=100)
    client_phone = models.CharField(max_length=20)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    maintenance_id = models.CharField(max_length=50, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.type} - {self.name} ({self.maintenance_id})"