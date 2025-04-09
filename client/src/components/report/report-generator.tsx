import { useState } from 'react';
import { useGenerateReport, usePromptReports } from '@/hooks/use-reports';
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
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Download, Clock } from 'lucide-react';
import { generateAndDownloadPdf } from '@/lib/pdf-generator';
import { Report } from '@shared/schema';

const formSchema = z.object({
  title: z.string().min(1, {
    message: 'Report title is required.',
  }),
});

interface ReportGeneratorProps {
  promptId: number;
}

export default function ReportGenerator({ promptId }: ReportGeneratorProps) {
  const generateReport = useGenerateReport();
  const { data: reports, isLoading } = usePromptReports(promptId);
  const [generatingReport, setGeneratingReport] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    setGeneratingReport(true);
    generateReport.mutate(
      {
        promptId,
        title: values.title,
      },
      {
        onSettled: () => {
          setGeneratingReport(false);
          form.reset();
        },
      }
    );
  }

  function handleDownload(report: Report) {
    generateAndDownloadPdf(report.title, report.content);
  }

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Report Title</FormLabel>
                <FormControl>
                  <Input placeholder="Enter a title for your report" {...field} />
                </FormControl>
                <FormDescription>
                  This will be used as the title of your PDF report.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button 
            type="submit" 
            disabled={generateReport.isPending || generatingReport}
          >
            {generateReport.isPending || generatingReport ? (
              <>Generating Report...</>
            ) : (
              <>Generate PDF Report</>
            )}
          </Button>
        </form>
      </Form>

      {reports && reports.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">Previous Reports</h3>
          <Separator className="my-4" />
          <div className="space-y-4">
            {reports.map((report: Report) => (
              <Card key={report.id}>
                <CardContent className="p-4 flex justify-between items-center">
                  <div>
                    <h4 className="font-medium">{report.title}</h4>
                    <p className="text-sm text-muted-foreground flex items-center mt-1">
                      <Clock className="w-3 h-3 mr-1" />
                      {new Date(report.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDownload(report)}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}