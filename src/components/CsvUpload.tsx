
import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface ProcessData {
  case_id: string;
  activity: string;
  timestamp: string;
  resource: string;
}

interface CsvUploadProps {
  onCsvUpload: (data: ProcessData[]) => void;
}

const CsvUpload: React.FC<CsvUploadProps> = ({ onCsvUpload }) => {
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [fileName, setFileName] = useState<string>('');

  const parseCsv = (csvText: string): ProcessData[] => {
    const lines = csvText.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/"/g, ''));
    
    // Check for required headers
    const requiredHeaders = ['case_id', 'activity', 'timestamp', 'resource'];
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
    
    if (missingHeaders.length > 0) {
      throw new Error(`Missing required columns: ${missingHeaders.join(', ')}`);
    }

    const data: ProcessData[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
      if (values.length === headers.length) {
        const row: any = {};
        headers.forEach((header, index) => {
          row[header] = values[index];
        });
        
        data.push({
          case_id: row.case_id,
          activity: row.activity,
          timestamp: row.timestamp,
          resource: row.resource
        });
      }
    }
    
    return data;
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setFileName(file.name);
    setUploadStatus('processing');

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csvText = e.target?.result as string;
        const parsedData = parseCsv(csvText);
        
        if (parsedData.length === 0) {
          throw new Error('No valid data found in CSV file');
        }

        setUploadStatus('success');
        onCsvUpload(parsedData);
        toast.success(`Successfully uploaded ${parsedData.length} records from ${file.name}`);
      } catch (error) {
        setUploadStatus('error');
        toast.error(`Error parsing CSV: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    };

    reader.readAsText(file);
  }, [onCsvUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.csv']
    },
    multiple: false
  });

  const getStatusIcon = () => {
    switch (uploadStatus) {
      case 'processing':
        return <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>;
      case 'success':
        return <CheckCircle className="h-8 w-8 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-8 w-8 text-red-500" />;
      default:
        return <Upload className="h-8 w-8 text-indigo-600" />;
    }
  };

  const getStatusText = () => {
    switch (uploadStatus) {
      case 'processing':
        return 'Processing your file...';
      case 'success':
        return `Successfully uploaded: ${fileName}`;
      case 'error':
        return 'Error uploading file. Please try again.';
      default:
        return 'Drop your CSV file here or click to browse';
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to <span className="bg-gradient-to-r from-indigo-600 to-indigo-700 bg-clip-text text-transparent">ProcessMiner</span>
          </h1>
          <p className="text-xl text-gray-600">
            Upload your process data to get started with advanced process mining analytics
          </p>
        </div>

        <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm hover:shadow-3xl transition-all duration-300 animate-scale-in">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-800 flex items-center justify-center gap-3">
              <FileText className="text-indigo-600" size={28} />
              CSV Data Upload
            </CardTitle>
            <p className="text-gray-600 mt-2">
              Upload a CSV file containing process data with the following columns:
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Required Format */}
            <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200">
              <h3 className="font-semibold text-indigo-800 mb-2">Required CSV Format:</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                <div className="bg-white rounded px-3 py-2 text-center font-medium text-indigo-700">case_id</div>
                <div className="bg-white rounded px-3 py-2 text-center font-medium text-indigo-700">activity</div>
                <div className="bg-white rounded px-3 py-2 text-center font-medium text-indigo-700">timestamp</div>
                <div className="bg-white rounded px-3 py-2 text-center font-medium text-indigo-700">resource</div>
              </div>
            </div>

            {/* Upload Area */}
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-300 ${
                isDragActive
                  ? 'border-indigo-500 bg-indigo-50 scale-105'
                  : uploadStatus === 'success'
                  ? 'border-green-400 bg-green-50'
                  : uploadStatus === 'error'
                  ? 'border-red-400 bg-red-50'
                  : 'border-gray-300 hover:border-indigo-400 hover:bg-indigo-50'
              }`}
            >
              <input {...getInputProps()} />
              <div className="flex flex-col items-center space-y-4">
                {getStatusIcon()}
                <div>
                  <p className="text-lg font-medium text-gray-700 mb-2">
                    {getStatusText()}
                  </p>
                  {uploadStatus === 'idle' && (
                    <p className="text-sm text-gray-500">
                      Supports CSV files up to 50MB
                    </p>
                  )}
                </div>
                {uploadStatus === 'idle' && (
                  <Button className="bg-indigo-600 hover:bg-indigo-700">
                    Choose File
                  </Button>
                )}
              </div>
            </div>

            {/* Sample Data Info */}
            <div className="bg-gray-50 rounded-lg p-4 border">
              <h3 className="font-semibold text-gray-800 mb-2">Sample Data Format:</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-3 font-medium">case_id</th>
                      <th className="text-left py-2 px-3 font-medium">activity</th>
                      <th className="text-left py-2 px-3 font-medium">timestamp</th>
                      <th className="text-left py-2 px-3 font-medium">resource</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-600">
                    <tr>
                      <td className="py-2 px-3">Case_001</td>
                      <td className="py-2 px-3">Start Process</td>
                      <td className="py-2 px-3">2024-01-01 09:00</td>
                      <td className="py-2 px-3">Agent_A</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3">Case_001</td>
                      <td className="py-2 px-3">Review Application</td>
                      <td className="py-2 px-3">2024-01-01 10:30</td>
                      <td className="py-2 px-3">Agent_B</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CsvUpload;
