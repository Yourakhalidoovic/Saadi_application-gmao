from django.contrib import admin

# Register your models here.
from .models import MaintenanceItem

@admin.register(MaintenanceItem)
class MaintenanceItemAdmin(admin.ModelAdmin):
    list_display = ('type', 'name', 'status', 'client', 'price', 'maintenance_id')
    list_filter = ('type', 'status')
    search_fields = ('name', 'client', 'maintenance_id')