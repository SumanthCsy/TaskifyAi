import { useState, useEffect } from 'react';
import { useLocation, Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Copy, CheckCircle, Download, ArrowLeft, Code, Share } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Highlight, themes } from 'prism-react-renderer';

interface CodeResultProps {
  code: string;
  language: string;
  title: string;
}

export default function CodeResult() {
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [codeData, setCodeData] = useState<CodeResultProps | null>(null);
  const [animationComplete, setAnimationComplete] = useState(false);
  
  useEffect(() => {
    // Get data from localStorage (passed from the code generator page)
    const savedData = localStorage.getItem('generatedCode');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        setCodeData(parsedData);
        
        // Start with animation
        const timer = setTimeout(() => {
          setAnimationComplete(true);
        }, 3000); // Animation duration
        
        return () => clearTimeout(timer);
      } catch (e) {
        console.error("Failed to parse code data", e);
        toast({
          title: 'Error',
          description: 'Failed to load code data.',
          variant: 'destructive',
        });
        navigate('/code-generator');
      }
    } else {
      // If no data, redirect back
      navigate('/code-generator');
    }
  }, []);

  function copyToClipboard() {
    if (codeData?.code) {
      navigator.clipboard.writeText(codeData.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      
      toast({
        title: 'Copied!',
        description: 'Code copied to clipboard.',
      });
    }
  }

  function downloadCode() {
    if (codeData?.code) {
      // Determine file extension
      const extension = getFileExtension(codeData.language);
      const blob = new Blob([codeData.code], { type: 'text/plain' });
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
  
  function getFileExtension(language: string): string {
    const extensionMap: Record<string, string> = {
      javascript: '.js',
      typescript: '.ts',
      python: '.py',
      java: '.java',
      csharp: '.cs',
      cpp: '.cpp',
      php: '.php',
      ruby: '.rb',
      go: '.go',
      rust: '.rs',
      swift: '.swift',
      kotlin: '.kt',
      html: '.html',
      css: '.css',
      sql: '.sql',
    };
    
    return extensionMap[language.toLowerCase()] || '.txt';
  }

  // Determine language for syntax highlighting
  const getLanguageForHighlight = (language: string): string => {
    const langMap: Record<string, string> = {
      javascript: 'jsx',
      typescript: 'tsx',
      python: 'python',
      java: 'java',
      csharp: 'csharp',
      cpp: 'cpp',
      php: 'php',
      ruby: 'ruby',
      go: 'go',
      rust: 'rust',
      swift: 'swift',
      kotlin: 'kotlin',
      html: 'html',
      css: 'css',
      sql: 'sql',
    };
    
    return langMap[language.toLowerCase()] || 'javascript';
  };

  if (!codeData) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <Code className="w-12 h-12 mx-auto mb-4 text-purple-500" />
          <h2 className="text-xl font-bold mb-4">Loading code...</h2>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white px-2 sm:px-4 py-4 sm:py-6">
      <div className="max-w-6xl mx-auto">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/code-generator')}
          className="mb-4 sm:mb-6 hover:bg-gray-800 text-sm sm:text-base"
          size="sm"
        >
          <ArrowLeft className="h-4 w-4 mr-1 sm:mr-2" /> Back to Generator
        </Button>
        
        <div className="mb-4 sm:mb-8">
          <motion.h1 
            className="text-2xl sm:text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-500"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {codeData.title || 'Generated Code'}
          </motion.h1>
          <motion.p 
            className="text-gray-400 text-sm sm:text-base"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Language: <span className="text-purple-400 font-semibold">{codeData.language || 'Auto-detected'}</span>
          </motion.p>
        </div>
        
        <Card className="bg-gray-900 border-gray-800 overflow-hidden">
          {!animationComplete ? (
            <div className="p-4 sm:p-8">
              <div className="h-6 sm:h-8 w-full max-w-full mx-auto relative overflow-hidden rounded-full bg-gray-800 mb-6 sm:mb-8">
                <motion.div 
                  className="h-full bg-gradient-to-r from-purple-600 via-blue-500 to-purple-600 shimmer"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 3, ease: "easeInOut" }}
                  onAnimationComplete={() => setAnimationComplete(true)}
                />
              </div>
              
              <motion.div 
                className="flex flex-wrap gap-1 sm:gap-2 mb-6 sm:mb-8 justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {['import', 'function', 'const', 'return', 'class', 'interface', 'async', 'await', 'try', 'export'].map((keyword, index) => (
                  <motion.div
                    key={keyword}
                    className="px-2 sm:px-3 py-1 rounded-full bg-gray-800 text-xs text-gray-300 inline-block"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ 
                      opacity: 1, 
                      scale: 1,
                      transition: { 
                        delay: index * 0.1,
                        type: "spring",
                        stiffness: 300
                      }
                    }}
                  >
                    {keyword}
                  </motion.div>
                ))}
              </motion.div>
              
              <div className="text-center mb-3 sm:mb-4">
                <motion.div 
                  className="relative inline-block"
                  animate={{
                    scale: [1, 1.1, 1],
                    rotate: [0, 2, -2, 0],
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                >
                  <Code className="h-10 w-10 sm:h-12 sm:w-12 text-purple-500" />
                  <motion.div
                    className="absolute -top-1 -right-1 w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-blue-500"
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0.7, 1, 0.7],
                    }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                </motion.div>
              </div>
              
              <motion.h3 
                className="text-lg sm:text-xl font-medium text-center text-white mb-1 sm:mb-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                Processing Your Code
              </motion.h3>
              
              <motion.p
                className="text-xs sm:text-sm text-center text-gray-400"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                Optimizing and formatting for readability...
              </motion.p>
            </div>
          ) : (
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", damping: 15 }}
              >
                <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-6 gap-3">
                  <div>
                    <CardTitle className="text-white text-lg sm:text-2xl">Code Result</CardTitle>
                    <CardDescription className="text-gray-400 text-xs sm:text-sm">
                      Language: {codeData.language || 'Auto-detected'}
                    </CardDescription>
                  </div>
                  <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-1/2 sm:w-auto">
                      <Button 
                        variant="secondary" 
                        size="sm"
                        onClick={copyToClipboard}
                        className="bg-gray-800 hover:bg-gray-700 text-xs sm:text-sm w-full sm:w-auto"
                      >
                        {copied ? (
                          <>
                            <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 text-green-500" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                            Copy
                          </>
                        )}
                      </Button>
                    </motion.div>
                    
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-1/2 sm:w-auto">
                      <Button 
                        variant="secondary" 
                        size="sm"
                        onClick={downloadCode}
                        className="bg-gray-800 hover:bg-gray-700 text-xs sm:text-sm w-full sm:w-auto"
                      >
                        <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                        Download
                      </Button>
                    </motion.div>
                  </div>
                </CardHeader>
                
                <CardContent className="p-2 sm:p-6">
                  <motion.div 
                    className="rounded-lg overflow-hidden border border-gray-800 shadow-lg"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <div className="bg-gray-800 px-2 sm:px-4 py-1 sm:py-2 flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex gap-1 sm:gap-1.5 mr-2 sm:mr-3">
                          <div className="h-2 w-2 sm:h-3 sm:w-3 rounded-full bg-red-500"></div>
                          <div className="h-2 w-2 sm:h-3 sm:w-3 rounded-full bg-yellow-500"></div>
                          <div className="h-2 w-2 sm:h-3 sm:w-3 rounded-full bg-green-500"></div>
                        </div>
                        <span className="text-xs sm:text-sm text-gray-400">
                          {codeData.language || 'code'}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 hidden sm:block">
                        {new Date().toLocaleDateString()}
                      </div>
                    </div>
                    
                    <div className="overflow-auto max-h-[300px] sm:max-h-[600px] bg-[#1e1e1e]">
                      <Highlight
                        theme={themes.vsDark}
                        code={codeData.code}
                        language={getLanguageForHighlight(codeData.language)}
                      >
                        {({ className, style, tokens, getLineProps, getTokenProps }) => (
                          <pre className="p-2 sm:p-4 overflow-auto text-xs sm:text-sm" style={style}>
                            {tokens.map((line, i) => (
                              <div key={i} {...getLineProps({ line })}>
                                <span className="inline-block w-6 sm:w-8 text-right pr-2 sm:pr-3 select-none opacity-50 text-xs">
                                  {i + 1}
                                </span>
                                {line.map((token, key) => (
                                  <span key={key} {...getTokenProps({ token })} />
                                ))}
                              </div>
                            ))}
                          </pre>
                        )}
                      </Highlight>
                    </div>
                  </motion.div>
                  
                  <div className="mt-4 sm:mt-8 flex flex-wrap justify-center gap-2">
                    <Button 
                      variant="outline" 
                      onClick={() => navigate('/code-generator')}
                      size="sm"
                      className="text-xs sm:text-sm"
                    >
                      <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                      Generate More
                    </Button>
                    
                    <Button 
                      variant="default" 
                      className="bg-purple-600 hover:bg-purple-700 text-xs sm:text-sm"
                      size="sm"
                      onClick={() => {
                        toast({
                          title: 'Great choice!',
                          description: 'Code has been saved to your account.',
                        });
                      }}
                    >
                      <Code className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                      Save Code
                    </Button>
                  </div>
                </CardContent>
              </motion.div>
            </AnimatePresence>
          )}
        </Card>
      </div>
    </div>
  );
}