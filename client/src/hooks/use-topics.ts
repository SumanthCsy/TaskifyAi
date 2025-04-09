import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Topic } from "@shared/schema";

export function useAllTopics() {
  return useQuery({
    queryKey: ["/api/topics"],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useRecentTopics() {
  const { data: allTopics } = useAllTopics();
  
  if (!allTopics) return { recentTopics: [] };
  
  // Sort by created date (newest first) and take the first 5
  const recentTopics = [...allTopics]
    .sort((a: Topic, b: Topic) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 5);
  
  return { recentTopics };
}

export function useBookmarkedTopics() {
  const { data: allTopics } = useAllTopics();
  
  if (!allTopics) return { bookmarkedTopics: [] };
  
  // Filter bookmarked topics
  const bookmarkedTopics = allTopics.filter((topic: Topic) => topic.isBookmarked);
  
  return { bookmarkedTopics };
}

export function useTopicsByCategory(category: string) {
  return useQuery({
    queryKey: [`/api/topics/category/${category}`],
    enabled: !!category,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useSearchHistory() {
  return useQuery({
    queryKey: ["/api/history"],
    staleTime: 1000 * 60, // 1 minute
  });
}

export function useClearHistory() {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async () => {
      const res = await apiRequest("DELETE", "/api/history");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/history"] });
      toast({
        title: "History Cleared",
        description: "Your search history has been cleared.",
      });
    },
    onError: (error: Error) => {
      console.error("Failed to clear history:", error);
      toast({
        title: "Error",
        description: "Failed to clear history. Please try again.",
        variant: "destructive",
      });
    }
  });
}
