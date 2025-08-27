import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertResumeSchema, insertActivitySchema } from "@shared/schema";
import multer from "multer";
import path from "path";
import { spawn } from "child_process";
import axios from "axios";

// Extend Express Request type to include file property
interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

// Python Flask server configuration
const PYTHON_SERVER_PORT = 8000;
const PYTHON_SERVER_URL = `http://localhost:${PYTHON_SERVER_PORT}`;

// Start Python resume processor
let pythonProcess: any = null;
function startPythonServer() {
  if (pythonProcess) return;
  
  console.log('Starting Python resume processor...');
  pythonProcess = spawn('python', ['server/resume_processor.py'], {
    env: { ...process.env, PORT: PYTHON_SERVER_PORT.toString() },
    stdio: 'inherit'
  });
  
  pythonProcess.on('error', (error: Error) => {
    console.error('Python server error:', error);
  });
  
  pythonProcess.on('exit', (code: number) => {
    console.log(`Python server exited with code ${code}`);
    pythonProcess = null;
  });
}

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedTypes = ['.pdf', '.txt', '.docx', '.doc'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, TXT, and DOC files are allowed'));
    }
  }
});

// Helper function to make Python service calls with fallback
async function callPythonService(endpoint: string, options: any = {}) {
  try {
    const response = await axios({
      method: options.method || 'GET',
      url: `${PYTHON_SERVER_URL}${endpoint}`,
      data: options.data,
      headers: options.headers,
      timeout: 30000,
      ...options
    });
    return response.data;
  } catch (error: any) {
    console.error(`Python service error (${endpoint}):`, error.message);
    return { success: false, error: error.message };
  }
}

// Fallback job data
const fallbackJobs = [
  {
    id: 'job-1',
    title: 'Full Stack Developer',
    company: 'TechCorp',
    location: 'Remote',
    description: 'Looking for a full stack developer with React, Node.js, and Python experience.',
    requirements: ['React', 'Node.js', 'Python', 'SQL', 'Git'],
    salary: '$80,000 - $120,000',
    applyUrl: 'https://example.com/apply',
    postedAt: '2025-01-20',
    matchScore: 85
  },
  {
    id: 'job-2', 
    title: 'Frontend Developer',
    company: 'WebStudio',
    location: 'Remote',
    description: 'Frontend developer needed for modern React applications with TypeScript.',
    requirements: ['React', 'TypeScript', 'HTML', 'CSS', 'JavaScript'],
    salary: '$70,000 - $100,000',
    applyUrl: 'https://example.com/apply2',
    postedAt: '2025-01-19',
    matchScore: 78
  },
  {
    id: 'job-3',
    title: 'Python Developer', 
    company: 'DataTech',
    location: 'Remote',
    description: 'Python developer for data processing and web applications.',
    requirements: ['Python', 'Django', 'PostgreSQL', 'Docker'],
    salary: '$75,000 - $110,000',
    applyUrl: 'https://example.com/apply3',
    postedAt: '2025-01-18',
    matchScore: 72
  }
];

export async function registerRoutes(app: Express): Promise<Server> {
  const defaultUserId = "default-user";

  // Start Python server
  startPythonServer();

  // Dashboard stats
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const resume = await storage.getResumeByUserId(defaultUserId);
      const skills = await storage.getSkillsByUserId(defaultUserId);
      const jobs = await storage.getJobs();
      
      const resumeScore = resume?.score || 0;
      const skillMatches = skills.length;
      const jobRecommendations = jobs.length || 3; // Show minimum 3

      res.json({
        resumeScore,
        skillMatches,
        jobRecommendations
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch dashboard stats" });
    }
  });

  // Recent activities
  app.get("/api/activities", async (req, res) => {
    try {
      const activities = await storage.getActivitiesByUserId(defaultUserId);
      res.json(activities);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch activities" });
    }
  });

  // Resume upload with Python integration
  app.post("/api/resume/upload", upload.single('resume'), async (req: MulterRequest, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      // Forward file to Python service
      const FormData = require('form-data');
      const fs = require('fs');
      
      const formData = new FormData();
      formData.append('resume', fs.createReadStream(req.file.path), {
        filename: req.file.originalname,
        contentType: req.file.mimetype
      });
      
      const pythonResponse = await callPythonService('/parse-resume', {
        method: 'POST',
        data: formData,
        headers: formData.getHeaders()
      });

      if (!pythonResponse.success) {
        // Fallback to basic parsing
        const content = await fs.promises.readFile(req.file.path, 'utf-8');
        const fallbackData = {
          name: "User",
          email: "",
          mobile_number: "",
          skills: ["JavaScript", "HTML", "CSS"], // Basic web skills
          education: [],
          experience: [],
          total_experience: 0
        };
        
        const resume = await storage.createResume({
          content,
          userId: defaultUserId,
          fileName: req.file.originalname,
          parsedData: fallbackData,
          score: 65
        });
        
        res.json({ 
          success: true, 
          resume,
          message: "Resume uploaded (basic parsing - Python service unavailable)",
          extractedSkills: fallbackData.skills.length
        });
      } else {
        // Use Python analysis results
        const resumeData = {
          content: pythonResponse.content,
          userId: defaultUserId,
          fileName: req.file.originalname,
          parsedData: pythonResponse.parsedData,
          score: pythonResponse.score
        };

        const resume = await storage.createResume(resumeData);
        
        // Update user skills based on resume analysis
        const extractedSkills = pythonResponse.parsedData?.skills || [];
        for (const skillName of extractedSkills) {
          try {
            await storage.createSkill({
              name: skillName,
              userId: defaultUserId,
              level: "intermediate",
              category: "technical",
              isInDemand: true
            });
          } catch (error) {
            // Skill might already exist, continue
          }
        }
        
        res.json({ 
          success: true, 
          resume,
          message: pythonResponse.message,
          extractedSkills: extractedSkills.length
        });
      }
      
      // Log activity
      await storage.createActivity({
        type: "resume_upload",
        description: `Uploaded and analyzed resume: ${req.file.originalname}`,
        userId: defaultUserId,
        status: "completed"
      });
      
      // Clean up temp file
      fs.unlinkSync(req.file.path);

    } catch (error: any) {
      console.error("Resume upload error:", error);
      res.status(500).json({ error: error.message || "Failed to process resume" });
    }
  });

  // Get resume analysis
  app.get("/api/resume", async (req, res) => {
    try {
      const resume = await storage.getResumeByUserId(defaultUserId);
      if (!resume) {
        return res.status(404).json({ error: "No resume found" });
      }
      res.json(resume);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch resume" });
    }
  });

  // Skills assessment
  app.get("/api/skills", async (req, res) => {
    try {
      const userSkills = await storage.getSkillsByUserId(defaultUserId);
      const demandSkills = [
        { name: "Machine Learning", level: "missing", category: "Data Science", isInDemand: true },
        { name: "Docker", level: "missing", category: "DevOps", isInDemand: true },
        { name: "AWS", level: "missing", category: "Cloud", isInDemand: true },
        { name: "GraphQL", level: "developing", category: "Backend", isInDemand: true },
        { name: "Kubernetes", level: "missing", category: "DevOps", isInDemand: true },
        { name: "TypeScript", level: "developing", category: "Frontend", isInDemand: true }
      ];

      res.json({
        userSkills,
        demandSkills,
        totalSkills: userSkills.length,
        demandSkillsCount: demandSkills.length
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch skills" });
    }
  });

  // Job matching with Python integration and Remotive API
  app.get("/api/jobs", async (req, res) => {
    try {
      const skills = await storage.getSkillsByUserId(defaultUserId);
      const skillNames = skills.map(s => s.name);
      const skillsParam = skillNames.join(',');
      
      // Try Python service first
      const pythonResponse = await callPythonService(`/jobs?skills=${encodeURIComponent(skillsParam)}`);
      
      if (pythonResponse.success) {
        // Store jobs from API
        for (const jobData of pythonResponse.jobs.slice(0, 10)) {
          try {
            await storage.createJob({
              title: jobData.title,
              description: jobData.description,
              location: jobData.location,
              company: jobData.company,
              salary: jobData.salary,
              requirements: jobData.requirements,
              matchScore: jobData.matchScore,
              postedAt: jobData.postedAt,
              applyUrl: jobData.applyUrl
            });
          } catch (error) {
            // Job might already exist
          }
        }
        
        res.json({
          success: true,
          jobs: pythonResponse.jobs,
          source: pythonResponse.source,
          message: pythonResponse.message
        });
      } else {
        // Fallback to static jobs
        res.json({
          success: true,
          jobs: fallbackJobs,
          source: 'fallback_data',
          message: 'Using fallback data - External job API unavailable'
        });
      }
    } catch (error) {
      console.error("Job fetching error:", error);
      res.json({
        success: true,
        jobs: fallbackJobs,
        source: 'fallback_data',
        message: 'Error occurred - Using fallback data'
      });
    }
  });

  // Career paths with Python integration  
  app.get("/api/career-paths", async (req, res) => {
    try {
      const skills = await storage.getSkillsByUserId(defaultUserId);
      const skillNames = skills.map(s => s.name);
      const skillsParam = skillNames.join(',');
      
      // Try Python service first
      const pythonResponse = await callPythonService(`/career-paths?skills=${encodeURIComponent(skillsParam)}`);
      
      if (pythonResponse.success) {
        // Store career paths
        for (const pathData of pythonResponse.paths) {
          try {
            await storage.createCareerPath({
              title: pathData.title,
              description: pathData.description,
              userId: defaultUserId,
              requiredSkills: pathData.requiredSkills,
              timeline: pathData.timeline,
              salaryRange: pathData.salaryRange,
              icon: pathData.icon
            });
          } catch (error) {
            // Path might already exist
          }
        }
        
        res.json(pythonResponse.paths);
      } else {
        // Fallback career paths
        const fallbackPaths = [
          {
            id: 'path-frontend',
            title: 'Frontend Developer',
            description: 'Specialize in user interface development with modern frameworks',
            requiredSkills: ['HTML', 'CSS', 'JavaScript', 'React', 'TypeScript'],
            matchingSkills: skillNames.filter(s => ['HTML', 'CSS', 'JavaScript', 'React', 'TypeScript'].includes(s)),
            missingSkills: ['HTML', 'CSS', 'JavaScript', 'React', 'TypeScript'].filter(s => !skillNames.includes(s)),
            matchPercentage: 60,
            timeline: '6-12 months',
            salaryRange: '$60,000 - $120,000',
            icon: 'monitor'
          },
          {
            id: 'path-fullstack',
            title: 'Full Stack Developer', 
            description: 'Master both frontend and backend technologies',
            requiredSkills: ['React', 'Node.js', 'Python', 'SQL', 'Git', 'Docker'],
            matchingSkills: skillNames.filter(s => ['React', 'Node.js', 'Python', 'SQL', 'Git', 'Docker'].includes(s)),
            missingSkills: ['React', 'Node.js', 'Python', 'SQL', 'Git', 'Docker'].filter(s => !skillNames.includes(s)),
            matchPercentage: 45,
            timeline: '12-18 months',
            salaryRange: '$80,000 - $140,000',
            icon: 'layers'
          }
        ];
        
        res.json(fallbackPaths);
      }
    } catch (error) {
      console.error("Career paths error:", error);
      res.status(500).json({ error: "Failed to fetch career paths" });
    }
  });

  // Courses endpoint
  app.get("/api/courses", async (req, res) => {
    try {
      const courses = await storage.getCourses();
      
      // Add fallback courses if none exist
      if (courses.length === 0) {
        const fallbackCourses = [
          {
            title: "Complete React Developer Course",
            description: "Learn React.js from basics to advanced concepts with hands-on projects",
            provider: "freeCodeCamp",
            courseUrl: "https://www.freecodecamp.org/learn/front-end-development-libraries/",
            duration: "20 hours",
            level: "Beginner",
            category: "Frontend",
            rating: "4.8",
            imageUrl: null,
            isFree: true
          },
          {
            title: "Python for Everybody Specialization",
            description: "Learn to program and analyze data with Python",
            provider: "Coursera",
            courseUrl: "https://www.coursera.org/specializations/python",
            duration: "8 months",
            level: "Beginner", 
            category: "Programming",
            rating: "4.8",
            imageUrl: null,
            isFree: true
          },
          {
            title: "CS50's Introduction to Computer Science",
            description: "Harvard's introduction to computer science and programming",
            provider: "edX",
            courseUrl: "https://www.edx.org/course/cs50s-introduction-to-computer-science",
            duration: "12 weeks",
            level: "Beginner",
            category: "Computer Science",
            rating: "4.9", 
            imageUrl: null,
            isFree: true
          }
        ];
        
        for (const courseData of fallbackCourses) {
          try {
            await storage.createCourse(courseData);
          } catch (error) {
            // Course might already exist
          }
        }
        
        const newCourses = await storage.getCourses();
        res.json(newCourses);
      } else {
        res.json(courses);
      }
    } catch (error) {
      console.error("Courses error:", error);
      res.status(500).json({ error: "Failed to fetch courses" });
    }
  });

  // Create a new activity
  app.post("/api/activities", async (req, res) => {
    try {
      const validation = insertActivitySchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: "Invalid activity data" });
      }

      const activity = await storage.createActivity({
        ...validation.data,
        userId: defaultUserId
      });
      
      res.json(activity);
    } catch (error) {
      res.status(500).json({ error: "Failed to create activity" });
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);
  return httpServer;
}