import { useState, useRef, useEffect, ChangeEvent } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { ArrowLeft, Send, Bot, User, Upload, FileText, X, File } from "lucide-react";
import { useGenerateResponse } from "@/hooks/use-prompts";

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
      content: 'Hello! I\'m your AI assistant. How can I help you today?\nYou can also upload files for analysis by using the file upload tab.',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [activeTab, setActiveTab] = useState<string>("text");
  const [uploadedFiles, setUploadedFiles] = useState<FileAttachment[]>([]);
  const [isAnalyzingFile, setIsAnalyzingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const generateResponse = useGenerateResponse();

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
      
      // Generate AI response
      generateResponse.mutate(inputMessage, {
        onSuccess: (data) => {
          const aiResponse: Message = {
            sender: 'ai',
            content: data.content,
            timestamp: new Date()
          };
          setMessages(prev => [...prev, aiResponse]);
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

    // Process each file
    Array.from(files).forEach(file => {
      // Check file size (limit to 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert(`File ${file.name} is too large. Maximum size is 5MB.`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
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
      };

      if (file.type.startsWith('text/') || 
          file.type === 'application/json' || 
          file.type === 'application/xml' ||
          file.type === 'application/javascript') {
        reader.readAsText(file);
      } else {
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

    // Create a message with file attachments
    const fileNames = uploadedFiles.map(file => file.name).join(', ');
    const userMessage: Message = {
      sender: 'user',
      content: `Please analyze these files: ${fileNames}`,
      timestamp: new Date(),
      attachments: uploadedFiles.map(file => ({
        name: file.name,
        type: file.type,
        content: file.content
      }))
    };

    setMessages(prev => [...prev, userMessage]);

    // Extract text content from files to send to API
    const textContents = uploadedFiles
      .filter(file => 
        file.type.startsWith('text/') || 
        file.type === 'application/json' || 
        file.type === 'application/xml' ||
        file.type === 'application/javascript'
      )
      .map(file => `File: ${file.name}\nContent: ${file.content}`)
      .join('\n\n');

    const prompt = `Please analyze these files and provide insights:\n${textContents}`;

    // Generate AI response for the files
    generateResponse.mutate(prompt, {
      onSuccess: (data) => {
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
      onError: () => {
        setIsAnalyzingFile(false);
      }
    });
  };

  return (
    <div className="min-h-screen bg-black text-white px-4 py-6">
      <div className="max-w-4xl mx-auto h-[calc(100vh-6rem)] flex flex-col">
        <Button 
          variant="ghost" 
          onClick={() => setLocation("/dashboard")}
          className="mb-6 hover:bg-gray-800"
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
        </Button>
        
        <h1 className="text-3xl font-bold mb-6 flex items-center">
          <Bot className="h-8 w-8 mr-3 text-purple-400" />
          AI Assistant Chat
        </h1>
        
        <Card className="bg-gray-900 border-gray-800 shadow-xl flex-1 flex flex-col">
          <CardHeader className="border-b border-gray-800">
            <CardTitle className="text-xl text-white">Chat with Taskify AI</CardTitle>
          </CardHeader>
          
          <CardContent className="flex-1 overflow-y-auto py-4 px-6">
            <div className="space-y-6">
              {messages.map((message, index) => (
                <div 
                  key={index} 
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-[80%] rounded-lg px-4 py-3 ${
                      message.sender === 'user' 
                        ? 'bg-purple-600 text-white' 
                        : 'bg-gray-800 text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {message.sender === 'ai' ? (
                        <Bot className="h-4 w-4" />
                      ) : (
                        <User className="h-4 w-4" />
                      )}
                      <span className="text-xs opacity-70">
                        {message.sender === 'ai' ? 'Taskify AI' : 'You'} • {formatTimestamp(message.timestamp)}
                      </span>
                    </div>
                    <div 
                      className="whitespace-pre-wrap"
                      dangerouslySetInnerHTML={{ 
                        __html: message.content.replace(/\n/g, '<br/>') 
                      }} 
                    />
                    
                    {/* Display file attachments if any */}
                    {message.attachments && message.attachments.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-gray-700">
                        <p className="text-xs text-gray-400 mb-1">Attachments:</p>
                        <div className="flex flex-wrap gap-2">
                          {message.attachments.map((file, idx) => (
                            <div 
                              key={idx} 
                              className="flex items-center bg-gray-700 rounded-md px-2 py-1"
                            >
                              <File className="h-3 w-3 mr-1 text-gray-400" />
                              <span className="text-xs">{file.name}</span>
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
            
            {generateResponse.isPending && (
              <div className="flex justify-start mt-4">
                <div className="bg-gray-800 rounded-lg px-4 py-3 flex items-center">
                  <LoadingSpinner size={16} />
                  <span className="ml-2 text-sm text-gray-400">Taskify AI is thinking...</span>
                </div>
              </div>
            )}
          </CardContent>
          
          <CardFooter className="border-t border-gray-800 p-4">
            <div className="flex flex-col w-full gap-2">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-2 mb-2 bg-gray-800">
                  <TabsTrigger value="text" className="data-[state=active]:bg-gray-700">
                    <User className="h-4 w-4 mr-2" /> Text
                  </TabsTrigger>
                  <TabsTrigger value="files" className="data-[state=active]:bg-gray-700">
                    <FileText className="h-4 w-4 mr-2" /> Files
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="text" className="mt-0">
                  <Textarea 
                    placeholder="Type your message here..." 
                    className="flex-1 min-h-[100px] md:min-h-[80px] resize-none bg-gray-800 border-gray-700 text-white"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={generateResponse.isPending}
                  />
                  <div className="flex justify-between items-center w-full mt-2">
                    <div className="text-xs text-gray-500">
                      Press Ctrl+Enter to send
                    </div>
                    <Button
                      className="bg-purple-600 hover:bg-purple-700 h-10 px-4 py-2"
                      disabled={!inputMessage.trim() || generateResponse.isPending}
                      onClick={handleSendMessage}
                    >
                      <Send className="h-5 w-5 mr-2" /> Send
                    </Button>
                  </div>
                </TabsContent>
                
                <TabsContent value="files" className="mt-0">
                  <div className="bg-gray-800 border border-gray-700 rounded-md p-4">
                    <div className="flex flex-col items-center justify-center">
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        className="hidden"
                        multiple
                        accept=".txt,.js,.jsx,.ts,.tsx,.json,.csv,.xml,.html,.css,.md,.py,.java,.c,.cpp,.h,.cs,.php,.rb,.go"
                      />
                      
                      {uploadedFiles.length === 0 ? (
                        <div className="text-center">
                          <Upload className="h-12 w-12 mb-2 mx-auto text-gray-500" />
                          <p className="text-sm text-gray-400 mb-4">Upload files for AI analysis</p>
                          <Button 
                            variant="outline" 
                            className="bg-gray-700 hover:bg-gray-600"
                            onClick={() => fileInputRef.current?.click()}
                          >
                            <Upload className="h-4 w-4 mr-2" /> Select Files
                          </Button>
                          <p className="text-xs text-gray-500 mt-2">
                            Supported formats: .txt, .js, .json, .csv, .xml, .html, .css, .md, etc.
                          </p>
                        </div>
                      ) : (
                        <div className="w-full">
                          <div className="flex items-center justify-between mb-4">
                            <p className="text-sm font-medium">{uploadedFiles.length} file(s) selected</p>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 px-2 text-xs"
                              onClick={() => fileInputRef.current?.click()}
                            >
                              <Upload className="h-3 w-3 mr-1" /> Add More
                            </Button>
                          </div>
                          
                          <div className="space-y-2 max-h-[150px] overflow-y-auto mb-4">
                            {uploadedFiles.map((file, index) => (
                              <div key={index} className="flex items-center justify-between bg-gray-700 rounded p-2">
                                <div className="flex items-center">
                                  <File className="h-4 w-4 mr-2 text-gray-400" />
                                  <span className="text-sm truncate max-w-[200px]">{file.name}</span>
                                </div>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-6 w-6 p-0 text-gray-400 hover:text-white hover:bg-gray-600 rounded-full"
                                  onClick={() => removeFile(index)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                          
                          <Button 
                            className="w-full bg-purple-600 hover:bg-purple-700"
                            disabled={isAnalyzingFile || generateResponse.isPending}
                            onClick={analyzeFiles}
                          >
                            {isAnalyzingFile ? (
                              <>
                                <LoadingSpinner size={16} className="mr-2" />
                                Analyzing...
                              </>
                            ) : (
                              <>
                                <FileText className="h-5 w-5 mr-2" /> 
                                Analyze Files
                              </>
                            )}
                          </Button>
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