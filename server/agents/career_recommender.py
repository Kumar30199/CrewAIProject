"""
Career Recommendation Agent
Provides personalized career path suggestions based on user profile and market analysis
"""

import json
from typing import Dict, List, Optional
from datetime import datetime

class CareerRecommenderAgent:
    def __init__(self):
        # Career paths database with progression information
        self.career_paths = {
            'Software Development': {
                'paths': [
                    {
                        'title': 'Senior Full Stack Developer',
                        'description': 'Build end-to-end applications with modern frameworks and cloud technologies.',
                        'current_skills_needed': ['JavaScript', 'Python', 'React', 'Node.js'],
                        'skills_to_develop': ['AWS', 'Docker', 'GraphQL', 'TypeScript'],
                        'timeline': '6-12 months with focused learning',
                        'salary_range': '$120k - $180k',
                        'icon': 'code',
                        'growth_potential': 'High',
                        'market_demand': 90,
                        'difficulty': 'Medium'
                    },
                    {
                        'title': 'Frontend Architect',
                        'description': 'Design and lead frontend architecture decisions for large-scale applications.',
                        'current_skills_needed': ['JavaScript', 'React', 'Vue.js', 'Angular'],
                        'skills_to_develop': ['Micro-frontends', 'Performance Optimization', 'Design Systems'],
                        'timeline': '8-15 months with leadership experience',
                        'salary_range': '$130k - $200k',
                        'icon': 'palette',
                        'growth_potential': 'High',
                        'market_demand': 75,
                        'difficulty': 'High'
                    },
                    {
                        'title': 'Backend Engineer',
                        'description': 'Focus on server-side architecture, APIs, and system scalability.',
                        'current_skills_needed': ['Python', 'Node.js', 'SQL', 'REST APIs'],
                        'skills_to_develop': ['Microservices', 'Database Design', 'System Architecture'],
                        'timeline': '4-10 months with system design focus',
                        'salary_range': '$115k - $170k',
                        'icon': 'server',
                        'growth_potential': 'High',
                        'market_demand': 85,
                        'difficulty': 'Medium'
                    }
                ]
            },
            'Data Science': {
                'paths': [
                    {
                        'title': 'Data Scientist',
                        'description': 'Analyze data to drive business decisions using machine learning and statistical methods.',
                        'current_skills_needed': ['Python', 'SQL', 'Statistics'],
                        'skills_to_develop': ['Machine Learning', 'Deep Learning', 'Data Visualization', 'R'],
                        'timeline': '12-18 months with intensive study',
                        'salary_range': '$130k - $200k',
                        'icon': 'chart-line',
                        'growth_potential': 'Very High',
                        'market_demand': 95,
                        'difficulty': 'High'
                    },
                    {
                        'title': 'Machine Learning Engineer',
                        'description': 'Build and deploy machine learning models at scale in production environments.',
                        'current_skills_needed': ['Python', 'Machine Learning', 'Statistics'],
                        'skills_to_develop': ['MLOps', 'TensorFlow', 'PyTorch', 'Kubernetes'],
                        'timeline': '10-16 months with ML focus',
                        'salary_range': '$140k - $220k',
                        'icon': 'brain',
                        'growth_potential': 'Very High',
                        'market_demand': 92,
                        'difficulty': 'Very High'
                    },
                    {
                        'title': 'Data Engineer',
                        'description': 'Build and maintain data pipelines and infrastructure for data processing.',
                        'current_skills_needed': ['Python', 'SQL', 'Data Processing'],
                        'skills_to_develop': ['Apache Spark', 'Apache Kafka', 'Data Warehousing', 'ETL'],
                        'timeline': '8-14 months with data infrastructure focus',
                        'salary_range': '$125k - $190k',
                        'icon': 'database',
                        'growth_potential': 'High',
                        'market_demand': 88,
                        'difficulty': 'High'
                    }
                ]
            },
            'Cloud & DevOps': {
                'paths': [
                    {
                        'title': 'Cloud Solutions Architect',
                        'description': 'Design and implement scalable cloud infrastructure and solutions.',
                        'current_skills_needed': ['Linux', 'Networking', 'Programming'],
                        'skills_to_develop': ['AWS', 'Kubernetes', 'Terraform', 'Azure'],
                        'timeline': '8-15 months with hands-on practice',
                        'salary_range': '$140k - $220k',
                        'icon': 'cloud',
                        'growth_potential': 'Very High',
                        'market_demand': 90,
                        'difficulty': 'High'
                    },
                    {
                        'title': 'DevOps Engineer',
                        'description': 'Automate deployment pipelines and manage infrastructure as code.',
                        'current_skills_needed': ['Linux', 'Scripting', 'Git'],
                        'skills_to_develop': ['Docker', 'Kubernetes', 'Jenkins', 'Infrastructure as Code'],
                        'timeline': '6-12 months with automation focus',
                        'salary_range': '$120k - $180k',
                        'icon': 'cog',
                        'growth_potential': 'High',
                        'market_demand': 85,
                        'difficulty': 'Medium'
                    },
                    {
                        'title': 'Site Reliability Engineer',
                        'description': 'Ensure system reliability, performance, and scalability at large scale.',
                        'current_skills_needed': ['Programming', 'System Administration', 'Monitoring'],
                        'skills_to_develop': ['SRE Practices', 'Observability', 'Incident Management'],
                        'timeline': '10-18 months with reliability focus',
                        'salary_range': '$135k - $200k',
                        'icon': 'shield-check',
                        'growth_potential': 'High',
                        'market_demand': 80,
                        'difficulty': 'High'
                    }
                ]
            },
            'Product & Management': {
                'paths': [
                    {
                        'title': 'Technical Product Manager',
                        'description': 'Bridge technical and business teams to deliver successful products.',
                        'current_skills_needed': ['Technical Background', 'Communication', 'Analytics'],
                        'skills_to_develop': ['Product Strategy', 'User Research', 'Agile Methodology'],
                        'timeline': '6-12 months with business focus',
                        'salary_range': '$130k - $190k',
                        'icon': 'briefcase',
                        'growth_potential': 'High',
                        'market_demand': 82,
                        'difficulty': 'Medium'
                    },
                    {
                        'title': 'Engineering Manager',
                        'description': 'Lead engineering teams while maintaining technical expertise.',
                        'current_skills_needed': ['Programming', 'Team Experience', 'Communication'],
                        'skills_to_develop': ['Leadership', 'People Management', 'Strategic Planning'],
                        'timeline': '12-24 months with leadership development',
                        'salary_range': '$150k - $230k',
                        'icon': 'users',
                        'growth_potential': 'Very High',
                        'market_demand': 78,
                        'difficulty': 'High'
                    }
                ]
            }
        }
        
        # Industry growth trends
        self.industry_trends = {
            'AI/ML': {'growth_rate': 35, 'job_increase': 42},
            'Cloud Computing': {'growth_rate': 25, 'job_increase': 30},
            'Cybersecurity': {'growth_rate': 28, 'job_increase': 35},
            'Web Development': {'growth_rate': 15, 'job_increase': 20},
            'Mobile Development': {'growth_rate': 18, 'job_increase': 22},
            'Data Engineering': {'growth_rate': 32, 'job_increase': 38}
        }
    
    def analyze_user_profile(self, user_skills: List[str], experience: str, interests: List[str] = None) -> Dict:
        """Analyze user profile to understand current position and potential"""
        try:
            # Categorize current skills
            skill_categories = self.categorize_skills(user_skills)
            
            # Determine experience level
            exp_level = self.parse_experience_level(experience)
            
            # Calculate skill strengths
            strengths = self.identify_strengths(user_skills, skill_categories)
            
            # Identify potential career domains
            potential_domains = self.identify_career_domains(skill_categories, strengths)
            
            return {
                'skill_categories': skill_categories,
                'experience_level': exp_level,
                'strengths': strengths,
                'potential_domains': potential_domains,
                'profile_completeness': self.calculate_profile_completeness(user_skills, experience, interests)
            }
            
        except Exception as e:
            print(f"Error analyzing user profile: {str(e)}")
            return {'error': str(e)}
    
    def categorize_skills(self, skills: List[str]) -> Dict[str, List[str]]:
        """Categorize user skills into technical domains"""
        categories = {
            'Frontend': ['React', 'Vue.js', 'Angular', 'JavaScript', 'TypeScript', 'HTML', 'CSS'],
            'Backend': ['Node.js', 'Python', 'Java', 'C#', 'Django', 'Flask', 'Express'],
            'Database': ['SQL', 'MongoDB', 'PostgreSQL', 'MySQL', 'Redis'],
            'Cloud': ['AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes'],
            'Data Science': ['Machine Learning', 'Data Analysis', 'Statistics', 'R', 'Pandas', 'NumPy'],
            'DevOps': ['Jenkins', 'Git', 'CI/CD', 'Terraform', 'Ansible'],
            'Mobile': ['React Native', 'Flutter', 'iOS', 'Android', 'Swift', 'Kotlin']
        }
        
        user_categories = {}
        for category, category_skills in categories.items():
            user_skills_in_category = [skill for skill in skills if skill in category_skills]
            if user_skills_in_category:
                user_categories[category] = user_skills_in_category
        
        return user_categories
    
    def parse_experience_level(self, experience: str) -> str:
        """Parse experience string to determine level"""
        if not experience or experience == "Not specified":
            return "Entry"
        
        exp_lower = experience.lower()
        if any(term in exp_lower for term in ['0-1', '0', '1 year', 'entry', 'junior', 'graduate']):
            return "Entry"
        elif any(term in exp_lower for term in ['2', '3', '4', '2-4', 'mid']):
            return "Mid"
        elif any(term in exp_lower for term in ['5', '6', '7', '8', '5+', 'senior']):
            return "Senior"
        else:
            return "Mid"  # Default
    
    def identify_strengths(self, user_skills: List[str], skill_categories: Dict[str, List[str]]) -> List[str]:
        """Identify user's strongest technical areas"""
        strengths = []
        
        # Categories with most skills indicate strengths
        category_counts = {cat: len(skills) for cat, skills in skill_categories.items()}
        sorted_categories = sorted(category_counts.items(), key=lambda x: x[1], reverse=True)
        
        # Top 2-3 categories with at least 2 skills each
        for category, count in sorted_categories:
            if count >= 2 and len(strengths) < 3:
                strengths.append(category)
        
        return strengths
    
    def identify_career_domains(self, skill_categories: Dict[str, List[str]], strengths: List[str]) -> List[str]:
        """Identify potential career domains based on skills"""
        domains = []
        
        # Map skill categories to career domains
        if any(cat in skill_categories for cat in ['Frontend', 'Backend']) and len(skill_categories) >= 2:
            domains.append('Software Development')
        
        if 'Data Science' in skill_categories or 'Database' in skill_categories:
            domains.append('Data Science')
        
        if 'Cloud' in skill_categories or 'DevOps' in skill_categories:
            domains.append('Cloud & DevOps')
        
        if len(skill_categories) >= 3:  # Broad technical background
            domains.append('Product & Management')
        
        return domains or ['Software Development']  # Default fallback
    
    def calculate_profile_completeness(self, skills: List[str], experience: str, interests: List[str]) -> Dict:
        """Calculate how complete the user profile is"""
        score = 0
        details = {}
        
        # Skills assessment (40 points)
        if len(skills) >= 5:
            score += 40
            details['skills'] = 'Complete'
        elif len(skills) >= 3:
            score += 25
            details['skills'] = 'Good'
        else:
            score += 10
            details['skills'] = 'Needs improvement'
        
        # Experience information (30 points)
        if experience and experience != "Not specified":
            score += 30
            details['experience'] = 'Complete'
        else:
            details['experience'] = 'Missing'
        
        # Interests (20 points)
        if interests and len(interests) > 0:
            score += 20
            details['interests'] = 'Complete'
        else:
            details['interests'] = 'Missing'
        
        # Portfolio/projects (10 points) - would be added if we had that data
        score += 5  # Assume partial
        details['portfolio'] = 'Partial'
        
        return {
            'score': score,
            'level': 'Complete' if score >= 80 else 'Good' if score >= 60 else 'Needs improvement',
            'details': details,
            'suggestions': self.get_profile_improvement_suggestions(details)
        }
    
    def get_profile_improvement_suggestions(self, details: Dict[str, str]) -> List[str]:
        """Generate suggestions for improving user profile"""
        suggestions = []
        
        if details.get('skills') == 'Needs improvement':
            suggestions.append('Add more technical skills to your profile')
        
        if details.get('experience') == 'Missing':
            suggestions.append('Specify your years of experience')
        
        if details.get('interests') == 'Missing':
            suggestions.append('Add career interests to get better recommendations')
        
        if details.get('portfolio') == 'Missing':
            suggestions.append('Consider adding portfolio projects or GitHub profile')
        
        return suggestions
    
    def get_personalized_recommendations(self, user_profile: Dict, limit: int = 5) -> List[Dict]:
        """Generate personalized career path recommendations"""
        try:
            potential_domains = user_profile.get('potential_domains', ['Software Development'])
            experience_level = user_profile.get('experience_level', 'Mid')
            strengths = user_profile.get('strengths', [])
            
            recommendations = []
            
            for domain in potential_domains:
                if domain in self.career_paths:
                    domain_paths = self.career_paths[domain]['paths']
                    
                    for path in domain_paths:
                        # Calculate recommendation score
                        score = self.calculate_recommendation_score(path, user_profile)
                        
                        recommendation = {
                            **path,
                            'domain': domain,
                            'recommendation_score': score,
                            'fit_explanation': self.generate_fit_explanation(path, user_profile),
                            'next_steps': self.generate_next_steps(path, user_profile)
                        }
                        
                        recommendations.append(recommendation)
            
            # Sort by recommendation score and return top recommendations
            recommendations.sort(key=lambda x: x['recommendation_score'], reverse=True)
            return recommendations[:limit]
            
        except Exception as e:
            print(f"Error generating recommendations: {str(e)}")
            return []
    
    def calculate_recommendation_score(self, path: Dict, user_profile: Dict) -> int:
        """Calculate how well a career path matches the user profile"""
        score = 0
        
        # Base score from market demand
        score += path.get('market_demand', 50)
        
        # Bonus for matching current skills
        user_skills = user_profile.get('skill_categories', {})
        all_user_skills = []
        for skills_list in user_skills.values():
            all_user_skills.extend(skills_list)
        
        current_skills_needed = path.get('current_skills_needed', [])
        matching_skills = len(set(all_user_skills) & set(current_skills_needed))
        skill_match_bonus = (matching_skills / len(current_skills_needed)) * 30 if current_skills_needed else 0
        score += skill_match_bonus
        
        # Experience level compatibility
        exp_level = user_profile.get('experience_level', 'Mid')
        difficulty = path.get('difficulty', 'Medium')
        
        exp_compatibility = {
            ('Entry', 'Easy'): 20,
            ('Entry', 'Medium'): 10,
            ('Entry', 'Hard'): -10,
            ('Mid', 'Easy'): 15,
            ('Mid', 'Medium'): 20,
            ('Mid', 'Hard'): 10,
            ('Senior', 'Easy'): 10,
            ('Senior', 'Medium'): 15,
            ('Senior', 'Hard'): 20
        }
        
        score += exp_compatibility.get((exp_level, difficulty), 10)
        
        # Growth potential bonus
        growth_potential = path.get('growth_potential', 'Medium')
        growth_bonus = {'Very High': 15, 'High': 10, 'Medium': 5, 'Low': 0}
        score += growth_bonus.get(growth_potential, 5)
        
        return min(int(score), 100)  # Cap at 100
    
    def generate_fit_explanation(self, path: Dict, user_profile: Dict) -> str:
        """Generate explanation of why this path fits the user"""
        explanations = []
        
        # Check skill alignment
        user_skills = user_profile.get('skill_categories', {})
        all_user_skills = []
        for skills_list in user_skills.values():
            all_user_skills.extend(skills_list)
        
        current_skills_needed = path.get('current_skills_needed', [])
        matching_skills = set(all_user_skills) & set(current_skills_needed)
        
        if matching_skills:
            explanations.append(f"You already have {len(matching_skills)} out of {len(current_skills_needed)} required skills")
        
        # Experience level compatibility
        exp_level = user_profile.get('experience_level', 'Mid')
        if exp_level == 'Senior' and path.get('difficulty') == 'High':
            explanations.append("Your senior experience level aligns well with this challenging role")
        elif exp_level == 'Mid' and path.get('difficulty') == 'Medium':
            explanations.append("This role matches your current experience level perfectly")
        
        # Market demand
        market_demand = path.get('market_demand', 50)
        if market_demand >= 85:
            explanations.append("This role is in very high market demand")
        
        return '. '.join(explanations) + '.' if explanations else 'This role matches your technical background.'
    
    def generate_next_steps(self, path: Dict, user_profile: Dict) -> List[str]:
        """Generate actionable next steps for pursuing this career path"""
        steps = []
        
        # Skills to develop
        skills_to_develop = path.get('skills_to_develop', [])[:3]  # Top 3 skills
        if skills_to_develop:
            steps.append(f"Focus on learning {', '.join(skills_to_develop)}")
        
        # Timeline guidance
        timeline = path.get('timeline', '')
        if timeline:
            steps.append(f"Plan for {timeline} to fully transition")
        
        # Experience building
        exp_level = user_profile.get('experience_level', 'Mid')
        if exp_level == 'Entry':
            steps.append("Build practical experience through projects and internships")
        elif exp_level == 'Mid':
            steps.append("Take on more complex projects to demonstrate advanced skills")
        
        # Networking and learning
        steps.append("Connect with professionals in this field on LinkedIn")
        steps.append("Consider relevant certifications or courses")
        
        return steps
    
    def get_industry_insights(self, career_domain: str = None) -> Dict:
        """Get insights about industry trends and growth"""
        if career_domain and career_domain in self.industry_trends:
            domain_trend = self.industry_trends[career_domain]
            return {
                'selected_domain': career_domain,
                'growth_rate': domain_trend['growth_rate'],
                'job_increase': domain_trend['job_increase'],
                'market_status': 'Growing rapidly' if domain_trend['growth_rate'] > 25 else 'Stable growth'
            }
        
        # General industry insights
        return {
            'top_growing_fields': [
                {'field': 'AI/ML', 'growth': '35%', 'jobs': '+42%'},
                {'field': 'Cloud Computing', 'growth': '25%', 'jobs': '+30%'},
                {'field': 'Cybersecurity', 'growth': '28%', 'jobs': '+35%'}
            ],
            'average_salary_trends': 'Tech salaries increased 8% in 2024',
            'remote_work_trend': '68% of tech jobs now offer remote options',
            'most_in_demand_skills': ['Python', 'AWS', 'React', 'Machine Learning', 'Docker']
        }

# Example usage
if __name__ == "__main__":
    recommender = CareerRecommenderAgent()
    
    # Simulate user profile
    user_skills = ['Python', 'JavaScript', 'React', 'Node.js']
    experience = '3 years'
    interests = ['Web Development', 'AI']
    
    # Analyze profile
    profile_analysis = recommender.analyze_user_profile(user_skills, experience, interests)
    
    # Get recommendations
    recommendations = recommender.get_personalized_recommendations(profile_analysis)
    
    print("Profile Analysis:")
    print(json.dumps(profile_analysis, indent=2))
    print("\nCareer Recommendations:")
    print(json.dumps(recommendations, indent=2))
