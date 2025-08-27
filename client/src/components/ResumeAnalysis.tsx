import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface ResumeData {
  id: string;
  fileName: string;
  parsedData: {
    name?: string;
    email?: string;
    phone?: string;
    experience?: string;
    education?: string;
    skills?: string[];
  };
  score: number;
}

export default function ResumeAnalysis() {
  const { data: resume, isLoading, error } = useQuery<ResumeData>({
    queryKey: ["/api/resume"],
  });

  if (error) {
    return (
      <Card className="bg-white rounded-xl shadow-sm border border-slate-200">
        <CardContent className="p-6">
          <h3 className="text-xl font-semibold text-slate-900 mb-4">Resume Analysis</h3>
          <div className="text-center py-8 text-slate-500">
            <p>No resume uploaded yet.</p>
            <p className="text-sm">Upload your resume above to see the analysis.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="bg-white rounded-xl shadow-sm border border-slate-200">
        <CardContent className="p-6">
          <h3 className="text-xl font-semibold text-slate-900 mb-4">Resume Analysis</h3>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-slate-200 rounded w-3/4"></div>
            <div className="h-4 bg-slate-200 rounded w-1/2"></div>
            <div className="h-4 bg-slate-200 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!resume) {
    return (
      <Card className="bg-white rounded-xl shadow-sm border border-slate-200">
        <CardContent className="p-6">
          <h3 className="text-xl font-semibold text-slate-900 mb-4">Resume Analysis</h3>
          <div className="text-center py-8 text-slate-500">
            <p>No resume found.</p>
            <p className="text-sm">Upload your resume above to see the analysis.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-orange-600";
    return "text-red-600";
  };

  const getProgressColor = (score: number) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-orange-500";
    return "bg-red-500";
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="bg-white rounded-xl shadow-sm border border-slate-200">
        <CardContent className="p-6">
          <h3 className="text-xl font-semibold text-slate-900 mb-4">Extracted Information</h3>
          
          <div className="space-y-4" data-testid="extracted-info">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
              <p className="text-slate-900">{resume.parsedData.name || "Not extracted"}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <p className="text-slate-900">{resume.parsedData.email || "Not extracted"}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
              <p className="text-slate-900">{resume.parsedData.phone || "Not extracted"}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Experience</label>
              <p className="text-slate-900">{resume.parsedData.experience || "Not specified"}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Education</label>
              <p className="text-slate-900">{resume.parsedData.education || "Not specified"}</p>
            </div>

            {resume.parsedData.skills && resume.parsedData.skills.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Skills</label>
                <div className="flex flex-wrap gap-2">
                  {resume.parsedData.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="bg-primary/10 text-primary px-2 py-1 rounded-full text-xs"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-white rounded-xl shadow-sm border border-slate-200">
        <CardContent className="p-6">
          <h3 className="text-xl font-semibold text-slate-900 mb-4">Resume Score</h3>
          
          <div className="text-center mb-6" data-testid="resume-score">
            <div className={`text-4xl font-bold mb-2 ${getScoreColor(resume.score)}`}>
              {resume.score}/100
            </div>
            <p className="text-slate-600">
              {resume.score >= 80 ? "Excellent resume!" : 
               resume.score >= 60 ? "Good resume with room for improvement" : 
               "Resume needs significant improvement"}
            </p>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Contact Information</span>
              <div className="flex items-center">
                <div className="w-24 bg-slate-200 rounded-full h-2 mr-2">
                  <Progress value={100} className="h-2" />
                </div>
                <span className="text-sm font-medium text-green-600">100%</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Work Experience</span>
              <div className="flex items-center">
                <div className="w-24 bg-slate-200 rounded-full h-2 mr-2">
                  <Progress value={80} className="h-2" />
                </div>
                <span className="text-sm font-medium text-orange-600">80%</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Skills</span>
              <div className="flex items-center">
                <div className="w-24 bg-slate-200 rounded-full h-2 mr-2">
                  <Progress value={60} className="h-2" />
                </div>
                <span className="text-sm font-medium text-orange-600">60%</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Education</span>
              <div className="flex items-center">
                <div className="w-24 bg-slate-200 rounded-full h-2 mr-2">
                  <Progress value={100} className="h-2" />
                </div>
                <span className="text-sm font-medium text-green-600">100%</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
