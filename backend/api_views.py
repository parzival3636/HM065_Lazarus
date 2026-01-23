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
        simplified = f"Simplified for {target_audience}: {text}"
        
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
        
        # Enhanced workflow generation logic
        if 'web' in description.lower() or 'website' in description.lower():
            if format_type == 'steps':
                workflow = "1. Requirements Analysis: Define project scope and gather requirements\n2. UI/UX Design: Create wireframes and mockups\n3. Frontend Development: Build user interface\n4. Backend Development: Create APIs and database\n5. Integration: Connect frontend with backend\n6. Testing: Unit, integration, and user testing\n7. Deployment: Deploy to production environment\n8. Maintenance: Monitor and maintain the system"
            elif format_type == 'checklist':
                workflow = "☐ Define project scope and requirements\n☐ Create database schema\n☐ Design user interface\n☐ Develop frontend components\n☐ Build backend APIs\n☐ Implement authentication\n☐ Test all features\n☐ Deploy to server\n☐ Setup monitoring"
            else:
                workflow = "Phase 1 (1-2 weeks): Planning and Design\nPhase 2 (3-4 weeks): Frontend Development\nPhase 3 (2-3 weeks): Backend Development\nPhase 4 (1 week): Integration and Testing\nPhase 5 (1 week): Deployment and Launch"
        elif 'mobile' in description.lower() or 'app' in description.lower():
            if format_type == 'steps':
                workflow = "1. Market Research: Research target audience and competitors\n2. Platform Selection: Choose iOS/Android/Cross-platform\n3. UI/UX Design: Create mobile-first designs\n4. Development: Build app features\n5. Testing: Device testing and debugging\n6. App Store Submission: Prepare and submit\n7. Launch: Release and marketing\n8. Updates: Regular feature updates"
            elif format_type == 'checklist':
                workflow = "☐ Research target audience\n☐ Choose development platform\n☐ Design app interface\n☐ Develop core features\n☐ Test on multiple devices\n☐ Optimize performance\n☐ Prepare app store assets\n☐ Submit for review\n☐ Launch marketing campaign"
            else:
                workflow = "Phase 1 (1 week): Research and Planning\nPhase 2 (2-3 weeks): Design and Prototyping\nPhase 3 (4-6 weeks): Development\nPhase 4 (1-2 weeks): Testing and Optimization\nPhase 5 (1 week): App Store Submission and Launch"
        else:
            # Generic project workflow
            if format_type == 'steps':
                workflow = "1. Project Initiation: Define scope and objectives\n2. Planning: Create detailed project plan\n3. Design: Create system architecture\n4. Development: Implement core features\n5. Testing: Quality assurance and testing\n6. Review: Stakeholder review and feedback\n7. Deployment: Release to production\n8. Monitoring: Track performance and issues"
            elif format_type == 'checklist':
                workflow = "☐ Define project requirements\n☐ Create project timeline\n☐ Assign team members\n☐ Setup development environment\n☐ Implement features\n☐ Conduct testing\n☐ Document the project\n☐ Deploy solution\n☐ Provide training"
            else:
                workflow = "Phase 1 (1 week): Planning and Analysis\nPhase 2 (2-4 weeks): Implementation\nPhase 3 (1 week): Testing and Quality Assurance\nPhase 4 (1 week): Deployment and Documentation"
        
        return JsonResponse({
            'workflow': workflow,
            'model_used': 'Enhanced Mock Model',
            'success': True
        })
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)