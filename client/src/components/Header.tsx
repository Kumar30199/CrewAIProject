import { Button } from "@/components/ui/button";
import { Settings, Bus } from "lucide-react";

export default function Header() {
  return (
    <header className="bg-white border-b border-slate-200 fixed top-0 left-0 right-0 z-50">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Bus className="text-white text-lg" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Career Coach AI</h1>
              <p className="text-sm text-slate-500">Personalized Career Guidance</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-slate-600">All systems operational</span>
            </div>
            <Button
              variant="ghost" 
              size="sm"
              className="bg-slate-100 hover:bg-slate-200 p-2 rounded-lg"
              data-testid="button-settings"
            >
              <Settings className="text-slate-600" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
