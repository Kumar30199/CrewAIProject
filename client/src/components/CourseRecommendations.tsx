import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, BarChart3, Star, ExternalLink } from "lucide-react";

interface Course {
  id: string;
  title: string;
  description: string;
  provider: string;
  duration?: string;
  level?: string;
  rating?: string;
  imageUrl?: string;
  courseUrl: string;
  isFree?: boolean;
  category?: string;
}

export default function CourseRecommendations() {
  const [selectedCategory, setSelectedCategory] = useState<string>("All Courses");

  const { data: courses, isLoading, error } = useQuery<Course[]>({
    queryKey: ["/api/courses", { category: selectedCategory === "All Courses" ? undefined : selectedCategory }],
  });

  const categories = ["All Courses", "Programming", "Cloud", "Data Science", "DevOps"];

  const getProviderColor = (provider: string) => {
    const colors: Record<string, string> = {
      "Coursera": "bg-primary/10 text-primary",
      "edX": "bg-orange-100 text-orange-800",
      "Udemy": "bg-blue-100 text-blue-800",
      "Kubernetes": "bg-green-100 text-green-800",
      "FreeCodeCamp": "bg-purple-100 text-purple-800",
      "MIT OpenCourseWare": "bg-red-100 text-red-800"
    };
    return colors[provider] || "bg-slate-100 text-slate-800";
  };

  const renderStars = (rating: string) => {
    const match = rating.match(/(\d+\.?\d*)/);
    const score = match ? parseFloat(match[1]) : 0;
    const fullStars = Math.floor(score);
    const hasHalfStar = score % 1 !== 0;
    
    return (
      <div className="flex text-yellow-400">
        {Array.from({ length: 5 }, (_, i) => (
          <Star 
            key={i} 
            className={`h-3 w-3 ${
              i < fullStars 
                ? "fill-current" 
                : (i === fullStars && hasHalfStar) 
                  ? "fill-current opacity-50" 
                  : ""
            }`} 
          />
        ))}
      </div>
    );
  };

  if (error) {
    return (
      <Card className="bg-white rounded-xl shadow-sm border border-slate-200">
        <CardContent className="p-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Free Learning Resources</h2>
          <div className="text-red-600">Failed to load course recommendations</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white rounded-xl shadow-sm border border-slate-200">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-900">Free Learning Resources</h2>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              <Star className="mr-1 h-3 w-3" />
              Personalized for You
            </Badge>
          </div>
        </div>
        
        {/* Course Categories */}
        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className={
                selectedCategory === category 
                  ? "bg-primary text-white" 
                  : "bg-slate-100 hover:bg-slate-200 text-slate-700"
              }
              data-testid={`category-${category.toLowerCase().replace(' ', '-')}`}
            >
              {category}
            </Button>
          ))}
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="border border-slate-200 rounded-xl overflow-hidden animate-pulse">
                <div className="w-full h-40 bg-slate-200"></div>
                <div className="p-4">
                  <div className="h-4 bg-slate-200 rounded mb-2"></div>
                  <div className="h-6 bg-slate-200 rounded mb-2"></div>
                  <div className="h-3 bg-slate-200 rounded mb-3"></div>
                  <div className="h-8 bg-slate-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : courses && courses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <div 
                key={course.id} 
                className="border border-slate-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow"
                data-testid={`course-${course.id}`}
              >
                {course.imageUrl && (
                  <img 
                    src={course.imageUrl} 
                    alt={course.title}
                    className="w-full h-40 object-cover" 
                  />
                )}
                
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="secondary" className={`text-xs font-medium ${getProviderColor(course.provider)}`}>
                      {course.provider}
                    </Badge>
                    {course.isFree && (
                      <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                        Free
                      </Badge>
                    )}
                  </div>
                  
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">{course.title}</h3>
                  <p className="text-sm text-slate-600 mb-3">{course.description}</p>
                  
                  <div className="flex items-center justify-between mb-3">
                    {course.duration && (
                      <div className="flex items-center text-sm text-slate-500">
                        <Clock className="mr-1 h-3 w-3" />
                        <span>{course.duration}</span>
                      </div>
                    )}
                    {course.level && (
                      <div className="flex items-center text-sm text-slate-500">
                        <BarChart3 className="mr-1 h-3 w-3" />
                        <span>{course.level}</span>
                      </div>
                    )}
                  </div>
                  
                  {course.rating && (
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        {renderStars(course.rating)}
                        <span className="text-sm text-slate-600 ml-1">{course.rating}</span>
                      </div>
                    </div>
                  )}
                  
                  <Button
                    className="w-full bg-primary hover:bg-primary/90 text-white"
                    onClick={() => window.open(course.courseUrl, '_blank')}
                    data-testid={`button-start-course-${course.id}`}
                  >
                    Start Course
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-500">
            <p>No courses found for the selected category.</p>
            <p className="text-sm">Try selecting a different category or check back later.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
