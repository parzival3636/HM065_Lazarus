"""
Enhanced Design Evaluator with Multi-Criteria Scoring
Provides more accurate and detailed evaluation of Figma designs
"""

import re
import requests
from io import BytesIO
from typing import List, Dict, Any

try:
    import torch
    import open_clip
    from PIL import Image
    import numpy as np
    OPENCLIP_AVAILABLE = True
except ImportError:
    OPENCLIP_AVAILABLE = False


class EnhancedDesignEvaluator:
    """
    Multi-criteria design evaluation system
    Scores designs based on multiple factors for better accuracy
    """
    
    def __init__(self):
        if not OPENCLIP_AVAILABLE:
            raise ImportError("OpenCLIP not installed")
        
        self.model = None
        self.preprocess = None
        self.tokenizer = None
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self._initialize_model()
    
    def _initialize_model(self):
        """Initialize OpenCLIP model"""
        self.model, _, self.preprocess = open_clip.create_model_and_transforms(
            'ViT-B-32',
            pretrained='laion2b_s34b_b79k'
        )
        self.tokenizer = open_clip.get_tokenizer('ViT-B-32')
        self.model = self.model.to(self.device)
        self.model.eval()
        print(f"✅ Enhanced evaluator initialized on {self.device}")
    
    def load_image_from_url(self, image_url):
        """Load and preprocess image from URL"""
        try:
            response = requests.get(image_url, timeout=10)
            response.raise_for_status()
            image = Image.open(BytesIO(response.content)).convert('RGB')
            return self.preprocess(image).unsqueeze(0).to(self.device)
        except Exception as e:
            print(f"❌ Failed to load image from {image_url}: {e}")
            raise
    
    def extract_design_requirements(self, description):
        """
        Extract specific design requirements from project description
        Returns structured requirements for evaluation
        """
        requirements = {
            'keywords': [],
            'features': [],
            'style': [],
            'colors': [],
            'target_audience': []
        }
        
        # Extract keywords (nouns and important terms)
        words = description.lower().split()
        
        # Common UI/UX keywords
        ui_keywords = ['dashboard', 'landing', 'homepage', 'profile', 'login', 
                      'signup', 'checkout', 'cart', 'menu', 'navigation', 
                      'header', 'footer', 'sidebar', 'modal', 'form']
        
        for keyword in ui_keywords:
            if keyword in description.lower():
                requirements['keywords'].append(keyword)
        
        # Extract features
        feature_patterns = [
            r'need[s]?\s+(\w+)',
            r'should\s+have\s+(\w+)',
            r'must\s+include\s+(\w+)',
            r'require[s]?\s+(\w+)'
        ]
        
        for pattern in feature_patterns:
            matches = re.findall(pattern, description.lower())
            requirements['features'].extend(matches)
        
        # Extract style keywords
        style_keywords = ['modern', 'minimal', 'clean', 'professional', 'colorful',
                         'dark', 'light', 'elegant', 'simple', 'complex', 'bold']
        
        for style in style_keywords:
            if style in description.lower():
                requirements['style'].append(style)
        
        # Extract color mentions
        colors = ['blue', 'red', 'green', 'yellow', 'purple', 'orange', 
                 'black', 'white', 'gray', 'pink']
        
        for color in colors:
            if color in description.lower():
                requirements['colors'].append(color)
        
        return requirements
    
    def compute_visual_text_similarity(self, image_tensor, text):
        """Compute CLIP similarity score"""
        try:
            text_tokens = self.tokenizer([text]).to(self.device)
            
            with torch.no_grad():
                image_features = self.model.encode_image(image_tensor)
                text_features = self.model.encode_text(text_tokens)
                
                image_features = image_features / image_features.norm(dim=-1, keepdim=True)
                text_features = text_features / text_features.norm(dim=-1, keepdim=True)
                
                similarity = (image_features @ text_features.T).item()
            
            # Convert to 0-100 scale
            score = (similarity + 1) / 2 * 100
            return max(0, min(100, score))
        
        except Exception as e:
            print(f"❌ Error computing similarity: {e}")
            raise
    
    def evaluate_design_quality(self, image_tensor):
        """
        Evaluate design quality based on visual characteristics
        Uses CLIP to assess design principles
        """
        quality_prompts = [
            "a professional user interface design",
            "a clean and organized layout",
            "a visually appealing design",
            "a well-structured interface",
            "a modern web design"
        ]
        
        scores = []
        for prompt in quality_prompts:
            score = self.compute_visual_text_similarity(image_tensor, prompt)
            scores.append(score)
        
        # Average quality score
        return sum(scores) / len(scores)
    
    def evaluate_requirement_match(self, image_tensor, requirements):
        """
        Evaluate how well the design matches specific requirements
        """
        scores = []
        
        # Check keywords
        for keyword in requirements['keywords']:
            prompt = f"a user interface with {keyword}"
            score = self.compute_visual_text_similarity(image_tensor, prompt)
            scores.append(score)
        
        # Check features
        for feature in requirements['features']:
            prompt = f"a design that includes {feature}"
            score = self.compute_visual_text_similarity(image_tensor, prompt)
            scores.append(score)
        
        # Check style
        for style in requirements['style']:
            prompt = f"a {style} design"
            score = self.compute_visual_text_similarity(image_tensor, prompt)
            scores.append(score * 1.2)  # Weight style higher
        
        # Check colors
        for color in requirements['colors']:
            prompt = f"a design with {color} colors"
            score = self.compute_visual_text_similarity(image_tensor, prompt)
            scores.append(score)
        
        if not scores:
            return 50  # Neutral score if no specific requirements
        
        return sum(scores) / len(scores)
    
    def evaluate_single_design(self, image_url, project_description):
        """
        Comprehensive evaluation of a single design
        Returns detailed scores
        """
        try:
            # Load image
            image_tensor = self.load_image_from_url(image_url)
            
            # Extract requirements
            requirements = self.extract_design_requirements(project_description)
            
            # 1. Overall visual-text similarity (30% weight)
            overall_similarity = self.compute_visual_text_similarity(
                image_tensor, 
                project_description
            )
            
            # 2. Design quality score (25% weight)
            quality_score = self.evaluate_design_quality(image_tensor)
            
            # 3. Requirement match score (35% weight)
            requirement_score = self.evaluate_requirement_match(
                image_tensor, 
                requirements
            )
            
            # 4. Specific feature detection (10% weight)
            feature_score = self.detect_ui_elements(image_tensor)
            
            # Weighted final score
            final_score = (
                overall_similarity * 0.30 +
                quality_score * 0.25 +
                requirement_score * 0.35 +
                feature_score * 0.10
            )
            
            return {
                'final_score': round(final_score, 1),
                'breakdown': {
                    'overall_similarity': round(overall_similarity, 1),
                    'design_quality': round(quality_score, 1),
                    'requirement_match': round(requirement_score, 1),
                    'ui_elements': round(feature_score, 1)
                },
                'requirements_found': requirements
            }
        
        except Exception as e:
            print(f"❌ Error evaluating design: {e}")
            raise
    
    def detect_ui_elements(self, image_tensor):
        """
        Detect common UI elements in the design
        """
        ui_elements = [
            "navigation menu",
            "buttons",
            "text content",
            "images and graphics",
            "forms and inputs",
            "cards and containers"
        ]
        
        scores = []
        for element in ui_elements:
            prompt = f"a user interface with {element}"
            score = self.compute_visual_text_similarity(image_tensor, prompt)
            scores.append(score)
        
        return sum(scores) / len(scores)
    
    def evaluate_multiple_designs(self, project_description, submissions):
        """
        Evaluate multiple design submissions and rank them
        
        Args:
            project_description: Text description of project requirements
            submissions: List of dicts with 'design_images', 'developer_id', 'shortlist_id'
        
        Returns:
            List of results with scores and rankings
        """
        results = []
        
        for submission in submissions:
            try:
                design_scores = []
                
                # Evaluate each image in the submission
                if submission.get('design_images'):
                    for image_url in submission['design_images']:
                        try:
                            eval_result = self.evaluate_single_design(
                                image_url, 
                                project_description
                            )
                            design_scores.append(eval_result)
                        except Exception as e:
                            print(f"⚠️ Failed to evaluate image {image_url}: {e}")
                
                # Average scores across all images
                if design_scores:
                    avg_final_score = sum(s['final_score'] for s in design_scores) / len(design_scores)
                    avg_breakdown = {
                        'overall_similarity': sum(s['breakdown']['overall_similarity'] for s in design_scores) / len(design_scores),
                        'design_quality': sum(s['breakdown']['design_quality'] for s in design_scores) / len(design_scores),
                        'requirement_match': sum(s['breakdown']['requirement_match'] for s in design_scores) / len(design_scores),
                        'ui_elements': sum(s['breakdown']['ui_elements'] for s in design_scores) / len(design_scores)
                    }
                    
                    results.append({
                        'shortlist_id': submission['shortlist_id'],
                        'developer_id': submission['developer_id'],
                        'clip_score': round(avg_final_score, 1),
                        'score_breakdown': avg_breakdown,
                        'images_evaluated': len(design_scores),
                        'requirements_found': design_scores[0]['requirements_found'] if design_scores else {}
                    })
                else:
                    # Fallback to Figma URL if no images
                    results.append({
                        'shortlist_id': submission['shortlist_id'],
                        'developer_id': submission['developer_id'],
                        'clip_score': 0,
                        'images_evaluated': 0,
                        'error': 'No images to evaluate'
                    })
            
            except Exception as e:
                print(f"⚠️ Failed to evaluate submission: {e}")
                results.append({
                    'shortlist_id': submission['shortlist_id'],
                    'developer_id': submission['developer_id'],
                    'clip_score': 0,
                    'images_evaluated': 0,
                    'error': str(e)
                })
        
        # Sort by score descending
        results.sort(key=lambda x: x['clip_score'], reverse=True)
        
        # Add rankings
        for rank, result in enumerate(results, start=1):
            result['rank'] = rank
        
        return results


# Singleton instance
_enhanced_evaluator = None

def get_enhanced_evaluator():
    """Get or create enhanced evaluator instance"""
    if not OPENCLIP_AVAILABLE:
        raise ImportError("OpenCLIP not installed")
    
    global _enhanced_evaluator
    if _enhanced_evaluator is None:
        _enhanced_evaluator = EnhancedDesignEvaluator()
    return _enhanced_evaluator
