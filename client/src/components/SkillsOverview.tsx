import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw } from "lucide-react";

interface Skill {
  id: string;
  name: string;
  level: string;
  category: string;
  isInDemand: boolean;
}

interface SkillsData {
  userSkills: Skill[];
  demandSkills: Array<{
    name: string;
    level: string;
    category: string;
    isInDemand: boolean;
  }>;
  stats: {
    matching: number;
    developing: number;
    missing: number;
  };
}

export default function SkillsOverview() {
  const { data: skillsData, isLoading, error, refetch } = useQuery<SkillsData>({
    queryKey: ["/api/skills"],
  });

  if (error) {
    return (
      <Card className="bg-white rounded-xl shadow-sm border border-slate-200">
        <CardContent className="p-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Skills Assessment</h2>
          <div className="text-red-600">Failed to load skills data</div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="bg-white rounded-xl shadow-sm border border-slate-200">
        <CardContent className="p-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Skills Assessment</h2>
          <div className="animate-pulse space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-4 bg-slate-100 rounded-lg">
                  <div className="h-8 bg-slate-200 rounded mb-2"></div>
                  <div className="h-4 bg-slate-200 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getLevelBadge = (level: string) => {
    const levelMap: Record<string, { variant: string; className: string }> = {
      expert: { variant: "secondary", className: "bg-green-100 text-green-800" },
      advanced: { variant: "secondary", className: "bg-green-100 text-green-800" },
      intermediate: { variant: "secondary", className: "bg-orange-100 text-orange-800" },
      beginner: { variant: "secondary", className: "bg-orange-100 text-orange-800" },
      missing: { variant: "secondary", className: "bg-red-100 text-red-800" },
      developing: { variant: "secondary", className: "bg-orange-100 text-orange-800" }
    };

    const config = levelMap[level] || levelMap.intermediate;
    return (
      <Badge variant={config.variant as any} className={config.className}>
        {level.charAt(0).toUpperCase() + level.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white rounded-xl shadow-sm border border-slate-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-900">Skills Assessment</h2>
            <Button
              variant="outline"
              onClick={() => refetch()}
              className="bg-primary hover:bg-primary/90 text-white border-primary"
              data-testid="button-refresh-skills"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh Analysis
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="text-center p-4 bg-green-50 rounded-lg" data-testid="matching-skills">
              <div className="text-3xl font-bold text-green-600 mb-1">
                {skillsData?.stats.matching || 0}
              </div>
              <div className="text-sm text-green-700">Matching Skills</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg" data-testid="developing-skills">
              <div className="text-3xl font-bold text-orange-600 mb-1">
                {skillsData?.stats.developing || 0}
              </div>
              <div className="text-sm text-orange-700">Skills to Develop</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg" data-testid="missing-skills">
              <div className="text-3xl font-bold text-red-600 mb-1">
                {skillsData?.stats.missing || 0}
              </div>
              <div className="text-sm text-red-700">Missing Skills</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white rounded-xl shadow-sm border border-slate-200">
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold text-slate-900 mb-4">Your Skills</h3>
            
            <div className="space-y-4" data-testid="user-skills">
              {skillsData?.userSkills && skillsData.userSkills.length > 0 ? (
                skillsData.userSkills.map((skill) => (
                  <div key={skill.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center">
                      <span className="w-3 h-3 bg-green-500 rounded-full mr-3"></span>
                      <span className="font-medium text-slate-900">{skill.name}</span>
                    </div>
                    {getLevelBadge(skill.level)}
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-slate-500">
                  <p>No skills found.</p>
                  <p className="text-sm">Upload your resume to extract skills.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white rounded-xl shadow-sm border border-slate-200">
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold text-slate-900 mb-4">Skills in Demand</h3>
            
            <div className="space-y-4" data-testid="demand-skills">
              {skillsData?.demandSkills && skillsData.demandSkills.length > 0 ? (
                skillsData.demandSkills.map((skill, index) => (
                  <div 
                    key={index}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      skill.level === 'missing' 
                        ? 'border border-red-200 bg-red-50'
                        : 'border border-orange-200 bg-orange-50'
                    }`}
                  >
                    <div className="flex items-center">
                      <span className={`w-3 h-3 rounded-full mr-3 ${
                        skill.level === 'missing' ? 'bg-red-500' : 'bg-orange-500'
                      }`}></span>
                      <span className="font-medium text-slate-900">{skill.name}</span>
                    </div>
                    {getLevelBadge(skill.level)}
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-slate-500">
                  <p>No skill gaps identified.</p>
                  <p className="text-sm">Your skills are well aligned with market demands!</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
