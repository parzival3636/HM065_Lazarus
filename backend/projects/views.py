from django.shortcuts import render
from django.http import JsonResponse

def project_list(request):
    return JsonResponse({'message': 'Project list endpoint'})

def project_create(request):
    return JsonResponse({'message': 'Project create endpoint'})

def project_detail(request, pk):
    return JsonResponse({'message': f'Project {pk} detail endpoint'})

def project_apply(request, pk):
    return JsonResponse({'message': f'Apply to project {pk} endpoint'})

def project_submissions(request, pk):
    return JsonResponse({'message': f'Project {pk} submissions endpoint'})