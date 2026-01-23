"""
REST API views for project management and freelancer matching.
"""

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404

from projects.models import Project, ProjectApplication
from projects.serializers import ProjectSerializer, ProjectApplicationSerializer

# Try to import fine-tuned matcher, fallback to original if issues
try:
    from projects.fine_tuned_matcher import get_fine_tuned_matcher
    FINE_TUNED_AVAILABLE = True
    print("✅ Fine-tuned matcher imported successfully")
except ImportError as e:
    print(f"⚠️ Fine-tuned matcher import failed: {e}")
    try:
        from projects.matcher import get_matcher
        FINE_TUNED_AVAILABLE = False
        print("✅ Fallback to original matcher")
    except ImportError as e2:
        print(f"❌ Both matchers failed: {e2}")
        FINE_TUNED_AVAILABLE = None


class ProjectViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Project management.
    Includes freelancer ranking and matching endpoints.
    """
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Filter projects based on user type."""
        user = self.request.user
        if user.user_type == 'company':
            return Project.objects.filter(company=user)
        # Developers can see all projects that are open for applications
        # Exclude draft and cancelled projects
        return Project.objects.exclude(status__in=['draft', 'cancelled'])
    
    def perform_create(self, serializer):
        """Create project with current user as company."""
        serializer.save(company=self.request.user)
    
    @action(detail=True, methods=['get'])
    def ranked_freelancers(self, request, pk=None):
        """
        Get top 5 ranked freelancers for a project.
        
        Uses ML model to rank applicants based on:
        - Skill match
        - Experience
        - Portfolio quality
        - Proposal quality
        - Rate fit
        """
        project = self.get_object()
        
        # Verify user is the project owner
        if project.company != request.user:
            return Response(
                {'error': 'You do not have permission to view this project\'s applications'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            if FINE_TUNED_AVAILABLE is True:
                print(f"🎯 Using fine-tuned matcher for project: {project.title} (ID: {project.id})")
                matcher = get_fine_tuned_matcher()
                ranked = matcher.rank_freelancers(project, top_n=5)
                print(f"   Matcher returned {len(ranked)} results")
            elif FINE_TUNED_AVAILABLE is False:
                print(f"⚠️ Using original matcher for project: {project.title} (ID: {project.id})")
                matcher = get_matcher()
                ranked = matcher.rank_freelancers(project, top_n=5)
                print(f"   Matcher returned {len(ranked)} results")
            else:
                print("❌ No matcher available, using mock data")
                ranked = [
                    {
                        'application_id': 1,
                        'developer_name': 'Sample Developer',
                        'overall_score': 85,
                        'matching_method': 'mock_fallback',
                        'note': 'Install dependencies to enable real matching'
                    }
                ]
            
            return Response({
                'project_id': project.id,
                'project_title': project.title,
                'total_applications': project.applications_count,
                'ranked_freelancers': ranked,
            })
        except Exception as e:
            return Response(
                {'error': f'Error ranking freelancers: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=True, methods=['get'])
    def match_analysis(self, request, pk=None):
        """
        Get detailed match analysis for a specific application.
        
        Query params:
        - application_id: ID of the application to analyze
        """
        project = self.get_object()
        
        # Verify user is the project owner
        if project.company != request.user:
            return Response(
                {'error': 'You do not have permission to view this project\'s applications'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        application_id = request.query_params.get('application_id')
        if not application_id:
            return Response(
                {'error': 'application_id query parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            application = ProjectApplication.objects.get(
                id=application_id,
                project=project
            )
            
            if FINE_TUNED_AVAILABLE is True:
                print("🎯 Using fine-tuned matcher for analysis")
                matcher = get_fine_tuned_matcher()
                analysis = matcher.get_match_details(application)
            elif FINE_TUNED_AVAILABLE is False:
                print("⚠️ Using original matcher for analysis")
                matcher = get_matcher()
                analysis = matcher.get_match_details(application)
            else:
                print("❌ No matcher available, using mock analysis")
                analysis = {
                    'overall_score': 75,
                    'matching_method': 'mock_fallback',
                    'component_scores': {
                        'skill_match': 80,
                        'experience_fit': 70,
                        'portfolio_quality': 75,
                        'proposal_quality': 80,
                        'rate_fit': 90
                    },
                    'note': 'Install dependencies to enable real matching'
                }
            
            if analysis is None:
                return Response(
                    {'error': 'Could not analyze match'},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
            
            return Response(analysis)
        except ProjectApplication.DoesNotExist:
            return Response(
                {'error': 'Application not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': f'Error analyzing match: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=True, methods=['post'])
    def shortlist_freelancer(self, request, pk=None):
        """
        Shortlist a freelancer for a project.
        
        Request body:
        - application_id: ID of the application to shortlist
        """
        project = self.get_object()
        
        # Verify user is the project owner
        if project.company != request.user:
            return Response(
                {'error': 'You do not have permission to modify this project'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        application_id = request.data.get('application_id')
        if not application_id:
            return Response(
                {'error': 'application_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            application = ProjectApplication.objects.get(
                id=application_id,
                project=project
            )
            application.status = 'shortlisted'
            application.save()
            
            return Response({
                'message': 'Freelancer shortlisted successfully',
                'application_id': application.id,
                'status': application.status,
            })
        except ProjectApplication.DoesNotExist:
            return Response(
                {'error': 'Application not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': f'Error shortlisting freelancer: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=True, methods=['post'])
    def reject_freelancer(self, request, pk=None):
        """
        Reject a freelancer for a project.
        
        Request body:
        - application_id: ID of the application to reject
        """
        project = self.get_object()
        
        # Verify user is the project owner
        if project.company != request.user:
            return Response(
                {'error': 'You do not have permission to modify this project'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        application_id = request.data.get('application_id')
        if not application_id:
            return Response(
                {'error': 'application_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            application = ProjectApplication.objects.get(
                id=application_id,
                project=project
            )
            application.status = 'rejected'
            application.save()
            
            return Response({
                'message': 'Freelancer rejected',
                'application_id': application.id,
                'status': application.status,
            })
        except ProjectApplication.DoesNotExist:
            return Response(
                {'error': 'Application not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': f'Error rejecting freelancer: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class ProjectApplicationViewSet(viewsets.ModelViewSet):
    """ViewSet for Project Applications."""
    queryset = ProjectApplication.objects.all()
    serializer_class = ProjectApplicationSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Filter applications based on user type."""
        user = self.request.user
        if user.user_type == 'developer':
            return ProjectApplication.objects.filter(developer=user)
        elif user.user_type == 'company':
            return ProjectApplication.objects.filter(project__company=user)
        return ProjectApplication.objects.none()
    
    def perform_create(self, serializer):
        """Create application with current user as developer."""
        serializer.save(developer=self.request.user)
