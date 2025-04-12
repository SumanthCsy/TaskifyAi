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
import { marked } from "marked";

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
      content: '# Welcome to Taskify AI Assistant! 👋\n\nI\'m your AI assistant, ready to help with any questions or tasks. I can provide detailed information, suggest ideas, or assist with problem-solving.\n\n**How can I help you today?**\n\n*Tip: You can also upload files for analysis using the file upload tab.*',
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
    
    // Create a more descriptive message with file attachments
    const fileNames = uploadedFiles.map(file => file.name).join(', ');
    const userMessage: Message = {
      sender: 'user',
      content: `I'm uploading ${uploadedFiles.length} file${uploadedFiles.length > 1 ? 's' : ''} (${textFiles.length} text file${textFiles.length !== 1 ? 's' : ''} and ${imageFiles.length} image file${imageFiles.length !== 1 ? 's' : ''}) for analysis: ${fileNames}`,
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

    // Create an enhanced, more structured prompt
    const prompt = `I've uploaded ${uploadedFiles.length} file${uploadedFiles.length > 1 ? 's' : ''} (${textFiles.length} text file${textFiles.length !== 1 ? 's' : ''} and ${imageFiles.length} image file${imageFiles.length !== 1 ? 's' : ''}) for analysis.

Please analyze the contents and provide:
1. A summary of each file
2. Key insights or information extracted
3. Any relationships between the files
4. Suggestions based on the file content

File contents:${filesContent}`;

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
      onError: (error) => {
        console.error("Error analyzing files:", error);
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
                    {message.sender === 'ai' ? (
                      <div 
                        className="prose prose-invert max-w-none prose-sm"
                        dangerouslySetInnerHTML={{ 
                          __html: marked(message.content) 
                        }} 
                      />
                    ) : (
                      <div className="whitespace-pre-wrap">
                        {message.content}
                      </div>
                    )}
                    
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
                        accept=".txt,.js,.jsx,.ts,.tsx,.json,.csv,.xml,.html,.css,.md,.py,.java,.c,.cpp,.h,.cs,.php,.rb,.go,.jpg,.jpeg,.png,.gif,.webp,.svg"
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
                            Supported formats: Text files (.txt, .js, .json, .csv, .html, etc.) and images (.jpg, .png, .gif)
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