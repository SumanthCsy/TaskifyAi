import { useState } from 'react';
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
import { Loader2, Code, Copy, CheckCircle, Download, ArrowLeft } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { marked } from 'marked';
import { useLocation } from 'wouter';

const formSchema = z.object({
  prompt: z.string().min(10, {
    message: 'Prompt must be at least 10 characters.',
  })
});

export default function CodeGenerator() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{code: string, explanation: string} | null>(null);
  const [activeTab, setActiveTab] = useState('code');
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
      // Create a stronger prompt for code generation
      const enhancedPrompt = `
      I need you to generate code based on this request: "${values.prompt}".
      
      Important instructions:
      1. Write the code inside a code block using markdown triple backticks with language specification
      2. After the code, include a detailed explanation of how the code works
      3. Make sure the code is complete, well-documented, and follows best practices
      4. Use proper formatting and syntax highlighting
      `;
      
      // Send to the standard generate endpoint
      const response = await apiRequest('/api/generate', {
        method: 'POST',
        body: JSON.stringify({ 
          prompt: enhancedPrompt
        }),
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
      
      // Remove code blocks to get the explanation
      let explanation = content.replace(/```[\s\S]*?```/g, '');
      
      // If somehow we still don't have code, extract it differently
      if (!code && content.includes('```')) {
        const parts = content.split('```');
        if (parts.length >= 3) {
          // The code is usually the second part (index 1) in a split by ```
          code = parts[1].trim();
          explanation = parts[0] + (parts.length > 2 ? parts.slice(2).join('') : '');
        }
      }
      
      // Set the result with code and explanation
      setResult({ 
        code: code || 'No code block detected in the response.', 
        explanation: explanation || 'No explanation provided.'
      });
      
      setActiveTab('code');
      
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
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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
              {result ? (
                <div className="space-y-4">
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 bg-gray-800">
                      <TabsTrigger value="code" className="data-[state=active]:bg-gray-700">Code</TabsTrigger>
                      <TabsTrigger value="explanation" className="data-[state=active]:bg-gray-700">Explanation</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="code" className="mt-4">
                      <div className="relative">
                        <pre className="rounded-md bg-black p-4 overflow-x-auto text-gray-100 max-h-[500px] overflow-y-auto">
                          <code>{result.code || 'No code generated yet.'}</code>
                        </pre>
                        
                        <div className="absolute top-2 right-2 flex gap-2">
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
                          
                          <Button 
                            variant="secondary" 
                            size="icon"
                            onClick={downloadCode}
                            disabled={!result.code}
                            className="bg-gray-800"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="explanation" className="mt-4">
                      <div className="rounded-md border border-gray-700 p-4 overflow-y-auto max-h-[500px]">
                        <div 
                          className="prose prose-invert max-w-none"
                          dangerouslySetInnerHTML={{ __html: marked(result.explanation || 'No explanation available.') }}
                        />
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              ) : (
                <div className="p-12 text-center">
                  <Code className="h-16 w-16 mb-4 mx-auto text-gray-500" />
                  <h3 className="text-lg font-medium text-white">No Code Generated</h3>
                  <p className="text-sm text-gray-400 mt-2 max-w-md mx-auto">
                    Fill out the form on the left with your code requirements and hit "Generate Code" to see your code appear here.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}