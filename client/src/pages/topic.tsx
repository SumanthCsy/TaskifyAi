import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import LoadingSpinner from "@/components/ui/loading-spinner";
import TopicVisualization from "@/components/ui/topic-visualization";
import ReportGenerator from "@/components/report/report-generator";
import { useTopicById } from "@/hooks/use-ai";
import { ArrowLeft, Bookmark, BookmarkCheck, Share2, FileText } from "lucide-react";
import { motion } from "framer-motion";

interface TopicPageProps {
  id: number;
}

export default function Topic({ id }: TopicPageProps) {
  const [location] = useLocation();
  const [showReport, setShowReport] = useState(false);
  const { data: topic, isLoading, error } = useTopicById(id);
  
  useEffect(() => {
    // Check URL parameters for report generation request
    const params = new URLSearchParams(window.location.search);
    if (params.get("report") === "true") {
      setShowReport(true);
    }
  }, [location]);
  
  if (isLoading) {
    return <LoadingSpinner text="Loading topic information..." />;
  }
  
  if (error || !topic) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold mb-2">Error Loading Topic</h2>
        <p className="text-muted-foreground mb-4">
          We couldn't load the requested topic. It may have been removed or you may have followed an invalid link.
        </p>
        <Button onClick={() => window.history.back()}>
          <ArrowLeft size={16} className="mr-2" /> Go Back
        </Button>
      </div>
    );
  }
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.history.back()}
          className="w-fit"
        >
          <ArrowLeft size={16} className="mr-2" /> Back
        </Button>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Bookmark size={16} className="mr-2" /> Bookmark
          </Button>
          
          <Button variant="outline" size="sm">
            <Share2 size={16} className="mr-2" /> Share
          </Button>
          
          <Button 
            size="sm"
            onClick={() => setShowReport(!showReport)}
          >
            <FileText size={16} className="mr-2" /> 
            {showReport ? "Hide Report" : "Generate Report"}
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <Badge className="mb-2">{topic.category}</Badge>
                  <CardTitle className="text-2xl">{topic.title}</CardTitle>
                  <CardDescription className="mt-2">
                    {new Date(topic.createdAt).toLocaleDateString()} • {topic.tags?.length || 0} tags
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-6">{topic.description}</p>
              
              <div className="prose prose-invert max-w-none">
                {topic.content.split('\n').map((paragraph, idx) => (
                  <p key={idx}>{paragraph}</p>
                ))}
              </div>
              
              {topic.tags && topic.tags.length > 0 && (
                <div className="mt-6 pt-6 border-t border-border">
                  <h3 className="text-sm font-medium mb-2">Related Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {topic.tags.map((tag, idx) => (
                      <Badge key={idx} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          {showReport && <ReportGenerator topic={topic} />}
        </div>
        
        <div className="space-y-6">
          <TopicVisualization 
            title={topic.title} 
            tags={topic.tags} 
            category={topic.category}
          />
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Related Information</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="related">
                <TabsList className="w-full">
                  <TabsTrigger value="related" className="flex-1">Related</TabsTrigger>
                  <TabsTrigger value="popular" className="flex-1">Popular</TabsTrigger>
                </TabsList>
                
                <TabsContent value="related" className="mt-4">
                  <ul className="space-y-3">
                    {[1, 2, 3].map((item) => (
                      <li key={item} className="border-b border-border pb-3 last:border-0">
                        <a href="#" className="hover:text-primary transition-colors">
                          Related Topic {item}
                        </a>
                        <p className="text-xs text-muted-foreground mt-1">
                          Brief description of the related topic.
                        </p>
                      </li>
                    ))}
                  </ul>
                </TabsContent>
                
                <TabsContent value="popular" className="mt-4">
                  <ul className="space-y-3">
                    {[1, 2, 3].map((item) => (
                      <li key={item} className="border-b border-border pb-3 last:border-0">
                        <a href="#" className="hover:text-primary transition-colors">
                          Popular Topic {item}
                        </a>
                        <p className="text-xs text-muted-foreground mt-1">
                          Brief description of the popular topic.
                        </p>
                      </li>
                    ))}
                  </ul>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Generate Report</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Create a comprehensive PDF report about this topic for download or sharing.
              </p>
              <Button 
                className="w-full"
                onClick={() => setShowReport(true)}
              >
                <FileText size={16} className="mr-2" /> 
                Generate PDF Report
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}
