import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, TrendingUp, Briefcase } from "lucide-react";

interface Activity {
  id: string;
  type: string;
  description: string;
  status: string;
  createdAt: string;
}

export default function RecentActivity() {
  const { data: activities, isLoading, error } = useQuery<Activity[]>({
    queryKey: ["/api/activities"],
  });

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "resume_upload":
        return <FileText className="text-primary" />;
      case "skills_assessment":
        return <TrendingUp className="text-orange-500" />;
      case "job_search":
        return <Briefcase className="text-indigo-500" />;
      default:
        return <FileText className="text-primary" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Completed</Badge>;
      case "new":
        return <Badge variant="secondary" className="bg-primary/10 text-primary">New</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  if (error) {
    return (
      <Card className="bg-white rounded-xl shadow-sm border border-slate-200">
        <CardContent className="p-6">
          <h3 className="text-xl font-semibold text-slate-900 mb-4">Recent Activity</h3>
          <div className="text-red-600">Failed to load recent activities</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white rounded-xl shadow-sm border border-slate-200">
      <CardContent className="p-6">
        <h3 className="text-xl font-semibold text-slate-900 mb-4">Recent Activity</h3>
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center space-x-4 p-3 animate-pulse">
                <div className="w-10 h-10 bg-slate-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                  <div className="h-3 bg-slate-200 rounded w-1/2 mt-1"></div>
                </div>
                <div className="h-6 bg-slate-200 rounded w-16"></div>
              </div>
            ))}
          </div>
        ) : activities && activities.length > 0 ? (
          <div className="space-y-4">
            {activities.slice(0, 5).map((activity) => (
              <div
                key={activity.id}
                className="flex items-center space-x-4 p-3 hover:bg-slate-50 rounded-lg transition-colors"
                data-testid={`activity-${activity.id}`}
              >
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-slate-900">{activity.description}</p>
                  <p className="text-sm text-slate-500">
                    {new Date(activity.createdAt).toLocaleDateString()}
                  </p>
                </div>
                {getStatusBadge(activity.status)}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-500">
            <p>No recent activities found.</p>
            <p className="text-sm">Upload your resume to get started!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
