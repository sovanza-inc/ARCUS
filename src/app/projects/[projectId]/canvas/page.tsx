"use client";

import { useEffect, useRef, useState } from "react";
import { fabric } from "fabric";
import { useParams } from "next/navigation";
import { ZoomIn, ZoomOut } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import { useCanvasStore } from "@/store/canvas-store";
import { useThemeStore } from "@/store/theme-store";
import { usePDFPageStore } from "@/store/pdf-page-store";
import LeftPanel from "@/components/canvas/left-panel";
import RightPanel from "@/components/canvas/right-panel";
import TopPanel from "@/components/canvas/top-panel";
import BottomPanel from "@/components/canvas/bottom-panel";
import { cn } from "@/lib/utils";

// Constants for zoom limits and steps
const MIN_ZOOM = 0.1; // 10% of original size
const MAX_ZOOM = 20; // 2000% of original size
const ZOOM_SPEED = 1.1; // 10% change per zoom step

export default function CanvasPage() {
  const { projectId } = useParams();
  const canvasRef = useRef<fabric.Canvas | null>(null);
  const { setCanvas } = useCanvasStore();
  const { isDarkMode } = useThemeStore();
  const { setCurrentPage, setTotalPages } = usePDFPageStore();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isCanvasReady, setIsCanvasReady] = useState(false);
  const [zoom, setZoom] = useState(1);
  const isDragging = useRef(false);
  const lastPosX = useRef<number>(0);
  const lastPosY = useRef<number>(0);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize canvas
  useEffect(() => {
    const initCanvas = () => {
      const container = containerRef.current;
      if (!container || canvasRef.current) return;

      const canvas = new fabric.Canvas("canvas", {
        width: container.clientWidth,
        height: container.clientHeight,
        backgroundColor: "#ffffff",
      });

      canvasRef.current = canvas;
      setCanvas(canvas);
      setIsCanvasReady(true);

      const handleResize = () => {
        canvas.setDimensions({
          width: container.clientWidth,
          height: container.clientHeight,
        });
        canvas.requestRenderAll();
      };

      window.addEventListener("resize", handleResize);
      return () => {
        window.removeEventListener("resize", handleResize);
        canvas.dispose();
      };
    };

    // Small delay to ensure DOM is ready
    setTimeout(initCanvas, 100);
  }, []);

  // Load initial canvas data
  useEffect(() => {
    if (!isCanvasReady || !canvasRef.current || !projectId) return;

    const loadCanvasData = async () => {
      try {
        setLoadingProgress(10);
        const response = await fetch(`/api/canvas-projects/${projectId}`);
        if (!response.ok) {
          setIsLoading(false);
          return;
        }

        setLoadingProgress(20);
        const project = await response.json();
        
        if (project.canvasData?.pages?.length > 0) {
          console.log('Loading project with pages:', project.canvasData.pages.length);
          setCurrentPage(0);
          setTotalPages(project.canvasData.pages.length);
          
          // Load the default image from the pages array
          const currentPage = 0;
          const imageData = project.canvasData.pages[currentPage];
          
          if (imageData) {
            await handlePDFProcessed([imageData]);
          }
        } else {
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error loading canvas data:", error);
        setIsLoading(false);
      }
    };

    loadCanvasData();
  }, [isCanvasReady, projectId]);

  // Handle adding PDF page to canvas
  const handlePDFProcessed = async (pages: string[]) => {
    if (!canvasRef.current || pages.length === 0) {
      setIsLoading(false);
      return;
    }
    
    const canvas = canvasRef.current;
    const currentPageData = pages[0]; // Load first page initially

    setLoadingProgress(30);
    
    // Create a fabric.Image from the data URL
    fabric.Image.fromURL(
      currentPageData,
      (img) => {
        setLoadingProgress(60);
        
        // Calculate scale to fit Arcus AI while maintaining aspect ratio
        const canvasWidth = canvas.getWidth();
        const canvasHeight = canvas.getHeight();
        const scale = Math.min(
          (canvasWidth * 0.9) / img.width!,
          (canvasHeight * 0.9) / img.height!
        );

        setLoadingProgress(80);

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

        // Clear existing objects and add the image
        canvas.clear();
        canvas.add(img);
        img.sendToBack();
        canvas.renderAll();

        setLoadingProgress(100);
        setTimeout(() => {
          setIsLoading(false);
        }, 500);
      },
      { crossOrigin: 'anonymous' }
    );
  };

  // Handle window resize
  useEffect(() => {
    if (!isCanvasReady || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!container) return;

    const handleResize = () => {
      canvas.setDimensions({
        width: container.clientWidth,
        height: container.clientHeight
      });
      canvas.requestRenderAll();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [isCanvasReady]);

  // Pan handlers
  useEffect(() => {
    if (!isCanvasReady || !canvasRef.current) return;

    const canvas = canvasRef.current;

    const handleMouseDown = (opt: fabric.IEvent) => {
      const evt = opt.e as MouseEvent;
      if (evt.altKey || evt.buttons === 2) {
        isDragging.current = true;
        canvas.selection = false;
        lastPosX.current = evt.clientX;
        lastPosY.current = evt.clientY;
        canvas.setCursor('grabbing');
        evt.preventDefault();
        evt.stopPropagation();
      }
    };

    const handleMouseMove = (opt: fabric.IEvent) => {
      if (!isDragging.current) return;

      const evt = opt.e as MouseEvent;
      evt.preventDefault();
      evt.stopPropagation();
      
      const vpt = canvas.viewportTransform!;
      const deltaX = evt.clientX - lastPosX.current;
      const deltaY = evt.clientY - lastPosY.current;
      
      vpt[4] += deltaX;
      vpt[5] += deltaY;
      
      lastPosX.current = evt.clientX;
      lastPosY.current = evt.clientY;
      
      canvas.requestRenderAll();
      canvas.setCursor('grabbing');
    };

    const handleMouseUp = () => {
      isDragging.current = false;
      canvas.selection = true;
      canvas.setCursor('default');
    };

    canvas.on('mouse:down', handleMouseDown);
    canvas.on('mouse:move', handleMouseMove);
    canvas.on('mouse:up', handleMouseUp);
    canvas.on('mouse:out', handleMouseUp);

    return () => {
      canvas.off('mouse:down', handleMouseDown);
      canvas.off('mouse:move', handleMouseMove);
      canvas.off('mouse:up', handleMouseUp);
      canvas.off('mouse:out', handleMouseUp);
    };
  }, [isCanvasReady]);

  // Mouse wheel zoom handler
  useEffect(() => {
    if (!isCanvasReady || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const handleWheel = (e: WheelEvent) => {
      if (!e.ctrlKey) return;
      
      // Only handle zoom if the event is within Arcus AI container
      const container = containerRef.current;
      if (!container?.contains(e.target as Node)) return;
      
      e.preventDefault();
      e.stopPropagation();
      
      const delta = e.deltaY;
      let currentZoom = canvas.getZoom();
      let newZoom = currentZoom;

      if (delta > 0) {
        newZoom = currentZoom / ZOOM_SPEED;
      } else {
        newZoom = currentZoom * ZOOM_SPEED;
      }

      newZoom = Math.min(Math.max(newZoom, MIN_ZOOM), MAX_ZOOM);

      // Get pointer position relative to canvas container
      const rect = canvas.getElement().getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      canvas.zoomToPoint(new fabric.Point(x, y), newZoom);
      setZoom(newZoom);
    };

    // Attach wheel event to Arcus AI container instead of canvas
    const container = containerRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false });
    }

    return () => {
      const container = containerRef.current;
      if (container) {
        container.removeEventListener('wheel', handleWheel);
      }
    };
  }, [isCanvasReady]);

  // Handle zoom button clicks
  const handleZoom = (direction: 'in' | 'out') => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    let currentZoom = canvas.getZoom();
    let newZoom = currentZoom;

    if (direction === 'in') {
      newZoom = currentZoom * ZOOM_SPEED;
    } else {
      newZoom = currentZoom / ZOOM_SPEED;
    }
    
    newZoom = Math.min(Math.max(newZoom, MIN_ZOOM), MAX_ZOOM);
    
    // Get canvas center point
    const center = {
      x: canvas.getWidth() / 2,
      y: canvas.getHeight() / 2
    };
    
    canvas.zoomToPoint(new fabric.Point(center.x, center.y), newZoom);
    setZoom(newZoom);
    canvas.requestRenderAll();
  };

  return (
    <div className={cn(
      "flex h-screen w-screen flex-col overflow-hidden",
      isDarkMode ? "bg-black" : "bg-zinc-50"
    )}>
      <TopPanel />
      <div className="flex flex-1 w-full min-h-0 overflow-hidden">
        <LeftPanel />
        <div className="relative w-[60%] h-full bg-gray-50">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-50">
              <div className="w-64 space-y-4">
                <Progress value={loadingProgress} />
                <p className="text-sm text-center text-gray-500">
                  Loading canvas {loadingProgress}%
                </p>
              </div>
            </div>
          )}
          <div 
            id="canvas-container" 
            ref={containerRef}
            className="absolute inset-0"
          >
            <canvas id="canvas" />
          </div>
          <div className="absolute bottom-4 right-4 flex gap-2 z-10">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => handleZoom('out')}
                    className="p-2 bg-white rounded-lg shadow hover:bg-gray-50"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Zoom Out</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => handleZoom('in')}
                    className="p-2 bg-white rounded-lg shadow hover:bg-gray-50"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Zoom In</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
        <RightPanel />
      </div>
      <BottomPanel />
    </div>
  );
}
