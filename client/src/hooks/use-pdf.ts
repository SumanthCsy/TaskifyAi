import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Topic } from "@shared/schema";

interface GenerateReportParams {
  topicId: number;
  title: string;
}

export function useGenerateReport() {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ topicId, title }: GenerateReportParams) => {
      const res = await apiRequest("POST", "/api/reports", {
        topicId,
        title,
        format: "pdf"
      });
      
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Report Generated",
        description: "Your PDF report has been successfully generated.",
      });
    },
    onError: (error: Error) => {
      console.error("Failed to generate report:", error);
      toast({
        title: "Error",
        description: "Failed to generate report. Please try again.",
        variant: "destructive",
      });
    }
  });
}

export function useTopicReports(topicId: number) {
  return useMutation({
    mutationFn: async () => {
      const res = await apiRequest("GET", `/api/topics/${topicId}/reports`);
      return res.json();
    },
  });
}
