import { useState } from 'react';
import { useLocation } from 'wouter';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { FileText, FileSpreadsheet, Presentation, Download, Eye, Plus, Search, ArrowLeft } from 'lucide-react';
import { usePrompts } from '@/hooks/use-prompts';
import { useGenerateReport } from '@/hooks/use-reports';
import { Prompt } from '@shared/schema';
import ReportGenerator from '@/components/report/report-generator';

export default function Reports() {
  const [_, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPromptId, setSelectedPromptId] = useState<number | null>(null);
  const [showGenerator, setShowGenerator] = useState(false);
  const { data: prompts, isLoading } = usePrompts();
  const generateReport = useGenerateReport();

  // Filter prompts by search query
  const filteredPrompts = prompts?.filter((prompt: Prompt) => 
    prompt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    prompt.prompt.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-3xl font-bold">Report Generator</h1>
          <p className="text-muted-foreground mt-1">
            Generate and manage professional reports in various formats
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button 
            onClick={() => setLocation('/dashboard')}
            variant="outline"
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Button>
        </div>
      </div>

      <Tabs defaultValue="generate" className="w-full">
        <TabsList className="grid w-full md:w-[400px] grid-cols-2">
          <TabsTrigger value="generate">Generate New Report</TabsTrigger>
          <TabsTrigger value="manage">Manage Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="generate" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Create a New Report</CardTitle>
              <CardDescription>
                Select a prompt to generate a report from or create a new one
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Search className="w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="Search prompts..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1"
                />
              </div>

              <div className="rounded-md border h-[300px] overflow-y-auto">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <LoadingSpinner size={24} />
                  </div>
                ) : filteredPrompts?.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center p-4">
                    <p className="text-muted-foreground mb-2">No prompts found</p>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setLocation('/home')}
                    >
                      <Plus className="h-4 w-4 mr-2" /> Create a New Prompt
                    </Button>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className="w-[100px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPrompts?.map((prompt: Prompt) => (
                        <TableRow 
                          key={prompt.id}
                          className={selectedPromptId === prompt.id ? "bg-muted" : ""}
                          onClick={() => setSelectedPromptId(prompt.id)}
                        >
                          <TableCell className="font-medium">{prompt.title}</TableCell>
                          <TableCell>
                            {new Date(prompt.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setLocation(`/prompt/${prompt.id}`);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t">
                <Button 
                  onClick={() => setShowGenerator(true)} 
                  disabled={!selectedPromptId}
                  className="gap-2"
                >
                  <FileText className="h-4 w-4" /> Generate Report
                </Button>
              </div>
            </CardContent>
          </Card>

          {showGenerator && selectedPromptId && (
            <Card>
              <CardHeader>
                <CardTitle>Report Generator</CardTitle>
                <CardDescription>
                  Generate a report from the selected prompt
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ReportGenerator promptId={selectedPromptId} />
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="manage" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Your Reports</CardTitle>
              <CardDescription>
                Manage and download all your generated reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center text-center">
                      <FileText className="h-12 w-12 text-primary mb-4" />
                      <h3 className="font-medium text-lg">PDF Reports</h3>
                      <p className="text-sm text-muted-foreground mt-1 mb-4">
                        Professionally formatted PDF documents
                      </p>
                      <Button className="w-full mt-auto">
                        <Download className="h-4 w-4 mr-2" /> Download Latest
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center text-center">
                      <FileSpreadsheet className="h-12 w-12 text-primary mb-4" />
                      <h3 className="font-medium text-lg">Excel Spreadsheets</h3>
                      <p className="text-sm text-muted-foreground mt-1 mb-4">
                        Organized data in Excel format
                      </p>
                      <Button className="w-full mt-auto">
                        <Download className="h-4 w-4 mr-2" /> Download Latest
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center text-center">
                      <Presentation className="h-12 w-12 text-primary mb-4" />
                      <h3 className="font-medium text-lg">PowerPoint Presentations</h3>
                      <p className="text-sm text-muted-foreground mt-1 mb-4">
                        Visual presentations in PowerPoint
                      </p>
                      <Button className="w-full mt-auto">
                        <Download className="h-4 w-4 mr-2" /> Download Latest
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}