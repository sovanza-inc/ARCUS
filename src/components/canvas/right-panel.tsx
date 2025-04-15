"use client";

import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { useThemeStore } from "@/store/theme-store";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { usePDFPageStore } from "@/store/pdf-page-store";

interface APIOption {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
  icon: string;
  progress: number;
  details: string[];
}

interface SubOption {
  id: string;
  title: string;
  description: string;
  enabled?: boolean;
}

interface APISection {
  id: string;
  title: string;
  options: SubOption[];
}

const apiOptions: APIOption[] = [
  {
    id: "doors-windows",
    title: "Doors and Windows Detection",
    description: "Automatically identifies and labels all doors and windows, including their dimensions and types.",
    enabled: false,
    icon: "🚪",
    progress: 0,
    details: [
      "Entry doors and emergency exits",
      "Window types and sizes",
      "Opening directions"
    ]
  },
  {
    id: "room-detection",
    title: "Room Area Detection",
    description: "Advanced room recognition with automatic labeling and area calculations.",
    enabled: false,
    icon: "🏠",
    progress: 0,
    details: [
      "Room type identification",
      "Area measurements",
      "Space optimization"
    ]
  },
  {
    id: "room-number-detection",
    title: "Room Number Detection",
    description: "Automatically identifies and labels room numbers from floor plans.",
    enabled: false,
    icon: "🔢",
    progress: 0,
    details: [
      "Room number identification",
      "Sequential numbering",
      "Custom numbering schemes"
    ]
  },
  {
    id: "inclusive-exclusive-zones",
    title: "Inclusive/Exclusive Zones",
    description: "Detects and highlights inclusive and exclusive zones within floor plans.",
    enabled: false,
    icon: "🔍",
    progress: 0,
    details: [
      "Zone boundary detection",
      "Inclusive area highlighting",
      "Exclusive area marking"
    ]
  },
  {
    id: "walls-detection",
    title: "Walls Detection",
    description: "Precise wall detection with thickness measurement and material analysis.",
    enabled: false,
    icon: "🧱",
    progress: 0,
    details: [
      "Wall thickness",
      "Material type",
      "Load-bearing analysis"
    ]
  },
  {
    id: "fire-alarm",
    title: "Fire Alarm Detection",
    description: "Comprehensive fire safety system detection and compliance checking.",
    enabled: false,
    icon: "🚨",
    progress: 0,
    details: [
      "Alarm placement verification",
      "Coverage analysis",
      "Emergency route planning"
    ]
  }
];

const doorWindowSection: APISection = {
  id: "door-window",
  title: "Door and window detection",
  options: [
    {
      id: "highlight-door",
      title: "Highlight a door",
      description: "Find and highlight one door on your plan"
    },
    {
      id: "highlight-window",
      title: "Highlight a window",
      description: "Find and highlight one window on your plan"
    },
    {
      id: "detect-remaining",
      title: "Detect remaining doors and windows",
      description: "Use AI to find all remaining objects"
    },
    {
      id: "confirm-exits",
      title: "Confirm fire exits",
      description: "Ensure all fire exits are marked correctly"
    }
  ]
};

export default function RightPanel() {
  const { projectId } = useParams();
  const { isDarkMode } = useThemeStore();
  const { currentPage } = usePDFPageStore(); // Use currentPage from the store
  const [expandedOption, setExpandedOption] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingFeature, setProcessingFeature] = useState<string | null>(null);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [options, setOptions] = useState<APIOption[]>(apiOptions);

  const simulateProcessing = async (featureId: string) => {
    if (!projectId) {
      return;
    }

    try {
      // Start processing - show loading indicator
      setIsProcessing(true);
      setProcessingFeature(featureId);
      setProcessingProgress(0);
      
      console.log(`Starting simulated ${featureId} detection process`);
      
      // Get the current project data - we still need this to verify the project exists
      const response = await fetch(`/api/canvas-projects/${projectId}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch project: ${response.statusText}`);
      }

      const project = await response.json();
      console.log('Project data:', project);
      
      if (!project.canvasData?.pages?.[currentPage]) {
        throw new Error("No image found in canvas");
      }
      
      // Simulate progress updates during the 1-minute wait
      const startTime = Date.now();
      const totalDuration = 60000; // 1 minute in milliseconds
      
      // Set up progress updates
      const progressInterval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(Math.floor((elapsed / totalDuration) * 100), 99);
        setProcessingProgress(progress);
        console.log(`Processing progress: ${progress}%`);
      }, 1000); // Update every second
      
      // Wait for 1 minute (simulating processing)
      await new Promise(resolve => setTimeout(resolve, totalDuration));
      
      // Clear the interval when done
      clearInterval(progressInterval);
      
      // Set final progress to 100%
      // Complete the processing
      setIsProcessing(false);
      setProcessingFeature(null);
      setProcessingProgress(100);
      
      // Dispatch the appropriate event based on the feature
      if (featureId === "doors-windows") {
        // Dispatch event for doors and windows detection completion
        window.dispatchEvent(new CustomEvent('doorsWindowsDetectionComplete'));
      } else if (featureId === "walls-detection") {
        // Dispatch event for walls detection completion
        window.dispatchEvent(new CustomEvent('wallsDetectionComplete'));
      } else if (featureId === "room-detection") {
        // Dispatch event for room area detection completion
        window.dispatchEvent(new CustomEvent('roomAreaDetectionComplete'));
      } else if (featureId === "room-number-detection") {
        // Dispatch event for room number detection completion
        window.dispatchEvent(new CustomEvent('roomNumberDetectionComplete'));
      } else if (featureId === "inclusive-exclusive-zones") {
        // Dispatch event for exclusion zones detection completion
        window.dispatchEvent(new CustomEvent('exclusionZonesDetectionComplete'));
      } else if (featureId === "fire-alarm") {
        // Dispatch event for fire alarm detection completion
        window.dispatchEvent(new CustomEvent('fireAlarmDetectionComplete'));
      }
      
    } catch (error) {
      console.error(`Error during ${featureId} detection:`, error);
      alert(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleDoorsWindowsDetection = async (enabled: boolean) => {
    if (!enabled) return;
    await simulateProcessing("doors-windows");
  };
  
  const handleWallsDetection = async (enabled: boolean) => {
    if (!enabled) return;
    await simulateProcessing("walls-detection");
  };
  
  const handleRoomAreaDetection = async (enabled: boolean) => {
    if (!enabled) return;
    await simulateProcessing("room-detection");
  };
  
  const handleRoomNumberDetection = async (enabled: boolean) => {
    if (!enabled) return;
    await simulateProcessing("room-number-detection");
  };
  
  const handleExclusionZonesDetection = async (enabled: boolean) => {
    if (!enabled) return;
    await simulateProcessing("inclusive-exclusive-zones");
  };
  
  const handleFireAlarmDetection = async (enabled: boolean) => {
    if (!enabled) return;
    await simulateProcessing("fire-alarm");
  };

  const handleOptionToggle = async (optionId: string) => {
    try {
      const option = apiOptions.find(opt => opt.id === optionId);
      if (!option) return;
      
      // For detection features, we want to ensure they always run the 1-minute process
      // when toggled on, regardless of previous state
      if (optionId === "doors-windows" || optionId === "walls-detection" || optionId === "room-detection" || optionId === "room-number-detection" || optionId === "inclusive-exclusive-zones" || optionId === "fire-alarm") {
        // First set the option to enabled in the UI
        const updatedOptions = apiOptions.map(opt => 
          opt.id === optionId 
            ? { ...opt, enabled: true }
            : opt
        );
        setOptions(updatedOptions);
        
        // Dispatch API toggle event
        const event = new CustomEvent("apiToggle", {
          detail: {
            apiId: optionId,
            enabled: true
          }
        });
        window.dispatchEvent(event);
        
        // Start the appropriate detection process
        if (optionId === "doors-windows") {
          handleDoorsWindowsDetection(true);
        } else if (optionId === "walls-detection") {
          handleWallsDetection(true);
        } else if (optionId === "room-detection") {
          handleRoomAreaDetection(true);
        } else if (optionId === "room-number-detection") {
          handleRoomNumberDetection(true);
        } else if (optionId === "inclusive-exclusive-zones") {
          handleExclusionZonesDetection(true);
        } else if (optionId === "fire-alarm") {
          handleFireAlarmDetection(true);
        }
      } else {
        // For other options, toggle as normal
        const updatedOptions = apiOptions.map(opt => 
          opt.id === optionId 
            ? { ...opt, enabled: !opt.enabled }
            : opt
        );
        setOptions(updatedOptions);
        
        // Dispatch API toggle event
        const event = new CustomEvent("apiToggle", {
          detail: {
            apiId: optionId,
            enabled: !option.enabled
          }
        });
        window.dispatchEvent(event);
      }
    } catch (error) {
      console.error("Error toggling option:", error);
    }
  };

  return (
    <div className={cn(
      "w-[300px] border-l transition-colors flex flex-col h-[calc(100vh-48px)]", 
      isDarkMode 
        ? "bg-gradient-to-b from-zinc-900 to-zinc-950 border-orange-900/20" 
        : "bg-gradient-to-b from-zinc-100 to-zinc-200 border-orange-500/20"
    )}>
      <div className={cn(
        "p-3 border-b transition-colors flex-shrink-0", 
        isDarkMode 
          ? "border-orange-500/10 bg-black/20"
          : "border-orange-500/10 bg-zinc-50/20"
      )}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={cn(
              "h-2 w-2 rounded-full",
              isDarkMode ? "bg-orange-500" : "bg-orange-500"
            )} />
            <h2 className={cn(
              "text-sm font-medium",
              isDarkMode ? "text-orange-100" : "text-zinc-900"
            )}>Arcus AI</h2>
          </div>
          <span className={cn(
            "text-xs",
            isDarkMode ? "text-orange-400" : "text-orange-500"
          )}>
            Step 1 of 4
          </span>
        </div>
      </div>

      <div className="flex-grow overflow-y-auto"> 
        <div className="p-4 space-y-4">
          {/* Detection Options */}
          <div className="space-y-3">
            {options.map((option) => (
              <div 
                key={option.id} 
                className={cn(
                  "space-y-2 rounded-lg p-3 transition-colors",
                  expandedOption === option.id
                    ? isDarkMode 
                      ? "bg-orange-500/10" 
                      : "bg-orange-500/10"
                    : "hover:bg-orange-500/5"
                )}
                onClick={() => setExpandedOption(expandedOption === option.id ? null : option.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{option.icon}</span>
                    <span className={cn(
                      "text-sm font-medium",
                      isDarkMode ? "text-orange-100" : "text-zinc-900"
                    )}>
                      {option.title}
                    </span>
                  </div>
                  {isProcessing && processingFeature === option.id ? (
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm text-gray-500">Processing...</span>
                    </div>
                  ) : (
                    <Switch 
                      checked={option.enabled}
                      className={isDarkMode ? "bg-zinc-700" : "bg-orange-500"}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOptionToggle(option.id);
                      }} 
                    />
                  )}
                </div>
                <p className={cn(
                  "text-xs",
                  isDarkMode ? "text-orange-100/70" : "text-zinc-600"
                )}>
                  {option.description}
                </p>
                
                {/* Expanded Details */}
                {expandedOption === option.id && (
                  <div className="mt-3 space-y-2 pl-7">
                    {option.details.map((detail, index) => (
                      <div 
                        key={index}
                        className={cn(
                          "text-xs flex items-center gap-2",
                          isDarkMode ? "text-orange-100/60" : "text-zinc-600"
                        )}
                      >
                        <div className="h-1 w-1 rounded-full bg-current" />
                        {detail}
                      </div>
                    ))}
                    
                    {/* Progress Bar */}
                    {option.enabled && (
                      <div className="mt-3">
                        <div className="h-1 bg-orange-200/20 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-orange-500 rounded-full transition-all duration-1000"
                            style={{ width: `${option.progress}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Next Button - Fixed at bottom */}
      <div className="p-4 border-t flex-shrink-0"> 
        <Button
          onClick={() => handleDoorsWindowsDetection(true)}
          disabled={isProcessing}
          className="w-full"
        >
          Detect Doors & Windows
        </Button>
      </div>
    </div>
  );
}