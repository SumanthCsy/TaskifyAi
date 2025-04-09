import { useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import SearchBar from "@/components/search/search-bar";
import TopicCard from "@/components/topics/topic-card";
import TopicCategory from "@/components/topics/topic-category";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { useRecentTopics, useBookmarkedTopics } from "@/hooks/use-topics";
import { useSuggestedTopics } from "@/hooks/use-ai";
import { Globe, PenTool, BookOpen, FileText, Lightbulb, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  const [_, setLocation] = useLocation();
  const { recentTopics } = useRecentTopics();
  const { bookmarkedTopics } = useBookmarkedTopics();
  const { data: suggestedTopics, isLoading: isLoadingSuggestions } = useSuggestedTopics();

  const handleSearch = (query: string) => {
    setLocation(`/search?q=${encodeURIComponent(query)}`);
  };

  const categories = [
    { id: "science", title: "Science", icon: <Globe size={20} /> },
    { id: "technology", title: "Technology", icon: <PenTool size={20} /> },
    { id: "history", title: "History", icon: <BookOpen size={20} /> },
    { id: "business", title: "Business", icon: <FileText size={20} /> },
    { id: "arts", title: "Arts", icon: <Lightbulb size={20} /> },
  ];

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mx-auto max-w-3xl mb-8"
      >
        <h1 className="text-3xl font-bold mb-3 font-display">
          Welcome to Taskify AI Knowledge Explorer
        </h1>
        <p className="text-muted-foreground mb-6">
          Discover detailed information on any topic and generate high-quality PDF reports instantly
        </p>
        <SearchBar
          placeholder="Search for any topic to begin your exploration..."
          onSearch={handleSearch}
          className="mb-4"
        />

        {isLoadingSuggestions ? (
          <div className="flex justify-center">
            <LoadingSpinner size={24} text="Loading suggestions..." />
          </div>
        ) : suggestedTopics && 'topics' in suggestedTopics && Array.isArray(suggestedTopics.topics) ? (
          <div className="flex flex-wrap justify-center gap-2 mt-4">
            {suggestedTopics.topics.map((topic: string, index: number) => (
              <Badge
                key={index}
                variant="outline"
                className="cursor-pointer hover:bg-primary/10 transition-colors"
                onClick={() => handleSearch(topic)}
              >
                {topic}
              </Badge>
            ))}
          </div>
        ) : null}
      </motion.div>

      {recentTopics.length > 0 && (
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Recent Explorations</h2>
            <Link href="/history">
              <Button variant="ghost" size="sm" className="gap-1">
                View All <ArrowRight size={16} />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentTopics.slice(0, 3).map((topic) => (
              <TopicCard key={topic.id} topic={topic} />
            ))}
          </div>
        </section>
      )}

      {bookmarkedTopics.length > 0 && (
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Bookmarked Topics</h2>
            <Link href="/history?tab=bookmarks">
              <Button variant="ghost" size="sm" className="gap-1">
                View All <ArrowRight size={16} />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {bookmarkedTopics.slice(0, 3).map((topic) => (
              <TopicCard key={topic.id} topic={topic} />
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="text-xl font-semibold mb-4">Browse by Category</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category) => (
            <TopicCategory
              key={category.id}
              title={category.title}
              categoryId={category.id}
              icon={category.icon}
            />
          ))}
        </div>
      </section>

      <section>
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle>Generate Comprehensive PDF Reports</CardTitle>
            <CardDescription>
              Transform any topic into a professionally formatted PDF document
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="flex-1">
                <ul className="space-y-2 mb-4">
                  <li className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-primary/10 h-6 w-6 flex items-center justify-center p-0 rounded-full">
                      ✓
                    </Badge>
                    <span>Detailed information structured in sections</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-primary/10 h-6 w-6 flex items-center justify-center p-0 rounded-full">
                      ✓
                    </Badge>
                    <span>Professional formatting with table of contents</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-primary/10 h-6 w-6 flex items-center justify-center p-0 rounded-full">
                      ✓
                    </Badge>
                    <span>Ready to download, share or print</span>
                  </li>
                </ul>
                <Link href="/search">
                  <Button>
                    Start Generating Reports
                  </Button>
                </Link>
              </div>
              <div className="flex-1 flex justify-center">
                <div className="w-52 h-64 bg-card border border-border shadow-lg rounded-md flex items-center justify-center">
                  <FileText size={64} className="text-primary/50" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
