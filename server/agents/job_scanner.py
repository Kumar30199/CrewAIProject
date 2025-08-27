"""
Job Market Scanner Agent
Fetches job opportunities from free APIs and matches them with user profiles
"""

import requests
import json
from typing import Dict, List, Optional
import time
from datetime import datetime, timedelta

class JobScannerAgent:
    def __init__(self):
        self.apis = {
            'remotive': {
                'base_url': 'https://remotive.io/api/remote-jobs',
                'rate_limit': 1  # seconds between requests
            },
            'github_jobs': {
                'base_url': 'https://jobs.github.com/positions.json',
                'rate_limit': 1
            },
            'adzuna': {
                'base_url': 'https://api.adzuna.com/v1/api/jobs',
                'rate_limit': 1
            }
        }
        
        # Fallback job data for when APIs are unavailable
        self.fallback_jobs = [
            {
                'title': 'Senior Full Stack Developer',
                'company': 'TechCorp Inc.',
                'location': 'San Francisco, CA (Remote)',
                'salary': '$120k - $180k',
                'description': 'We\'re looking for a passionate Full Stack Developer to join our growing team. You\'ll work on exciting projects using React, Node.js, and cloud technologies.',
                'requirements': ['React', 'Node.js', 'JavaScript', 'AWS'],
                'posted_at': '2 days ago',
                'apply_url': 'https://techcorp.com/careers/senior-fullstack',
                'job_type': 'Full-time',
                'experience_level': 'Senior',
                'remote': True
            },
            {
                'title': 'Frontend Developer',
                'company': 'StartupCo',
                'location': 'New York, NY',
                'salary': '$100k - $140k',
                'description': 'Join our innovative startup as a Frontend Developer. You\'ll be working on cutting-edge web applications using React, TypeScript, and modern development tools.',
                'requirements': ['React', 'TypeScript', 'JavaScript', 'GraphQL'],
                'posted_at': '1 week ago',
                'apply_url': 'https://startupco.com/jobs/frontend-dev',
                'job_type': 'Full-time',
                'experience_level': 'Mid-level',
                'remote': False
            },
            {
                'title': 'Python Developer',
                'company': 'MegaCorp Solutions',
                'location': 'Remote',
                'salary': '$110k - $160k',
                'description': 'We\'re seeking a skilled Python Developer to work on data-driven applications. Experience with Django, Flask, and data analysis libraries required.',
                'requirements': ['Python', 'Django', 'Machine Learning', 'Docker'],
                'posted_at': '3 days ago',
                'apply_url': 'https://megacorp.com/careers/python-developer',
                'job_type': 'Full-time',
                'experience_level': 'Mid-level',
                'remote': True
            },
            {
                'title': 'DevOps Engineer',
                'company': 'InnovateTech',
                'location': 'Austin, TX',
                'salary': '$130k - $190k',
                'description': 'Looking for an experienced DevOps Engineer to manage our cloud infrastructure. Strong experience with AWS, Docker, and Kubernetes required.',
                'requirements': ['AWS', 'Docker', 'Kubernetes', 'Python'],
                'posted_at': '5 days ago',
                'apply_url': 'https://innovatetech.com/jobs/devops-engineer',
                'job_type': 'Full-time',
                'experience_level': 'Senior',
                'remote': False
            },
            {
                'title': 'Machine Learning Engineer',
                'company': 'AI Innovations',
                'location': 'Seattle, WA (Remote)',
                'salary': '$140k - $200k',
                'description': 'Join our AI team to build cutting-edge machine learning models. Experience with TensorFlow, PyTorch, and cloud ML services required.',
                'requirements': ['Machine Learning', 'Python', 'TensorFlow', 'AWS'],
                'posted_at': '1 day ago',
                'apply_url': 'https://aiinnovations.com/careers/ml-engineer',
                'job_type': 'Full-time',
                'experience_level': 'Senior',
                'remote': True
            }
        ]
    
    def fetch_remotive_jobs(self, search_params: Dict = None) -> List[Dict]:
        """Fetch jobs from Remotive.io API"""
        try:
            url = self.apis['remotive']['base_url']
            params = {
                'category': search_params.get('category', 'software-dev') if search_params else 'software-dev',
                'limit': search_params.get('limit', 10) if search_params else 10
            }
            
            response = requests.get(url, params=params, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                jobs = []
                
                for job in data.get('jobs', []):
                    formatted_job = {
                        'title': job.get('title', 'Unknown Title'),
                        'company': job.get('company_name', 'Unknown Company'),
                        'location': job.get('candidate_required_location', 'Remote'),
                        'salary': job.get('salary', 'Not specified'),
                        'description': job.get('description', '')[:500] + '...' if len(job.get('description', '')) > 500 else job.get('description', ''),
                        'requirements': self.extract_requirements(job.get('description', '')),
                        'posted_at': self.format_date(job.get('publication_date', '')),
                        'apply_url': job.get('url', ''),
                        'job_type': job.get('job_type', 'Full-time'),
                        'experience_level': self.determine_experience_level(job.get('title', '')),
                        'remote': True
                    }
                    jobs.append(formatted_job)
                
                return jobs
                
        except Exception as e:
            print(f"Error fetching from Remotive API: {str(e)}")
            
        return []
    
    def fetch_github_jobs(self, search_params: Dict = None) -> List[Dict]:
        """Fetch jobs from GitHub Jobs API (deprecated but kept for reference)"""
        # GitHub Jobs API was discontinued, but keeping structure for other APIs
        return []
    
    def extract_requirements(self, description: str) -> List[str]:
        """Extract skill requirements from job description"""
        common_skills = [
            'Python', 'JavaScript', 'Java', 'React', 'Node.js', 'Angular', 'Vue.js',
            'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Machine Learning',
            'TensorFlow', 'PyTorch', 'SQL', 'MongoDB', 'PostgreSQL', 'Redis',
            'GraphQL', 'REST API', 'TypeScript', 'HTML', 'CSS', 'Git'
        ]
        
        requirements = []
        description_lower = description.lower()
        
        for skill in common_skills:
            if skill.lower() in description_lower:
                requirements.append(skill)
        
        return requirements[:6]  # Limit to top 6 requirements
    
    def determine_experience_level(self, title: str) -> str:
        """Determine experience level from job title"""
        title_lower = title.lower()
        
        if any(word in title_lower for word in ['senior', 'lead', 'principal', 'architect']):
            return 'Senior'
        elif any(word in title_lower for word in ['junior', 'entry', 'graduate', 'trainee']):
            return 'Entry-level'
        else:
            return 'Mid-level'
    
    def format_date(self, date_string: str) -> str:
        """Format date string to relative time"""
        try:
            job_date = datetime.fromisoformat(date_string.replace('Z', '+00:00'))
            now = datetime.now(job_date.tzinfo)
            diff = now - job_date
            
            if diff.days == 0:
                return "Today"
            elif diff.days == 1:
                return "1 day ago"
            elif diff.days < 7:
                return f"{diff.days} days ago"
            elif diff.days < 30:
                weeks = diff.days // 7
                return f"{weeks} week{'s' if weeks > 1 else ''} ago"
            else:
                months = diff.days // 30
                return f"{months} month{'s' if months > 1 else ''} ago"
                
        except:
            return "Recently posted"
    
    def calculate_job_match_score(self, user_skills: List[str], job_requirements: List[str]) -> int:
        """Calculate match score between user skills and job requirements"""
        if not job_requirements:
            return 50  # Default score if no requirements specified
        
        user_skills_lower = [skill.lower() for skill in user_skills]
        job_requirements_lower = [req.lower() for req in job_requirements]
        
        matching_skills = set(user_skills_lower) & set(job_requirements_lower)
        match_percentage = (len(matching_skills) / len(job_requirements_lower)) * 100
        
        # Boost score if user has additional relevant skills
        bonus_skills = set(user_skills_lower) - set(job_requirements_lower)
        bonus = min(len(bonus_skills) * 5, 20)  # Max 20% bonus
        
        final_score = min(int(match_percentage + bonus), 100)
        return final_score
    
    def search_jobs(self, user_skills: List[str] = None, filters: Dict = None) -> Dict:
        """Main job search function"""
        try:
            all_jobs = []
            
            # Try to fetch from APIs
            if filters and filters.get('use_live_data', False):
                remotive_jobs = self.fetch_remotive_jobs(filters)
                all_jobs.extend(remotive_jobs)
            
            # Always include fallback jobs for demonstration
            all_jobs.extend(self.fallback_jobs)
            
            # Apply filters
            if filters:
                all_jobs = self.apply_filters(all_jobs, filters)
            
            # Calculate match scores if user skills provided
            if user_skills:
                for job in all_jobs:
                    job['match_score'] = self.calculate_job_match_score(
                        user_skills, 
                        job.get('requirements', [])
                    )
                
                # Sort by match score
                all_jobs.sort(key=lambda x: x.get('match_score', 0), reverse=True)
            
            return {
                'jobs': all_jobs,
                'total': len(all_jobs),
                'filters_applied': filters or {},
                'last_updated': datetime.now().isoformat()
            }
            
        except Exception as e:
            print(f"Error in job search: {str(e)}")
            return {
                'jobs': self.fallback_jobs[:5],  # Return limited fallback jobs
                'total': 5,
                'error': str(e),
                'last_updated': datetime.now().isoformat()
            }
    
    def apply_filters(self, jobs: List[Dict], filters: Dict) -> List[Dict]:
        """Apply search filters to job list"""
        filtered_jobs = jobs.copy()
        
        # Location filter
        if filters.get('location') and filters['location'] != 'All Locations':
            location_filter = filters['location'].lower()
            filtered_jobs = [
                job for job in filtered_jobs 
                if location_filter in job['location'].lower() or 
                (location_filter == 'remote' and job.get('remote', False))
            ]
        
        # Experience level filter
        if filters.get('experience') and filters['experience'] != 'All Experience':
            exp_filter = filters['experience']
            filtered_jobs = [
                job for job in filtered_jobs 
                if job.get('experience_level', '').lower() == exp_filter.lower().replace(' level', '')
            ]
        
        # Salary filter (if implemented)
        if filters.get('min_salary'):
            min_salary = filters['min_salary']
            filtered_jobs = [
                job for job in filtered_jobs 
                if self.extract_min_salary(job.get('salary', '')) >= min_salary
            ]
        
        return filtered_jobs
    
    def extract_min_salary(self, salary_string: str) -> int:
        """Extract minimum salary from salary string"""
        import re
        
        # Look for patterns like "$120k", "$120,000", "120k"
        salary_pattern = r'(\d+)[k|,]?'
        matches = re.findall(salary_pattern, salary_string.replace(',', ''))
        
        if matches:
            try:
                salary = int(matches[0])
                if salary < 1000:  # Assume it's in thousands
                    salary *= 1000
                return salary
            except:
                pass
        
        return 0
    
    def get_job_recommendations(self, user_profile: Dict) -> Dict:
        """Get personalized job recommendations based on user profile"""
        user_skills = user_profile.get('skills', [])
        experience_level = user_profile.get('experience_level', 'Mid-level')
        location_pref = user_profile.get('location_preference', 'Remote')
        
        filters = {
            'location': location_pref,
            'experience': experience_level,
            'use_live_data': False  # Set to True to fetch live data
        }
        
        search_result = self.search_jobs(user_skills, filters)
        
        # Add personalization insights
        recommendations = {
            'recommended_jobs': search_result['jobs'][:10],  # Top 10 matches
            'match_insights': self.generate_match_insights(search_result['jobs'], user_skills),
            'market_trends': self.get_market_trends(),
            'total_opportunities': search_result['total']
        }
        
        return recommendations
    
    def generate_match_insights(self, jobs: List[Dict], user_skills: List[str]) -> Dict:
        """Generate insights about job matches"""
        if not jobs:
            return {}
        
        total_jobs = len(jobs)
        high_match_jobs = len([job for job in jobs if job.get('match_score', 0) >= 80])
        medium_match_jobs = len([job for job in jobs if 50 <= job.get('match_score', 0) < 80])
        
        # Most common requirements
        all_requirements = []
        for job in jobs:
            all_requirements.extend(job.get('requirements', []))
        
        requirement_counts = {}
        for req in all_requirements:
            requirement_counts[req] = requirement_counts.get(req, 0) + 1
        
        top_requirements = sorted(requirement_counts.items(), key=lambda x: x[1], reverse=True)[:5]
        
        return {
            'total_jobs_analyzed': total_jobs,
            'high_match_jobs': high_match_jobs,
            'medium_match_jobs': medium_match_jobs,
            'match_distribution': {
                'high': high_match_jobs,
                'medium': medium_match_jobs,
                'low': total_jobs - high_match_jobs - medium_match_jobs
            },
            'top_skill_requirements': [req[0] for req in top_requirements],
            'skills_you_have': len([skill for skill in user_skills if skill in [req[0] for req in top_requirements]])
        }
    
    def get_market_trends(self) -> Dict:
        """Get current market trends (simplified version)"""
        return {
            'trending_skills': ['Machine Learning', 'AWS', 'React', 'Python', 'Docker'],
            'growing_companies': ['TechCorp Inc.', 'AI Innovations', 'StartupCo'],
            'popular_locations': ['Remote', 'San Francisco, CA', 'New York, NY'],
            'average_salaries': {
                'Entry-level': '$70k - $100k',
                'Mid-level': '$100k - $140k',
                'Senior': '$140k - $200k'
            }
        }

# Example usage
if __name__ == "__main__":
    scanner = JobScannerAgent()
    
    user_profile = {
        'skills': ['Python', 'JavaScript', 'React', 'Node.js'],
        'experience_level': 'Mid-level',
        'location_preference': 'Remote'
    }
    
    recommendations = scanner.get_job_recommendations(user_profile)
    print(json.dumps(recommendations, indent=2))
