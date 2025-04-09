import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Prompt } from '@shared/schema';
import { toast } from '@/hooks/use-toast';

// Get all prompts
export function usePrompts() {
  return useQuery({
    queryKey: ['/api/prompts'],
    queryFn: () => apiRequest<Prompt[]>('/api/prompts')
  });
}

// Get favorite prompts
export function useFavoritePrompts() {
  return useQuery({
    queryKey: ['/api/prompts/favorites'],
    queryFn: () => apiRequest<Prompt[]>('/api/prompts/favorites')
  });
}

// Get prompt by ID
export function usePromptById(id: number) {
  return useQuery({
    queryKey: ['/api/prompts', id],
    queryFn: () => apiRequest<Prompt>(`/api/prompts/${id}`),
    enabled: !!id
  });
}

// Generate a response from a prompt
export function useGenerateResponse() {
  return useMutation({
    mutationFn: (prompt: string) => 
      apiRequest<Prompt>('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/prompts'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error generating response',
        description: error.message,
        variant: 'destructive'
      });
    }
  });
}

// Get suggested prompts
export function useSuggestedPrompts() {
  return useQuery({
    queryKey: ['/api/prompts/suggested'],
    queryFn: async () => {
      const data = await apiRequest<{ prompts: string[] }>('/api/prompts/suggested');
      return data.prompts;
    }
  });
}

// Toggle favorite status
export function useToggleFavorite() {
  return useMutation({
    mutationFn: (id: number) => 
      apiRequest<Prompt>(`/api/prompts/${id}/favorite`, {
        method: 'POST'
      }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/prompts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/prompts/favorites'] });
      queryClient.invalidateQueries({ queryKey: ['/api/prompts', data.id] });
      
      toast({
        title: data.isFavorite ? 'Added to favorites' : 'Removed from favorites',
        description: `"${data.title}" ${data.isFavorite ? 'added to' : 'removed from'} favorites.`
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error updating favorite status',
        description: error.message,
        variant: 'destructive'
      });
    }
  });
}

// Delete a prompt
export function useDeletePrompt() {
  return useMutation({
    mutationFn: (id: number) => 
      apiRequest<{ message: string }>(`/api/prompts/${id}`, {
        method: 'DELETE'
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/prompts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/prompts/favorites'] });
      
      toast({
        title: 'Prompt deleted',
        description: 'The prompt has been successfully deleted.'
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error deleting prompt',
        description: error.message,
        variant: 'destructive'
      });
    }
  });
}