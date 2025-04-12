import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Code, Copy, CheckCircle, Download, ArrowLeft, Sparkles } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { marked } from 'marked';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import LoadingSpinner from '@/components/ui/loading-spinner';

const formSchema = z.object({
  prompt: z.string().min(10, {
    message: 'Prompt must be at least 10 characters.',
  })
});

export default function CodeGenerator() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{code: string} | null>(null);
  const [copied, setCopied] = useState(false);
  const [_, setLocation] = useLocation();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: ''
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      // Attempt to detect language from prompt
      const prompt = values.prompt;
      let detectedLanguage = "code";
      
      const languagePatterns = [
        { pattern: /python|\.py/i, language: "python" },
        { pattern: /javascript|js|node/i, language: "javascript" },
        { pattern: /typescript|ts/i, language: "typescript" },
        { pattern: /java\b|\.java/i, language: "java" },
        { pattern: /html/i, language: "html" },
        { pattern: /css/i, language: "css" },
        { pattern: /c\+\+|cpp/i, language: "cpp" },
        { pattern: /c#|csharp|\.cs/i, language: "csharp" },
        { pattern: /php/i, language: "php" },
        { pattern: /ruby|\.rb/i, language: "ruby" },
        { pattern: /go\b|golang/i, language: "go" },
        { pattern: /rust|\.rs/i, language: "rust" },
        { pattern: /swift/i, language: "swift" },
        { pattern: /sql/i, language: "sql" }
      ];
      
      for (const lang of languagePatterns) {
        if (lang.pattern.test(prompt)) {
          detectedLanguage = lang.language;
          break;
        }
      }

      // Create a stronger prompt for code generation
      const enhancedPrompt = `Generate only code for the following request without explanation or comments: ${prompt}. 
      Return only the code as a code block with language identifier, no explanations.
      If multiple code files are needed, identify each with a filename comment at the top.`;
      
      // Use the dedicated code generation endpoint
      const response = await apiRequest('/api/generate', {
        method: 'POST',
        body: JSON.stringify({ 
          prompt: enhancedPrompt
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      // Extract code and explanation from the generated response
      const content = response.content;
      
      // Look for code blocks with or without language specification
      const codeBlockRegex = /```([a-zA-Z0-9]*)\n([\s\S]*?)```/g;
      let match;
      let code = '';
      
      // Extract the first code block found
      if ((match = codeBlockRegex.exec(content)) !== null) {
        code = match[2]; // The second capturing group contains the code
      }
      
      // If no code block is found, try a simpler pattern
      if (!code) {
        const simpleCodeBlockRegex = /```([\s\S]*?)```/g;
        const simpleMatch = simpleCodeBlockRegex.exec(content);
        if (simpleMatch) {
          code = simpleMatch[1]; // The first capturing group contains the code
        }
      }
      
      // If we still don't have code, look for sections
      if (!code) {
        const codeSectionRegex = /CODE:\s*\n([\s\S]*?)(?=EXPLANATION:|$)/i;
        const codeSectionMatch = codeSectionRegex.exec(content);
        if (codeSectionMatch && codeSectionMatch[1]) {
          code = codeSectionMatch[1].trim();
        }
      }
      
      // If somehow we still don't have code, extract it differently
      if (!code && content.includes('```')) {
        const parts = content.split('```');
        if (parts.length >= 3) {
          // The code is usually the second part (index 1) in a split by ```
          code = parts[1].trim();
        }
      }
      
      // If all extraction methods fail, use the entire content as code
      if (!code && content) {
        code = content.trim();
      }
      
      // Set the result with code only
      setResult({ 
        code: code || 'No code block detected in the response.'
      });
      
      toast({
        title: 'Code Generated',
        description: 'Your code has been successfully generated.',
      });
    } catch (error) {
      console.error("Code generation error:", error);
      toast({
        title: 'Error',
        description: 'Failed to generate code. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  function copyToClipboard() {
    if (result?.code) {
      navigator.clipboard.writeText(result.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      
      toast({
        title: 'Copied!',
        description: 'Code copied to clipboard.',
      });
    }
  }

  function downloadCode() {
    if (result?.code) {
      // Attempt to detect language from code content or default to .txt
      const extension = detectLanguageExtension(result.code);
      const blob = new Blob([result.code], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `code${extension}`;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }, 100);
    }
  }

  function detectLanguageExtension(code: string): string {
    // Simple language detection based on code patterns
    if (code.includes('def ') && (code.includes('print(') || code.includes('return '))) {
      return '.py'; // Python
    } else if (code.includes('function') && (code.includes('const ') || code.includes('let '))) {
      return '.js'; // JavaScript
    } else if (code.includes('class') && code.includes('public static void main')) {
      return '.java'; // Java
    } else if (code.includes('import React') || code.includes('export default')) {
      return '.jsx'; // React/JSX
    } else if (code.includes('<html') || code.includes('<!DOCTYPE')) {
      return '.html'; // HTML
    } else if (code.includes('using System;') || code.includes('namespace ')) {
      return '.cs'; // C#
    } else if (code.includes('#include <') || code.includes('std::')) {
      return '.cpp'; // C++
    } else {
      return '.txt'; // Default
    }
  }

  return (
    <div className="min-h-screen bg-black text-white px-4 py-6">
      <div className="max-w-5xl mx-auto">
        <Button 
          variant="ghost" 
          onClick={() => setLocation('/dashboard')}
          className="mb-6 hover:bg-gray-800"
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
        </Button>
        
        <h1 className="text-3xl font-bold mb-6">AI Code Generator</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-1 bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Code Requirements</CardTitle>
              <CardDescription className="text-gray-400">
                Describe what you need and get production-ready code
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="prompt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-200">What code do you need?</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe the code you need. For example: Create a Python function that sorts an array of objects by a specific property"
                            className="min-h-[200px] bg-gray-800 border-gray-700 text-white"
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription className="text-gray-400">
                          Be specific about language, inputs, outputs, and functionality.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="rounded-md bg-gray-800 p-4 text-sm text-gray-300">
                    <p className="font-medium mb-2">Tips for better results:</p>
                    <ul className="space-y-1 list-disc pl-5">
                      <li>Specify the programming language (Python, JavaScript, etc.)</li>
                      <li>Include details about inputs and outputs</li>
                      <li>Mention required features or functionality</li>
                      <li>Describe edge cases to be handled</li>
                    </ul>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-purple-600 hover:bg-purple-700"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Sparkles className="mr-2 h-4 w-4 text-yellow-300" />
                        Generating Code...
                      </>
                    ) : (
                      <>
                        <Code className="mr-2 h-4 w-4" />
                        Generate Code
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
          
          <Card className="md:col-span-2 bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Generated Code</CardTitle>
              <CardDescription className="text-gray-400">
                View, copy, and download your code
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <motion.div 
                  className="p-12 flex flex-col items-center justify-center text-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="relative mb-6">
                    <LoadingSpinner type="sparkles" size={56} className="mb-2" />
                    <motion.div 
                      className="absolute top-0 left-0 w-full h-full"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: [0, 0.5, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Sparkles className="h-8 w-8 text-purple-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                    </motion.div>
                  </div>
                  
                  <h3 className="text-xl font-medium text-white mb-3">Generating Your Code</h3>
                  
                  <div className="text-sm text-gray-300 max-w-md mx-auto mb-6">
                    Our AI is writing high-quality, optimized code based on your requirements...
                  </div>
                  
                  <div className="w-full max-w-md mx-auto h-8 relative overflow-hidden rounded-full bg-gray-800">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-purple-600 via-blue-500 to-purple-600 shimmer"
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 15, ease: "easeInOut" }}
                    />
                  </div>
                  
                  <div className="mt-8 flex flex-wrap justify-center gap-2">
                    {['import', 'function', 'const', 'return', 'class', 'interface', 'async', 'await', 'try', 'export'].map((keyword, index) => (
                      <motion.div
                        key={keyword}
                        className="px-3 py-1 rounded-full bg-gray-800 text-xs text-gray-300"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 + 0.5 }}
                      >
                        {keyword}
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              ) : result ? (
                <AnimatePresence mode="wait">
                  <motion.div 
                    className="space-y-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: "spring", stiffness: 100 }}
                    key="result"
                  >
                    <div className="relative">
                      <pre className="rounded-md bg-black p-4 overflow-x-auto text-gray-100 max-h-[500px] overflow-y-auto">
                        <code>{result.code || 'No code generated yet.'}</code>
                      </pre>
                      
                      <div className="absolute top-2 right-2 flex gap-2">
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Button 
                            variant="secondary" 
                            size="icon"
                            onClick={copyToClipboard}
                            disabled={!result.code}
                            className="bg-gray-800"
                          >
                            {copied ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </motion.div>
                        
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Button 
                            variant="secondary" 
                            size="icon"
                            onClick={downloadCode}
                            disabled={!result.code}
                            className="bg-gray-800"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </motion.div>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              ) : (
                <motion.div 
                  className="p-12 text-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <Code className="h-16 w-16 mb-4 mx-auto text-gray-500" />
                  <h3 className="text-lg font-medium text-white">No Code Generated</h3>
                  <p className="text-sm text-gray-400 mt-2 max-w-md mx-auto">
                    Fill out the form on the left with your code requirements and hit "Generate Code" to see your code appear here.
                  </p>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}