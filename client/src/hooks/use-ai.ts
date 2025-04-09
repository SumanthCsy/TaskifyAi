import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export function useTopicSearch() {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (query: string) => {
      const res = await apiRequest("POST", "/api/topics/search", { query });
      return res.json();
    },
    onError: (error: Error) => {
      console.error("Topic search error:", error);
      toast({
        title: "Search Failed",
        description: "Could not search for this topic. Please try again.",
        variant: "destructive",
      });
    },
  });
}

export function useSuggestedTopics() {
  return useQuery({
    queryKey: ["/api/topics/suggested"],
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}

export function useTopicById(id: number) {
  const { toast } = useToast();
  
  return useQuery({
    queryKey: [`/api/topics/${id}`],
    staleTime: 1000 * 60 * 5, // 5 minutes
    queryFn: ({ queryKey }) => {
      if (!id) return null;
      return fetch(queryKey[0] as string, { credentials: "include" }).then(res => {
        if (!res.ok) {
          throw new Error("Failed to fetch topic");
        }
        return res.json();
      });
    },
    onError: (error: Error) => {
      console.error("Error fetching topic:", error);
      toast({
        title: "Error",
        description: "Failed to load topic information. Please try again.",
        variant: "destructive",
      });
    },
  });
}

export function useTopicsByCategory(category: string) {
  return useQuery({
    queryKey: [`/api/topics/category/${category}`],
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!category,
  });
}

export function useBookmarkTopic() {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (topicId: number) => {
      const res = await apiRequest("POST", `/api/topics/${topicId}/bookmark`);
      return res.json();
    },
    onSuccess: (data) => {
      const message = data.isBookmarked 
        ? "Topic added to bookmarks" 
        : "Topic removed from bookmarks";
      
      toast({
        title: "Success",
        description: message,
      });
    },
    onError: (error: Error) => {
      console.error("Error bookmarking topic:", error);
      toast({
        title: "Error",
        description: "Failed to update bookmark status. Please try again.",
        variant: "destructive",
      });
    },
  });
}
