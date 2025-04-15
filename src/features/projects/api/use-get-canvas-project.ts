import { useQuery } from "@tanstack/react-query";

export const useGetCanvasProject = (id: string) => {
  const query = useQuery({
    enabled: !!id,
    queryKey: ["canvas-project", { id }],
    queryFn: async () => {
      const response = await fetch(`/api/canvas-projects/${id}`);

      if (!response.ok) {
        throw new Error("Failed to fetch canvas project");
      }

      return response.json();
    },
  });

  return query;
};
