import { useState } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bookmark, BookmarkCheck, Share2, FileText } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { Topic } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

interface TopicCardProps {
  topic: Topic;
  showFullContent?: boolean;
}

export default function TopicCard({ topic, showFullContent = false }: TopicCardProps) {
  const [isBookmarked, setIsBookmarked] = useState(topic.isBookmarked);
  const [isBookmarking, setIsBookmarking] = useState(false);
  const { toast } = useToast();

  const handleBookmark = async () => {
    try {
      setIsBookmarking(true);
      await apiRequest("POST", `/api/topics/${topic.id}/bookmark`);
      setIsBookmarked(!isBookmarked);
      
      toast({
        title: isBookmarked ? "Bookmark removed" : "Topic bookmarked",
        description: isBookmarked 
          ? "This topic has been removed from your bookmarks" 
          : "This topic has been added to your bookmarks",
        duration: 3000,
      });
      
      // Invalidate the topics query to refresh the list
      queryClient.invalidateQueries({ queryKey: ["/api/topics"] });
    } catch (error) {
      console.error("Error bookmarking topic:", error);
      toast({
        title: "Error",
        description: "Failed to bookmark topic. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsBookmarking(false);
    }
  };

  const handleShare = () => {
    // Create a shareable URL to the topic
    const url = `${window.location.origin}/topic/${topic.id}`;
    
    // Use the Web Share API if available
    if (navigator.share) {
      navigator.share({
        title: topic.title,
        text: topic.description,
        url: url,
      })
      .then(() => {
        toast({
          title: "Shared successfully",
          description: "The topic has been shared",
          duration: 3000,
        });
      })
      .catch((error) => {
        console.error("Error sharing:", error);
        // Fallback to clipboard
        copyToClipboard(url);
      });
    } else {
      // Fallback to clipboard
      copyToClipboard(url);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(
      () => {
        toast({
          title: "Link copied",
          description: "The link has been copied to your clipboard",
          duration: 3000,
        });
      },
      (err) => {
        console.error("Could not copy text: ", err);
        toast({
          title: "Error",
          description: "Failed to copy link to clipboard",
          variant: "destructive",
        });
      }
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.02 }}
      className="h-full"
    >
      <Card className="h-full flex flex-col overflow-hidden border-border shadow-md hover:shadow-lg transition-shadow duration-300">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
              {topic.category}
            </Badge>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleBookmark}
              disabled={isBookmarking}
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              {isBookmarked ? (
                <BookmarkCheck size={20} className="text-primary" />
              ) : (
                <Bookmark size={20} />
              )}
            </motion.button>
          </div>
          <CardTitle className="text-xl mt-2 line-clamp-2">
            <Link href={`/topic/${topic.id}`}>
              <a className="hover:text-primary transition-colors">
                {topic.title}
              </a>
            </Link>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1">
          <p className={showFullContent ? "" : "line-clamp-3"} className="text-muted-foreground">
            {topic.description}
          </p>
          {topic.tags && topic.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-4">
              {topic.tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
        <CardFooter className="pt-4 border-t border-border flex justify-between">
          <Link href={`/topic/${topic.id}`}>
            <Button variant="outline" size="sm">
              View Details
            </Button>
          </Link>
          <div className="flex space-x-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleShare}
              title="Share"
            >
              <Share2 size={16} />
            </Button>
            <Link href={`/topic/${topic.id}?report=true`}>
              <Button 
                variant="ghost" 
                size="icon"
                title="Generate Report"
              >
                <FileText size={16} />
              </Button>
            </Link>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
