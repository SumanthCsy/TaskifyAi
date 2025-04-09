import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import SearchBar from "@/components/search/search-bar";
import TopicCard from "@/components/topics/topic-card";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { useTopicSearch, useTopicsByCategory } from "@/hooks/use-ai";
import { useAllTopics } from "@/hooks/use-topics";
import { motion } from "framer-motion";

export default function Search() {
  const [searchParams, setSearchParams] = useState<URLSearchParams>();
  const [location, setLocation] = useLocation();
  const searchMutation = useTopicSearch();
  const { data: allTopics, isLoading: isLoadingTopics } = useAllTopics();
  
  const [activeTab, setActiveTab] = useState("all");
  const [category, setCategory] = useState<string | null>(null);
  
  // Extract search parameters
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setSearchParams(params);
    
    const categoryParam = params.get("category");
    if (categoryParam) {
      setCategory(categoryParam);
      setActiveTab("categories");
    }
    
    const query = params.get("q");
    if (query) {
      handleSearch(query);
    }
  }, [location]);
  
  const handleSearch = (query: string) => {
    setLocation(`/search?q=${encodeURIComponent(query)}`);
    searchMutation.mutate(query);
  };
  
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    
    if (value === "categories" && !category) {
      setCategory("science"); // Default category
    }
  };
  
  const handleCategoryChange = (newCategory: string) => {
    setCategory(newCategory);
    setLocation(`/search?category=${newCategory}`);
  };
  
  // Filter topics based on the active tab
  const getFilteredTopics = () => {
    if (!allTopics || !Array.isArray(allTopics)) return [];
    
    if (activeTab === "categories" && category) {
      return allTopics.filter((topic: any) => 
        topic.category.toLowerCase() === category.toLowerCase()
      );
    } else if (activeTab === "recent") {
      return [...allTopics].sort((a: any, b: any) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } else if (activeTab === "bookmarked") {
      return allTopics.filter((topic: any) => topic.isBookmarked);
    }
    
    return allTopics;
  };
  
  const categories = [
    { id: "science", label: "Science" },
    { id: "technology", label: "Technology" },
    { id: "history", label: "History" },
    { id: "business", label: "Business" },
    { id: "arts", label: "Arts" },
    { id: "health", label: "Health" },
    { id: "philosophy", label: "Philosophy" },
    { id: "politics", label: "Politics" },
  ];

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold mb-6 font-display">Knowledge Explorer</h1>
        
        <SearchBar
          initialQuery={searchParams?.get("q") || ""}
          onSearch={handleSearch}
          isLoading={searchMutation.isPending}
          placeholder="Search for any topic to generate AI content..."
          className="mb-8"
        />
      </motion.div>
      
      {searchMutation.isPending ? (
        <LoadingSpinner text="Generating comprehensive information about your topic..." />
      ) : searchMutation.data ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-xl font-semibold mb-4">Search Results</h2>
          <TopicCard topic={searchMutation.data} showFullContent />
        </motion.div>
      ) : (
        <Tabs defaultValue="all" value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="mb-6">
            <TabsTrigger value="all">All Topics</TabsTrigger>
            <TabsTrigger value="recent">Recent</TabsTrigger>
            <TabsTrigger value="bookmarked">Bookmarked</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
          </TabsList>
          
          <TabsContent value="categories" className="mt-0">
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <Button
                      key={cat.id}
                      variant={category === cat.id ? "default" : "outline"}
                      onClick={() => handleCategoryChange(cat.id)}
                      size="sm"
                    >
                      {cat.label}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {isLoadingTopics ? (
            <LoadingSpinner />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {getFilteredTopics().map((topic: any) => (
                <TopicCard key={topic.id} topic={topic} />
              ))}
              
              {getFilteredTopics().length === 0 && (
                <div className="col-span-full text-center py-12">
                  <p className="text-muted-foreground mb-4">No topics found</p>
                  <Button onClick={() => setLocation("/search")}>
                    Start a New Search
                  </Button>
                </div>
              )}
            </div>
          )}
        </Tabs>
      )}
    </div>
  );
}
