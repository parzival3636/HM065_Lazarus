# """
# Freelancer Matching Engine using BERT Embeddings
# Matches freelancers to projects based on:
# - Skill overlap
# - Experience level
# - Portfolio similarity
# - Proposal quality
# - Past project relevance
# """

# import os
# import pickle
# import json
# import numpy as np
# from typing import List, Dict, Tuple
# from pathlib import Path

# from sentence_transformers import SentenceTransformer
# from django.conf import settings

# from accounts.models import DeveloperProfile
# from django.contrib.auth import get_user_model
# User = get_user_model()
# from projects.models import Project, ProjectApplication


# class FreelancerMatcher:
#     """
#     ML-based freelancer matching engine using BERT embeddings and trained classifiers.
#     """
    
#     def __init__(self):
#         """Initialize the matcher with pre-trained models and embeddings."""
#         self.model_dir = os.path.join(settings.BASE_DIR, 'ml_models')
#         self._load_models()
#         self._initialize_embedder()
    
#     def _load_models(self):
#         """Load pre-trained classifiers and scaler from pickle files."""
#         try:
#             gb_path = os.path.join(self.model_dir, 'gb_classifier.pkl')
#             rf_path = os.path.join(self.model_dir, 'rf_classifier.pkl')
#             scaler_path = os.path.join(self.model_dir, 'feature_scaler.pkl')
#             metadata_path = os.path.join(self.model_dir, 'model_metadata.json')
            
#             with open(gb_path, 'rb') as f:
#                 self.gb_model = pickle.load(f)
            
#             with open(rf_path, 'rb') as f:
#                 self.rf_model = pickle.load(f)
            
#             with open(scaler_path, 'rb') as f:
#                 self.scaler = pickle.load(f)
            
#             with open(metadata_path, 'r') as f:
#                 self.metadata = json.load(f)
            
#             print("✓ Models loaded successfully")
#         except FileNotFoundError as e:
#             raise Exception(f"Model files not found in {self.model_dir}: {e}")
    
#     def _initialize_embedder(self):
#         """Initialize BERT embedder for semantic similarity."""
#         model_name = self.metadata.get('embedding_model_name', 'all-MiniLM-L6-v2')
#         self.embedder = SentenceTransformer(model_name)
#         print(f"✓ BERT embedder initialized: {model_name}")
    
#     def _extract_features(self, project: Project, developer: DeveloperProfile, 
#                          application: ProjectApplication) -> np.ndarray:
#         """
#         Extract features from project-freelancer-application triplet.
        
#         Features include:
#         1. BERT embeddings for semantic similarity
#         2. Skill overlap metrics
#         3. Experience level matching
#         4. Portfolio/past project similarity
#         5. Proposal quality metrics
#         """
        
#         # Prepare text inputs
#         project_text = f"{project.title} {project.description} {' '.join(project.tech_stack)}"
        
#         developer_text = f"{developer.title} {developer.bio} {developer.skills}"
        
#         # Combine all past project descriptions if available
#         past_projects_text = self._get_developer_past_projects(developer.user)
        
#         proposal_text = application.cover_letter
        
#         # 1. Get BERT embeddings
#         project_emb = self.embedder.encode(project_text)
#         developer_emb = self.embedder.encode(developer_text)
#         proposal_emb = self.embedder.encode(proposal_text)
#         past_projects_emb = self.embedder.encode(past_projects_text) if past_projects_text else np.zeros_like(project_emb)
        
#         # 2. Calculate cosine similarities
#         project_developer_sim = self._cosine_similarity(project_emb, developer_emb)
#         project_proposal_sim = self._cosine_similarity(project_emb, proposal_emb)
#         project_portfolio_sim = self._cosine_similarity(project_emb, past_projects_emb)
        
#         # 3. Skill overlap calculation
#         required_skills = set(self._normalize_skills(project.tech_stack))
#         developer_skills = set(self._normalize_skills(developer.skills.split(',')))
        
#         skill_overlap = len(required_skills & developer_skills) / max(len(required_skills), 1)
#         missing_skills = len(required_skills - developer_skills)
#         extra_skills = len(developer_skills - required_skills)
        
#         # 4. Experience matching
#         years_exp = developer.years_experience
#         experience_score = min(years_exp / 10, 1.0)  # Normalize to 0-1
        
#         # 5. Proposal quality metrics
#         proposal_length = len(proposal_text.split())
#         proposal_detailed = 1 if proposal_length > 50 else 0
#         proposal_quality_score = min(proposal_length / 500, 1.0)  # Normalize
        
#         # 6. Performance metrics
#         rating_score = float(developer.rating) / 5.0 if developer.rating else 0.5
#         success_rate_score = float(developer.success_rate) / 100.0 if developer.success_rate else 0.5
        
#         # 7. Availability and rate matching
#         proposed_rate = float(application.proposed_rate) if application.proposed_rate else 0
#         budget_mid = (float(project.budget_min) + float(project.budget_max)) / 2 if project.budget_min and project.budget_max else 1000
#         rate_fit = 1.0 if proposed_rate <= budget_mid else max(0, 1 - (proposed_rate - budget_mid) / budget_mid)
        
#         # Combine all features
#         features = np.concatenate([
#             [project_developer_sim],      # Overall similarity
#             [project_proposal_sim],        # Proposal relevance
#             [project_portfolio_sim],       # Portfolio relevance
#             [skill_overlap],               # Skill match ratio
#             [missing_skills / max(len(required_skills), 1)],  # Missing skills ratio
#             [extra_skills / max(len(developer_skills), 1)],   # Extra skills ratio
#             [years_exp / 20],              # Normalized experience
#             [experience_score],            # Experience fit
#             [proposal_length / 1000],      # Normalized proposal length
#             [proposal_detailed],           # Proposal quality flag
#             [proposal_quality_score],      # Proposal quality score
#             [rating_score],                # Developer rating
#             [success_rate_score],          # Success rate
#             [rate_fit],                    # Rate fit score
#             project_emb[:50],              # First 50 dims of project embedding
#             developer_emb[:50],            # First 50 dims of developer embedding
#         ])
        
#         return features
    
#     def _cosine_similarity(self, vec1: np.ndarray, vec2: np.ndarray) -> float:
#         """Calculate cosine similarity between two vectors."""
#         norm1 = np.linalg.norm(vec1)
#         norm2 = np.linalg.norm(vec2)
        
#         if norm1 == 0 or norm2 == 0:
#             return 0.0
        
#         return float(np.dot(vec1, vec2) / (norm1 * norm2))
    
#     def _normalize_skills(self, skills) -> List[str]:
#         """Normalize skill strings to lowercase and split."""
#         if isinstance(skills, list):
#             return [s.strip().lower() for s in skills]
#         elif isinstance(skills, str):
#             return [s.strip().lower() for s in skills.replace(',', ' ').split()]
#         return []
    
#     def _get_developer_past_projects(self, user: User) -> str:
#         """Get developer's past project descriptions from applications."""
#         past_projects = []
        
#         # Get completed projects
#         completed_apps = ProjectApplication.objects.filter(
#             developer=user,
#             status='selected'
#         ).select_related('project')[:10]  # Last 10 projects
        
#         for app in completed_apps:
#             past_projects.append(app.project.description)
        
#         return ' '.join(past_projects) if past_projects else ""
    
#     def _predict_match_score(self, features: np.ndarray, component_scores: Dict[str, int] = None) -> int:
#         """
#         Predict match score using component scores as fallback.
        
#         Returns score from 0-100.
#         """
#         try:
#             # If component scores provided, use them as primary source
#             if component_scores:
#                 # Weighted average of components
#                 score = (
#                     component_scores['skill_match'] * 0.35 +
#                     component_scores['experience_fit'] * 0.25 +
#                     component_scores['portfolio_quality'] * 0.20 +
#                     component_scores['proposal_quality'] * 0.15 +
#                     component_scores['rate_fit'] * 0.05
#                 )
#                 return int(round(score))
            
#             # Scale features
#             features_scaled = self.scaler.transform(features.reshape(1, -1))
            
#             # Get predictions from both models
#             gb_bin = self.gb_model.predict(features_scaled)[0]
#             rf_bin = self.rf_model.predict(features_scaled)[0]
            
#             # Map bins to scores
#             bin_to_score = {0: 25, 1: 50, 2: 75, 3: 95}
#             gb_score = bin_to_score.get(gb_bin, 50)
#             rf_score = bin_to_score.get(rf_bin, 50)
            
#             # Weighted ensemble average
#             final_score = (gb_score + rf_score) / 2
            
#             return int(round(final_score))
#         except Exception as e:
#             print(f"Error in prediction: {e}")
#             # Fallback to component scores if available
#             if component_scores:
#                 score = (
#                     component_scores['skill_match'] * 0.35 +
#                     component_scores['experience_fit'] * 0.25 +
#                     component_scores['portfolio_quality'] * 0.20 +
#                     component_scores['proposal_quality'] * 0.15 +
#                     component_scores['rate_fit'] * 0.05
#                 )
#                 return int(round(score))
#             return 50  # Default middle score on error
    
#     def _calculate_component_scores(self, project: Project, developer: DeveloperProfile,
#                                    application: ProjectApplication) -> Dict[str, int]:
#         """Calculate individual component scores for transparency."""
        
#         # Skill match
#         required_skills = set(self._normalize_skills(project.tech_stack))
#         developer_skills = set(self._normalize_skills(developer.skills.split(',')))
#         skill_match = len(required_skills & developer_skills) / max(len(required_skills), 1) * 100
        
#         # Experience fit
#         experience_fit = min(developer.years_experience / 5 * 100, 100)
        
#         # Portfolio quality
#         portfolio_quality = float(developer.rating) * 20 if developer.rating else 50
        
#         # Proposal quality
#         proposal_length = len(application.cover_letter.split())
#         proposal_quality = min(proposal_length / 5, 100)
        
#         # Rate fit
#         proposed_rate = float(application.proposed_rate) if application.proposed_rate else 0
#         budget_mid = (float(project.budget_min) + float(project.budget_max)) / 2 if project.budget_min and project.budget_max else 1000
#         rate_fit = 100 if proposed_rate <= budget_mid else max(0, 100 - (proposed_rate - budget_mid) / budget_mid * 100)
        
#         return {
#             'skill_match': int(skill_match),
#             'experience_fit': int(experience_fit),
#             'portfolio_quality': int(portfolio_quality),
#             'proposal_quality': int(proposal_quality),
#             'rate_fit': int(rate_fit),
#         }
    
#     def rank_freelancers(self, project: Project, top_n: int = 5) -> List[Dict]:
#         """
#         Rank all freelancers who applied to a project.
        
#         Args:
#             project: Project instance
#             top_n: Number of top freelancers to return
        
#         Returns:
#             List of dicts with freelancer info and match scores
#         """
        
#         # Get all applications for the project
#         applications = ProjectApplication.objects.filter(
#             project=project,
#             status='pending'
#         ).select_related('developer', 'developer__developerprofile')
        
#         if not applications.exists():
#             return []
        
#         results = []
        
#         for application in applications:
#             try:
#                 developer = application.developer.developerprofile
                
#                 # Extract features and predict
#                 features = self._extract_features(project, developer, application)
#                 component_scores = self._calculate_component_scores(project, developer, application)
#                 overall_score = self._predict_match_score(features, component_scores)
                
#                 results.append({
#                     'application_id': application.id,
#                     'developer_id': developer.user.id,
#                     'developer_name': developer.user.get_full_name(),
#                     'developer_title': developer.title,
#                     'overall_score': overall_score,
#                     'component_scores': component_scores,
#                     'years_experience': developer.years_experience,
#                     'rating': float(developer.rating),
#                     'total_projects': developer.total_projects,
#                     'success_rate': float(developer.success_rate),
#                     'proposed_rate': float(application.proposed_rate) if application.proposed_rate else None,
#                     'estimated_duration': application.estimated_duration,
#                 })
#             except Exception as e:
#                 print(f"Error processing application {application.id}: {e}")
#                 continue
        
#         # Sort by overall score descending
#         results.sort(key=lambda x: x['overall_score'], reverse=True)
        
#         # Return top N
#         return results[:top_n]
    
#     def get_match_details(self, application: ProjectApplication) -> Dict:
#         """
#         Get detailed match analysis for a specific application.
        
#         Returns comprehensive matching details.
#         """
#         project = application.project
#         developer = application.developer.developerprofile
        
#         try:
#             features = self._extract_features(project, developer, application)
#             component_scores = self._calculate_component_scores(project, developer, application)
#             overall_score = self._predict_match_score(features, component_scores)
            
#             # Calculate skill gaps
#             required_skills = set(self._normalize_skills(project.tech_stack))
#             developer_skills = set(self._normalize_skills(developer.skills.split(',')))
            
#             matching_skills = list(required_skills & developer_skills)
#             missing_skills = list(required_skills - developer_skills)
#             extra_skills = list(developer_skills - required_skills)
            
#             return {
#                 'overall_score': overall_score,
#                 'component_scores': component_scores,
#                 'matching_skills': matching_skills,
#                 'missing_skills': missing_skills,
#                 'extra_skills': extra_skills,
#                 'developer_info': {
#                     'name': developer.user.get_full_name(),
#                     'title': developer.title,
#                     'years_experience': developer.years_experience,
#                     'rating': float(developer.rating),
#                     'total_projects': developer.total_projects,
#                     'success_rate': float(developer.success_rate),
#                 },
#                 'project_info': {
#                     'title': project.title,
#                     'category': project.category,
#                     'complexity': project.complexity,
#                     'tech_stack': project.tech_stack,
#                 },
#             }
#         except Exception as e:
#             print(f"Error getting match details: {e}")
#             return None


# # Singleton instance
# _matcher_instance = None


# def get_matcher() -> FreelancerMatcher:
#     """Get or create the matcher instance."""
#     global _matcher_instance
#     if _matcher_instance is None:
#         _matcher_instance = FreelancerMatcher()
#     return _matcher_instance
























"""
Freelancer Matching Engine using BERT Embeddings
Matches freelancers to projects based on:
- Skill overlap
- Experience level
- Portfolio similarity
- Proposal quality
- Past project relevance
"""

import os
import pickle
import json
import numpy as np
from typing import List, Dict, Tuple, Optional
from pathlib import Path

from sentence_transformers import SentenceTransformer
from django.conf import settings

from accounts.models import DeveloperProfile
from django.contrib.auth import get_user_model

User = get_user_model()
from projects.models import Project, ProjectApplication


class FreelancerMatcher:
    """
    ML-based freelancer matching engine using BERT embeddings and trained classifiers.
    """
    
    def __init__(self):
        """Initialize the matcher with pre-trained models and embeddings."""
        self.model_dir = os.path.join(settings.BASE_DIR, 'ml_models')
        self.models_loaded = False
        self._load_models()
        self._initialize_embedder()
    
    def _load_models(self):
        """Load pre-trained classifiers and scaler from pickle files."""
        try:
            gb_path = os.path.join(self.model_dir, 'gb_classifier.pkl')
            rf_path = os.path.join(self.model_dir, 'rf_classifier.pkl')
            scaler_path = os.path.join(self.model_dir, 'feature_scaler.pkl')
            metadata_path = os.path.join(self.model_dir, 'model_metadata.json')
            
            # Check if files exist
            if not all(os.path.exists(p) for p in [gb_path, rf_path, scaler_path, metadata_path]):
                print(f"⚠ Model files not found in {self.model_dir}. Using fallback scoring.")
                self.models_loaded = False
                return
            
            with open(gb_path, 'rb') as f:
                self.gb_model = pickle.load(f)
            
            with open(rf_path, 'rb') as f:
                self.rf_model = pickle.load(f)
            
            with open(scaler_path, 'rb') as f:
                self.scaler = pickle.load(f)
            
            with open(metadata_path, 'r') as f:
                self.metadata = json.load(f)
            
            self.models_loaded = True
            print("✓ Models loaded successfully")
            print(f"  Expected feature dimensions: {self.metadata.get('n_features', 'unknown')}")
            
        except Exception as e:
            print(f"⚠ Error loading models: {e}")
            print("  Using fallback component-based scoring")
            self.models_loaded = False
    
    def _initialize_embedder(self):
        """Initialize BERT embedder for semantic similarity."""
        try:
            model_name = getattr(self, 'metadata', {}).get('embedding_model_name', 'all-MiniLM-L6-v2')
            self.embedder = SentenceTransformer(model_name)
            print(f"✓ BERT embedder initialized: {model_name}")
        except Exception as e:
            print(f"⚠ Error initializing embedder: {e}")
            self.embedder = None
    
    def _extract_features(self, project: Project, developer: DeveloperProfile, 
                         application: ProjectApplication) -> np.ndarray:
        """
        Extract features from project-freelancer-application triplet.
        """
        
        # Prepare text inputs
        project_text = f"{project.title} {project.description} {' '.join(project.tech_stack)}"
        developer_text = f"{developer.title} {developer.bio} {developer.skills}"
        past_projects_text = self._get_developer_past_projects(developer.user)
        proposal_text = application.cover_letter
        
        # 1. Get BERT embeddings (if available)
        if self.embedder is not None:
            try:
                project_emb = self.embedder.encode(project_text)
                developer_emb = self.embedder.encode(developer_text)
                proposal_emb = self.embedder.encode(proposal_text)
                past_projects_emb = self.embedder.encode(past_projects_text) if past_projects_text else np.zeros_like(project_emb)
                
                # Calculate cosine similarities
                project_developer_sim = self._cosine_similarity(project_emb, developer_emb)
                project_proposal_sim = self._cosine_similarity(project_emb, proposal_emb)
                project_portfolio_sim = self._cosine_similarity(project_emb, past_projects_emb)
            except Exception as e:
                print(f"⚠ Error computing embeddings: {e}")
                project_developer_sim = 0.5
                project_proposal_sim = 0.5
                project_portfolio_sim = 0.5
                project_emb = np.zeros(384)
                developer_emb = np.zeros(384)
        else:
            project_developer_sim = 0.5
            project_proposal_sim = 0.5
            project_portfolio_sim = 0.5
            project_emb = np.zeros(384)
            developer_emb = np.zeros(384)
        
        # 2. Skill overlap calculation
        required_skills = set(self._normalize_skills(project.tech_stack))
        developer_skills = set(self._normalize_skills(developer.skills.split(',')))
        
        skill_overlap = len(required_skills & developer_skills) / max(len(required_skills), 1)
        missing_skills = len(required_skills - developer_skills)
        extra_skills = len(developer_skills - required_skills)
        
        # 3. Experience matching
        years_exp = developer.years_experience or 0
        experience_score = min(years_exp / 10, 1.0)
        
        # 4. Proposal quality metrics
        proposal_length = len(proposal_text.split())
        proposal_detailed = 1 if proposal_length > 50 else 0
        proposal_quality_score = min(proposal_length / 500, 1.0)
        
        # 5. Performance metrics
        rating_score = float(developer.rating or 0) / 5.0
        success_rate_score = float(developer.success_rate or 50) / 100.0
        
        # 6. Availability and rate matching
        proposed_rate = float(application.proposed_rate) if application.proposed_rate else 0
        budget_min = float(project.budget_min) if project.budget_min else 0
        budget_max = float(project.budget_max) if project.budget_max else 1000
        budget_mid = (budget_min + budget_max) / 2 if budget_max > 0 else 1000
        
        if budget_mid > 0:
            rate_fit = 1.0 if proposed_rate <= budget_mid else max(0, 1 - (proposed_rate - budget_mid) / budget_mid)
        else:
            rate_fit = 0.5
        
        # Combine all features (14 scalar features only for simplicity)
        features = np.array([
            project_developer_sim,      # Overall similarity
            project_proposal_sim,        # Proposal relevance
            project_portfolio_sim,       # Portfolio relevance
            skill_overlap,               # Skill match ratio
            missing_skills / max(len(required_skills), 1),  # Missing skills ratio
            extra_skills / max(len(developer_skills), 1),   # Extra skills ratio
            years_exp / 20,              # Normalized experience
            experience_score,            # Experience fit
            proposal_length / 1000,      # Normalized proposal length
            float(proposal_detailed),    # Proposal quality flag
            proposal_quality_score,      # Proposal quality score
            rating_score,                # Developer rating
            success_rate_score,          # Success rate
            rate_fit,                    # Rate fit score
        ])
        
        return features
    
    def _cosine_similarity(self, vec1: np.ndarray, vec2: np.ndarray) -> float:
        """Calculate cosine similarity between two vectors."""
        norm1 = np.linalg.norm(vec1)
        norm2 = np.linalg.norm(vec2)
        
        if norm1 == 0 or norm2 == 0:
            return 0.0
        
        return float(np.dot(vec1, vec2) / (norm1 * norm2))
    
    def _normalize_skills(self, skills) -> List[str]:
        """Normalize skill strings to lowercase and split."""
        if isinstance(skills, list):
            return [s.strip().lower() for s in skills if s.strip()]
        elif isinstance(skills, str):
            return [s.strip().lower() for s in skills.replace(',', ' ').split() if s.strip()]
        return []
    
    def _get_developer_past_projects(self, user: User) -> str:
        """Get developer's past project descriptions from applications."""
        try:
            past_projects = []
            completed_apps = ProjectApplication.objects.filter(
                developer=user,
                status='selected'
            ).select_related('project')[:10]
            
            for app in completed_apps:
                past_projects.append(app.project.description)
            
            return ' '.join(past_projects) if past_projects else ""
        except Exception as e:
            print(f"⚠ Error fetching past projects: {e}")
            return ""
    
    def _predict_match_score(self, features: np.ndarray, component_scores: Dict[str, float]) -> int:
        """
        Predict match score using ML models or component scores as fallback.
        
        Returns score from 0-100.
        """
        
        # ALWAYS use component scores as primary method
        # This ensures transparent, explainable scoring
        weighted_score = (
            component_scores['skill_match'] * 0.35 +
            component_scores['experience_fit'] * 0.25 +
            component_scores['portfolio_quality'] * 0.20 +
            component_scores['proposal_quality'] * 0.15 +
            component_scores['rate_fit'] * 0.05
        )
        
        print(f"  Component breakdown: Skill={component_scores['skill_match']:.1f}, "
              f"Exp={component_scores['experience_fit']:.1f}, "
              f"Portfolio={component_scores['portfolio_quality']:.1f}, "
              f"Proposal={component_scores['proposal_quality']:.1f}, "
              f"Rate={component_scores['rate_fit']:.1f}")
        print(f"  → Weighted score: {weighted_score:.1f}")
        
        # If models are loaded, use them to adjust the score
        if self.models_loaded:
            try:
                features_scaled = self.scaler.transform(features.reshape(1, -1))
                
                gb_bin = self.gb_model.predict(features_scaled)[0]
                rf_bin = self.rf_model.predict(features_scaled)[0]
                
                bin_to_score = {0: 25, 1: 50, 2: 75, 3: 95}
                gb_score = bin_to_score.get(gb_bin, 50)
                rf_score = bin_to_score.get(rf_bin, 50)
                
                ml_score = (gb_score + rf_score) / 2
                
                # Blend ML score with component score (70% component, 30% ML)
                final_score = weighted_score * 0.7 + ml_score * 0.3
                print(f"  → ML adjustment: {ml_score:.1f}, Final: {final_score:.1f}")
                
                return int(round(final_score))
            except Exception as e:
                print(f"⚠ ML prediction failed: {e}, using component score")
        
        return int(round(weighted_score))
    
    def _calculate_component_scores(self, project: Project, developer: DeveloperProfile,
                                   application: ProjectApplication) -> Dict[str, float]:
        """Calculate individual component scores for transparency."""
        
        # 1. Skill match (0-100)
        required_skills = set(self._normalize_skills(project.tech_stack))
        developer_skills = set(self._normalize_skills(developer.skills.split(',')))
        
        if len(required_skills) > 0:
            skill_overlap = len(required_skills & developer_skills) / len(required_skills)
            skill_match = skill_overlap * 100
        else:
            skill_match = 50.0  # Neutral if no requirements
        
        # 2. Experience fit (0-100)
        years_exp = developer.years_experience or 0
        # Map 0-10 years to 0-100 score
        experience_fit = min(years_exp * 10, 100)
        
        # 3. Portfolio quality (0-100)
        rating = float(developer.rating or 0)
        total_projects = developer.total_projects or 0
        success_rate = float(developer.success_rate or 50)
        
        # Weighted average: rating 50%, success rate 30%, project count 20%
        portfolio_quality = (
            (rating / 5.0 * 100) * 0.5 +
            success_rate * 0.3 +
            min(total_projects * 5, 100) * 0.2
        )
        
        # 4. Proposal quality (0-100)
        proposal_length = len(application.cover_letter.split())
        # Good proposal: 100-300 words = 80-100 score
        if proposal_length < 50:
            proposal_quality = proposal_length * 0.8  # 0-40 score
        elif proposal_length < 100:
            proposal_quality = 40 + (proposal_length - 50) * 0.8  # 40-80 score
        else:
            proposal_quality = min(80 + (proposal_length - 100) / 10, 100)  # 80-100 score
        
        # 5. Rate fit (0-100)
        proposed_rate = float(application.proposed_rate) if application.proposed_rate else 0
        budget_min = float(project.budget_min) if project.budget_min else 0
        budget_max = float(project.budget_max) if project.budget_max else 1000
        budget_mid = (budget_min + budget_max) / 2 if budget_max > 0 else 1000
        
        if budget_mid > 0 and proposed_rate > 0:
            if proposed_rate <= budget_mid:
                rate_fit = 100.0
            else:
                # Penalty for exceeding budget
                overage_pct = (proposed_rate - budget_mid) / budget_mid
                rate_fit = max(0, 100 - (overage_pct * 100))
        else:
            rate_fit = 50.0  # Neutral if no budget info
        
        scores = {
            'skill_match': float(skill_match),
            'experience_fit': float(experience_fit),
            'portfolio_quality': float(portfolio_quality),
            'proposal_quality': float(proposal_quality),
            'rate_fit': float(rate_fit),
        }
        
        print(f"  Raw component scores: {scores}")
        return scores
    
    def rank_freelancers(self, project: Project, top_n: int = 5) -> List[Dict]:
        """
        Rank all freelancers who applied to a project.
        """
        
        applications = ProjectApplication.objects.filter(
            project=project,
            status='pending'
        ).select_related('developer', 'developer__developerprofile')
        
        if not applications.exists():
            print("  No pending applications found")
            return []
        
        print(f"\n📊 Ranking {applications.count()} freelancers for project: {project.title}")
        results = []
        
        for application in applications:
            try:
                developer = application.developer.developerprofile
                print(f"\n  Evaluating: {developer.user.get_full_name()}")
                
                component_scores = self._calculate_component_scores(project, developer, application)
                features = self._extract_features(project, developer, application)
                overall_score = self._predict_match_score(features, component_scores)
                
                results.append({
                    'application_id': application.id,
                    'developer_id': developer.user.id,
                    'developer_name': developer.user.get_full_name(),
                    'developer_title': developer.title,
                    'overall_score': overall_score,
                    'component_scores': component_scores,
                    'years_experience': developer.years_experience,
                    'rating': float(developer.rating or 0),
                    'total_projects': developer.total_projects,
                    'success_rate': float(developer.success_rate or 0),
                    'proposed_rate': float(application.proposed_rate) if application.proposed_rate else None,
                    'estimated_duration': application.estimated_duration,
                })
            except Exception as e:
                print(f"  ⚠ Error processing application {application.id}: {e}")
                import traceback
                traceback.print_exc()
                continue
        
        results.sort(key=lambda x: x['overall_score'], reverse=True)
        
        print(f"\n✅ Ranked {len(results)} freelancers")
        for i, r in enumerate(results[:top_n], 1):
            print(f"  {i}. {r['developer_name']}: {r['overall_score']}/100")
        
        return results[:top_n]
    
    def get_match_details(self, application: ProjectApplication) -> Optional[Dict]:
        """Get detailed match analysis for a specific application."""
        project = application.project
        developer = application.developer.developerprofile
        
        try:
            component_scores = self._calculate_component_scores(project, developer, application)
            features = self._extract_features(project, developer, application)
            overall_score = self._predict_match_score(features, component_scores)
            
            required_skills = set(self._normalize_skills(project.tech_stack))
            developer_skills = set(self._normalize_skills(developer.skills.split(',')))
            
            matching_skills = sorted(list(required_skills & developer_skills))
            missing_skills = sorted(list(required_skills - developer_skills))
            extra_skills = sorted(list(developer_skills - required_skills))
            
            return {
                'overall_score': overall_score,
                'component_scores': component_scores,
                'matching_skills': matching_skills,
                'missing_skills': missing_skills,
                'extra_skills': extra_skills,
                'developer_info': {
                    'name': developer.user.get_full_name(),
                    'title': developer.title,
                    'years_experience': developer.years_experience,
                    'rating': float(developer.rating or 0),
                    'total_projects': developer.total_projects,
                    'success_rate': float(developer.success_rate or 0),
                },
                'project_info': {
                    'title': project.title,
                    'category': project.category,
                    'complexity': project.complexity,
                    'tech_stack': project.tech_stack,
                },
            }
        except Exception as e:
            print(f"⚠ Error getting match details: {e}")
            import traceback
            traceback.print_exc()
            return None


# Singleton instance
_matcher_instance = None


def get_matcher() -> FreelancerMatcher:
    """Get or create the matcher instance."""
    global _matcher_instance
    if _matcher_instance is None:
        _matcher_instance = FreelancerMatcher()
    return _matcher_instance