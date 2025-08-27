"""
Skill Matcher Agent
Compares user skills with market demands and identifies gaps
"""

import json
from typing import Dict, List, Set
import requests

class SkillMatcherAgent:
    def __init__(self):
        self.skill_categories = {
            'Programming Languages': ['Python', 'JavaScript', 'Java', 'C++', 'C#', 'Go', 'Rust', 'PHP', 'Ruby'],
            'Frontend': ['React', 'Vue.js', 'Angular', 'HTML', 'CSS', 'TypeScript', 'Sass', 'jQuery'],
            'Backend': ['Node.js', 'Express', 'Django', 'Flask', 'Spring', 'Ruby on Rails'],
            'Database': ['MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'Elasticsearch', 'SQL'],
            'Cloud': ['AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Terraform'],
            'DevOps': ['Jenkins', 'Git', 'GitHub', 'GitLab', 'CI/CD', 'Linux'],
            'Data Science': ['Machine Learning', 'Pandas', 'NumPy', 'TensorFlow', 'PyTorch', 'Scikit-learn'],
            'Mobile': ['React Native', 'Flutter', 'iOS', 'Android', 'Swift', 'Kotlin'],
            'Tools': ['Jira', 'Confluence', 'Slack', 'Figma', 'Adobe Creative Suite']
        }
        
        # Load in-demand skills from local database
        self.in_demand_skills = self.load_market_skills()
    
    def load_market_skills(self) -> Dict[str, Dict]:
        """Load in-demand skills from local database"""
        # This would typically load from a regularly updated database
        # For now, using hardcoded data based on 2024 market trends
        return {
            'Machine Learning': {'demand_level': 95, 'growth_rate': 25, 'avg_salary': 130000},
            'Python': {'demand_level': 90, 'growth_rate': 15, 'avg_salary': 110000},
            'JavaScript': {'demand_level': 88, 'growth_rate': 10, 'avg_salary': 100000},
            'React': {'demand_level': 85, 'growth_rate': 20, 'avg_salary': 105000},
            'AWS': {'demand_level': 92, 'growth_rate': 30, 'avg_salary': 125000},
            'Docker': {'demand_level': 80, 'growth_rate': 22, 'avg_salary': 115000},
            'Kubernetes': {'demand_level': 78, 'growth_rate': 35, 'avg_salary': 130000},
            'Node.js': {'demand_level': 75, 'growth_rate': 12, 'avg_salary': 105000},
            'TypeScript': {'demand_level': 82, 'growth_rate': 28, 'avg_salary': 110000},
            'GraphQL': {'demand_level': 70, 'growth_rate': 40, 'avg_salary': 115000},
            'Terraform': {'demand_level': 65, 'growth_rate': 45, 'avg_salary': 120000},
            'Vue.js': {'demand_level': 60, 'growth_rate': 18, 'avg_salary': 95000}
        }
    
    def categorize_skills(self, skills: List[str]) -> Dict[str, List[str]]:
        """Categorize skills by type"""
        categorized = {}
        
        for category, category_skills in self.skill_categories.items():
            categorized[category] = []
            for skill in skills:
                if skill in category_skills:
                    categorized[category].append(skill)
        
        # Add uncategorized skills
        all_categorized = []
        for cat_skills in categorized.values():
            all_categorized.extend(cat_skills)
        
        uncategorized = [skill for skill in skills if skill not in all_categorized]
        if uncategorized:
            categorized['Other'] = uncategorized
        
        return {k: v for k, v in categorized.items() if v}  # Remove empty categories
    
    def assess_skill_level(self, skill: str, user_experience: str) -> str:
        """Assess skill level based on experience and market data"""
        # Simple heuristic based on years of experience
        if 'years' in user_experience.lower():
            try:
                years = int(user_experience.split()[0])
                if years >= 5:
                    return 'expert'
                elif years >= 3:
                    return 'advanced'
                elif years >= 1:
                    return 'intermediate'
                else:
                    return 'beginner'
            except:
                return 'intermediate'
        
        return 'intermediate'  # Default
    
    def identify_skill_gaps(self, user_skills: List[str], target_role: str = None) -> Dict[str, List[str]]:
        """Identify missing skills based on market demand"""
        user_skills_set = set(skill.lower() for skill in user_skills)
        
        gaps = {
            'critical_missing': [],
            'emerging_opportunities': [],
            'complementary_skills': []
        }
        
        for skill, data in self.in_demand_skills.items():
            skill_lower = skill.lower()
            demand_level = data['demand_level']
            growth_rate = data['growth_rate']
            
            if skill_lower not in user_skills_set:
                if demand_level >= 85:
                    gaps['critical_missing'].append(skill)
                elif growth_rate >= 30:
                    gaps['emerging_opportunities'].append(skill)
                else:
                    gaps['complementary_skills'].append(skill)
        
        return gaps
    
    def get_learning_recommendations(self, skill_gaps: Dict[str, List[str]]) -> Dict[str, List[Dict]]:
        """Generate learning recommendations for skill gaps"""
        recommendations = {}
        
        priority_mapping = {
            'critical_missing': 'High Priority',
            'emerging_opportunities': 'Medium Priority',
            'complementary_skills': 'Low Priority'
        }
        
        learning_paths = {
            'Machine Learning': {
                'courses': ['Machine Learning Basics', 'Deep Learning Fundamentals'],
                'time_estimate': '3-6 months',
                'difficulty': 'Advanced'
            },
            'AWS': {
                'courses': ['AWS Cloud Practitioner', 'AWS Solutions Architect'],
                'time_estimate': '2-4 months',
                'difficulty': 'Intermediate'
            },
            'Docker': {
                'courses': ['Docker Fundamentals', 'Container Orchestration'],
                'time_estimate': '1-2 months',
                'difficulty': 'Intermediate'
            },
            'GraphQL': {
                'courses': ['GraphQL Basics', 'Advanced GraphQL'],
                'time_estimate': '1-2 months',
                'difficulty': 'Beginner'
            }
        }
        
        for gap_type, skills in skill_gaps.items():
            recommendations[gap_type] = []
            
            for skill in skills:
                if skill in learning_paths:
                    recommendations[gap_type].append({
                        'skill': skill,
                        'priority': priority_mapping[gap_type],
                        'learning_path': learning_paths[skill],
                        'market_data': self.in_demand_skills.get(skill, {})
                    })
        
        return recommendations
    
    def calculate_skill_match_score(self, user_skills: List[str], job_requirements: List[str]) -> Dict:
        """Calculate how well user skills match job requirements"""
        user_skills_set = set(skill.lower() for skill in user_skills)
        job_skills_set = set(skill.lower() for skill in job_requirements)
        
        matching_skills = user_skills_set.intersection(job_skills_set)
        missing_skills = job_skills_set - user_skills_set
        
        if len(job_skills_set) == 0:
            match_percentage = 100
        else:
            match_percentage = int((len(matching_skills) / len(job_skills_set)) * 100)
        
        return {
            'match_percentage': match_percentage,
            'matching_skills': list(matching_skills),
            'missing_skills': list(missing_skills),
            'total_required': len(job_skills_set),
            'user_has': len(matching_skills)
        }
    
    def analyze_user_skills(self, user_skills: List[str], user_experience: str = "2 years") -> Dict:
        """Complete skill analysis for a user"""
        try:
            # Categorize skills
            categorized_skills = self.categorize_skills(user_skills)
            
            # Identify gaps
            skill_gaps = self.identify_skill_gaps(user_skills)
            
            # Get recommendations
            recommendations = self.get_learning_recommendations(skill_gaps)
            
            # Calculate overall skill profile
            skill_profile = {
                'total_skills': len(user_skills),
                'categories_covered': len(categorized_skills),
                'high_demand_skills': len([s for s in user_skills if s in self.in_demand_skills]),
                'experience_level': self.assess_skill_level('general', user_experience)
            }
            
            return {
                'skill_profile': skill_profile,
                'categorized_skills': categorized_skills,
                'skill_gaps': skill_gaps,
                'recommendations': recommendations,
                'market_alignment': self.calculate_market_alignment(user_skills)
            }
            
        except Exception as e:
            print(f"Error analyzing skills: {str(e)}")
            return {'error': str(e)}
    
    def calculate_market_alignment(self, user_skills: List[str]) -> Dict:
        """Calculate how well user skills align with market demands"""
        if not user_skills:
            return {'alignment_score': 0, 'details': 'No skills provided'}
        
        total_demand = 0
        skill_count = 0
        
        for skill in user_skills:
            if skill in self.in_demand_skills:
                total_demand += self.in_demand_skills[skill]['demand_level']
                skill_count += 1
        
        if skill_count == 0:
            alignment_score = 30  # Base score for having skills
        else:
            alignment_score = min(int(total_demand / skill_count), 100)
        
        return {
            'alignment_score': alignment_score,
            'in_demand_count': skill_count,
            'total_skills': len(user_skills),
            'alignment_percentage': int((skill_count / len(user_skills)) * 100)
        }

# Example usage
if __name__ == "__main__":
    matcher = SkillMatcherAgent()
    
    user_skills = ['Python', 'JavaScript', 'React', 'Node.js']
    analysis = matcher.analyze_user_skills(user_skills, "3 years")
    
    print(json.dumps(analysis, indent=2))
