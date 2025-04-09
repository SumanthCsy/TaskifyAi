import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronRight } from "lucide-react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";

interface TopicCategoryProps {
  title: string;
  categoryId: string;
  icon: React.ReactNode;
}

export default function TopicCategory({ title, categoryId, icon }: TopicCategoryProps) {
  const [_, setLocation] = useLocation();
  const [topics, setTopics] = useState<string[]>([]);

  const { data, isLoading, error } = useQuery<{ topics: string[] }>({
    queryKey: [`/api/categories/${categoryId}/topics`],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  useEffect(() => {
    if (data?.topics) {
      setTopics(data.topics.slice(0, 3)); // Show only 3 topics
    }
  }, [data]);

  const handleCategoryClick = () => {
    setLocation(`/search?category=${categoryId}`);
  };

  const handleTopicClick = (topic: string) => {
    setLocation(`/search?q=${encodeURIComponent(topic)}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
    >
      <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-lg font-semibold">
            <div className="mr-2 text-primary">{icon}</div>
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          ) : error ? (
            <div className="text-sm text-muted-foreground">
              Failed to load topics
            </div>
          ) : (
            <>
              <ul className="space-y-2">
                {topics.map((topic, index) => (
                  <motion.li 
                    key={index}
                    whileHover={{ x: 5 }}
                    className="text-sm"
                  >
                    <button
                      onClick={() => handleTopicClick(topic)}
                      className="w-full text-left py-2 px-3 rounded-md hover:bg-primary/10 transition flex justify-between items-center"
                    >
                      <span className="truncate">{topic}</span>
                      <ChevronRight size={16} className="shrink-0 text-primary" />
                    </button>
                  </motion.li>
                ))}
              </ul>
              
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full mt-4 text-primary"
                onClick={handleCategoryClick}
              >
                View All {title} Topics
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
