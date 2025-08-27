import { Button } from "@/components/ui/button";
import { BookOpen, Search, Target, Upload } from "lucide-react";

interface QuickActionsProps {
  onActionClick: (section: string) => void;
}

export default function QuickActions({ onActionClick }: QuickActionsProps) {
  const actions = [
    {
      id: "resume",
      title: "Upload Resume",
      description: "Get instant analysis",
      icon: Upload,
      bgColor: "bg-primary hover:bg-primary/90",
    },
    {
      id: "skills",
      title: "Analyze Skills",
      description: "Find skill gaps",
      icon: Search,
      bgColor: "bg-green-500 hover:bg-green-600",
    },
    {
      id: "jobs",
      title: "Find Jobs",
      description: "Match opportunities",
      icon: Target,
      bgColor: "bg-orange-500 hover:bg-orange-600",
    },
    {
      id: "courses",
      title: "Learn Skills",
      description: "Free resources",
      icon: BookOpen,
      bgColor: "bg-indigo-500 hover:bg-indigo-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <Button
            key={action.id}
            variant="ghost"
            className={`${action.bgColor} text-white p-6 rounded-xl shadow-sm transition-colors h-auto flex flex-col items-center text-center`}
            onClick={() => onActionClick(action.id)}
            data-testid={`action-${action.id}`}
          >
            <Icon className="text-2xl mb-3 h-6 w-6" />
            <h3 className="font-semibold mb-2">{action.title}</h3>
            <p className="text-sm opacity-90">{action.description}</p>
          </Button>
        );
      })}
    </div>
  );
}
