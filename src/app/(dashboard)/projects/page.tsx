"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Heading } from "@/components/ui/heading";
import { Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { PDFUploadDialog } from "@/components/pdf-upload-dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CanvasProject {
  id: string;
  name: string;
  createdAt: string;
}

export default function ProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<CanvasProject[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);

  const loadProjects = async () => {
    try {
      setIsLoadingProjects(true);
      const response = await fetch("/api/canvas-projects");
      if (response.ok) {
        const data = await response.json();
        setProjects(data);
      }
    } catch (error) {
      console.error("Failed to load projects:", error);
      toast.error("Failed to load projects");
    } finally {
      setIsLoadingProjects(false);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    try {
      const response = await fetch(`/api/canvas-projects?projectId=${projectId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete project");
      }

      // Remove project from state
      setProjects((prev) => prev.filter((p) => p.id !== projectId));
      toast.success("Project deleted successfully");
    } catch (error) {
      console.error("Error deleting project:", error);
      toast.error("Failed to delete project");
    } finally {
      setProjectToDelete(null);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleCreateProject = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/canvas-projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: "Untitled Project",
        }),
      });

      if (response.ok) {
        const project = await response.json();
        toast.success("Project created successfully");
        router.push(`/projects/${project.id}/canvas`);
      }
    } catch (error) {
      console.error("Failed to create project:", error);
      toast.error("Failed to create project");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePDFProcessed = async (pages: string[], fileName: string) => {
    try {
      setIsLoading(true);
      toast.loading("Creating project...");

      // Create initial project with all pages
      const response = await fetch("/api/canvas-projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: fileName,
          canvasData: {
            version: "1.0",
            pages: pages, // Save all pages
            currentPage: 0
          }
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create project");
      }

      const project = await response.json();
      
      toast.dismiss();
      toast.success("Project created successfully");
      
      // Navigate to Arcus AI page
      router.push(`/projects/${project.id}/canvas`);
    } catch (error) {
      console.error("Error creating project:", error);
      toast.dismiss();
      toast.error("Failed to create project");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-muted h-full p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-2.5">
          <Heading
            title="My Projects"
            description="View and manage all your design projects"
            className="space-y-1"
          />
          <div className="h-1 w-20 bg-gradient-to-r from-orange-500 to-orange-400 rounded-full" />
        </div>
        <div className="flex items-center space-x-2">
          <PDFUploadDialog 
            className="bg-orange-500 hover:bg-orange-600 text-white transition-colors font-medium" 
          />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {isLoadingProjects ? (
          <div className="col-span-full flex justify-center items-center min-h-[200px]">
            <Spinner className="h-6 w-6 text-orange-500" />
          </div>
        ) : projects.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-20 bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mb-5">
              <svg className="w-10 h-10 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <p className="text-xl font-semibold text-gray-900 mb-1">No projects yet</p>
            <p className="text-sm text-gray-500">Upload a PDF to create your first project</p>
          </div>
        ) : (
          projects.map((project) => (
            <Card 
              key={project.id}
              className="cursor-pointer hover:shadow-lg transition-all duration-200 border border-gray-100 group bg-white relative"
            >
              <div 
                className="absolute top-2 right-2 z-10"
                onClick={(e) => {
                  e.stopPropagation();
                  setProjectToDelete(project.id);
                }}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
              <div onClick={() => router.push(`/projects/${project.id}/canvas`)}>
                <CardHeader className="p-4 border-b border-gray-100">
                  <CardTitle className="text-sm truncate group-hover:text-orange-500 transition-colors">
                    {project.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-3 text-xs text-gray-500 flex items-center">
                  <svg className="w-4 h-4 mr-1.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {format(new Date(project.createdAt), "MMM d, yyyy")}
                </CardContent>
              </div>
            </Card>
          ))
        )}
      </div>

      <AlertDialog open={!!projectToDelete} onOpenChange={(open: boolean) => !open && setProjectToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your project.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 hover:bg-red-600"
              onClick={() => projectToDelete && handleDeleteProject(projectToDelete)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
