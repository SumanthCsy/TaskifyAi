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
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Code, Copy, CheckCircle, Download } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { marked } from 'marked';

const formSchema = z.object({
  prompt: z.string().min(10, {
    message: 'Prompt must be at least 10 characters.',
  }),
  language: z.string().min(1, {
    message: 'Please select a programming language.',
  }),
  codeType: z.string().min(1, {
    message: 'Please select a code type.',
  }),
});

export default function CodeGenerator() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{code: string, explanation: string} | null>(null);
  const [activeTab, setActiveTab] = useState('code');
  const [copied, setCopied] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: '',
      language: 'javascript',
      codeType: 'function',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      // Send to the code-specific API endpoint
      const response = await apiRequest('/api/generate/code', {
        method: 'POST',
        body: JSON.stringify({ 
          prompt: values.prompt,
          language: values.language,
          codeType: values.codeType
        }),
      });
      
      // Extract code and explanation from the generated response
      const content = response.content;
      
      // Parse the markdown response to separate code blocks from explanation
      const codeBlockRegex = /```[\w]*\n([\s\S]*?)```/g;
      const codeMatches = content.match(codeBlockRegex);
      
      let code = '';
      if (codeMatches && codeMatches.length > 0) {
        // Extract code from the first code block without the backticks
        code = codeMatches[0].replace(/```[\w]*\n|```/g, '');
      }
      
      // Remove code blocks from the content to get the explanation
      const explanation = content.replace(codeBlockRegex, '');
      
      setResult({ code, explanation });
      setActiveTab('code');
      
      toast({
        title: 'Code Generated',
        description: 'Your code has been successfully generated.',
      });
    } catch (error) {
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
      const language = form.getValues('language');
      const fileExtension = getFileExtension(language);
      const blob = new Blob([result.code], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `code${fileExtension}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    }
  }

  function getFileExtension(language: string): string {
    const extensions: Record<string, string> = {
      javascript: '.js',
      typescript: '.ts',
      python: '.py',
      java: '.java',
      csharp: '.cs',
      cpp: '.cpp',
      php: '.php',
      ruby: '.rb',
      go: '.go',
      swift: '.swift',
      kotlin: '.kt',
      rust: '.rs',
      html: '.html',
      css: '.css',
      sql: '.sql',
    };
    
    return extensions[language] || '.txt';
  }

  return (
    <div className="container max-w-5xl mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">AI Code Generator</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Code Requirements</CardTitle>
            <CardDescription>
              Describe what you need and customize the generation options
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
                      <FormLabel>What do you need?</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe the code you need. For example: A function that sorts an array of objects by a specific property"
                          className="min-h-[150px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Be as specific as possible about inputs, outputs, and functionality.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="language"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Programming Language</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select language" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="javascript">JavaScript</SelectItem>
                            <SelectItem value="typescript">TypeScript</SelectItem>
                            <SelectItem value="python">Python</SelectItem>
                            <SelectItem value="java">Java</SelectItem>
                            <SelectItem value="csharp">C#</SelectItem>
                            <SelectItem value="cpp">C++</SelectItem>
                            <SelectItem value="php">PHP</SelectItem>
                            <SelectItem value="ruby">Ruby</SelectItem>
                            <SelectItem value="go">Go</SelectItem>
                            <SelectItem value="swift">Swift</SelectItem>
                            <SelectItem value="kotlin">Kotlin</SelectItem>
                            <SelectItem value="rust">Rust</SelectItem>
                            <SelectItem value="html">HTML</SelectItem>
                            <SelectItem value="css">CSS</SelectItem>
                            <SelectItem value="sql">SQL</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="codeType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Code Type</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="function">Function</SelectItem>
                            <SelectItem value="class">Class</SelectItem>
                            <SelectItem value="component">Component</SelectItem>
                            <SelectItem value="script">Full Script</SelectItem>
                            <SelectItem value="api">API Endpoint</SelectItem>
                            <SelectItem value="algorithm">Algorithm</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
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
        
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Generated Code</CardTitle>
            <CardDescription>
              View and use your generated code
            </CardDescription>
          </CardHeader>
          <CardContent>
            {result ? (
              <div className="space-y-4">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="code">Code</TabsTrigger>
                    <TabsTrigger value="explanation">Explanation</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="code" className="mt-4">
                    <div className="relative">
                      <pre className="language-code rounded-md bg-black p-4 overflow-x-auto text-gray-100">
                        <code>{result.code || 'No code generated yet.'}</code>
                      </pre>
                      
                      <div className="absolute top-2 right-2 flex gap-2">
                        <Button 
                          variant="secondary" 
                          size="icon"
                          onClick={copyToClipboard}
                          disabled={!result.code}
                        >
                          {copied ? (
                            <CheckCircle className="h-4 w-4" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                        
                        <Button 
                          variant="secondary" 
                          size="icon"
                          onClick={downloadCode}
                          disabled={!result.code}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="explanation" className="mt-4">
                    <div className="rounded-md border p-4 overflow-y-auto max-h-[500px]">
                      <div 
                        className="prose max-w-none"
                        dangerouslySetInnerHTML={{ __html: marked(result.explanation || 'No explanation available.') }}
                      />
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            ) : (
              <div className="p-12 text-center">
                <Code className="h-12 w-12 mb-4 mx-auto text-gray-400" />
                <h3 className="text-lg font-medium">No Code Generated</h3>
                <p className="text-sm text-gray-500 mt-2">
                  Fill in the form on the left and click "Generate Code" to create your code.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}