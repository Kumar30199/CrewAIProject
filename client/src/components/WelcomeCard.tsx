import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";

interface DashboardStats {
  resumeScore: number;
  skillMatches: number;
  jobRecommendations: number;
}

export default function WelcomeCard() {
  const { data: stats, isLoading, error } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
  });

  if (error) {
    return (
      <Card className="bg-white rounded-xl shadow-sm border border-slate-200">
        <CardContent className="p-6">
          <div className="text-red-600">Failed to load dashboard stats</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white rounded-xl shadow-sm border border-slate-200">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Welcome back, Alex!</h2>
            <p className="text-slate-600">Ready to advance your career?</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-center" data-testid="stat-resume-score">
              <div className="text-2xl font-bold text-primary">
                {isLoading ? "..." : `${stats?.resumeScore || 0}%`}
              </div>
              <div className="text-sm text-slate-500">Resume Score</div>
            </div>
            <div className="text-center" data-testid="stat-skill-matches">
              <div className="text-2xl font-bold text-green-500">
                {isLoading ? "..." : stats?.skillMatches || 0}
              </div>
              <div className="text-sm text-slate-500">Skill Matches</div>
            </div>
            <div className="text-center" data-testid="stat-job-recommendations">
              <div className="text-2xl font-bold text-orange-500">
                {isLoading ? "..." : stats?.jobRecommendations || 0}
              </div>
              <div className="text-sm text-slate-500">Job Matches</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
