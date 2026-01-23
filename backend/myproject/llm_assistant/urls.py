from django.urls import path
from . import views

urlpatterns = [
    path('simplify/', views.simplify_text, name='simplify_text'),
    path('generate-workflow/', views.generate_workflow, name='generate_workflow'),
]