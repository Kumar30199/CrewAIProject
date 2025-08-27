#!/usr/bin/env python3
"""
Resume Processing Service for Career Coach AI
Handles PDF/TXT resume parsing and analysis using Flask
"""

import os
import tempfile
import json
import requests
from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename
import logging

# Resume parsing libraries
try:
    import nltk
    # Download required NLTK data
    try:
        nltk.data.find('corpora/stopwords')
    except LookupError:
        nltk.download('stopwords', quiet=True)
    
    try:
        nltk.data.find('tokenizers/punkt')
    except LookupError:
        nltk.download('punkt', quiet=True)
        
    from pyresparser import ResumeParser
    PYRESPARSER_AVAILABLE = True
except (ImportError, Exception) as e:
    logger.warning(f"PyResParser not available: {e}")
    PYRESPARSER_AVAILABLE = False

try:
    from pdfminer.high_level import extract_text
    PDFMINER_AVAILABLE = True
except ImportError:
    PDFMINER_AVAILABLE = False

app = Flask(__name__)
CORS(app)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configuration
UPLOAD_FOLDER = '/tmp/resumes'
ALLOWED_EXTENSIONS = {'txt', 'pdf', 'docx', 'doc'}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB

# Create upload directory
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def allowed_file(filename):
    """Check if file extension is allowed"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def extract_text_from_file(file_path, filename):
    """Extract text from uploaded file"""
    try:
        file_ext = filename.rsplit('.', 1)[1].lower()
        
        if file_ext == 'pdf' and PDFMINER_AVAILABLE:
            from pdfminer.high_level import extract_text
            return extract_text(file_path)
        elif file_ext == 'txt':
            with open(file_path, 'r', encoding='utf-8') as f:
                return f.read()
        else:
            # Fallback to basic text reading
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                return f.read()
    except Exception as e:
        logger.error(f"Error extracting text: {str(e)}")
        return None

def parse_resume_with_pyresparser(file_path):
    """Parse resume using pyresparser library"""
    try:
        if not PYRESPARSER_AVAILABLE:
            return None
            
        data = ResumeParser(file_path).get_extracted_data()
        return {
            'name': data.get('name', ''),
            'email': data.get('email', ''),
            'mobile_number': data.get('mobile_number', ''),
            'skills': data.get('skills', []),
            'education': data.get('education', []),
            'experience': data.get('experience', []),
            'total_experience': data.get('total_experience', 0)
        }
    except Exception as e:
        logger.error(f"Error parsing with pyresparser: {str(e)}")
        return None

def parse_resume_basic(text_content):
    """Basic text-based resume parsing as fallback"""
    import re
    
    # Extract email
    email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
    emails = re.findall(email_pattern, text_content)
    
    # Extract phone numbers
    phone_pattern = r'[\+]?[1-9]?[0-9]{7,14}'
    phones = re.findall(phone_pattern, text_content)
    
    # Extract potential skills (common tech skills)
    tech_skills = [
        'Python', 'JavaScript', 'Java', 'C++', 'React', 'Node.js', 'HTML', 'CSS',
        'SQL', 'MongoDB', 'PostgreSQL', 'Docker', 'AWS', 'Git', 'Linux',
        'Machine Learning', 'Data Science', 'Angular', 'Vue.js', 'TypeScript',
        'Express.js', 'Django', 'Flask', 'Spring', 'Kubernetes'
    ]
    
    found_skills = []
    text_upper = text_content.upper()
    for skill in tech_skills:
        if skill.upper() in text_upper:
            found_skills.append(skill)
    
    return {
        'name': '',  # Hard to extract reliably
        'email': emails[0] if emails else '',
        'mobile_number': phones[0] if phones else '',
        'skills': found_skills,
        'education': [],
        'experience': [],
        'total_experience': 0
    }

def fetch_remote_jobs(skills_list=None):
    """Fetch jobs from Remotive.io API with skill filtering"""
    try:
        url = "https://remotive.io/api/remote-jobs"
        params = {}
        
        # Add skill-based search if skills provided
        if skills_list:
            # Use first few skills as search terms
            search_terms = ' OR '.join(skills_list[:3])  # Limit to avoid long URLs
            params['search'] = search_terms
            
        response = requests.get(url, params=params, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            jobs = data.get('jobs', [])
            
            # Format jobs for our frontend
            formatted_jobs = []
            for job in jobs[:20]:  # Limit to 20 jobs
                formatted_job = {
                    'id': str(job.get('id', '')),
                    'title': job.get('job_title', ''),
                    'company': job.get('company_name', ''),
                    'location': 'Remote',
                    'description': job.get('job_description', '')[:200] + '...' if job.get('job_description') else '',
                    'requirements': job.get('job_description', ''),
                    'salary': job.get('salary', None),
                    'applyUrl': job.get('url', ''),
                    'postedAt': job.get('publication_date', ''),
                    'matchScore': calculate_job_match(job, skills_list) if skills_list else 75
                }
                formatted_jobs.append(formatted_job)
            
            return {
                'success': True,
                'jobs': formatted_jobs,
                'source': 'remotive_api'
            }
        else:
            raise Exception(f"API returned status {response.status_code}")
            
    except Exception as e:
        logger.error(f"Error fetching from Remotive API: {str(e)}")
        return get_fallback_jobs(skills_list)

def calculate_job_match(job, user_skills):
    """Calculate job match score based on user skills"""
    if not user_skills:
        return 75
        
    job_text = (job.get('job_description', '') + ' ' + job.get('job_title', '')).lower()
    skill_matches = 0
    
    for skill in user_skills:
        if skill.lower() in job_text:
            skill_matches += 1
    
    # Calculate match percentage
    if len(user_skills) > 0:
        match_score = min(95, max(45, (skill_matches / len(user_skills)) * 100))
    else:
        match_score = 75
        
    return int(match_score)

def get_fallback_jobs(skills_list=None):
    """Fallback static job data when API fails"""
    fallback_jobs = [
        {
            'id': 'job-1',
            'title': 'Full Stack Developer',
            'company': 'TechCorp',
            'location': 'Remote',
            'description': 'Looking for a full stack developer with React, Node.js, and Python experience.',
            'requirements': 'React, Node.js, Python, SQL, Git',
            'salary': '$80,000 - $120,000',
            'applyUrl': 'https://example.com/apply',
            'postedAt': '2025-01-20',
            'matchScore': 85
        },
        {
            'id': 'job-2',
            'title': 'Frontend Developer',
            'company': 'WebStudio',
            'location': 'Remote',
            'description': 'Frontend developer needed for modern React applications with TypeScript.',
            'requirements': 'React, TypeScript, HTML, CSS, JavaScript',
            'salary': '$70,000 - $100,000',
            'applyUrl': 'https://example.com/apply2',
            'postedAt': '2025-01-19',
            'matchScore': 78
        },
        {
            'id': 'job-3',
            'title': 'Python Developer',
            'company': 'DataTech',
            'location': 'Remote',
            'description': 'Python developer for data processing and web applications.',
            'requirements': 'Python, Django, PostgreSQL, Docker',
            'salary': '$75,000 - $110,000',
            'applyUrl': 'https://example.com/apply3',
            'postedAt': '2025-01-18',
            'matchScore': 72
        }
    ]
    
    return {
        'success': False,
        'jobs': fallback_jobs,
        'source': 'fallback_data',
        'message': 'Using fallback data - API unavailable'
    }

def generate_career_paths(user_skills):
    """Generate dynamic career paths based on user skills"""
    
    # Define skill-based career paths
    career_paths = {
        'frontend': {
            'title': 'Frontend Developer',
            'description': 'Specialize in user interface development with modern frameworks',
            'required_skills': ['HTML', 'CSS', 'JavaScript', 'React', 'TypeScript'],
            'timeline': '6-12 months',
            'salaryRange': '$60,000 - $120,000',
            'icon': 'monitor'
        },
        'backend': {
            'title': 'Backend Developer',
            'description': 'Focus on server-side development and API design',
            'required_skills': ['Python', 'Node.js', 'SQL', 'MongoDB', 'Express.js'],
            'timeline': '8-14 months',
            'salaryRange': '$70,000 - $130,000',
            'icon': 'server'
        },
        'fullstack': {
            'title': 'Full Stack Developer',
            'description': 'Master both frontend and backend technologies',
            'required_skills': ['React', 'Node.js', 'Python', 'SQL', 'Git', 'Docker'],
            'timeline': '12-18 months',
            'salaryRange': '$80,000 - $140,000',
            'icon': 'layers'
        },
        'data': {
            'title': 'Data Scientist',
            'description': 'Analyze data and build machine learning models',
            'required_skills': ['Python', 'Machine Learning', 'SQL', 'Statistics', 'Pandas'],
            'timeline': '10-16 months',
            'salaryRange': '$90,000 - $150,000',
            'icon': 'trending-up'
        }
    }
    
    # Calculate skill matches for each path
    user_skills_lower = [skill.lower() for skill in user_skills]
    path_recommendations = []
    
    for path_key, path_data in career_paths.items():
        required_skills = path_data['required_skills']
        matching_skills = []
        missing_skills = []
        
        for skill in required_skills:
            if skill.lower() in user_skills_lower:
                matching_skills.append(skill)
            else:
                missing_skills.append(skill)
        
        match_percentage = (len(matching_skills) / len(required_skills)) * 100
        
        path_recommendations.append({
            'id': f'path-{path_key}',
            'title': path_data['title'],
            'description': path_data['description'],
            'requiredSkills': required_skills,
            'matchingSkills': matching_skills,
            'missingSkills': missing_skills,
            'matchPercentage': int(match_percentage),
            'timeline': path_data['timeline'],
            'salaryRange': path_data['salaryRange'],
            'icon': path_data['icon']
        })
    
    # Sort by match percentage
    path_recommendations.sort(key=lambda x: x['matchPercentage'], reverse=True)
    
    return path_recommendations

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'pyresparser': PYRESPARSER_AVAILABLE,
        'pdfminer': PDFMINER_AVAILABLE
    })

@app.route('/parse-resume', methods=['POST'])
def parse_resume():
    """Parse uploaded resume file"""
    try:
        # Check if file was uploaded
        if 'resume' not in request.files:
            return jsonify({'error': 'No file uploaded'}), 400
        
        file = request.files['resume']
        
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if not allowed_file(file.filename):
            return jsonify({'error': 'File type not allowed'}), 400
        
        # Save file temporarily
        if not file.filename:
            return jsonify({'error': 'Invalid filename'}), 400
        filename = secure_filename(file.filename)
        temp_path = os.path.join(UPLOAD_FOLDER, filename)
        file.save(temp_path)
        
        try:
            # Extract text content
            text_content = extract_text_from_file(temp_path, filename)
            
            if not text_content:
                return jsonify({'error': 'Could not extract text from file'}), 400
            
            # Try advanced parsing first
            parsed_data = parse_resume_with_pyresparser(temp_path)
            
            # Fallback to basic parsing if advanced fails
            if not parsed_data:
                parsed_data = parse_resume_basic(text_content)
            
            # Calculate resume score based on completeness
            score = calculate_resume_score(parsed_data)
            
            response_data = {
                'success': True,
                'fileName': filename,
                'content': text_content[:1000],  # First 1000 chars
                'parsedData': parsed_data,
                'score': score,
                'message': 'Resume parsed successfully'
            }
            
            return jsonify(response_data)
            
        finally:
            # Clean up temp file
            if os.path.exists(temp_path):
                os.remove(temp_path)
                
    except Exception as e:
        logger.error(f"Error parsing resume: {str(e)}")
        return jsonify({'error': f'Processing error: {str(e)}'}), 500

@app.route('/jobs', methods=['GET'])
def get_jobs():
    """Get job recommendations based on skills"""
    try:
        # Get skills from query parameter
        skills_param = request.args.get('skills', '')
        user_skills = [s.strip() for s in skills_param.split(',') if s.strip()] if skills_param else None
        
        # Fetch jobs from API
        job_data = fetch_remote_jobs(user_skills)
        
        return jsonify(job_data)
        
    except Exception as e:
        logger.error(f"Error fetching jobs: {str(e)}")
        return jsonify({
            'success': False,
            'jobs': [],
            'message': f'Error: {str(e)}'
        }), 500

@app.route('/career-paths', methods=['GET'])
def get_career_paths():
    """Generate career paths based on user skills"""
    try:
        # Get skills from query parameter
        skills_param = request.args.get('skills', '')
        user_skills = [s.strip() for s in skills_param.split(',') if s.strip()] if skills_param else []
        
        # If no skills provided, use default set
        if not user_skills:
            user_skills = ['JavaScript', 'HTML', 'CSS']  # Default skills
        
        career_paths = generate_career_paths(user_skills)
        
        return jsonify({
            'success': True,
            'paths': career_paths,
            'userSkills': user_skills
        })
        
    except Exception as e:
        logger.error(f"Error generating career paths: {str(e)}")
        return jsonify({
            'success': False,
            'paths': [],
            'message': f'Error: {str(e)}'
        }), 500

def calculate_resume_score(parsed_data):
    """Calculate resume completeness score"""
    score = 0
    
    # Check for basic info
    if parsed_data.get('name'):
        score += 20
    if parsed_data.get('email'):
        score += 20
    if parsed_data.get('mobile_number'):
        score += 10
    
    # Check for skills
    skills = parsed_data.get('skills', [])
    if len(skills) > 0:
        score += 25
    if len(skills) > 5:
        score += 10
    
    # Check for experience
    if parsed_data.get('experience'):
        score += 10
    if parsed_data.get('total_experience', 0) > 0:
        score += 5
    
    return min(score, 100)

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8000))
    app.run(host='0.0.0.0', port=port, debug=True)