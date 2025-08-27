import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, DollarSign, Clock, Heart, ExternalLink, RefreshCw, AlertCircle } from "lucide-react";

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  salary?: string | null;
  description: string;
  requirements?: string | string[];
  matchScore?: number;
  postedAt?: string | null;
  applyUrl?: string | null;
}

interface JobsResponse {
  success: boolean;
  jobs: Job[];
  source?: string;
  message?: string;
}

export default function JobCards() {
  const [location, setLocation] = useState<string>("All Locations");
  const [experience, setExperience] = useState<string>("All Experience");

  // Fetch user skills first
  const { data: skillsData } = useQuery({
    queryKey: ["/api/skills"],
  });

  const { data: jobsData, isLoading, error, refetch } = useQuery<JobsResponse>({
    queryKey: ["/api/jobs", { location, experience }],
  });

  const getMatchColor = (score: number) => {
    if (score >= 90) return "bg-green-100 text-green-800";
    if (score >= 80) return "bg-green-100 text-green-800";
    if (score >= 70) return "bg-orange-100 text-orange-800";
    return "bg-red-100 text-red-800";
  };

  const getSkillBadgeColor = (skill: string) => {
    const userSkills = (skillsData as any)?.userSkills?.map((s: any) => s.name) || [];
    return userSkills.includes(skill) 
      ? "bg-green-100 text-green-800" 
      : "bg-red-100 text-red-800";
  };
  
  const parseRequirements = (requirements: string | string[] | undefined): string[] => {
    if (!requirements) return [];
    if (Array.isArray(requirements)) return requirements;
    if (typeof requirements === 'string') {
      // Try to parse as JSON array first, then fallback to comma-separated
      try {
        const parsed = JSON.parse(requirements);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return requirements.split(',').map(s => s.trim()).filter(s => s.length > 0);
      }
    }
    return [];
  };

  if (error) {
    return (
      <Card className="bg-white rounded-xl shadow-sm border border-slate-200">
        <CardContent className="p-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Job Opportunities</h2>
          <div className="text-red-600">Failed to load job opportunities</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-white rounded-xl shadow-sm border border-slate-200">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-slate-900 mb-4 lg:mb-0">Job Opportunities</h2>
            <div className="flex items-center space-x-4">
              <Select value={location} onValueChange={setLocation}>
                <SelectTrigger className="w-48" data-testid="select-location">
                  <SelectValue placeholder="All Locations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All Locations">All Locations</SelectItem>
                  <SelectItem value="Remote">Remote</SelectItem>
                  <SelectItem value="San Francisco">San Francisco</SelectItem>
                  <SelectItem value="New York">New York</SelectItem>
                  <SelectItem value="Los Angeles">Los Angeles</SelectItem>
                </SelectContent>
              </Select>
              <Select value={experience} onValueChange={setExperience}>
                <SelectTrigger className="w-48" data-testid="select-experience">
                  <SelectValue placeholder="All Experience" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All Experience">All Experience</SelectItem>
                  <SelectItem value="Entry Level">Entry Level</SelectItem>
                  <SelectItem value="Mid Level">Mid Level</SelectItem>
                  <SelectItem value="Senior Level">Senior Level</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                onClick={() => refetch()}
                className="bg-primary hover:bg-primary/90 text-white border-primary"
                data-testid="button-refresh-jobs"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
            </div>
          </div>
          
          <div className="flex items-center justify-between text-sm text-slate-600">
            <span data-testid="jobs-total">
              {isLoading ? "Loading..." : `Found ${jobsData?.jobs?.length || 0} matching opportunities`}
            </span>
            <div className="flex items-center space-x-2">
              {jobsData?.source === 'remotive_api' && (
                <Badge variant="outline" className="text-green-600 border-green-200">
                  Live API Data
                </Badge>
              )}
              {jobsData?.source === 'fallback_data' && (
                <Badge variant="outline" className="text-orange-600 border-orange-200">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Fallback Data
                </Badge>
              )}
              <span>Updated 2 minutes ago</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="bg-white rounded-xl shadow-sm border border-slate-200">
              <CardContent className="p-6 animate-pulse">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-slate-200 rounded-lg"></div>
                    <div>
                      <div className="h-4 bg-slate-200 rounded w-32 mb-2"></div>
                      <div className="h-3 bg-slate-200 rounded w-24"></div>
                    </div>
                  </div>
                  <div className="h-6 bg-slate-200 rounded w-16"></div>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="h-3 bg-slate-200 rounded w-full"></div>
                  <div className="h-3 bg-slate-200 rounded w-3/4"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {jobsData?.jobs && jobsData.jobs.length > 0 ? (
              jobsData.jobs.map((job) => (
                <Card 
                  key={job.id} 
                  className="bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow"
                  data-testid={`job-card-${job.id}`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                          <span className="text-white font-bold text-lg">
                            {job.company.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-slate-900">{job.title}</h3>
                          <p className="text-slate-600">{job.company}</p>
                        </div>
                      </div>
                      {job.matchScore && (
                        <Badge variant="secondary" className={getMatchColor(job.matchScore)}>
                          {job.matchScore}% Match
                        </Badge>
                      )}
                    </div>
                    
                    <div className="mb-4">
                      <div className="flex items-center text-sm text-slate-600 mb-2">
                        <MapPin className="mr-2 h-4 w-4" />
                        <span>{job.location}</span>
                      </div>
                      {job.salary && (
                        <div className="flex items-center text-sm text-slate-600 mb-2">
                          <DollarSign className="mr-2 h-4 w-4" />
                          <span>{job.salary}</span>
                        </div>
                      )}
                      {job.postedAt && (
                        <div className="flex items-center text-sm text-slate-600">
                          <Clock className="mr-2 h-4 w-4" />
                          <span>Posted {job.postedAt}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="mb-4">
                      <p className="text-sm text-slate-700 line-clamp-3">
                        {job.description}
                      </p>
                    </div>
                    
                    {(() => {
                      const skillsList = parseRequirements(job.requirements);
                      return skillsList.length > 0 && (
                        <div className="mb-4">
                          <p className="text-xs font-medium text-slate-600 mb-2">Required Skills:</p>
                          <div className="flex flex-wrap gap-2">
                            {skillsList.slice(0, 6).map((skill, index) => {
                              const hasSkill = (skillsData as any)?.userSkills?.some((s: any) => 
                                s.name.toLowerCase() === skill.toLowerCase()
                              );
                              return (
                                <Badge
                                  key={index}
                                  variant="secondary"
                                  className={hasSkill 
                                    ? "bg-green-100 text-green-800 border-green-200" 
                                    : "bg-red-100 text-red-800 border-red-200"
                                  }
                                  title={hasSkill ? 'You have this skill' : 'Missing skill'}
                                >
                                  {skill}
                                  {hasSkill ? ' ✓' : ' ✗'}
                                </Badge>
                              );
                            })}
                            {skillsList.length > 6 && (
                              <Badge variant="outline" className="text-slate-500">
                                +{skillsList.length - 6} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      );
                    })()}
                    
                    <div className="flex items-center justify-between">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="text-slate-600 hover:text-slate-900"
                        data-testid={`button-save-${job.id}`}
                      >
                        <Heart className="mr-1 h-4 w-4" />
                        Save Job
                      </Button>
                      <Button
                        className="bg-primary hover:bg-primary/90 text-white"
                        onClick={() => job.applyUrl && window.open(job.applyUrl, '_blank')}
                        data-testid={`button-apply-${job.id}`}
                      >
                        Apply Now
                        <ExternalLink className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-2">
                <Card className="bg-white rounded-xl shadow-sm border border-slate-200">
                  <CardContent className="p-6">
                    <div className="text-center py-8 text-slate-500">
                      <p>No job opportunities found.</p>
                      <p className="text-sm mb-4">{jobsData?.message || 'Try adjusting your filters or check back later.'}</p>
                      {jobsData?.source === 'fallback_data' && (
                        <div className="text-xs text-orange-600 bg-orange-50 rounded-lg p-3 inline-block">
                          <AlertCircle className="w-4 h-4 inline mr-1" />
                          External job API temporarily unavailable. Showing sample data.
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
          
          {jobsData?.jobs && jobsData.jobs.length > 0 && (
            <div className="text-center mt-8">
              <Button 
                variant="outline"
                className="bg-slate-100 hover:bg-slate-200 text-slate-700"
                data-testid="button-load-more"
              >
                Load More Jobs
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
