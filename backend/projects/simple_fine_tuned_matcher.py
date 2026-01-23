"""
Simple Fine-tuned Matcher for Supabase Integration
Adapts the fine-tuned matcher to work with Supabase data structures
"""

import os
import numpy as np
from typing import Dict
from django.conf import settings

# Try to import SentenceTransformer with graceful handling
try:
    from sentence_transformers import SentenceTransformer
    SENTENCE_TRANSFORMERS_AVAILABLE = True
except ImportError:
    SentenceTransformer = None
    SENTENCE_TRANSFORMERS_AVAILABLE = False


class SimpleMatcher:
    """
    Simple matcher that works with Supabase data structures.
    Uses fine-tuned SBERT model if available, falls back to component scoring.
    """
    
    def __init__(self):
        """Initialize the matcher with the fine-tuned model."""
        self.model_dir = os.path.join(settings.BASE_DIR, 'fine_tuned_model')
        self.model = None
        self.scorer = None
        
        self._load_model()
        self._load_scorer()
    
    def _load_model(self):
        """Load the fine-tuned SBERT model."""
        if not SENTENCE_TRANSFORMERS_AVAILABLE:
            print("⚠️ SentenceTransformers not available, using component scoring")
            return
        
        if not os.path.exists(self.model_dir):
            print(f"⚠️ Fine-tuned model not found at: {self.model_dir}")
            return
        
        try:
            self.model = SentenceTransformer(self.model_dir)
            print("✅ Fine-tuned SBERT model loaded successfully!")
        except Exception as e:
            print(f"⚠️ Failed to load fine-tuned model: {e}")
            self.model = None
    
    def _load_scorer(self):
        """Load the custom scorer."""
        scorer_path = os.path.join(settings.BASE_DIR, 'scorer.py')
        
        if not os.path.exists(scorer_path):
            return
        
        try:
            import importlib.util
            spec = importlib.util.spec_from_file_location("scorer", scorer_path)
            scorer_module = importlib.util.module_from_spec(spec)
            spec.loader.exec_module(scorer_module)
            
            if hasattr(scorer_module, 'calculate_score'):
                self.scorer = scorer_module.calculate_score
                print("✅ Custom scorer loaded successfully!")
            elif hasattr(scorer_module, 'score'):
                self.scorer = scorer_module.score
                print("✅ Custom scorer loaded successfully!")
        except Exception as e:
            print(f"⚠️ Error loading custom scorer: {e}")
            self.scorer = None
    
    def calculate_match_score(self, project_data: Dict, application_data: Dict) -> Dict:
        """
        Calculate match score for a project and application.
        
        Args:
            project_data: Dict with project info (title, description, tech_stack, budget, etc.)
            application_data: Dict with application info (cover_letter, proposed_rate, developer_profile, etc.)
        
        Returns:
            Dict with overall_score, component_scores, and reasoning
        """
        
        developer_profile = application_data.get('developer_profile', {})
        
        # Calculate component scores
        component_scores = self._calculate_component_scores(project_data, developer_profile, application_data)
        
        # Try to use fine-tuned model if available
        if self.model:
            try:
                overall_score = self._calculate_sbert_score(project_data, developer_profile, application_data, component_scores)
                method = "fine-tuned SBERT"
            except Exception as e:
                print(f"⚠️ SBERT scoring failed: {e}")
                overall_score = self._calculate_weighted_score(component_scores)
                method = "component-based"
        else:
            overall_score = self._calculate_weighted_score(component_scores)
            method = "component-based"
        
        # Generate reasoning
        reasoning = self._generate_reasoning(overall_score, component_scores, method)
        
        return {
            'overall_score': int(round(overall_score)),
            'component_scores': component_scores,
            'reasoning': reasoning,
            'method': method
        }
    
    def _calculate_sbert_score(self, project_data: Dict, developer_profile: Dict, 
                              application_data: Dict, component_scores: Dict) -> float:
        """Calculate score using fine-tuned SBERT model."""
        
        # Prepare text pairs
        project_text = f"{project_data.get('title', '')}. {project_data.get('description', '')}"
        
        tech_stack = project_data.get('tech_stack', [])
        if isinstance(tech_stack, str):
            tech_stack = [tech_stack]
        project_requirements = f"Required skills: {', '.join(tech_stack)}. "
        project_requirements += f"Budget: ${project_data.get('budget_min', 0)}-${project_data.get('budget_max', 0)}."
        
        developer_text = f"{developer_profile.get('title', '')}. {developer_profile.get('bio', '')}"
        developer_skills = f"Skills: {developer_profile.get('skills', '')}. "
        developer_skills += f"Experience: {developer_profile.get('years_experience', 0)} years. "
        developer_skills += f"Rating: {developer_profile.get('rating', 0)}/5."
        
        proposal_text = application_data.get('cover_letter', '')
        
        # Calculate similarities
        text_pairs = [
            (project_text, developer_text),
            (project_requirements, developer_skills),
            (project_text, proposal_text),
        ]
        
        similarities = []
        for text1, text2 in text_pairs:
            if text1 and text2:
                try:
                    emb1 = self.model.encode(text1, convert_to_tensor=False)
                    emb2 = self.model.encode(text2, convert_to_tensor=False)
                    similarity = np.dot(emb1, emb2) / (np.linalg.norm(emb1) * np.linalg.norm(emb2))
                    similarities.append(float(similarity))
                except:
                    similarities.append(0.5)
        
        # Weight similarities
        if similarities:
            avg_similarity = sum(similarities) / len(similarities)
            # Convert from [-1, 1] to [0, 100]
            sbert_score = (avg_similarity + 1) * 50
            
            # Blend with component scores (70% SBERT, 30% components)
            component_avg = self._calculate_weighted_score(component_scores)
            final_score = sbert_score * 0.7 + component_avg * 0.3
            
            return min(100, max(0, final_score))
        
        return self._calculate_weighted_score(component_scores)
    
    def _calculate_weighted_score(self, component_scores: Dict) -> float:
        """Calculate weighted average of component scores."""
        return (
            component_scores['skill_match'] * 0.35 +
            component_scores['experience_fit'] * 0.25 +
            component_scores['portfolio_quality'] * 0.20 +
            component_scores['proposal_quality'] * 0.15 +
            component_scores['rate_fit'] * 0.05
        )
    
    def _calculate_component_scores(self, project_data: Dict, developer_profile: Dict,
                                   application_data: Dict) -> Dict:
        """Calculate individual component scores."""
        
        # Skill match
        tech_stack = project_data.get('tech_stack', [])
        if isinstance(tech_stack, str):
            tech_stack = [tech_stack]
        required_skills = set(skill.strip().lower() for skill in tech_stack)
        
        dev_skills_str = developer_profile.get('skills', '')
        developer_skills = set(skill.strip().lower() for skill in dev_skills_str.split(',') if skill.strip())
        
        if len(required_skills) > 0:
            skill_overlap = len(required_skills & developer_skills) / len(required_skills)
            skill_match = skill_overlap * 100
        else:
            skill_match = 50.0
        
        # Experience fit
        years_exp = developer_profile.get('years_experience', 0) or 0
        experience_fit = min(years_exp * 10, 100)
        
        # Portfolio quality
        rating = float(developer_profile.get('rating', 0) or 0)
        total_projects = developer_profile.get('total_projects', 0) or 0
        success_rate = float(developer_profile.get('success_rate', 50) or 50)
        
        portfolio_quality = (
            (rating / 5.0 * 100) * 0.5 +
            success_rate * 0.3 +
            min(total_projects * 5, 100) * 0.2
        )
        
        # Proposal quality
        cover_letter = application_data.get('cover_letter', '')
        proposal_length = len(cover_letter.split())
        if proposal_length < 50:
            proposal_quality = proposal_length * 0.8
        elif proposal_length < 100:
            proposal_quality = 40 + (proposal_length - 50) * 0.8
        else:
            proposal_quality = min(80 + (proposal_length - 100) / 10, 100)
        
        # Rate fit
        try:
            proposed_rate = float(application_data.get('proposed_rate', 0) or 0)
            budget_min = float(project_data.get('budget_min', 0) or 0)
            budget_max = float(project_data.get('budget_max', 1000) or 1000)
            budget_mid = (budget_min + budget_max) / 2 if budget_max > 0 else 1000
            
            if budget_mid > 0 and proposed_rate > 0:
                if proposed_rate <= budget_mid:
                    rate_fit = 100.0
                else:
                    overage_pct = (proposed_rate - budget_mid) / budget_mid
                    rate_fit = max(0, 100 - (overage_pct * 100))
            else:
                rate_fit = 50.0
        except:
            rate_fit = 50.0
        
        return {
            'skill_match': float(skill_match),
            'experience_fit': float(experience_fit),
            'portfolio_quality': float(portfolio_quality),
            'proposal_quality': float(proposal_quality),
            'rate_fit': float(rate_fit),
        }
    
    def _generate_reasoning(self, overall_score: float, component_scores: Dict, method: str) -> str:
        """Generate human-readable reasoning for the match score."""
        
        reasoning_parts = []
        
        # Overall assessment
        if overall_score >= 85:
            reasoning_parts.append("Excellent match!")
        elif overall_score >= 70:
            reasoning_parts.append("Strong match.")
        elif overall_score >= 55:
            reasoning_parts.append("Good potential match.")
        else:
            reasoning_parts.append("Moderate match.")
        
        # Skill analysis
        skill_score = component_scores['skill_match']
        if skill_score >= 80:
            reasoning_parts.append("Strong skill alignment.")
        elif skill_score >= 60:
            reasoning_parts.append("Good skill match.")
        elif skill_score >= 40:
            reasoning_parts.append("Partial skill match.")
        else:
            reasoning_parts.append("Limited skill overlap.")
        
        # Experience analysis
        exp_score = component_scores['experience_fit']
        if exp_score >= 80:
            reasoning_parts.append("Highly experienced.")
        elif exp_score >= 50:
            reasoning_parts.append("Solid experience level.")
        else:
            reasoning_parts.append("Growing experience.")
        
        # Portfolio analysis
        portfolio_score = component_scores['portfolio_quality']
        if portfolio_score >= 80:
            reasoning_parts.append("Excellent track record.")
        elif portfolio_score >= 60:
            reasoning_parts.append("Good portfolio quality.")
        
        # Rate analysis
        rate_score = component_scores['rate_fit']
        if rate_score >= 90:
            reasoning_parts.append("Budget-friendly rate.")
        elif rate_score < 50:
            reasoning_parts.append("Rate above budget.")
        
        reasoning = " ".join(reasoning_parts)
        reasoning += f" (Scored using {method})"
        
        return reasoning
