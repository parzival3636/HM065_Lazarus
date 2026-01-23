from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
import json

@csrf_exempt
@require_http_methods(["POST"])
def simplify_text(request):
    try:
        data = json.loads(request.body)
        text = data.get('text', '')
        target_audience = data.get('target_audience', 'general audience')
        
        # Simple text simplification logic (replace with actual LLM integration)
        simplified = f"Simplified for {target_audience}: {text[:100]}..."
        
        return JsonResponse({
            'simplified': simplified,
            'model_used': 'Simple Mock Model',
            'success': True
        })
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)

@csrf_exempt
@require_http_methods(["POST"])
def generate_workflow(request):
    try:
        data = json.loads(request.body)
        description = data.get('description', '')
        format_type = data.get('format', 'steps')
        
        # Simple workflow generation logic (replace with actual LLM integration)
        if format_type == 'steps':
            workflow = f"1. Analyze: {description}\n2. Plan the approach\n3. Execute the plan\n4. Review results"
        elif format_type == 'checklist':
            workflow = f"☐ Understand: {description}\n☐ Research requirements\n☐ Create implementation\n☐ Test and validate"
        else:
            workflow = f"Phase 1 (2 hours): Analysis of {description}\nPhase 2 (4 hours): Implementation\nPhase 3 (1 hour): Testing"
        
        return JsonResponse({
            'workflow': workflow,
            'model_used': 'Simple Mock Model',
            'success': True
        })
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)
