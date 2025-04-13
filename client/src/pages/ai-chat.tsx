import { useState, useRef, useEffect, ChangeEvent } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { ArrowLeft, Send, Bot, User, Upload, FileText, X, File, Copy, Check, Sparkles, Square } from "lucide-react";
import { useGenerateResponse } from "@/hooks/use-prompts";
import { marked } from "marked";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  sender: 'user' | 'ai';
  content: string;
  timestamp: Date;
  attachments?: Array<{
    name: string;
    type: string;
    content: string;
  }>;
}

interface FileAttachment {
  name: string;
  type: string;
  content: string;
  size: number;
}

export default function AiChat() {
  const [_, setLocation] = useLocation();
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'ai',
      content: '# Welcome to Taskify AI Assistant! 👋\n\nI\'m your AI assistant, ready to help with any questions or tasks. I can provide detailed information, suggest ideas, or assist with problem-solving.\n\n**How can I help you today?**\n\n*Tip: You can upload files for analysis in the Files tab, and add custom prompts about what you want analyzed.*',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [activeTab, setActiveTab] = useState<string>("text");
  const [uploadedFiles, setUploadedFiles] = useState<FileAttachment[]>([]);
  const [isAnalyzingFile, setIsAnalyzingFile] = useState(false);
  const [fileAnalysisPrompt, setFileAnalysisPrompt] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const generateResponse = useGenerateResponse();
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (inputMessage.trim()) {
      // Add user message
      const userMessage: Message = {
        sender: 'user',
        content: inputMessage,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, userMessage]);
      setInputMessage("");
      setSendingMessage(true);
      
      // Add typing indicator message with sparkles
      const typingMessage: Message = {
        sender: 'ai',
        content: `<div class="thinking-animation">
          <div class="sparkle-container">
            <div class="sparkle" style="top: 20%; left: 15%;"></div>
            <div class="sparkle" style="top: 60%; left: 85%; animation-delay: 0.5s;"></div>
            <div class="sparkle" style="top: 30%; left: 50%; animation-delay: 1s;"></div>
            <div class="sparkle" style="top: 70%; left: 30%; animation-delay: 1.5s;"></div>
            <div class="sparkle" style="top: 10%; left: 70%; animation-delay: 2s;"></div>
          </div>
        </div>`,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, typingMessage]);
      
      // Only include a simple signature note
      const enhancedPrompt = inputMessage + "\n\nNote: You are Taskify AI, a helpful assistant.";
      
      // Generate AI response
      generateResponse.mutate(enhancedPrompt, {
        onSuccess: (data) => {
          // Remove the typing indicator message
          setMessages(prev => prev.slice(0, -1));
          
          const aiResponse: Message = {
            sender: 'ai',
            content: data.content,
            timestamp: new Date()
          };
          setMessages(prev => [...prev, aiResponse]);
          setSendingMessage(false);
        },
        onError: (error) => {
          // Remove the typing indicator message
          setMessages(prev => prev.slice(0, -1));
          setSendingMessage(false);
          
          // Add error message
          const errorMessage: Message = {
            sender: 'ai',
            content: "Sorry, I encountered an error while processing your request. Please try again.",
            timestamp: new Date()
          };
          setMessages(prev => [...prev, errorMessage]);
        }
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleSendMessage();
    }
  };

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    // Define allowed text file types
    const allowedTextTypes = [
      'text/plain', 'text/html', 'text/css', 'text/javascript',
      'text/markdown', 'text/csv', 'text/xml',
      'application/json', 'application/xml', 'application/javascript',
      'application/typescript', 'application/x-javascript',
      'application/x-typescript'
    ];
    
    // Define allowed image types
    const allowedImageTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp', 
      'image/svg+xml'
    ];
    
    // Define allowed extensions
    const allowedTextExtensions = [
      '.txt', '.js', '.jsx', '.ts', '.tsx', '.json', '.csv', '.xml', 
      '.html', '.css', '.md', '.py', '.java', '.c', '.cpp', '.h', 
      '.cs', '.php', '.rb', '.go'
    ];
    
    const allowedImageExtensions = [
      '.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'
    ];
    
    // Process each file
    Array.from(files).forEach(file => {
      // Check file size (limit to 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert(`File ${file.name} is too large. Maximum size is 5MB.`);
        return;
      }

      // Check if file is a supported type by extension
      const fileExt = '.' + file.name.split('.').pop()?.toLowerCase();
      const isTextFile = allowedTextExtensions.includes(fileExt);
      const isImageFile = allowedImageExtensions.includes(fileExt);
      
      if (!isTextFile && !isImageFile) {
        alert(`File type not supported: ${file.name}. Only text and image files are supported.`);
        return;
      }

      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          
          setUploadedFiles(prev => [
            ...prev,
            {
              name: file.name,
              type: file.type,
              content: content,
              size: file.size
            }
          ]);
        } catch (err) {
          console.error("Error processing file:", err);
          alert(`Could not read ${file.name}. Please try a different file.`);
        }
      };

      // Choose appropriate reader method based on file type
      if (isTextFile) {
        reader.readAsText(file);
      } else if (isImageFile) {
        reader.readAsDataURL(file);
      }
    });

    // Reset the input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const analyzeFiles = () => {
    if (uploadedFiles.length === 0) return;

    setIsAnalyzingFile(true);

    // Count different file types for better prompt creation
    const imageFiles = uploadedFiles.filter(file => file.type.startsWith('image/'));
    const textFiles = uploadedFiles.filter(file => !file.type.startsWith('image/'));
    
    // Create a more descriptive message with file attachments and custom prompt
    const fileNames = uploadedFiles.map(file => file.name).join(', ');
    
    // Include the custom analysis prompt if provided
    const customPrompt = fileAnalysisPrompt.trim() 
      ? `\n\nMy request: "${fileAnalysisPrompt}"`
      : '';
      
    const userMessage: Message = {
      sender: 'user',
      content: `I'm uploading ${uploadedFiles.length} file${uploadedFiles.length > 1 ? 's' : ''} (${textFiles.length} text file${textFiles.length !== 1 ? 's' : ''} and ${imageFiles.length} image file${imageFiles.length !== 1 ? 's' : ''}) for analysis: ${fileNames}${customPrompt}`,
      timestamp: new Date(),
      attachments: uploadedFiles.map(file => ({
        name: file.name,
        type: file.type,
        content: file.content
      }))
    };

    setMessages(prev => [...prev, userMessage]);

    // Prepare content from all files with better formatting
    let filesContent = "";
    
    // Process each file based on type with better formatting
    uploadedFiles.forEach((file, index) => {
      filesContent += `\n===== FILE ${index + 1}: ${file.name} =====\n`;
      
      if (file.type.startsWith('image/')) {
        // For images, just mention the file but don't include the base64 data
        filesContent += `[This is an image file of type ${file.type}]\n`;
      } else {
        // For text files, include the content with clear boundaries
        filesContent += `${file.content}\n`;
      }
      
      filesContent += `===== END OF FILE ${index + 1} =====\n\n`;
    });

    // Create an enhanced, more structured prompt that incorporates the user's custom instructions
    let prompt = `I've uploaded ${uploadedFiles.length} file${uploadedFiles.length > 1 ? 's' : ''} (${textFiles.length} text file${textFiles.length !== 1 ? 's' : ''} and ${imageFiles.length} image file${imageFiles.length !== 1 ? 's' : ''}) for analysis.`;
    
    // Add user's custom prompt if available
    if (fileAnalysisPrompt.trim()) {
      prompt += `\n\nHere's what I want you to do with these files: "${fileAnalysisPrompt}"\n`;
    } else {
      // Default instructions if no custom prompt is provided
      prompt += `\n\nPlease analyze the contents and provide:
1. A summary of each file
2. Key insights or information extracted
3. Any relationships between the files
4. Suggestions based on the file content`;
    }
    
    prompt += `\n\nFile contents:${filesContent}`;
    
    // Add a simple note about the assistant identity
    prompt += `\n\nNote: You are Taskify AI, a helpful assistant.`;

    // Add thinking/analyzing indicator
    const thinkingMessage: Message = {
      sender: 'ai',
      content: `<div class="thinking-animation">
        <div class="sparkle-container">
          <div class="sparkle" style="top: 20%; left: 15%;"></div>
          <div class="sparkle" style="top: 60%; left: 85%; animation-delay: 0.5s;"></div>
          <div class="sparkle" style="top: 30%; left: 50%; animation-delay: 1s;"></div>
          <div class="sparkle" style="top: 70%; left: 30%; animation-delay: 1.5s;"></div>
          <div class="sparkle" style="top: 10%; left: 70%; animation-delay: 2s;"></div>
        </div>
      </div>`,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, thinkingMessage]);
    
    // Generate AI response for the files
    generateResponse.mutate(prompt, {
      onSuccess: (data) => {
        // Remove the thinking indicator
        setMessages(prev => prev.slice(0, -1));
        
        const aiResponse: Message = {
          sender: 'ai',
          content: data.content,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiResponse]);
        setIsAnalyzingFile(false);
        setUploadedFiles([]);
        setActiveTab("text");
      },
      onError: (error) => {
        console.error("Error analyzing files:", error);
        
        // Remove the thinking indicator
        setMessages(prev => prev.slice(0, -1));
        
        // Add error message to the chat
        const errorMessage: Message = {
          sender: 'ai',
          content: "Sorry, I encountered an error while analyzing your files. Please try again with smaller or different files.",
          timestamp: new Date()
        };
        setMessages(prev => [...prev, errorMessage]);
        setIsAnalyzingFile(false);
      }
    });
  };

  return (
    <div className="min-h-screen bg-black text-white px-2 sm:px-4 py-3 sm:py-6">
      <div className="max-w-4xl mx-auto h-[calc(100vh-5rem)] flex flex-col">
        <Button 
          variant="ghost" 
          onClick={() => setLocation("/dashboard")}
          className="mb-3 sm:mb-6 hover:bg-gray-800 text-xs sm:text-sm"
          size="sm"
        >
          <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" /> Back to Dashboard
        </Button>
        
        <h1 className="text-xl sm:text-3xl font-bold mb-3 sm:mb-6 flex items-center">
          <Bot className="h-6 w-6 sm:h-8 sm:w-8 mr-2 sm:mr-3 text-purple-400" />
          AI Assistant Chat
        </h1>
        
        <Card className="bg-gray-900 border-gray-800 shadow-xl flex-1 flex flex-col">
          <CardHeader className="border-b border-gray-800 py-2 px-3 sm:p-4">
            <CardTitle className="text-base sm:text-xl text-white">Chat with Taskify AI</CardTitle>
          </CardHeader>
          
          <CardContent className="flex-1 overflow-y-auto py-2 sm:py-4 px-2 sm:px-6">
            <div className="space-y-3 sm:space-y-6">
              {messages.map((message, index) => (
                <div 
                  key={index} 
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-[85%] sm:max-w-[80%] rounded-lg px-3 py-2 sm:px-4 sm:py-3 ${
                      message.sender === 'user' 
                        ? 'bg-purple-600 text-white' 
                        : 'bg-gray-800 text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 sm:gap-2 mb-1">
                      <div className="flex items-center gap-1 sm:gap-2">
                        {message.sender === 'ai' ? (
                          <Bot className="h-3 w-3 sm:h-4 sm:w-4" />
                        ) : (
                          <User className="h-3 w-3 sm:h-4 sm:w-4" />
                        )}
                        <span className="text-[10px] sm:text-xs opacity-70">
                          {message.sender === 'ai' ? 'Taskify AI' : 'You'} • {formatTimestamp(message.timestamp)}
                        </span>
                      </div>
                      
                      {message.sender === 'ai' && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5 sm:h-6 sm:w-6 rounded-full hover:bg-gray-700"
                          onClick={() => {
                            navigator.clipboard.writeText(message.content);
                            setCopiedMessageId(index);
                            toast({
                              title: "Copied to clipboard",
                              description: "Message content has been copied to your clipboard",
                              duration: 2000,
                            });
                            setTimeout(() => setCopiedMessageId(null), 2000);
                          }}
                        >
                          {copiedMessageId === index ? (
                            <Check className="h-2 w-2 sm:h-3 sm:w-3 text-green-400" />
                          ) : (
                            <Copy className="h-2 w-2 sm:h-3 sm:w-3 text-gray-400" />
                          )}
                        </Button>
                      )}
                    </div>
                    {message.sender === 'ai' ? (
                      <div 
                        className="prose prose-invert max-w-none prose-xs sm:prose-sm text-xs sm:text-sm"
                        dangerouslySetInnerHTML={{ 
                          __html: marked(message.content) 
                        }} 
                      />
                    ) : (
                      <div className="whitespace-pre-wrap text-xs sm:text-sm">
                        {message.content}
                      </div>
                    )}
                    
                    {/* Display file attachments if any */}
                    {message.attachments && message.attachments.length > 0 && (
                      <div className="mt-1 sm:mt-2 pt-1 sm:pt-2 border-t border-gray-700">
                        <p className="text-[10px] sm:text-xs text-gray-400 mb-1">Attachments:</p>
                        <div className="flex flex-wrap gap-1 sm:gap-2">
                          {message.attachments.map((file, idx) => (
                            <div 
                              key={idx} 
                              className="flex items-center bg-gray-700 rounded-md px-1 py-0.5 sm:px-2 sm:py-1"
                            >
                              <File className="h-2 w-2 sm:h-3 sm:w-3 mr-1 text-gray-400" />
                              <span className="text-[10px] sm:text-xs truncate max-w-[100px] sm:max-w-none">
                                {file.name.length > 15 ? file.name.substring(0, 13) + '...' : file.name}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </CardContent>
          
          <CardFooter className="border-t border-gray-800 p-2 sm:p-4">
            <div className="flex flex-col w-full gap-1 sm:gap-2">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-2 mb-2 bg-gray-800">
                  <TabsTrigger value="text" className="data-[state=active]:bg-gray-700 py-1 sm:py-2 text-xs sm:text-sm">
                    <User className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" /> Text
                  </TabsTrigger>
                  <TabsTrigger value="files" className="data-[state=active]:bg-gray-700 py-1 sm:py-2 text-xs sm:text-sm">
                    <FileText className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" /> Files
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="text" className="mt-0">
                  <Textarea 
                    placeholder="Type your message here..." 
                    className="flex-1 min-h-[80px] sm:min-h-[100px] resize-none bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 placeholder:opacity-40 text-xs sm:text-sm"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={generateResponse.isPending}
                  />
                  <div className="flex justify-between items-center w-full mt-2">
                    <div className="text-[10px] sm:text-xs text-gray-500">
                      Press Ctrl+Enter to send
                    </div>
                    {generateResponse.isPending ? (
                      <Button
                        className="bg-red-600 hover:bg-red-700 h-8 sm:h-10 px-2 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm"
                        size="sm"
                        onClick={() => {
                          // Cancel the current response
                          generateResponse.reset();
                          // Remove the thinking indicator from messages
                          setMessages(prev => prev.filter(msg => 
                            !msg.content.includes('thinking-animation')
                          ));
                          setSendingMessage(false);
                          // Show a toast notification
                          toast({
                            title: "Response Canceled",
                            description: "AI response has been stopped.",
                            variant: "default",
                          });
                        }}
                      >
                        <Square className="h-3 w-3 sm:h-5 sm:w-5 mr-1 sm:mr-2" /> Stop
                      </Button>
                    ) : (
                      <Button
                        className="bg-purple-600 hover:bg-purple-700 h-8 sm:h-10 px-2 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm"
                        size="sm"
                        disabled={!inputMessage.trim() || generateResponse.isPending}
                        onClick={handleSendMessage}
                      >
                        <Send className="h-3 w-3 sm:h-5 sm:w-5 mr-1 sm:mr-2" /> Send
                      </Button>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="files" className="mt-0">
                  <div className="bg-gray-800 border border-gray-700 rounded-md p-2 sm:p-4">
                    <div className="flex flex-col items-center justify-center">
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        className="hidden"
                        multiple
                        accept=".txt,.js,.jsx,.ts,.tsx,.json,.csv,.xml,.html,.css,.md,.py,.java,.c,.cpp,.h,.cs,.php,.rb,.go,.jpg,.jpeg,.png,.gif,.webp,.svg"
                      />
                      
                      {uploadedFiles.length === 0 ? (
                        <div className="text-center">
                          <Upload className="h-8 w-8 sm:h-12 sm:w-12 mb-2 mx-auto text-gray-500" />
                          <p className="text-xs sm:text-sm text-gray-400 mb-2 sm:mb-4">Upload files or take a photo for AI analysis</p>
                          <div className="flex flex-col gap-2 justify-center">
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="bg-gray-700 hover:bg-gray-600 text-xs sm:text-sm"
                              onClick={() => fileInputRef.current?.click()}
                            >
                              <Upload className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" /> Select Files
                            </Button>

                          </div>
                          <p className="text-[10px] sm:text-xs text-gray-500 mt-2">
                            Supported: Text files and images
                          </p>
                        </div>
                      ) : (
                        <div className="w-full">
                          <div className="flex items-center justify-between mb-2 sm:mb-4">
                            <p className="text-xs sm:text-sm font-medium">{uploadedFiles.length} file(s) selected</p>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-6 sm:h-8 px-1 sm:px-2 text-[10px] sm:text-xs"
                              onClick={() => fileInputRef.current?.click()}
                            >
                              <Upload className="h-2 w-2 sm:h-3 sm:w-3 mr-1" /> Add More
                            </Button>
                          </div>
                          
                          <div className="space-y-1 sm:space-y-2 max-h-[100px] sm:max-h-[150px] overflow-y-auto mb-2 sm:mb-4">
                            {uploadedFiles.map((file, index) => (
                              <div key={index} className="flex items-center justify-between bg-gray-700 rounded p-1 sm:p-2">
                                <div className="flex items-center">
                                  <File className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 text-gray-400" />
                                  <span className="text-xs sm:text-sm truncate max-w-[120px] sm:max-w-[200px]">
                                    {file.name.length > 20 ? file.name.substring(0, 18) + '...' : file.name}
                                  </span>
                                </div>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-5 w-5 sm:h-6 sm:w-6 p-0 text-gray-400 hover:text-white hover:bg-gray-600 rounded-full"
                                  onClick={() => removeFile(index)}
                                >
                                  <X className="h-3 w-3 sm:h-4 sm:w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>

                          <div className="mb-2 sm:mb-4">
                            <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">
                              What would you like to analyze in these files?
                            </label>
                            <Textarea
                              placeholder="E.g., 'Summarize the content' or 'Analyze the code'..."
                              className="min-h-[60px] sm:min-h-[80px] bg-gray-700 border-gray-600 text-white resize-none placeholder:text-gray-500 placeholder:opacity-40 text-xs sm:text-sm"
                              value={fileAnalysisPrompt}
                              onChange={(e) => setFileAnalysisPrompt(e.target.value)}
                            />
                          </div>
                          
                          {isAnalyzingFile ? (
                            <Button 
                              className="w-full bg-red-600 hover:bg-red-700 text-xs sm:text-sm"
                              size="sm"
                              onClick={() => {
                                // Cancel the current response
                                generateResponse.reset();
                                // Remove the thinking indicator from messages
                                setMessages(prev => prev.filter(msg => 
                                  !msg.content.includes('thinking-animation')
                                ));
                                setIsAnalyzingFile(false);
                                // Show a toast notification
                                toast({
                                  title: "Analysis Canceled",
                                  description: "File analysis has been stopped.",
                                  variant: "default",
                                });
                              }}
                            >
                              <Square className="h-3 w-3 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
                              Stop Analysis
                            </Button>
                          ) : (
                            <Button 
                              className="w-full bg-purple-600 hover:bg-purple-700 text-xs sm:text-sm"
                              size="sm"
                              disabled={isAnalyzingFile || generateResponse.isPending}
                              onClick={analyzeFiles}
                            >
                              <FileText className="h-3 w-3 sm:h-5 sm:w-5 mr-1 sm:mr-2" /> 
                              Analyze Files
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}