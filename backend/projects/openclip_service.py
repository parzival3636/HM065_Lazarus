"""
OpenCLIP service for evaluating Figma designs against project descriptions.
Uses CLIP model to compute similarity between design images and text descriptions.
"""

import re
import requests
from io import BytesIO

# Try to import OpenCLIP dependencies
try:
    import torch
    import open_clip
    from PIL import Image
    OPENCLIP_AVAILABLE = True
except ImportError as e:
    OPENCLIP_AVAILABLE = False
    print(f"⚠️ OpenCLIP not available: {e}")
    print("   Install with: pip install open-clip-torch pillow torchvision")


class OpenCLIPEvaluator:
    """Evaluates Figma designs using OpenCLIP model"""
    
    def __init__(self):
        if not OPENCLIP_AVAILABLE:
            raise ImportError(
                "OpenCLIP is not installed. "
                "Install with: pip install open-clip-torch pillow torchvision"
            )
        
        self.model = None
        self.preprocess = None
        self.tokenizer = None
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self._initialize_model()
    
    def _initialize_model(self):
        """Initialize OpenCLIP model"""
        try:
            # Using ViT-B-32 model with laion2b_s34b_b79k pretrained weights
            self.model, _, self.preprocess = open_clip.create_model_and_transforms(
                'ViT-B-32',
                pretrained='laion2b_s34b_b79k'
            )
            self.tokenizer = open_clip.get_tokenizer('ViT-B-32')
            self.model = self.model.to(self.device)
            self.model.eval()
            print(f"✅ OpenCLIP model initialized on {self.device}")
        except Exception as e:
            print(f"❌ Failed to initialize OpenCLIP: {e}")
            raise
    
    def extract_figma_image_url(self, figma_url):
        """
        Extract image URL from Figma link.
        For now, we'll use Figma's thumbnail API or screenshot service.
        
        Note: In production, you'd need:
        1. Figma API token
        2. Parse file ID from URL
        3. Use Figma API to get image exports
        """
        # Extract file ID from Figma URL
        # Format: https://www.figma.com/file/{file_id}/{file_name}
        match = re.search(r'figma\.com/file/([a-zA-Z0-9]+)', figma_url)
        if not match:
            raise ValueError("Invalid Figma URL format")
        
        file_id = match.group(1)
        
        # For now, return a placeholder
        # In production, use Figma API to get actual image
        return f"https://www.figma.com/file/{file_id}/thumbnail"
    
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
    
    def compute_similarity(self, image_url, text_description):
        """
        Compute similarity between image and text description.
        Returns a score between 0 and 1.
        """
        try:
            # Load and preprocess image
            image_tensor = self.load_image_from_url(image_url)
            
            # Tokenize text
            text_tokens = self.tokenizer([text_description]).to(self.device)
            
            # Compute embeddings
            with torch.no_grad():
                image_features = self.model.encode_image(image_tensor)
                text_features = self.model.encode_text(text_tokens)
                
                # Normalize features
                image_features = image_features / image_features.norm(dim=-1, keepdim=True)
                text_features = text_features / text_features.norm(dim=-1, keepdim=True)
                
                # Compute cosine similarity
                similarity = (image_features @ text_features.T).item()
            
            # Convert to 0-100 scale
            score = (similarity + 1) / 2 * 100  # CLIP similarity is between -1 and 1
            
            return max(0, min(100, score))  # Clamp between 0 and 100
        
        except Exception as e:
            print(f"❌ Error computing similarity: {e}")
            raise
    
    def evaluate_figma_submissions(self, project_description, submissions):
        """
        Evaluate multiple Figma submissions and rank them.
        
        Args:
            project_description: Text description of the project requirements
            submissions: List of dicts with 'figma_url', 'design_images', 'developer_id', and 'shortlist_id'
        
        Returns:
            List of dicts with scores and rankings
        """
        results = []
        
        for submission in submissions:
            try:
                scores = []
                
                # Evaluate design images if provided
                if submission.get('design_images') and len(submission['design_images']) > 0:
                    for image_url in submission['design_images']:
                        try:
                            score = self.compute_similarity(image_url, project_description)
                            scores.append(score)
                        except Exception as e:
                            print(f"⚠️ Failed to evaluate image {image_url}: {e}")
                
                # If no images or all failed, try Figma URL
                if not scores and submission.get('figma_url'):
                    try:
                        image_url = self.extract_figma_image_url(submission['figma_url'])
                        score = self.compute_similarity(image_url, project_description)
                        scores.append(score)
                    except Exception as e:
                        print(f"⚠️ Failed to evaluate Figma URL: {e}")
                
                # Use average score if multiple images, or 0 if all failed
                final_score = sum(scores) / len(scores) if scores else 0
                
                results.append({
                    'shortlist_id': submission['shortlist_id'],
                    'developer_id': submission['developer_id'],
                    'clip_score': final_score,
                    'images_evaluated': len(scores)
                })
            
            except Exception as e:
                print(f"⚠️ Failed to evaluate submission for developer {submission['developer_id']}: {e}")
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
_evaluator_instance = None


def get_openclip_evaluator():
    """Get or create OpenCLIP evaluator instance"""
    if not OPENCLIP_AVAILABLE:
        raise ImportError(
            "OpenCLIP is not installed. "
            "Install with: pip install open-clip-torch pillow torchvision"
        )
    
    global _evaluator_instance
    if _evaluator_instance is None:
        _evaluator_instance = OpenCLIPEvaluator()
    return _evaluator_instance
