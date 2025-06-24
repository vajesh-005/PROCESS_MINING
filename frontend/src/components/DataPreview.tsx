
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Table, Download } from 'lucide-react';

interface ProcessData {
  case_id: string;
  activity: string;
  timestamp: string;
  resource: string;
}

interface DataPreviewProps {
  data: ProcessData[];
}

const DataPreview: React.FC<DataPreviewProps> = ({ data }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(data.length / itemsPerPage);

  const getCurrentPageData = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return data.slice(startIndex, endIndex);
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      return new Date(timestamp).toLocaleString();
    } catch {
      return timestamp;
    }
  };

  const handleExport = () => {
    const csvContent = [
      'case_id,activity,timestamp,resource',
      ...data.map(row => `${row.case_id},${row.activity},${row.timestamp},${row.resource}`)
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'process_data.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (data.length === 0) {
    return null;
  }

  return (
    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm animate-fade-in">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Table className="text-indigo-600" size={24} />
            Data Preview ({data.length} records)
          </CardTitle>
          <Button
            onClick={handleExport}
            variant="outline"
            className="border-indigo-200 text-indigo-600 hover:bg-indigo-50"
          >
            <Download size={16} className="mr-2" />
            Export
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b-2 border-indigo-100">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Case ID</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Activity</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Timestamp</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Resource</th>
              </tr>
            </thead>
            <tbody>
              {getCurrentPageData().map((row, index) => (
                <tr
                  key={index}
                  className="border-b border-gray-100 hover:bg-indigo-50/50 transition-colors duration-150"
                >
                  <td className="py-3 px-4 text-gray-900 font-medium">{row.case_id}</td>
                  <td className="py-3 px-4 text-gray-700">{row.activity}</td>
                  <td className="py-3 px-4 text-gray-600 text-sm">{formatTimestamp(row.timestamp)}</td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                      {row.resource}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
            <div className="text-sm text-gray-600">
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, data.length)} of {data.length} entries
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="border-indigo-200"
              >
                <ChevronLeft size={16} />
                Previous
              </Button>
              <span className="px-3 py-1 text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="border-indigo-200"
              >
                Next
                <ChevronRight size={16} />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DataPreview;
