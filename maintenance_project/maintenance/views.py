from django.shortcuts import render

# Create your views here.
from rest_framework import viewsets
from .models import MaintenanceItem
from .serializers import MaintenanceItemSerializer

class MaintenanceItemViewSet(viewsets.ModelViewSet):
    queryset = MaintenanceItem.objects.all()
    serializer_class = MaintenanceItemSerializer