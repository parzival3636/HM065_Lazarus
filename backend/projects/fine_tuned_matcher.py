"""
Fine-tuned SBERT Matcher for Developer-Project Matching
Uses ONLY the custom fine-tuned sentence transformer model with graceful fallbacks
"""

import os
import numpy as np
from typing import List, Dict, Optional
from pathlib import Path

from django.conf import settings
from accounts.models import DeveloperProfile
from django.contrib.auth import get_user_model
from projects.models import Project, ProjectApplication

User = get_user_model()

# Try to import SentenceTransformer with graceful handling
try:
    from sentence_transformers import SentenceTransformer
    SENTENCE_TRANSFORMERS_AVAILABLE = True
except ImportError as e:
    print(f"⚠️ SentenceTransformers not available: {e}")
    SentenceTransformer = None
    SENTENCE_TRANSFORMERS_AVAILABLE = False


class FineTunedMatcher:
    """
    Fine-tuned SBERT-based matcher with graceful fallbacks.
    """
    
    def __init__(self):
        """Initialize the matcher with the fine-tuned model."""
        self.model_dir = os.path.join(settings.BASE_DIR, 'fine_tuned_model')
        self.model = None
        self.scorer = None
        
        print("\n" + "="*60)
        print("🎯 INITIALIZING FINE-TUNED MATCHER")
        print("="*60)
        
        self._load_model()
        self._load_scorer()
        self._print_status_summary()
    
    def _load_model(self):
        """Load the fine-tuned SBERT model with graceful fallbacks."""
        print("📦 Loading Fine-tuned SBERT Model...")
        
        if not SENTENCE_TRANSFORMERS_AVAILABLE:
            print("   ❌ SentenceTransformers library not available")
            print("   📋 Will use component-based scoring as fallback")
            self.model = None
            self.model_status = "library_unavailable"
            return
        
        if not os.path.exists(self.model_dir):
            print(f"   ⚠️ Fine-tuned model not found at: {self.model_dir}")
            print("   📋 Will try to use default SBERT model")
            try:
                self.model = SentenceTransformer('all-MiniLM-L6-v2')
                print("   ✅ Default SBERT model loaded as fallback")
                self.model_status = "default_sbert"
                return
            except Exception as e:
                print(f"   ❌ Default model also failed: {e}")
                self.model = None
                self.model_status = "no_model"
                return
        
        print(f"   📁 Found fine-tuned model directory: {self.model_dir}")
        
        try:
            self.model = SentenceTransformer(self.model_dir)
            print("   ✅ Fine-tuned SBERT model loaded successfully!")
            self.model_status = "fine_tuned_loaded"
        except Exception as e:
            print(f"   ❌ Failed to load fine-tuned model: {e}")
            print("   🔄 Trying default SBERT model as fallback...")
            try:
                self.model = SentenceTransformer('all-MiniLM-L6-v2')
                print("   ✅ Default SBERT model loaded as fallback")
                self.model_status = "default_sbert"
            except Exception as e2:
                print(f"   ❌ Default model also failed: {e2}")
                self.model = None
                self.model_status = "no_model"
    
    def _load_scorer(self):
        """Load the custom scorer with graceful fallbacks."""
        print("🎯 Loading Custom Scorer...")
        
        scorer_path = os.path.join(settings.BASE_DIR, 'scorer.py')
        
        if not os.path.exists(scorer_path):
            print(f"   ⚠️ Custom scorer not found at: {scorer_path}")
            print("   📋 Will use built-in similarity-based scoring")
            self.scorer_status = "not_found"
            return
        
        print(f"   📁 Found scorer file: {scorer_path}")
        
        try:
            # Import the scorer module dynamically
            import importlib.util
            spec = importlib.util.spec_from_file_location("scorer", scorer_path)
            scorer_module = importlib.util.module_from_spec(spec)
            spec.loader.exec_module(scorer_module)
            
            # Check for scoring functions
            if hasattr(scorer_module, 'calculate_score'):
                self.scorer = scorer_module.calculate_score
                print("   ✅ Custom scorer loaded successfully! (function: calculate_score)")
                self.scorer_status = "custom_loaded"
            elif hasattr(scorer_module, 'score'):
                self.scorer = scorer_module.score
                print("   ✅ Custom scorer loaded successfully! (function: score)")
                self.scorer_status = "custom_loaded"
            else:
                print("   ❌ Scorer file found but no valid scoring function detected")
                print("   📋 Expected functions: 'calculate_score' or 'score'")
                print("   📋 Will use built-in scoring")
                self.scorer_status = "invalid_function"
                
        except Exception as e:
            print(f"   ❌ Error loading custom scorer: {e}")
            print("   📋 Will use built-in scoring")
            self.scorer = None
            self.scorer_status = "failed_to_load"
    
    def _print_status_summary(self):
        """Print a comprehensive status summary."""
        print("\n📊 MATCHER STATUS SUMMARY")
        print("-" * 40)
        
        # Model Status
        if hasattr(self, 'model_status') and self.model_status == "fine_tuned_loaded":
            print("🎯 MODEL: ✅ Fine-tuned SBERT (YOUR CUSTOM MODEL)")
            model_type = "FINE-TUNED"
        else:
            print("🎯 MODEL: ❌ Failed to load fine-tuned model")
            model_type = "FAILED"
        
        # Scorer Status
        if hasattr(self, 'scorer_status') and self.scorer_status == "custom_loaded":
            print("🎯 SCORER: ✅ Custom scorer (YOUR SCORING LOGIC)")
            scorer_type = "CUSTOM"
        else:
            print("🎯 SCORER: ⚠️  Built-in SBERT similarity scoring")
            scorer_type = "BUILT-IN"
        
        # Overall Status
        print("-" * 40)
        if hasattr(self, 'model_status') and self.model_status == "fine_tuned_loaded":
            if hasattr(self, 'scorer_status') and self.scorer_status == "custom_loaded":
                print("🚀 OVERALL: ✅ FULLY FINE-TUNED SYSTEM ACTIVE!")
                overall_status = "FULLY-CUSTOM"
            else:
                print("🚀 OVERALL: ✅ Fine-tuned model with built-in scoring")
                overall_status = "SEMI-CUSTOM"
        else:
            print("🚀 OVERALL: ❌ SYSTEM FAILED TO INITIALIZE")
            overall_status = "FAILED"
        
        print("=" * 60)
        print(f"🏷️  ACTIVE CONFIGURATION: {overall_status}")
        print("=" * 60)
        
        # Store for later use
        self.overall_status = overall_status
        self.model_type = model_type
        self.scorer_type = scorer_type
    
    def get_status_info(self) -> Dict[str, str]:
        """Get current matcher status information."""
        return {
            'overall_status': getattr(self, 'overall_status', 'UNKNOWN'),
            'model_type': getattr(self, 'model_type', 'UNKNOWN'),
            'scorer_type': getattr(self, 'scorer_type', 'UNKNOWN'),
            'model_loaded': self.model is not None,
            'scorer_loaded': self.scorer is not None,
            'fine_tuned_model_required': True,
            'fallback_disabled': True,
        }
    
    def _prepare_text_pairs(self, project: Project, developer: DeveloperProfile, 
                           application: ProjectApplication) -> List[tuple]:
        """
        Prepare text pairs for the fine-tuned model.
        Returns list of (project_text, developer_text) tuples.
        """
        
        # Main project description
        project_main = f"{project.title}. {project.description}"
        
        # Project requirements
        project_requirements = f"Required skills: {', '.join(project.tech_stack)}. "
        project_requirements += f"Budget: ${project.budget_min}-${project.budget_max}. "
        project_requirements += f"Category: {project.category}. Complexity: {project.complexity}."
        
        # Developer profile
        developer_main = f"{developer.title}. {developer.bio}"
        
        # Developer skills and experience
        developer_skills = f"Skills: {developer.skills}. "
        developer_skills += f"Experience: {developer.years_experience} years. "
        developer_skills += f"Rating: {developer.rating}/5. "
        developer_skills += f"Success rate: {developer.success_rate}%."
        
        # Application proposal
        proposal_text = application.cover_letter
        
        # Past projects context
        past_projects = self._get_developer_past_projects(developer.user)
        
        # Create multiple text pairs for comprehensive matching
        text_pairs = [
            (project_main, developer_main),  # Main descriptions
            (project_requirements, developer_skills),  # Requirements vs skills
            (project_main, proposal_text),  # Project vs proposal
            (project_requirements, proposal_text),  # Requirements vs proposal
        ]
        
        # Add past projects if available
        if past_projects:
            text_pairs.append((project_main, past_projects))
        
        return text_pairs
    
    def _get_developer_past_projects(self, user: User) -> str:
        """Get developer's past project descriptions."""
        try:
            past_projects = []
            completed_apps = ProjectApplication.objects.filter(
                developer=user,
                status='selected'
            ).select_related('project')[:5]  # Last 5 projects
            
            for app in completed_apps:
                past_projects.append(f"{app.project.title}: {app.project.description}")
            
            return '. '.join(past_projects) if past_projects else ""
        except Exception as e:
            print(f"⚠ Error fetching past projects: {e}")
            return ""
    
    def _calculate_similarity_scores(self, text_pairs: List[tuple]) -> List[float]:
        """Calculate similarity scores for text pairs using the available model."""
        if not self.model:
            print("   ⚠️ No SBERT model available for similarity calculation")
            return [0.5] * len(text_pairs)  # Neutral scores
            
        scores = []
        for text1, text2 in text_pairs:
            if not text1 or not text2:
                scores.append(0.0)
                continue
            
            try:
                # Encode both texts using available model
                embedding1 = self.model.encode(text1, convert_to_tensor=False)
                embedding2 = self.model.encode(text2, convert_to_tensor=False)
                
                # Calculate cosine similarity
                similarity = np.dot(embedding1, embedding2) / (
                    np.linalg.norm(embedding1) * np.linalg.norm(embedding2)
                )
                scores.append(float(similarity))
            except Exception as e:
                print(f"   ⚠️ Error encoding text pair: {e}")
                scores.append(0.5)  # Neutral score on error
        
        return scores
    
    def _predict_match_score(self, project: Project, developer: DeveloperProfile,
                           application: ProjectApplication) -> int:
        """
        Predict match score using the best available method.
        Returns score from 0-100.
        """
        
        # Priority 1: Custom scorer (if available)
        if self.scorer:
            try:
                score = self.scorer(project, developer, application)
                if isinstance(score, (int, float)) and 0 <= score <= 100:
                    print(f"   🎯 Custom scorer result: {score}/100")
                    return int(round(score))
                else:
                    print(f"   ⚠️ Custom scorer returned invalid score: {score}")
            except Exception as e:
                print(f"   ❌ Custom scorer failed: {e}")
        
        # Priority 2: SBERT model similarity scoring (if available)
        if self.model:
            try:
                print(f"   🤖 Using SBERT model ({getattr(self, 'model_status', 'unknown')})")
                text_pairs = self._prepare_text_pairs(project, developer, application)
                similarity_scores = self._calculate_similarity_scores(text_pairs)
                
                # Weight different similarity aspects
                weights = [0.3, 0.25, 0.2, 0.15, 0.1]
                weights = weights[:len(similarity_scores)]
                
                if len(similarity_scores) > 0:
                    weighted_score = sum(s * w for s, w in zip(similarity_scores, weights))
                    weighted_score /= sum(weights)
                    
                    # Convert from [-1, 1] to [0, 100] range
                    final_score = (weighted_score + 1) * 50
                    
                    # Add component-based adjustments
                    component_bonus = self._calculate_component_bonus(project, developer, application)
                    final_score = min(100, final_score + component_bonus)
                    
                    print(f"   🎯 SBERT model result: {final_score:.1f}/100")
                    return int(round(final_score))
            except Exception as e:
                print(f"   ❌ SBERT model scoring failed: {e}")
        
        # Priority 3: Component-based scoring (always available)
        print("   📊 Using component-based scoring")
        component_scores = self._calculate_component_scores(project, developer, application)
        
        weighted_score = (
            component_scores['skill_match'] * 0.35 +
            component_scores['experience_fit'] * 0.25 +
            component_scores['portfolio_quality'] * 0.20 +
            component_scores['proposal_quality'] * 0.15 +
            component_scores['rate_fit'] * 0.05
        )
        
        print(f"   🎯 Component-based result: {weighted_score:.1f}/100")
        return int(round(weighted_score))
    
    def _calculate_component_bonus(self, project: Project, developer: DeveloperProfile,
                                 application: ProjectApplication) -> float:
        """Calculate bonus/penalty based on specific components."""
        bonus = 0.0
        
        # Skill match bonus
        required_skills = set(skill.strip().lower() for skill in project.tech_stack)
        developer_skills = set(skill.strip().lower() for skill in developer.skills.split(','))
        
        if len(required_skills) > 0:
            skill_overlap = len(required_skills & developer_skills) / len(required_skills)
            bonus += (skill_overlap - 0.5) * 20  # -10 to +10 bonus
        
        # Experience bonus
        years_exp = developer.years_experience or 0
        if years_exp >= 5:
            bonus += 5
        elif years_exp >= 2:
            bonus += 2
        
        # Rating bonus
        rating = float(developer.rating or 0)
        if rating >= 4.5:
            bonus += 5
        elif rating >= 4.0:
            bonus += 3
        
        # Rate fit bonus/penalty
        try:
            proposed_rate = float(application.proposed_rate) if application.proposed_rate else 0
            budget_max = float(project.budget_max) if project.budget_max else 1000
            
            if proposed_rate > 0 and budget_max > 0:
                if proposed_rate <= budget_max:
                    bonus += 5
                elif proposed_rate > budget_max * 1.5:
                    bonus -= 10
        except:
            pass
        
        return bonus
    
    def rank_freelancers(self, project: Project, top_n: int = 5) -> List[Dict]:
        """
        Rank all freelancers who applied to a project using the fine-tuned model.
        """
        
        applications = ProjectApplication.objects.filter(
            project=project,
            status='pending'
        ).select_related('developer', 'developer__developerprofile')
        
        if not applications.exists():
            print("  No pending applications found")
            return []
        
        print(f"\n🎯 FINE-TUNED MATCHER: Ranking {applications.count()} freelancers for: {project.title}")
        print(f"🏷️ Configuration: {getattr(self, 'overall_status', 'UNKNOWN')}")
        
        # Show what method will be used
        if self.scorer:
            print("   ✅ Will use custom scorer")
        elif self.model:
            print(f"   ✅ Will use SBERT model ({getattr(self, 'model_status', 'unknown')})")
        else:
            print("   ⚠️ Will use component-based scoring")
        results = []
        
        for application in applications:
            try:
                developer = application.developer.developerprofile
                print(f"  Evaluating: {developer.user.get_full_name()}")
                
                # Get match score from fine-tuned model
                overall_score = self._predict_match_score(project, developer, application)
                
                # Calculate component scores for transparency
                component_scores = self._calculate_component_scores(project, developer, application)
                
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
                    'matching_method': getattr(self, 'overall_status', 'UNKNOWN'),
                    'model_type': getattr(self, 'model_type', 'UNKNOWN'),
                    'scorer_type': getattr(self, 'scorer_type', 'UNKNOWN'),
                })
                
                print(f"    → Score: {overall_score}/100")
                
            except Exception as e:
                print(f"  ⚠ Error processing application {application.id}: {e}")
                import traceback
                traceback.print_exc()
                continue
        
        # Sort by overall score descending
        results.sort(key=lambda x: x['overall_score'], reverse=True)
        
        print(f"\n✅ Fine-tuned ranking complete:")
        for i, r in enumerate(results[:top_n], 1):
            print(f"  {i}. {r['developer_name']}: {r['overall_score']}/100")
        
        return results[:top_n]
    
    def _calculate_component_scores(self, project: Project, developer: DeveloperProfile,
                                   application: ProjectApplication) -> Dict[str, float]:
        """Calculate component scores for transparency (same as original matcher)."""
        
        # Skill match
        required_skills = set(skill.strip().lower() for skill in project.tech_stack)
        developer_skills = set(skill.strip().lower() for skill in developer.skills.split(','))
        
        if len(required_skills) > 0:
            skill_overlap = len(required_skills & developer_skills) / len(required_skills)
            skill_match = skill_overlap * 100
        else:
            skill_match = 50.0
        
        # Experience fit
        years_exp = developer.years_experience or 0
        experience_fit = min(years_exp * 10, 100)
        
        # Portfolio quality
        rating = float(developer.rating or 0)
        total_projects = developer.total_projects or 0
        success_rate = float(developer.success_rate or 50)
        
        portfolio_quality = (
            (rating / 5.0 * 100) * 0.5 +
            success_rate * 0.3 +
            min(total_projects * 5, 100) * 0.2
        )
        
        # Proposal quality
        proposal_length = len(application.cover_letter.split())
        if proposal_length < 50:
            proposal_quality = proposal_length * 0.8
        elif proposal_length < 100:
            proposal_quality = 40 + (proposal_length - 50) * 0.8
        else:
            proposal_quality = min(80 + (proposal_length - 100) / 10, 100)
        
        # Rate fit
        try:
            proposed_rate = float(application.proposed_rate) if application.proposed_rate else 0
            budget_min = float(project.budget_min) if project.budget_min else 0
            budget_max = float(project.budget_max) if project.budget_max else 1000
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
    
    def get_match_details(self, application: ProjectApplication) -> Optional[Dict]:
        """Get detailed match analysis for a specific application."""
        project = application.project
        developer = application.developer.developerprofile
        
        try:
            overall_score = self._predict_match_score(project, developer, application)
            component_scores = self._calculate_component_scores(project, developer, application)
            
            # Skill analysis
            required_skills = set(skill.strip().lower() for skill in project.tech_stack)
            developer_skills = set(skill.strip().lower() for skill in developer.skills.split(','))
            
            matching_skills = sorted(list(required_skills & developer_skills))
            missing_skills = sorted(list(required_skills - developer_skills))
            extra_skills = sorted(list(developer_skills - required_skills))
            
            return {
                'overall_score': overall_score,
                'component_scores': component_scores,
                'matching_skills': matching_skills,
                'missing_skills': missing_skills,
                'extra_skills': extra_skills,
                'matching_method': getattr(self, 'overall_status', 'UNKNOWN'),
                'model_type': getattr(self, 'model_type', 'UNKNOWN'),
                'scorer_type': getattr(self, 'scorer_type', 'UNKNOWN'),
                'status_info': self.get_status_info(),
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
_fine_tuned_matcher_instance = None


def get_fine_tuned_matcher() -> FineTunedMatcher:
    """Get or create the fine-tuned matcher instance."""
    global _fine_tuned_matcher_instance
    if _fine_tuned_matcher_instance is None:
        _fine_tuned_matcher_instance = FineTunedMatcher()
    return _fine_tuned_matcher_instance