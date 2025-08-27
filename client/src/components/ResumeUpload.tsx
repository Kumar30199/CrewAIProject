import { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { CloudUpload, FileText, CheckCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

export default function ResumeUpload() {
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('resume', file);
      
      // Direct fetch with multipart/form-data
      const response = await fetch('/api/resume/upload', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }
      
      return await response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Resume uploaded successfully!",
        description: data.message || "Your resume has been analyzed and processed.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/resume"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/activities"] });
      queryClient.invalidateQueries({ queryKey: ["/api/skills"] });
      setSelectedFile(null);
      
      if (data.extractedSkills > 0) {
        toast({
          title: `Found ${data.extractedSkills} skills in your resume!`,
          description: "Your skills have been added to your profile.",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload resume. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleFileSelect = (file: File) => {
    const allowedTypes = ['application/pdf', 'text/plain', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF, TXT, or DOC file.",
        variant: "destructive",
      });
      return;
    }

    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: "Please upload a file smaller than 5MB.",
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleUpload = () => {
    if (selectedFile) {
      uploadMutation.mutate(selectedFile);
    }
  };

  return (
    <Card className="bg-white rounded-xl shadow-sm border border-slate-200">
      <CardContent className="p-6">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">Resume Analysis</h2>
        
        <div
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
            dragOver 
              ? 'border-primary bg-primary/5' 
              : 'border-slate-300 hover:border-primary/40'
          }`}
          onDrop={handleDrop}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          data-testid="resume-upload-area"
        >
          {selectedFile ? (
            <div className="space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="text-2xl text-green-600 h-8 w-8" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">File Selected</h3>
                <p className="text-slate-600 mb-2">{selectedFile.name}</p>
                <p className="text-sm text-slate-500">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <div className="flex gap-4 justify-center">
                <Button
                  onClick={handleUpload}
                  disabled={uploadMutation.isPending}
                  className="bg-primary hover:bg-primary/90"
                  data-testid="button-upload"
                >
                  {uploadMutation.isPending ? "Uploading..." : "Upload & Analyze"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedFile(null);
                    if (fileInputRef.current) {
                      fileInputRef.current.value = '';
                    }
                  }}
                  data-testid="button-cancel"
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CloudUpload className="text-2xl text-slate-400 h-8 w-8" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Upload Your Resume</h3>
              <p className="text-slate-600 mb-4">Drag and drop your PDF or TXT file here, or click to browse</p>
              <Button
                onClick={() => fileInputRef.current?.click()}
                className="bg-primary hover:bg-primary/90"
                data-testid="button-choose-file"
              >
                Choose File
              </Button>
              <p className="text-sm text-slate-500 mt-3">Supported formats: PDF, TXT, DOC, DOCX (Max size: 5MB)</p>
            </>
          )}
        </div>
        
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.txt,.doc,.docx"
          onChange={handleFileInputChange}
          className="hidden"
          data-testid="file-input"
        />
      </CardContent>
    </Card>
  );
}
