import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { useGenerateResponse, usePrompts, useSuggestedPrompts } from "@/hooks/use-prompts";
import { FileText, Star, Clock, ArrowRight, Send, Sparkles, File, FileSpreadsheet, Presentation, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";
import { Prompt } from "@shared/schema";

interface HomeProps {
  generatorType?: string;
}

export default function Home({ generatorType }: HomeProps) {
  const [_, setLocation] = useLocation();
  const [promptInput, setPromptInput] = useState("");
  const { data: recentPrompts, isLoading: isLoadingPrompts } = usePrompts();
  const { data: suggestedPrompts, isLoading: isLoadingSuggestions } = useSuggestedPrompts();
  const generateResponse = useGenerateResponse();

  const handleSubmitPrompt = () => {
    if (promptInput.trim()) {
      generateResponse.mutate(promptInput, {
        onSuccess: (data) => {
          setPromptInput("");
          setLocation(`/prompt/${data.id}`);
        }
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleSubmitPrompt();
    }
  };

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mx-auto max-w-3xl mb-8"
      >
        <h1 className="text-3xl font-bold mb-3 font-display">
          Welcome to Taskify AI
        </h1>
        <p className="text-muted-foreground mb-6">
          Get detailed information on any topic and generate high-quality PDF reports instantly
        </p>
        
        <Card className="bg-card border-border shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Ask Taskify AI Anything</CardTitle>
            <CardDescription>
              Type your question or prompt below to get a detailed response
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Textarea 
                placeholder="Example: Explain how solar panels work and their environmental benefits..." 
                className="min-h-[120px] resize-none"
                value={promptInput}
                onChange={(e) => setPromptInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={generateResponse.isPending}
              />
              <div className="text-xs text-muted-foreground text-right">
                Press Ctrl+Enter to submit
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button
              onClick={handleSubmitPrompt}
              disabled={!promptInput.trim() || generateResponse.isPending}
              className="gap-2"
            >
              {generateResponse.isPending ? (
                <>
                  <LoadingSpinner size={16} /> Generating...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" /> Generate Response
                </>
              )}
            </Button>
          </CardFooter>
        </Card>

        {isLoadingSuggestions ? (
          <div className="flex justify-center mt-4">
            <LoadingSpinner size={24} text="Loading suggestions..." />
          </div>
        ) : suggestedPrompts && Array.isArray(suggestedPrompts) ? (
          <div className="mt-4">
            <p className="text-sm text-muted-foreground mb-2">Try asking about:</p>
            <div className="flex flex-wrap justify-center gap-2">
              {suggestedPrompts.map((prompt: string, index: number) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="cursor-pointer hover:bg-primary/10 transition-colors"
                  onClick={() => setPromptInput(prompt)}
                >
                  {prompt}
                </Badge>
              ))}
            </div>
          </div>
        ) : null}
      </motion.div>

      {!isLoadingPrompts && recentPrompts && recentPrompts.length > 0 && (
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Clock className="h-5 w-5" /> Recent Prompts
            </h2>
            {recentPrompts.length > 3 && (
              <Link href="/history">
                <Button variant="ghost" size="sm" className="gap-1">
                  View All <ArrowRight size={16} />
                </Button>
              </Link>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentPrompts.slice(0, 3).map((prompt: Prompt) => (
              <Card key={prompt.id} className="h-full flex flex-col">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base line-clamp-1">
                    <Link href={`/prompt/${prompt.id}`}>
                      <a className="hover:text-primary cursor-pointer">{prompt.title}</a>
                    </Link>
                  </CardTitle>
                  <CardDescription className="text-xs">
                    {new Date(prompt.createdAt).toLocaleString()}
                  </CardDescription>
                </CardHeader>
                <CardContent className="py-2 flex-1">
                  <p className="text-sm line-clamp-2 text-muted-foreground mb-1">
                    <span className="font-medium">Prompt:</span> {prompt.prompt}
                  </p>
                  <p className="text-sm line-clamp-2">
                    {prompt.content.replace(/[#*`]/g, '').substring(0, 120)}...
                  </p>
                </CardContent>
                <CardFooter className="pt-2 flex justify-between">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="gap-1"
                    onClick={() => setLocation(`/prompt/${prompt.id}`)}
                  >
                    View <ArrowRight className="h-3 w-3" />
                  </Button>
                  {prompt.isFavorite && (
                    <Badge variant="outline" className="gap-1 bg-primary/5">
                      <Star className="h-3 w-3 fill-primary text-primary" /> Favorite
                    </Badge>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        </section>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* PDF Report Section */}
        <section>
          <Card className="bg-primary/5 border-primary/20 h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" /> PDF Reports
              </CardTitle>
              <CardDescription>
                Generate professionally formatted PDF documents
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center gap-4">
                <div className="w-32 h-40 bg-card border border-border shadow-lg rounded-md flex items-center justify-center">
                  <FileText size={40} className="text-primary/50" />
                </div>
                <ul className="space-y-2 w-full">
                  <li className="flex items-center gap-2 text-sm">
                    <Badge variant="outline" className="bg-primary/10 h-5 w-5 flex items-center justify-center p-0 rounded-full">
                      ✓
                    </Badge>
                    <span>Structured information in sections</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Badge variant="outline" className="bg-primary/10 h-5 w-5 flex items-center justify-center p-0 rounded-full">
                      ✓
                    </Badge>
                    <span>Professional formatting with clean layout</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Badge variant="outline" className="bg-primary/10 h-5 w-5 flex items-center justify-center p-0 rounded-full">
                      ✓
                    </Badge>
                    <span>Ready to download, share or print</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Excel Reports Section */}
        <section>
          <Card className="bg-primary/5 border-primary/20 h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5" /> Excel Spreadsheets
              </CardTitle>
              <CardDescription>
                Transform prompt responses into organized Excel files
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center gap-4">
                <div className="w-32 h-40 bg-card border border-border shadow-lg rounded-md flex items-center justify-center">
                  <FileSpreadsheet size={40} className="text-primary/50" />
                </div>
                <ul className="space-y-2 w-full">
                  <li className="flex items-center gap-2 text-sm">
                    <Badge variant="outline" className="bg-primary/10 h-5 w-5 flex items-center justify-center p-0 rounded-full">
                      ✓
                    </Badge>
                    <span>Data organized in structured tables</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Badge variant="outline" className="bg-primary/10 h-5 w-5 flex items-center justify-center p-0 rounded-full">
                      ✓
                    </Badge>
                    <span>Properly formatted cells and columns</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Badge variant="outline" className="bg-primary/10 h-5 w-5 flex items-center justify-center p-0 rounded-full">
                      ✓
                    </Badge>
                    <span>Download in Excel format (.xlsx)</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* PowerPoint Presentation Section */}
        <section>
          <Card className="bg-primary/5 border-primary/20 h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Presentation className="h-5 w-5" /> PowerPoint Presentations
              </CardTitle>
              <CardDescription>
                Create professional presentations from your prompts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center gap-4">
                <div className="w-32 h-40 bg-card border border-border shadow-lg rounded-md flex items-center justify-center">
                  <Presentation size={40} className="text-primary/50" />
                </div>
                <ul className="space-y-2 w-full">
                  <li className="flex items-center gap-2 text-sm">
                    <Badge variant="outline" className="bg-primary/10 h-5 w-5 flex items-center justify-center p-0 rounded-full">
                      ✓
                    </Badge>
                    <span>Clean slide layouts with key points</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Badge variant="outline" className="bg-primary/10 h-5 w-5 flex items-center justify-center p-0 rounded-full">
                      ✓
                    </Badge>
                    <span>Title, content, and summary slides</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Badge variant="outline" className="bg-primary/10 h-5 w-5 flex items-center justify-center p-0 rounded-full">
                      ✓
                    </Badge>
                    <span>Download in PowerPoint format (.pptx)</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* AI Chat Section */}
        <section>
          <Card className="bg-primary/5 border-primary/20 h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" /> Ask AI Chat
              </CardTitle>
              <CardDescription>
                Interactive conversations with our AI assistant
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center gap-4">
                <div className="w-32 h-40 bg-card border border-border shadow-lg rounded-md flex items-center justify-center">
                  <MessageSquare size={40} className="text-primary/50" />
                </div>
                <ul className="space-y-2 w-full">
                  <li className="flex items-center gap-2 text-sm">
                    <Badge variant="outline" className="bg-primary/10 h-5 w-5 flex items-center justify-center p-0 rounded-full">
                      ✓
                    </Badge>
                    <span>Real-time conversation with AI</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Badge variant="outline" className="bg-primary/10 h-5 w-5 flex items-center justify-center p-0 rounded-full">
                      ✓
                    </Badge>
                    <span>Follow-up questions and clarifications</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Badge variant="outline" className="bg-primary/10 h-5 w-5 flex items-center justify-center p-0 rounded-full">
                      ✓
                    </Badge>
                    <span>Persistent chat history for reference</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
