"""
Resume Analyzer Agent
Parses and analyzes uploaded resumes using spaCy and pyresparser
"""

import spacy
import json
from typing import Dict, List, Any
import re

class ResumeAnalyzerAgent:
    def __init__(self):
        # Load English language model
        try:
            self.nlp = spacy.load("en_core_web_sm")
        except:
            print("Warning: spaCy English model not found. Install with: python -m spacy download en_core_web_sm")
            self.nlp = None
    
    def extract_contact_info(self, text: str) -> Dict[str, str]:
        """Extract contact information from resume text"""
        contact_info = {
            'email': '',
            'phone': '',
            'name': ''
        }
        
        # Email extraction
        email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
        emails = re.findall(email_pattern, text)
        if emails:
            contact_info['email'] = emails[0]
        
        # Phone extraction
        phone_pattern = r'(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}'
        phones = re.findall(phone_pattern, text)
        if phones:
            contact_info['phone'] = ''.join(phones[0])
        
        # Name extraction (first two words of the first line, typically)
        lines = text.strip().split('\n')
        if lines:
            first_line = lines[0].strip()
            words = first_line.split()
            if len(words) >= 2:
                contact_info['name'] = ' '.join(words[:2])
        
        return contact_info
    
    def extract_skills(self, text: str) -> List[str]:
        """Extract skills from resume text"""
        # Common technical skills database
        technical_skills = [
            'python', 'javascript', 'java', 'c++', 'c#', 'php', 'ruby', 'go', 'rust',
            'react', 'angular', 'vue', 'node.js', 'express', 'django', 'flask',
            'html', 'css', 'sass', 'typescript', 'jquery',
            'mysql', 'postgresql', 'mongodb', 'redis', 'elasticsearch',
            'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins',
            'git', 'github', 'gitlab', 'jira', 'agile', 'scrum',
            'machine learning', 'ai', 'tensorflow', 'pytorch', 'scikit-learn',
            'data science', 'pandas', 'numpy', 'matplotlib', 'sql'
        ]
        
        text_lower = text.lower()
        found_skills = []
        
        for skill in technical_skills:
            if skill in text_lower:
                found_skills.append(skill.title())
        
        return list(set(found_skills))  # Remove duplicates
    
    def extract_experience(self, text: str) -> str:
        """Extract years of experience"""
        # Look for patterns like "5 years", "5+ years", "5-7 years"
        experience_patterns = [
            r'(\d+)\s*\+?\s*years?\s*of\s*experience',
            r'(\d+)\s*years?\s*experience',
            r'experience\s*:?\s*(\d+)\s*years?',
            r'(\d+)-(\d+)\s*years?\s*experience'
        ]
        
        text_lower = text.lower()
        for pattern in experience_patterns:
            matches = re.findall(pattern, text_lower)
            if matches:
                if isinstance(matches[0], tuple):
                    return f"{matches[0][0]}-{matches[0][1]} years"
                else:
                    return f"{matches[0]} years"
        
        return "Not specified"
    
    def extract_education(self, text: str) -> str:
        """Extract education information"""
        education_keywords = [
            'bachelor', 'master', 'phd', 'doctorate', 'associate',
            'computer science', 'software engineering', 'information technology',
            'electrical engineering', 'mathematics', 'data science'
        ]
        
        text_lower = text.lower()
        education_info = []
        
        for keyword in education_keywords:
            if keyword in text_lower:
                education_info.append(keyword.title())
        
        if education_info:
            return ', '.join(set(education_info))
        return "Not specified"
    
    def calculate_resume_score(self, parsed_data: Dict[str, Any]) -> int:
        """Calculate resume completeness score"""
        score = 0
        
        # Contact information (30 points)
        if parsed_data.get('email'):
            score += 10
        if parsed_data.get('phone'):
            score += 10
        if parsed_data.get('name'):
            score += 10
        
        # Skills (25 points)
        skills = parsed_data.get('skills', [])
        if len(skills) >= 5:
            score += 25
        elif len(skills) >= 3:
            score += 15
        elif len(skills) >= 1:
            score += 10
        
        # Experience (25 points)
        experience = parsed_data.get('experience', '')
        if 'years' in experience.lower() and experience != "Not specified":
            score += 25
        
        # Education (20 points)
        education = parsed_data.get('education', '')
        if education != "Not specified":
            score += 20
        
        return min(score, 100)  # Cap at 100
    
    def analyze_resume(self, resume_text: str) -> Dict[str, Any]:
        """Main analysis function"""
        try:
            # Extract information
            contact_info = self.extract_contact_info(resume_text)
            skills = self.extract_skills(resume_text)
            experience = self.extract_experience(resume_text)
            education = self.extract_education(resume_text)
            
            # Combine all extracted data
            parsed_data = {
                'name': contact_info['name'],
                'email': contact_info['email'],
                'phone': contact_info['phone'],
                'skills': skills,
                'experience': experience,
                'education': education
            }
            
            # Calculate score
            score = self.calculate_resume_score(parsed_data)
            
            return {
                'parsed_data': parsed_data,
                'score': score,
                'analysis': {
                    'contact_completeness': 100 if all(contact_info.values()) else 70,
                    'skills_count': len(skills),
                    'has_experience': experience != "Not specified",
                    'has_education': education != "Not specified"
                }
            }
            
        except Exception as e:
            print(f"Error analyzing resume: {str(e)}")
            return {
                'parsed_data': {},
                'score': 0,
                'analysis': {},
                'error': str(e)
            }

# Example usage
if __name__ == "__main__":
    analyzer = ResumeAnalyzerAgent()
    
    sample_resume = """
    Alex Rodriguez
    alex.rodriguez@email.com
    +1 (555) 123-4567
    
    EXPERIENCE
    Senior Software Developer (5 years)
    - Developed web applications using JavaScript, Python, React, and Node.js
    - Worked with AWS cloud services and Docker containers
    - Led agile development teams
    
    EDUCATION
    Bachelor's Degree in Computer Science
    XYZ University
    
    SKILLS
    Programming: Python, JavaScript, Java
    Web: React, HTML, CSS, Node.js
    Cloud: AWS, Docker
    Database: MySQL, MongoDB
    """
    
    result = analyzer.analyze_resume(sample_resume)
    print(json.dumps(result, indent=2))
