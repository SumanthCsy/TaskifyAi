import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Report } from '@shared/schema';
import { toast } from '@/hooks/use-toast';

interface GenerateReportParams {
  promptId: number;
  title: string;
}

// Generate a report based on a prompt
export function useGenerateReport() {
  return useMutation({
    mutationFn: ({ promptId, title }: GenerateReportParams) => 
      apiRequest<Report>('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ promptId, title })
      }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/prompts', data.promptId, 'reports'] });
      
      toast({
        title: 'Report generated',
        description: `Report "${data.title}" has been generated successfully.`
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error generating report',
        description: error.message,
        variant: 'destructive'
      });
    }
  });
}

// Get reports for a specific prompt
export function usePromptReports(promptId: number) {
  return useQuery({
    queryKey: ['/api/prompts', promptId, 'reports'],
    queryFn: () => apiRequest<Report[]>(`/api/prompts/${promptId}/reports`),
    enabled: !!promptId
  });
}

// Get a specific report by id
export function useReport(id: number) {
  return useQuery({
    queryKey: ['/api/reports', id],
    queryFn: () => apiRequest<Report>(`/api/reports/${id}`),
    enabled: !!id
  });
}