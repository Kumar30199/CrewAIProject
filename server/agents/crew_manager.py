"""
CrewAI Manager
Coordinates all AI agents and manages workflow for career coaching tasks
"""

import json
from typing import Dict, List, Any, Optional
from datetime import datetime
import asyncio

# Import individual agents
from .resume_analyzer import ResumeAnalyzerAgent
from .skill_matcher import SkillMatcherAgent
from .job_scanner import JobScannerAgent
from .career_recommender import CareerRecommenderAgent

class CrewAIManager:
    """
    Main orchestrator for all career coaching AI agents
    Manages workflow and coordinates between different agents
    """
    
    def __init__(self):
        # Initialize all agents
        self.resume_analyzer = ResumeAnalyzerAgent()
        self.skill_matcher = SkillMatcherAgent()
        self.job_scanner = JobScannerAgent()
        self.career_recommender = CareerRecommenderAgent()
        
        # Workflow status tracking
        self.current_workflows = {}
        
    def create_workflow_id(self) -> str:
        """Generate unique workflow ID"""
        return f"workflow_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{id(self)}"
    
    async def process_resume_upload(self, resume_content: str, user_id: str) -> Dict[str, Any]:
        """
        Complete resume processing workflow
        1. Analyze resume content
        2. Extract and categorize skills
        3. Calculate gaps and recommendations
        """
        workflow_id = self.create_workflow_id()
        
        try:
            # Update workflow status
            self.current_workflows[workflow_id] = {
                'status': 'processing',
                'stage': 'resume_analysis',
                'user_id': user_id,
                'started_at': datetime.now()
            }
            
            # Stage 1: Resume Analysis
            print(f"[{workflow_id}] Starting resume analysis...")
            resume_analysis = self.resume_analyzer.analyze_resume(resume_content)
            
            if 'error' in resume_analysis:
                return {'error': resume_analysis['error'], 'workflow_id': workflow_id}
            
            # Stage 2: Skill Analysis
            self.current_workflows[workflow_id]['stage'] = 'skill_analysis'
            print(f"[{workflow_id}] Analyzing skills...")
            
            extracted_skills = resume_analysis.get('parsed_data', {}).get('skills', [])
            experience = resume_analysis.get('parsed_data', {}).get('experience', '2 years')
            
            skill_analysis = self.skill_matcher.analyze_user_skills(extracted_skills, experience)
            
            # Stage 3: Generate Initial Recommendations
            self.current_workflows[workflow_id]['stage'] = 'generating_recommendations'
            print(f"[{workflow_id}] Generating recommendations...")
            
            # Create user profile for recommendations
            user_profile = {
                'skills': extracted_skills,
                'experience_level': self.skill_matcher.assess_skill_level('general', experience),
                'skill_categories': skill_analysis.get('categorized_skills', {}),
                'strengths': list(skill_analysis.get('categorized_skills', {}).keys())[:3]
            }
            
            career_recommendations = self.career_recommender.get_personalized_recommendations(user_profile, limit=3)
            
            # Complete workflow
            self.current_workflows[workflow_id]['stage'] = 'completed'
            self.current_workflows[workflow_id]['status'] = 'completed'
            self.current_workflows[workflow_id]['completed_at'] = datetime.now()
            
            return {
                'workflow_id': workflow_id,
                'resume_analysis': resume_analysis,
                'skill_analysis': skill_analysis,
                'career_recommendations': career_recommendations,
                'status': 'completed',
                'next_steps': self.generate_next_steps(resume_analysis, skill_analysis, career_recommendations)
            }
            
        except Exception as e:
            print(f"Error in resume workflow {workflow_id}: {str(e)}")
            self.current_workflows[workflow_id]['status'] = 'error'
            self.current_workflows[workflow_id]['error'] = str(e)
            
            return {'error': str(e), 'workflow_id': workflow_id}
    
    async def get_job_recommendations(self, user_skills: List[str], filters: Dict = None) -> Dict[str, Any]:
        """
        Job matching workflow
        1. Fetch relevant jobs
        2. Calculate match scores
        3. Provide insights and recommendations
        """
        workflow_id = self.create_workflow_id()
        
        try:
            self.current_workflows[workflow_id] = {
                'status': 'processing',
                'stage': 'job_search',
                'started_at': datetime.now()
            }
            
            print(f"[{workflow_id}] Searching for jobs...")
            
            # Get job recommendations
            job_search_results = self.job_scanner.search_jobs(user_skills, filters)
            
            # Analyze skill gaps for top jobs
            top_jobs = job_search_results.get('jobs', [])[:5]
            gap_analysis = []
            
            for job in top_jobs:
                job_requirements = job.get('requirements', [])
                match_analysis = self.skill_matcher.calculate_skill_match_score(user_skills, job_requirements)
                gap_analysis.append({
                    'job_title': job.get('title'),
                    'company': job.get('company'),
                    'match_analysis': match_analysis
                })
            
            self.current_workflows[workflow_id]['status'] = 'completed'
            
            return {
                'workflow_id': workflow_id,
                'job_search_results': job_search_results,
                'gap_analysis': gap_analysis,
                'recommendations': self.generate_job_application_strategy(gap_analysis),
                'status': 'completed'
            }
            
        except Exception as e:
            print(f"Error in job recommendation workflow {workflow_id}: {str(e)}")
            return {'error': str(e), 'workflow_id': workflow_id}
    
    async def comprehensive_career_analysis(self, user_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Complete career analysis workflow combining all agents
        1. Analyze current profile
        2. Identify career opportunities
        3. Suggest learning paths
        4. Provide market insights
        """
        workflow_id = self.create_workflow_id()
        
        try:
            self.current_workflows[workflow_id] = {
                'status': 'processing',
                'stage': 'comprehensive_analysis',
                'started_at': datetime.now()
            }
            
            user_skills = user_data.get('skills', [])
            experience = user_data.get('experience', '2 years')
            interests = user_data.get('interests', [])
            location_pref = user_data.get('location_preference', 'Remote')
            
            print(f"[{workflow_id}] Starting comprehensive analysis...")
            
            # Stage 1: Profile Analysis
            profile_analysis = self.career_recommender.analyze_user_profile(user_skills, experience, interests)
            
            # Stage 2: Skill Gap Analysis
            skill_analysis = self.skill_matcher.analyze_user_skills(user_skills, experience)
            
            # Stage 3: Job Market Analysis
            job_market_analysis = self.job_scanner.get_job_recommendations({
                'skills': user_skills,
                'experience_level': profile_analysis.get('experience_level', 'Mid-level'),
                'location_preference': location_pref
            })
            
            # Stage 4: Career Path Recommendations
            career_recommendations = self.career_recommender.get_personalized_recommendations(profile_analysis, limit=5)
            
            # Stage 5: Industry Insights
            industry_insights = self.career_recommender.get_industry_insights()
            
            # Generate comprehensive report
            comprehensive_report = self.generate_comprehensive_report(
                profile_analysis,
                skill_analysis,
                job_market_analysis,
                career_recommendations,
                industry_insights
            )
            
            self.current_workflows[workflow_id]['status'] = 'completed'
            
            return {
                'workflow_id': workflow_id,
                'comprehensive_report': comprehensive_report,
                'detailed_analysis': {
                    'profile_analysis': profile_analysis,
                    'skill_analysis': skill_analysis,
                    'job_market_analysis': job_market_analysis,
                    'career_recommendations': career_recommendations,
                    'industry_insights': industry_insights
                },
                'status': 'completed'
            }
            
        except Exception as e:
            print(f"Error in comprehensive analysis workflow {workflow_id}: {str(e)}")
            return {'error': str(e), 'workflow_id': workflow_id}
    
    def generate_next_steps(self, resume_analysis: Dict, skill_analysis: Dict, career_recommendations: List[Dict]) -> List[str]:
        """Generate actionable next steps based on analysis"""
        steps = []
        
        # Resume improvements
        resume_score = resume_analysis.get('score', 0)
        if resume_score < 80:
            steps.append("Improve your resume by adding more detailed experience descriptions")
        
        # Skill development
        skill_gaps = skill_analysis.get('skill_gaps', {})
        critical_missing = skill_gaps.get('critical_missing', [])
        if critical_missing:
            steps.append(f"Prioritize learning: {', '.join(critical_missing[:2])}")
        
        # Career progression
        if career_recommendations:
            top_recommendation = career_recommendations[0]
            steps.append(f"Consider pursuing: {top_recommendation.get('title')}")
        
        # General advice
        steps.append("Update your LinkedIn profile with new skills")
        steps.append("Start building a portfolio or contributing to open source projects")
        
        return steps
    
    def generate_job_application_strategy(self, gap_analysis: List[Dict]) -> Dict[str, Any]:
        """Generate job application strategy based on gap analysis"""
        if not gap_analysis:
            return {'error': 'No gap analysis available'}
        
        high_match_jobs = [job for job in gap_analysis if job.get('match_analysis', {}).get('match_percentage', 0) >= 80]
        medium_match_jobs = [job for job in gap_analysis if 60 <= job.get('match_analysis', {}).get('match_percentage', 0) < 80]
        
        strategy = {
            'immediate_applications': len(high_match_jobs),
            'skill_development_needed': len(medium_match_jobs),
            'recommendations': []
        }
        
        if high_match_jobs:
            strategy['recommendations'].append(f"Apply immediately to {len(high_match_jobs)} high-match positions")
        
        if medium_match_jobs:
            strategy['recommendations'].append(f"Develop skills for {len(medium_match_jobs)} potential opportunities")
        
        # Extract most common missing skills
        all_missing_skills = []
        for job in gap_analysis:
            missing = job.get('match_analysis', {}).get('missing_skills', [])
            all_missing_skills.extend(missing)
        
        from collections import Counter
        common_missing = Counter(all_missing_skills).most_common(3)
        
        if common_missing:
            missing_skills = [skill[0] for skill in common_missing]
            strategy['recommendations'].append(f"Focus on learning: {', '.join(missing_skills)}")
        
        return strategy
    
    def generate_comprehensive_report(self, profile_analysis: Dict, skill_analysis: Dict, 
                                    job_market_analysis: Dict, career_recommendations: List[Dict],
                                    industry_insights: Dict) -> Dict[str, Any]:
        """Generate a comprehensive career report"""
        
        # Executive summary
        profile_score = profile_analysis.get('profile_completeness', {}).get('score', 0)
        market_alignment = skill_analysis.get('market_alignment', {}).get('alignment_score', 0)
        job_opportunities = len(job_market_analysis.get('recommended_jobs', []))
        
        executive_summary = {
            'profile_strength': 'Strong' if profile_score >= 80 else 'Good' if profile_score >= 60 else 'Needs Improvement',
            'market_readiness': 'High' if market_alignment >= 80 else 'Medium' if market_alignment >= 60 else 'Low',
            'job_opportunities': job_opportunities,
            'top_career_path': career_recommendations[0].get('title') if career_recommendations else 'General Development'
        }
        
        # Key insights
        insights = []
        
        # Profile insights
        if profile_score < 70:
            insights.append("Your profile could be strengthened with more detailed information")
        
        # Skill insights
        skill_gaps = skill_analysis.get('skill_gaps', {})
        if skill_gaps.get('critical_missing'):
            insights.append(f"Critical skills gap identified: {len(skill_gaps['critical_missing'])} high-demand skills missing")
        
        # Market insights
        if market_alignment >= 85:
            insights.append("Your skills are well-aligned with current market demands")
        elif market_alignment < 60:
            insights.append("Consider focusing on more in-demand skills")
        
        # Opportunity insights
        if job_opportunities >= 20:
            insights.append("Excellent job market opportunities available")
        elif job_opportunities < 10:
            insights.append("Limited immediate opportunities - skill development recommended")
        
        return {
            'executive_summary': executive_summary,
            'key_insights': insights,
            'profile_score': profile_score,
            'market_alignment_score': market_alignment,
            'total_opportunities': job_opportunities,
            'priority_actions': self.generate_priority_actions(profile_analysis, skill_analysis, career_recommendations),
            'success_timeline': self.generate_success_timeline(career_recommendations),
            'report_generated_at': datetime.now().isoformat()
        }
    
    def generate_priority_actions(self, profile_analysis: Dict, skill_analysis: Dict, 
                                career_recommendations: List[Dict]) -> List[Dict]:
        """Generate prioritized action items"""
        actions = []
        
        # Profile completion actions
        profile_details = profile_analysis.get('profile_completeness', {}).get('details', {})
        for area, status in profile_details.items():
            if status in ['Missing', 'Needs improvement']:
                actions.append({
                    'category': 'Profile',
                    'action': f'Complete {area} information',
                    'priority': 'High' if area in ['skills', 'experience'] else 'Medium',
                    'effort': 'Low',
                    'timeline': '1 week'
                })
        
        # Skill development actions
        skill_gaps = skill_analysis.get('skill_gaps', {})
        for gap_type, skills in skill_gaps.items():
            if skills and gap_type == 'critical_missing':
                for skill in skills[:2]:  # Top 2 critical skills
                    actions.append({
                        'category': 'Skill Development',
                        'action': f'Learn {skill}',
                        'priority': 'High',
                        'effort': 'High',
                        'timeline': '2-3 months'
                    })
        
        # Career progression actions
        if career_recommendations:
            top_recommendation = career_recommendations[0]
            actions.append({
                'category': 'Career Planning',
                'action': f'Explore {top_recommendation.get("title")} opportunities',
                'priority': 'Medium',
                'effort': 'Medium',
                'timeline': '1 month'
            })
        
        # Sort by priority
        priority_order = {'High': 3, 'Medium': 2, 'Low': 1}
        actions.sort(key=lambda x: priority_order.get(x['priority'], 0), reverse=True)
        
        return actions[:5]  # Top 5 actions
    
    def generate_success_timeline(self, career_recommendations: List[Dict]) -> Dict[str, List[str]]:
        """Generate timeline for career success"""
        if not career_recommendations:
            return {}
        
        top_recommendation = career_recommendations[0]
        
        timeline = {
            'next_30_days': [
                'Complete profile assessment and improvements',
                'Research target companies and roles',
                'Begin skill development plan'
            ],
            'next_90_days': [
                'Complete first priority skill course',
                'Update resume and LinkedIn profile',
                'Start networking in target industry'
            ],
            'next_6_months': [
                'Complete skill development goals',
                'Build portfolio projects',
                'Apply to target positions'
            ],
            'next_12_months': [
                f'Transition to {top_recommendation.get("title")} role',
                'Continue advanced skill development',
                'Establish yourself in new position'
            ]
        }
        
        return timeline
    
    def get_workflow_status(self, workflow_id: str) -> Dict[str, Any]:
        """Get status of a running workflow"""
        if workflow_id in self.current_workflows:
            return self.current_workflows[workflow_id]
        else:
            return {'error': 'Workflow not found', 'workflow_id': workflow_id}
    
    def cleanup_completed_workflows(self, max_age_hours: int = 24):
        """Clean up old completed workflows"""
        cutoff_time = datetime.now() - timedelta(hours=max_age_hours)
        
        workflows_to_remove = []
        for workflow_id, workflow_data in self.current_workflows.items():
            if (workflow_data.get('status') in ['completed', 'error'] and
                workflow_data.get('completed_at', datetime.now()) < cutoff_time):
                workflows_to_remove.append(workflow_id)
        
        for workflow_id in workflows_to_remove:
            del self.current_workflows[workflow_id]
        
        return len(workflows_to_remove)

# Example usage and testing
if __name__ == "__main__":
    import asyncio
    
    async def test_crew_manager():
        crew = CrewAIManager()
        
        # Test resume upload workflow
        sample_resume = """
        Alex Rodriguez
        alex.rodriguez@email.com
        +1 (555) 123-4567
        
        EXPERIENCE
        Senior Software Developer (3 years)
        - Developed web applications using JavaScript, Python, React
        - Worked with cloud technologies and databases
        
        EDUCATION
        Bachelor's in Computer Science
        
        SKILLS
        Python, JavaScript, React, Node.js, SQL
        """
        
        print("Testing resume upload workflow...")
        result = await crew.process_resume_upload(sample_resume, "test_user")
        print(f"Resume workflow completed: {result.get('status')}")
        
        # Test job recommendations
        print("\nTesting job recommendations...")
        job_result = await crew.get_job_recommendations(['Python', 'JavaScript', 'React'])
        print(f"Job recommendations completed: {job_result.get('status')}")
        
        print("\nWorkflows completed successfully!")
    
    # Run test
    asyncio.run(test_crew_manager())
