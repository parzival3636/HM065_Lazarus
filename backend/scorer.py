
import numpy as np
from sentence_transformers import SentenceTransformer

def cos_sim(a, b):
    """Cosine similarity"""
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))

def smart_normalize_tech(text):
    """Normalize tech text"""
    import re
    tech_variants = {
        'react': ['react', 'reactjs', 'react.js'],
        'typescript': ['typescript', 'ts', 'type script'],
        'javascript': ['javascript', 'js', 'ecmascript'],
        'node': ['node', 'nodejs', 'node.js'],
        'd3': ['d3', 'd3.js', 'd3js'],
        'mongodb': ['mongodb', 'mongo'],
        'express': ['express', 'expressjs', 'express.js'],
        'jest': ['jest'],
        'tailwind': ['tailwind', 'tailwindcss'],
        'websocket': ['websocket', 'websockets'],
        'chart.js': ['chart.js', 'chartjs'],
    }

    found = set()
    text_lower = text.lower()
    for main_tech, variants in tech_variants.items():
        for variant in variants:
            if re.search(r'\b' + re.escape(variant) + r'\b', text_lower):
                found.add(main_tech.capitalize())
                break

    return ', '.join(sorted(found)) if found else text

class ApplicantScorer:
    """Main scoring class using your fine-tuned model"""

    def __init__(self, model_path="./fine_tuned_model"):
        self.model = SentenceTransformer(model_path)
        print(f"✅ Loaded fine-tuned model from {model_path}")

    def score_single(self, project, applicant):
        """Score one applicant for one project"""
        # Normalize tech text
        norm_tech_stack = smart_normalize_tech(project.get('tech_stack', ''))
        norm_skills = smart_normalize_tech(applicant.get('skills', ''))
        norm_portfolio = smart_normalize_tech(applicant.get('portfolio', ''))

        # Get embeddings
        desc_emb = self.model.encode(project.get('description', ''))
        tech_emb = self.model.encode(norm_tech_stack)
        prop_emb = self.model.encode(applicant.get('proposal', ''))
        skills_emb = self.model.encode(norm_skills)
        port_emb = self.model.encode(applicant.get('portfolio', ''))
        port_tech_emb = self.model.encode(norm_portfolio)

        # Calculate similarities
        similarities = {
            'desc_proposal': cos_sim(desc_emb, prop_emb).item(),
            'tech_skills': cos_sim(tech_emb, skills_emb).item(),
            'desc_portfolio': cos_sim(desc_emb, port_emb).item(),
            'tech_portfolio': cos_sim(tech_emb, port_tech_emb).item(),
        }

        # Composite scores
        tech_match = (similarities['tech_skills'] + similarities['tech_portfolio']) / 2
        experience_match = (similarities['desc_portfolio'] + similarities['tech_portfolio']) / 2

        # Other factors
        budget_score = 1.0 if applicant.get('bid', 0) <= project.get('budget_max', 0) else 0.9
        rating_score = applicant.get('rating', 0) / 5.0
        exp_score = min(applicant.get('experience', 0) / 10.0, 1.0)

        # Weighted final score
        final_score = (
            similarities['desc_proposal'] * 0.30 +
            tech_match * 0.25 +
            experience_match * 0.20 +
            rating_score * 0.12 +
            budget_score * 0.08 +
            exp_score * 0.05
        ) * 100

        # Add keyword bonus
        import re
        def get_keyword_bonus(p_text, a_text):
            techs = ['react', 'typescript', 'javascript', 'node', 'mongodb', 'd3', 'chart', 'express']
            p_techs = set(re.findall(r'\b(' + '|'.join(techs) + r')\b', p_text.lower()))
            a_techs = set(re.findall(r'\b(' + '|'.join(techs) + r')\b', a_text.lower()))

            if not p_techs:
                return 1.0

            match_ratio = len(p_techs.intersection(a_techs)) / len(p_techs)
            return 1.0 + (match_ratio * 0.1)

        keyword_bonus = get_keyword_bonus(
            project.get('description', '') + project.get('tech_stack', ''),
            applicant.get('proposal', '') + applicant.get('skills', '') + applicant.get('portfolio', '')
        )

        final_score = final_score * keyword_bonus
        final_score = min(max(final_score, 20.0), 95.0)

        return {
            'total_score': round(final_score, 1),
            'breakdown': {
                'requirements': round(similarities['desc_proposal'] * 100, 1),
                'technical': round(tech_match * 100, 1),
                'experience': round(experience_match * 100, 1),
                'reputation': round(rating_score * 100, 1),
                'budget': round(budget_score * 100, 1),
                'years': round(exp_score * 100, 1)
            }
        }

    def score_multiple(self, project, applicants):
        """Score multiple applicants and rank them"""
        scored = []
        for applicant in applicants:
            result = self.score_single(project, applicant)
            scored.append({
                'applicant': applicant.get('name', 'Unknown'),
                **result
            })

        # Sort by score
        scored.sort(key=lambda x: x['total_score'], reverse=True)
        return scored

# Example usage
if __name__ == "__main__":
    scorer = ApplicantScorer()

    # Example project
    project = {
        "title": "React Dashboard",
        "description": "Build analytics dashboard with React and D3.js",
        "tech_stack": "React, TypeScript, D3.js, Node.js",
        "budget_max": 10000
    }

    # Example applicant
    applicant = {
        "name": "John Developer",
        "proposal": "I will build your React dashboard with D3.js charts",
        "skills": "React, TypeScript, D3.js, Node.js",
        "portfolio": "Built React dashboards for analytics",
        "bid": 8000,
        "rating": 4.5,
        "experience": 3
    }

    result = scorer.score_single(project, applicant)
    print(f"Score: {result['total_score']}/100")


# ============================================================================
# INTEGRATION FUNCTIONS FOR DJANGO FINE-TUNED MATCHER
# ============================================================================

# Global scorer instance (initialized once)
_scorer_instance = None

def get_scorer():
    """Get or create the scorer instance"""
    global _scorer_instance
    if _scorer_instance is None:
        try:
            _scorer_instance = ApplicantScorer()
        except Exception as e:
            print(f"❌ Failed to initialize scorer: {e}")
            _scorer_instance = None
    return _scorer_instance

def calculate_score(project, developer, application):
    """
    Main scoring function expected by the fine-tuned matcher.
    
    Args:
        project: Django Project model instance
        developer: Django DeveloperProfile model instance  
        application: Django ProjectApplication model instance
    
    Returns:
        int: Score from 0-100
    """
    
    try:
        # Get scorer instance
        scorer = get_scorer()
        if not scorer:
            print("⚠️ Scorer not available, using fallback")
            return 75  # Fallback score
        
        # Convert Django models to the format expected by your scorer
        project_data = {
            'title': project.title,
            'description': project.description,
            'tech_stack': ', '.join(project.tech_stack) if isinstance(project.tech_stack, list) else str(project.tech_stack),
            'budget_max': float(project.budget_max) if project.budget_max else 10000,
        }
        
        applicant_data = {
            'name': developer.user.get_full_name(),
            'proposal': application.cover_letter,
            'skills': developer.skills,
            'portfolio': developer.bio,  # Using bio as portfolio description
            'bid': float(application.proposed_rate) if application.proposed_rate else 0,
            'rating': float(developer.rating) if developer.rating else 0,
            'experience': developer.years_experience if developer.years_experience else 0,
        }
        
        # Use your existing scoring logic
        result = scorer.score_single(project_data, applicant_data)
        score = result['total_score']
        
        # Ensure score is in valid range
        score = max(0, min(100, score))
        
        print(f"🎯 Custom scorer result: {score}/100")
        print(f"   Breakdown: {result['breakdown']}")
        
        return int(round(score))
        
    except Exception as e:
        print(f"❌ Error in custom scorer: {e}")
        import traceback
        traceback.print_exc()
        return 75  # Fallback score on error
