import { useState } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import WelcomeCard from "@/components/WelcomeCard";
import QuickActions from "@/components/QuickActions";
import RecentActivity from "@/components/RecentActivity";
import ResumeUpload from "@/components/ResumeUpload";
import ResumeAnalysis from "@/components/ResumeAnalysis";
import SkillsOverview from "@/components/SkillsOverview";
import JobCards from "@/components/JobCards";
import CareerPath from "@/components/CareerPath";
import CourseRecommendations from "@/components/CourseRecommendations";

export default function Dashboard() {
  const [activeSection, setActiveSection] = useState("dashboard");

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        return (
          <div className="space-y-6">
            <WelcomeCard />
            <QuickActions onActionClick={setActiveSection} />
            <RecentActivity />
          </div>
        );
      case "resume":
        return (
          <div className="space-y-6">
            <ResumeUpload />
            <ResumeAnalysis />
          </div>
        );
      case "skills":
        return <SkillsOverview />;
      case "jobs":
        return <JobCards />;
      case "recommendations":
        return <CareerPath />;
      case "courses":
        return <CourseRecommendations />;
      default:
        return (
          <div className="space-y-6">
            <WelcomeCard />
            <QuickActions onActionClick={setActiveSection} />
            <RecentActivity />
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <div className="flex pt-20">
        <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} />
        <main className="flex-1 ml-64 p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
