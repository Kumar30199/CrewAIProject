import { 
  type User, type InsertUser, type Resume, type InsertResume,
  type Skill, type InsertSkill, type Job, type InsertJob,
  type CareerPath, type InsertCareerPath, type Course, type InsertCourse,
  type Activity, type InsertActivity
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Resume operations
  createResume(resume: InsertResume): Promise<Resume>;
  getResumeByUserId(userId: string): Promise<Resume | undefined>;
  updateResume(id: string, data: Partial<Resume>): Promise<Resume | undefined>;
  
  // Skills operations
  getSkillsByUserId(userId: string): Promise<Skill[]>;
  createSkill(skill: InsertSkill): Promise<Skill>;
  getInDemandSkills(): Promise<Skill[]>;
  
  // Jobs operations
  getJobs(filters?: { location?: string; experience?: string }): Promise<Job[]>;
  createJob(job: InsertJob): Promise<Job>;
  getJobsByMatchScore(minScore: number): Promise<Job[]>;
  
  // Career paths operations
  getCareerPathsByUserId(userId: string): Promise<CareerPath[]>;
  createCareerPath(path: InsertCareerPath): Promise<CareerPath>;
  
  // Courses operations
  getCourses(category?: string): Promise<Course[]>;
  createCourse(course: InsertCourse): Promise<Course>;
  
  // Activities operations
  getActivitiesByUserId(userId: string): Promise<Activity[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private resumes: Map<string, Resume>;
  private skills: Map<string, Skill>;
  private jobs: Map<string, Job>;
  private careerPaths: Map<string, CareerPath>;
  private courses: Map<string, Course>;
  private activities: Map<string, Activity>;

  constructor() {
    this.users = new Map();
    this.resumes = new Map();
    this.skills = new Map();
    this.jobs = new Map();
    this.careerPaths = new Map();
    this.courses = new Map();
    this.activities = new Map();
    
    // Initialize with sample data
    this.initializeSampleData();
  }

  private async initializeSampleData() {
    // Create default user
    const defaultUser: User = {
      id: "default-user",
      username: "alex",
      password: "password",
      name: "Alex Rodriguez",
      email: "alex.rodriguez@email.com",
      phone: "+1 (555) 123-4567",
      createdAt: new Date(),
    };
    this.users.set(defaultUser.id, defaultUser);

    // Add sample skills
    const skills = [
      { name: "JavaScript", level: "expert", category: "Programming" },
      { name: "Python", level: "advanced", category: "Programming" },
      { name: "React", level: "intermediate", category: "Frontend" },
      { name: "Node.js", level: "beginner", category: "Backend" },
    ];

    for (const skill of skills) {
      const skillData: Skill = {
        id: randomUUID(),
        userId: defaultUser.id,
        ...skill,
        isInDemand: true,
        addedAt: new Date(),
      };
      this.skills.set(skillData.id, skillData);
    }

    // Add sample courses
    const courses = [
      {
        title: "Complete Web Development Bootcamp",
        description: "Learn HTML, CSS, JavaScript, React, Node.js and build real-world projects.",
        provider: "Coursera",
        duration: "40 hours",
        level: "Beginner",
        rating: "4.8 (12.5k)",
        imageUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=200",
        courseUrl: "https://coursera.org/web-development",
        category: "Programming"
      },
      {
        title: "AWS Cloud Practitioner",
        description: "Learn cloud fundamentals and prepare for AWS certification.",
        provider: "edX",
        duration: "20 hours",
        level: "Intermediate",
        rating: "4.6 (8.2k)",
        imageUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=200",
        courseUrl: "https://edx.org/aws-cloud",
        category: "Cloud"
      }
    ];

    for (const course of courses) {
      const courseData: Course = {
        id: randomUUID(),
        ...course,
        isFree: true,
        addedAt: new Date(),
      };
      this.courses.set(courseData.id, courseData);
    }
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id,
      name: insertUser.name || null,
      email: insertUser.email || null,
      phone: insertUser.phone || null,
      createdAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  async createResume(insertResume: InsertResume): Promise<Resume> {
    const id = randomUUID();
    const resume: Resume = {
      ...insertResume,
      id,
      parsedData: insertResume.parsedData || null,
      score: insertResume.score || null,
      uploadedAt: new Date(),
    };
    this.resumes.set(id, resume);
    return resume;
  }

  async getResumeByUserId(userId: string): Promise<Resume | undefined> {
    return Array.from(this.resumes.values()).find(resume => resume.userId === userId);
  }

  async updateResume(id: string, data: Partial<Resume>): Promise<Resume | undefined> {
    const resume = this.resumes.get(id);
    if (!resume) return undefined;
    
    const updated = { ...resume, ...data };
    this.resumes.set(id, updated);
    return updated;
  }

  async getSkillsByUserId(userId: string): Promise<Skill[]> {
    return Array.from(this.skills.values()).filter(skill => skill.userId === userId);
  }

  async createSkill(insertSkill: InsertSkill): Promise<Skill> {
    const id = randomUUID();
    const skill: Skill = {
      ...insertSkill,
      id,
      isInDemand: insertSkill.isInDemand || null,
      addedAt: new Date(),
    };
    this.skills.set(id, skill);
    return skill;
  }

  async getInDemandSkills(): Promise<Skill[]> {
    return Array.from(this.skills.values()).filter(skill => skill.isInDemand);
  }

  async getJobs(filters?: { location?: string; experience?: string }): Promise<Job[]> {
    let jobs = Array.from(this.jobs.values());
    
    if (filters?.location && filters.location !== 'All Locations') {
      jobs = jobs.filter(job => job.location.includes(filters.location!));
    }
    
    return jobs.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
  }

  async createJob(insertJob: InsertJob): Promise<Job> {
    const id = randomUUID();
    const job: Job = {
      ...insertJob,
      id,
      salary: insertJob.salary || null,
      requirements: insertJob.requirements || null,
      matchScore: insertJob.matchScore || null,
      postedAt: insertJob.postedAt || null,
      applyUrl: insertJob.applyUrl || null,
      fetchedAt: new Date(),
    };
    this.jobs.set(id, job);
    return job;
  }

  async getJobsByMatchScore(minScore: number): Promise<Job[]> {
    return Array.from(this.jobs.values())
      .filter(job => (job.matchScore || 0) >= minScore)
      .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
  }

  async getCareerPathsByUserId(userId: string): Promise<CareerPath[]> {
    return Array.from(this.careerPaths.values()).filter(path => path.userId === userId);
  }

  async createCareerPath(insertPath: InsertCareerPath): Promise<CareerPath> {
    const id = randomUUID();
    const path: CareerPath = {
      ...insertPath,
      id,
      requiredSkills: insertPath.requiredSkills || null,
      timeline: insertPath.timeline || null,
      salaryRange: insertPath.salaryRange || null,
      icon: insertPath.icon || null,
      createdAt: new Date(),
    };
    this.careerPaths.set(id, path);
    return path;
  }

  async getCourses(category?: string): Promise<Course[]> {
    let courses = Array.from(this.courses.values());
    
    if (category && category !== 'All Courses') {
      courses = courses.filter(course => course.category === category);
    }
    
    return courses;
  }

  async createCourse(insertCourse: InsertCourse): Promise<Course> {
    const id = randomUUID();
    const course: Course = {
      ...insertCourse,
      id,
      duration: insertCourse.duration || null,
      level: insertCourse.level || null,
      rating: insertCourse.rating || null,
      imageUrl: insertCourse.imageUrl || null,
      isFree: insertCourse.isFree || null,
      category: insertCourse.category || null,
      addedAt: new Date(),
    };
    this.courses.set(id, course);
    return course;
  }

  async getActivitiesByUserId(userId: string): Promise<Activity[]> {
    return Array.from(this.activities.values())
      .filter(activity => activity.userId === userId)
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  }

  async createActivity(insertActivity: InsertActivity): Promise<Activity> {
    const id = randomUUID();
    const activity: Activity = {
      ...insertActivity,
      id,
      createdAt: new Date(),
    };
    this.activities.set(id, activity);
    return activity;
  }
}

export const storage = new MemStorage();
