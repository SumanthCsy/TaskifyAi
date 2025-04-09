import { useState } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import TopicCard from "@/components/topics/topic-card";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { useSearchHistory, useAllTopics, useBookmarkedTopics, useClearHistory } from "@/hooks/use-topics";
import { Clock, Bookmark, Trash2 } from "lucide-react";
import { motion } from "framer-motion";

export default function History() {
  const [activeTab, setActiveTab] = useState("history");
  const { data: searchHistory, isLoading: isLoadingHistory } = useSearchHistory();
  const { data: allTopics, isLoading: isLoadingTopics } = useAllTopics();
  const { bookmarkedTopics } = useBookmarkedTopics();
  const clearHistoryMutation = useClearHistory();
  
  if (isLoadingHistory || isLoadingTopics) {
    return <LoadingSpinner text="Loading your history..." />;
  }
  
  // Match history with topics
  const historyWithTopics = searchHistory
    ? searchHistory.map((historyItem: any) => {
        const topic = allTopics?.find(
          (topic: any) => topic.id === historyItem.resultTopicId
        );
        return { ...historyItem, topic };
      })
    : [];
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-bold font-display">Your History</h1>
        
        {activeTab === "history" && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Trash2 size={16} className="mr-2" /> Clear History
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Clear search history?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete your search history. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => clearHistoryMutation.mutate()}
                  disabled={clearHistoryMutation.isPending}
                >
                  {clearHistoryMutation.isPending ? "Clearing..." : "Clear History"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
      
      <Tabs defaultValue="history" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <Clock size={16} /> Search History
          </TabsTrigger>
          <TabsTrigger value="bookmarks" className="flex items-center gap-2">
            <Bookmark size={16} /> Bookmarks
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="history">
          {historyWithTopics.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center pt-6 pb-4">
                <Clock size={48} className="text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Search History</h3>
                <p className="text-muted-foreground text-center mb-4">
                  You haven't searched for any topics yet.
                </p>
                <Link href="/search">
                  <Button>Start Exploring</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Recent Searches</h2>
              
              <div className="space-y-4">
                {historyWithTopics.map((item: any) => (
                  <Card key={item.id} className="overflow-hidden">
                    <div className="flex flex-col md:flex-row">
                      <div className="p-4 md:w-64 bg-muted/30 flex flex-col">
                        <span className="text-xs text-muted-foreground">
                          {new Date(item.createdAt).toLocaleString()}
                        </span>
                        <span className="font-medium truncate mt-1">
                          "{item.query}"
                        </span>
                        <Badge className="mt-2 w-fit">
                          {item.topic?.category || "Unknown"}
                        </Badge>
                      </div>
                      
                      <div className="flex-1">
                        {item.topic ? (
                          <Link href={`/topic/${item.topic.id}`}>
                            <a className="block p-4 hover:bg-muted/20 transition-colors">
                              <h3 className="font-medium mb-1">{item.topic.title}</h3>
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {item.topic.description}
                              </p>
                            </a>
                          </Link>
                        ) : (
                          <div className="p-4">
                            <p className="text-sm text-muted-foreground">
                              Topic no longer available
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="bookmarks">
          {bookmarkedTopics.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center pt-6 pb-4">
                <Bookmark size={48} className="text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Bookmarks</h3>
                <p className="text-muted-foreground text-center mb-4">
                  You haven't bookmarked any topics yet.
                </p>
                <Link href="/search">
                  <Button>Explore Topics</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Your Bookmarks</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {bookmarkedTopics.map((topic) => (
                  <TopicCard key={topic.id} topic={topic} />
                ))}
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
