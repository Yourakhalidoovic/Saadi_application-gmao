from rest_framework import serializers
from .models import MaintenanceItem

class MaintenanceItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = MaintenanceItem
        fields = '__all__'