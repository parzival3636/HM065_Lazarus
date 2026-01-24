import os
import google.generativeai as genai
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings

# Configure Gemini API
genai.configure(api_key=os.getenv('GEMINI_API_KEY'))

# System prompts for different user types
DEVELOPER_SYSTEM_PROMPT = """You are a helpful assistant for a developer on a project collaboration platform. 
You help developers with:
- Understanding how to apply to projects
- Navigating their active projects and assignments
- Understanding team formation and collaboration
- Submitting Figma designs and project deliverables
- Understanding feedback and ratings
- Managing their portfolio and profile

Be concise, friendly, and provide actionable guidance. Keep responses under 150 words."""

COMPANY_SYSTEM_PROMPT = """You are a helpful assistant for a company on a project collaboration platform.
You help companies with:
- Posting new projects and defining requirements
- Reviewing and managing applications from developers
- Understanding the AI-powered matching system
- Assigning projects to developers or teams
- Reviewing Figma submissions and providing feedback
- Managing team assignments and project progress

Be concise, professional, and provide actionable guidance. Keep responses under 150 words."""

def get_system_prompt(user_type):
    """Get appropriate system prompt based on user type"""
    if user_type == 'developer':
        return DEVELOPER_SYSTEM_PROMPT
    elif user_type == 'company':
        return COMPANY_SYSTEM_PROMPT
    else:
        return "You are a helpful assistant for a project collaboration platform."

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def chatbot_query(request):
    """
    Handle chatbot queries using Gemini API
    """
    try:
        message = request.data.get('message', '').strip()
        user_type = request.data.get('user_type', 'developer')
        
        if not message:
            return Response(
                {'error': 'Message is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get system prompt based on user type
        system_prompt = get_system_prompt(user_type)
        
        # Initialize Gemini model
        model = genai.GenerativeModel('gemini-pro')
        
        # Create full prompt with context
        full_prompt = f"{system_prompt}\n\nUser Question: {message}\n\nAssistant:"
        
        # Generate response
        response = model.generate_content(full_prompt)
        
        # Extract text from response
        bot_response = response.text if response.text else "I'm sorry, I couldn't generate a response. Please try again."
        
        return Response({
            'response': bot_response,
            'user_type': user_type
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        print(f"Chatbot error: {str(e)}")
        return Response(
            {'error': 'Failed to process your request. Please try again.'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def chatbot_suggestions(request):
    """
    Get suggested questions based on user type
    """
    user_type = request.query_params.get('user_type', 'developer')
    
    if user_type == 'developer':
        suggestions = [
            'How do I apply to projects?',
            'What are my active projects?',
            'How does team formation work?',
            'How to submit Figma designs?',
            'How do I view my ratings?',
            'How to update my portfolio?'
        ]
    else:  # company
        suggestions = [
            'How do I post a project?',
            'How to review applications?',
            'How does the matching system work?',
            'How to assign projects to teams?',
            'How to review Figma submissions?',
            'How to provide feedback to developers?'
        ]
    
    return Response({
        'suggestions': suggestions,
        'user_type': user_type
    }, status=status.HTTP_200_OK)
