import { sql } from "drizzle-orm";
import { pgTable, text, varchar, jsonb, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name"),
  email: text("email"),
  phone: text("phone"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const resumes = pgTable("resumes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  fileName: text("file_name").notNull(),
  content: text("content").notNull(),
  parsedData: jsonb("parsed_data"),
  score: integer("score"),
  uploadedAt: timestamp("uploaded_at").defaultNow(),
});

export const skills = pgTable("skills", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  level: text("level").notNull(), // beginner, intermediate, advanced, expert
  category: text("category").notNull(),
  isInDemand: boolean("is_in_demand").default(false),
  addedAt: timestamp("added_at").defaultNow(),
});

export const jobs = pgTable("jobs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  company: text("company").notNull(),
  location: text("location").notNull(),
  salary: text("salary"),
  description: text("description").notNull(),
  requirements: jsonb("requirements"),
  matchScore: integer("match_score"),
  postedAt: text("posted_at"),
  applyUrl: text("apply_url"),
  fetchedAt: timestamp("fetched_at").defaultNow(),
});

export const careerPaths = pgTable("career_paths", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  requiredSkills: jsonb("required_skills"),
  timeline: text("timeline"),
  salaryRange: text("salary_range"),
  icon: text("icon"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const courses = pgTable("courses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  provider: text("provider").notNull(),
  duration: text("duration"),
  level: text("level"),
  rating: text("rating"),
  imageUrl: text("image_url"),
  courseUrl: text("course_url").notNull(),
  isFree: boolean("is_free").default(true),
  category: text("category"),
  addedAt: timestamp("added_at").defaultNow(),
});

export const activities = pgTable("activities", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: text("type").notNull(),
  description: text("description").notNull(),
  status: text("status").notNull(), // completed, new, in-progress
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  name: true,
  email: true,
  phone: true,
});

export const insertResumeSchema = createInsertSchema(resumes).omit({
  id: true,
  uploadedAt: true,
});

export const insertSkillSchema = createInsertSchema(skills).omit({
  id: true,
  addedAt: true,
});

export const insertJobSchema = createInsertSchema(jobs).omit({
  id: true,
  fetchedAt: true,
});

export const insertCareerPathSchema = createInsertSchema(careerPaths).omit({
  id: true,
  createdAt: true,
});

export const insertCourseSchema = createInsertSchema(courses).omit({
  id: true,
  addedAt: true,
});

export const insertActivitySchema = createInsertSchema(activities).omit({
  id: true,
  createdAt: true,
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Resume = typeof resumes.$inferSelect;
export type InsertResume = z.infer<typeof insertResumeSchema>;
export type Skill = typeof skills.$inferSelect;
export type InsertSkill = z.infer<typeof insertSkillSchema>;
export type Job = typeof jobs.$inferSelect;
export type InsertJob = z.infer<typeof insertJobSchema>;
export type CareerPath = typeof careerPaths.$inferSelect;
export type InsertCareerPath = z.infer<typeof insertCareerPathSchema>;
export type Course = typeof courses.$inferSelect;
export type InsertCourse = z.infer<typeof insertCourseSchema>;
export type Activity = typeof activities.$inferSelect;
export type InsertActivity = z.infer<typeof insertActivitySchema>;
