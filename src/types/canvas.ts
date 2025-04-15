export interface CanvasData {
  version: string;
  pages: string[];
  currentPage: number;
  totalChunks?: number;
  chunkIndex?: number;
  projectId?: string;
  complete_doors_and_windows: string[];
  single_doors: string[];
  double_doors: string[];
  windows: string[];
  single_doors_and_windows: string[];
  single_doors_and_double_doors: string[];
  double_doors_and_windows: string[];
  wall_color_processing: string[];
  room_area_processing: string[];
  room_n_processing: string[];
  exclusion_Zones_processing: string[];
  fire_alarm_processing: string[];

  // Add index signature for dynamic access
  [key: string]: string | string[] | number | undefined;
}
