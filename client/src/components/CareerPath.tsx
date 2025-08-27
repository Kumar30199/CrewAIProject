import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Code, TrendingUp, Cloud, Monitor, Server, Layers } from "lucide-react";

interface CareerPath {
  id: string;
  title: string;
  description: string;
  requiredSkills?: string[];
  matchingSkills?: string[];
  missingSkills?: string[];
  matchPercentage?: number;
  timeline?: string;
  salaryRange?: string;
  icon?: string;
}

export default function CareerPath() {
  const { data: skillsData } = useQuery({
    queryKey: ["/api/skills"],
  });
  
  const { data: careerPaths, isLoading, error } = useQuery<CareerPath[]>({
    queryKey: ["/api/career-paths"],
  });

  const getIcon = (iconName?: string) => {
    switch (iconName) {
      case "monitor":
        return <Monitor className="text-white text-xl h-6 w-6" />;
      case "server":
        return <Server className="text-white text-xl h-6 w-6" />;
      case "layers":
        return <Layers className="text-white text-xl h-6 w-6" />;
      case "trending-up":
        return <TrendingUp className="text-white text-xl h-6 w-6" />;
      case "cloud":
        return <Cloud className="text-white text-xl h-6 w-6" />;
      default:
        return <Code className="text-white text-xl h-6 w-6" />;
    }
  };

  const getIconColor = (iconName?: string) => {
    switch (iconName) {
      case "monitor":
        return "bg-blue-500";
      case "server":
        return "bg-green-500";
      case "layers":
        return "bg-purple-500";
      case "trending-up":
        return "bg-orange-500";
      case "cloud":
        return "bg-sky-500";
      default:
        return "bg-primary";
    }
  };

  const getButtonColor = (matchPercentage?: number) => {
    if (matchPercentage && matchPercentage >= 70) {
      return "bg-green-500 hover:bg-green-600";
    } else if (matchPercentage && matchPercentage >= 50) {
      return "bg-orange-500 hover:bg-orange-600";
    } else {
      return "bg-primary hover:bg-primary/90";
    }
  };
  
  const getMatchBadgeColor = (matchPercentage?: number) => {
    if (matchPercentage && matchPercentage >= 80) {
      return "bg-green-100 text-green-800";
    } else if (matchPercentage && matchPercentage >= 60) {
      return "bg-orange-100 text-orange-800";
    } else {
      return "bg-red-100 text-red-800";
    }
  };

  if (error) {
    return (
      <Card className="bg-white rounded-xl shadow-sm border border-slate-200">
        <CardContent className="p-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Career Path Recommendations</h2>
          <div className="text-red-600">Failed to load career recommendations</div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="bg-white rounded-xl shadow-sm border border-slate-200">
        <CardContent className="p-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Career Path Recommendations</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border border-slate-200 rounded-xl p-6 animate-pulse">
                <div className="w-12 h-12 bg-slate-200 rounded-lg mb-4"></div>
                <div className="h-6 bg-slate-200 rounded mb-2"></div>
                <div className="h-4 bg-slate-200 rounded mb-4"></div>
                <div className="space-y-2">
                  <div className="h-3 bg-slate-200 rounded"></div>
                  <div className="h-3 bg-slate-200 rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white rounded-xl shadow-sm border border-slate-200">
      <CardContent className="p-6">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">Career Path Recommendations</h2>
        
        {careerPaths && careerPaths.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {careerPaths.map((path) => (
              <div 
                key={path.id} 
                className="border border-slate-200 rounded-xl p-6 hover:shadow-lg transition-shadow"
                data-testid={`career-path-${path.id}`}
              >
                <div className={`w-12 h-12 ${getIconColor(path.icon)} rounded-lg flex items-center justify-center mb-4`}>
                  {getIcon(path.icon)}
                </div>
                
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-semibold text-slate-900">{path.title}</h3>
                  {path.matchPercentage !== undefined && (
                    <Badge className={getMatchBadgeColor(path.matchPercentage)}>
                      {path.matchPercentage}% Match
                    </Badge>
                  )}
                </div>
                <p className="text-slate-600 mb-4">{path.description}</p>
                
                {path.matchingSkills && path.matchingSkills.length > 0 && (
                  <div className="mb-3">
                    <h4 className="font-medium text-slate-700 mb-2 text-sm">You Have ({path.matchingSkills.length}):</h4>
                    <div className="flex flex-wrap gap-1">
                      {path.matchingSkills.slice(0, 4).map((skill, index) => (
                        <Badge key={index} variant="secondary" className="bg-green-100 text-green-800 text-xs">
                          {skill} ✓
                        </Badge>
                      ))}
                      {path.matchingSkills.length > 4 && (
                        <Badge variant="outline" className="text-xs text-green-600">
                          +{path.matchingSkills.length - 4} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
                
                {path.missingSkills && path.missingSkills.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-medium text-slate-700 mb-2 text-sm">Need to Learn ({path.missingSkills.length}):</h4>
                    <div className="flex flex-wrap gap-1">
                      {path.missingSkills.slice(0, 4).map((skill, index) => (
                        <Badge key={index} variant="secondary" className="bg-red-100 text-red-800 text-xs">
                          {skill}
                        </Badge>
                      ))}
                      {path.missingSkills.length > 4 && (
                        <Badge variant="outline" className="text-xs text-red-600">
                          +{path.missingSkills.length - 4} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
                
                <div className="space-y-3 text-sm text-slate-600 mb-4">
                  {path.timeline && (
                    <div className="flex justify-between">
                      <span>Timeline:</span>
                      <span className="font-medium">{path.timeline}</span>
                    </div>
                  )}
                  {path.salaryRange && (
                    <div className="flex justify-between">
                      <span>Salary Range:</span>
                      <span className="font-medium text-green-600">{path.salaryRange}</span>
                    </div>
                  )}
                </div>
                
                <Button 
                  className={`w-full ${getButtonColor(path.matchPercentage)}`}
                  data-testid={`career-path-explore-${path.id}`}
                >
                  {path.matchPercentage && path.matchPercentage >= 70 ? 'Start Learning' : 'Explore Path'}
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-500">
            <p className="mb-2">No career paths available yet.</p>
            <p className="text-sm">Upload your resume to get personalized recommendations!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}