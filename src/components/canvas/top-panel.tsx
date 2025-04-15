"use client";

import React, { useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Download, ChevronLeft, Undo, Redo, Share2, Sun, Moon, ChevronRight } from "lucide-react";
import { useCanvasStore } from "@/store/canvas-store";
import { useThemeStore } from "@/store/theme-store";
import { usePDFPageStore } from "@/store/pdf-page-store";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { useParams } from "next/navigation";
import { useGetCanvasProject } from "@/features/projects/api/use-get-canvas-project";
import { fabric } from 'fabric';

export default function TopPanel() {
  const { canvas } = useCanvasStore();
  const { isDarkMode, toggleTheme } = useThemeStore();
  const { projectId } = useParams();
  const { data: project } = useGetCanvasProject(projectId as string);
  const { currentPage, totalPages, setCurrentPage } = usePDFPageStore();

  useEffect(() => {
    if (project?.canvasData?.pages) {
      console.log('Project pages:', project.canvasData.pages);
      console.log('Current page:', currentPage);
      console.log('Total pages:', project.canvasData.pages.length);
    }

    // Update canvas image when project data changes......
    if (canvas && project?.canvasData?.pages) {
      updateCanvasImage(currentPage);
    }

    // Listen for layer visibility changes
    const handleLayerVisibilityChange = (event: Event) => {
      const customEvent = event as CustomEvent;
      const { imageUrl, layerId, visible } = customEvent.detail;
      
      if (canvas && imageUrl) {
        // Create a fabric.Image from the new URL
        fabric.Image.fromURL(
          imageUrl,
          (img) => {
            console.log('Image loaded successfully:', {
              width: img.width,
              height: img.height,
              layer: layerId
            });
            
            // Calculate scale to fit Arcus AI while maintaining aspect ratio
            const canvasWidth = canvas.getWidth();
            const canvasHeight = canvas.getHeight();
            const scale = Math.min(
              (canvasWidth * 0.9) / img.width!,
              (canvasHeight * 0.9) / img.height!
            );

            // Set image properties
            img.scale(scale);
            img.set({
              left: (canvasWidth - img.width! * scale) / 2,
              top: (canvasHeight - img.height! * scale) / 2,
              selectable: false,
              evented: false,
              hasControls: false,
              hasBorders: false,
              lockMovementX: true,
              lockMovementY: true,
              hoverCursor: 'default',
            });

            // Clear existing objects and add the new image
            const existingObjects = canvas.getObjects();
            const backgroundImage = existingObjects.find(obj => !obj.selectable);
            if (backgroundImage) {
              canvas.remove(backgroundImage);
            }
            canvas.add(img);
            img.sendToBack();
            canvas.renderAll();
          },
          { crossOrigin: 'anonymous' }
        );
      }
    };

    window.addEventListener('layerVisibilityChanged', handleLayerVisibilityChange as EventListener);
    return () => window.removeEventListener('layerVisibilityChanged', handleLayerVisibilityChange as EventListener);
  }, [project, currentPage]);

  const updateCanvasImage = (page: number) => {
    if (!canvas || !project?.canvasData?.pages) return;

    // Get the active layer based on current visibility state
    const activeLayer = useCanvasStore.getState().getActiveLayer(page, project.canvasData);
    console.log('Active layer for page', page, 'is:', activeLayer);
    
    // Get the URL from the appropriate array
    const imageUrl = project.canvasData[activeLayer]?.[page] || project.canvasData.pages[page];
    console.log('Loading image from array:', activeLayer, 'URL:', imageUrl);
    
    if (imageUrl) {
      // Create a fabric.Image from the new page
      fabric.Image.fromURL(
        imageUrl,
        (img) => {
          console.log('Image loaded successfully:', {
            width: img.width,
            height: img.height,
            layer: activeLayer
          });
          
          // Calculate scale to fit Arcus AI while maintaining aspect ratio
          const canvasWidth = canvas.getWidth();
          const canvasHeight = canvas.getHeight();
          const scale = Math.min(
            (canvasWidth * 0.9) / img.width!,
            (canvasHeight * 0.9) / img.height!
          );

          // Set image properties
          img.scale(scale);
          img.set({
            left: (canvasWidth - img.width! * scale) / 2,
            top: (canvasHeight - img.height! * scale) / 2,
            selectable: false,
            evented: false,
            hasControls: false,
            hasBorders: false,
            lockMovementX: true,
            lockMovementY: true,
            hoverCursor: 'default',
          });

          // Clear existing objects and add the new image
          const existingObjects = canvas.getObjects();
          const backgroundImage = existingObjects.find(obj => !obj.selectable);
          if (backgroundImage) {
            canvas.remove(backgroundImage);
          }
          canvas.add(img);
          img.sendToBack();
          canvas.renderAll();
        },
        { crossOrigin: 'anonymous' }
      );
    }
  };

  const handlePageChange = async (newPage: number) => {
    if (!project?.canvasData?.pages || newPage < 0 || newPage >= project.canvasData.pages.length) return;
    
    if (canvas) {
      updateCanvasImage(newPage);
    }
    
    setCurrentPage(newPage);
  };

  const handleExport = () => {
    if (!canvas) return;

    try {
      const dataURL = canvas.toDataURL({
        format: 'png',
        quality: 1,
        multiplier: 2
      });

      const link = document.createElement('a');
      link.href = dataURL;
      link.download = 'canvas-export.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error exporting canvas:', error);
    }
  };

  return (
    <div className={cn(
      "h-16 border-b transition-colors",
      isDarkMode 
        ? "bg-gradient-to-r from-zinc-900 to-zinc-950 border-orange-900/20" 
        : "bg-gradient-to-r from-zinc-100 to-zinc-200 border-orange-500/20"
    )}>
      <div className="h-full px-4 flex items-center justify-between">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          <button className={cn(
            "p-2 rounded-lg transition-colors group",
            isDarkMode 
              ? "hover:bg-orange-500/10" 
              : "hover:bg-orange-500/10"
          )}>
            <ChevronLeft className={cn(
              "w-5 h-5 transition-colors",
              isDarkMode 
                ? "text-orange-100 group-hover:text-orange-400" 
                : "text-zinc-900 group-hover:text-orange-500"
            )} />
          </button>
          <div className={cn(
            "h-6 w-px",
            isDarkMode ? "bg-orange-500/20" : "bg-orange-500/20"
          )} />
          <div className="flex items-center gap-2">
            <button className={cn(
              "p-2 rounded-lg transition-colors group disabled:opacity-50",
              isDarkMode 
                ? "hover:bg-orange-500/10" 
                : "hover:bg-orange-500/10"
            )} disabled>
              <Undo className={cn(
                "w-4 h-4 transition-colors",
                isDarkMode 
                  ? "text-orange-100 group-hover:text-orange-400" 
                  : "text-zinc-900 group-hover:text-orange-500"
              )} />
            </button>
            <button className={cn(
              "p-2 rounded-lg transition-colors group disabled:opacity-50",
              isDarkMode 
                ? "hover:bg-orange-500/10" 
                : "hover:bg-orange-500/10"
            )} disabled>
              <Redo className={cn(
                "w-4 h-4 transition-colors",
                isDarkMode 
                  ? "text-orange-100 group-hover:text-orange-400" 
                  : "text-zinc-900 group-hover:text-orange-500"
              )} />
            </button>
          </div>
        </div>

        {/* Center Section */}
        <div className="flex-1 flex justify-center items-center gap-4">
          <button 
            className={cn(
              "p-2 rounded-lg transition-colors group",
              isDarkMode 
                ? "hover:bg-orange-500/10" 
                : "hover:bg-orange-500/10",
              currentPage === 0 && "opacity-50 cursor-not-allowed"
            )}
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 0}
          >
            <ChevronLeft className={cn(
              "w-4 h-4 transition-colors",
              isDarkMode 
                ? "text-orange-100 group-hover:text-orange-400" 
                : "text-zinc-900 group-hover:text-orange-500"
            )} />
          </button>
          
          <div className="flex items-center gap-2">
            <h1 className={cn(
              "font-medium transition-colors",
              isDarkMode ? "text-orange-100" : "text-zinc-900"
            )}>{project?.name || "Untitled Project"}</h1>
            {project?.canvasData?.pages && project.canvasData.pages.length > 1 && (
              <span className={cn(
                "text-sm",
                isDarkMode ? "text-orange-100/70" : "text-zinc-600"
              )}>
                Page {currentPage + 1} of {project.canvasData.pages.length}
              </span>
            )}
          </div>

          <button 
            className={cn(
              "p-2 rounded-lg transition-colors group",
              isDarkMode 
                ? "hover:bg-orange-500/10" 
                : "hover:bg-orange-500/10",
              !project?.canvasData?.pages || currentPage >= project.canvasData.pages.length - 1 && "opacity-50 cursor-not-allowed"
            )}
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={!project?.canvasData?.pages || currentPage >= project.canvasData.pages.length - 1}
          >
            <ChevronRight className={cn(
              "w-4 h-4 transition-colors",
              isDarkMode 
                ? "text-orange-100 group-hover:text-orange-400" 
                : "text-zinc-900 group-hover:text-orange-500"
            )} />
          </button>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-2">
            <Sun className={cn(
              "w-4 h-4 transition-colors",
              isDarkMode ? "text-orange-100/50" : "text-orange-500"
            )} />
            <Switch
              checked={isDarkMode}
              onCheckedChange={() => toggleTheme()}
              className={cn(
                isDarkMode ? "bg-orange-500" : "bg-zinc-700"
              )}
            />
            <Moon className={cn(
              "w-4 h-4 transition-colors",
              isDarkMode ? "text-orange-400" : "text-zinc-400"
            )} />
          </div>
          <div className={cn(
            "h-6 w-px",
            isDarkMode ? "bg-orange-500/20" : "bg-orange-500/20"
          )} />
          <Button 
            onClick={handleExport}
            className={cn(
              "flex items-center gap-2 transition-colors",
              isDarkMode 
                ? "bg-orange-500/10 hover:bg-orange-500/20 text-orange-100" 
                : "bg-orange-500/10 hover:bg-orange-500/20 text-zinc-900"
            )}
            variant="ghost"
            size="sm"
          >
            <Download className="w-4 h-4" />
            Export
          </Button>
          <div className={cn(
            "h-6 w-px",
            isDarkMode ? "bg-orange-500/20" : "bg-orange-500/20"
          )} />
          <button className={cn(
            "p-2 rounded-lg transition-colors group",
            isDarkMode 
              ? "hover:bg-orange-500/10" 
              : "hover:bg-orange-500/10"
          )}>
            <Share2 className={cn(
              "w-4 h-4 transition-colors",
              isDarkMode 
                ? "text-orange-100 group-hover:text-orange-400" 
                : "text-zinc-900 group-hover:text-orange-500"
            )} />
          </button>
        </div>
      </div>
    </div>
  );
}
