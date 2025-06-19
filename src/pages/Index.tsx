
import React, { useState, useEffect } from 'react';
import { Upload, BarChart3, GitBranch, CheckCircle, AlertTriangle, Menu, X, Moon, Sun } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTheme } from '@/contexts/ThemeContext';
import { useScroll } from '@/hooks/useScroll';
import CsvUpload from '@/components/CsvUpload';
import DataPreview from '@/components/DataPreview';
import ProcessFlow from '@/components/ProcessFlow';
import ConformanceAnalysis from '@/components/ConformanceAnalysis';
import RootCauseAnalysis from '@/components/RootCauseAnalysis';
import ChartsSection from '@/components/ChartsSection';

interface ProcessData {
  case_id: string;
  activity: string;
  timestamp: string;
  resource: string;
}

const Index = () => {
  const [csvData, setCsvData] = useState<ProcessData[]>([]);
  const [filteredData, setFilteredData] = useState<ProcessData[]>([]);
  const [activeTab, setActiveTab] = useState('upload');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    activity: '',
    resource: ''
  });

  const { theme, toggleTheme } = useTheme();
  const { isScrolled } = useScroll();

  // Handle CSV upload
  const handleCsvUpload = (data: ProcessData[]) => {
    setCsvData(data);
    setFilteredData(data);
    setActiveTab('overview');
  };

  // Apply filters
  useEffect(() => {
    let filtered = [...csvData];
    
    if (filters.dateFrom) {
      filtered = filtered.filter(row => new Date(row.timestamp) >= new Date(filters.dateFrom));
    }
    if (filters.dateTo) {
      filtered = filtered.filter(row => new Date(row.timestamp) <= new Date(filters.dateTo));
    }
    if (filters.activity) {
      filtered = filtered.filter(row => row.activity.includes(filters.activity));
    }
    if (filters.resource) {
      filtered = filtered.filter(row => row.resource.includes(filters.resource));
    }
    
    setFilteredData(filtered);
  }, [filters, csvData]);

  const navigation = [
    { id: 'upload', label: 'Upload', icon: Upload },
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'process-flow', label: 'Process Flow', icon: GitBranch },
    { id: 'conformance', label: 'Conformance', icon: CheckCircle },
    { id: 'root-cause', label: 'Root Cause', icon: AlertTriangle }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-indigo-50 dark:from-black dark:to-indigo-950 transition-colors duration-300">
      {/* Fixed Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-indigo-100 dark:border-indigo-900 shadow-lg' 
          : 'bg-white/95 dark:bg-black/95 backdrop-blur-sm border-b border-indigo-100 dark:border-indigo-900 shadow-sm'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-indigo-700 dark:from-indigo-400 dark:to-indigo-500 bg-clip-text text-transparent">
                  ProcessMiner
                </h1>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              <div className="flex items-baseline space-x-4">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                        activeTab === item.id
                          ? 'bg-indigo-600 text-white shadow-md'
                          : 'text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30'
                      }`}
                    >
                      <Icon size={16} />
                      {item.label}
                    </button>
                  );
                })}
              </div>
              
              {/* Theme Toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className="ml-2 text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400"
              >
                {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
              </Button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400"
              >
                {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
              </Button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 p-2"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-indigo-100 dark:border-indigo-900 bg-white/95 dark:bg-black/95 backdrop-blur-sm">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-md text-base font-medium transition-all duration-200 flex items-center gap-2 ${
                      activeTab === item.id
                        ? 'bg-indigo-600 text-white'
                        : 'text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30'
                    }`}
                  >
                    <Icon size={16} />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            {/* CSV Upload Tab */}
            <TabsContent value="upload" className="mt-0">
              <div className="animate-fade-in">
                <CsvUpload onCsvUpload={handleCsvUpload} />
              </div>
            </TabsContent>

            {/* Overview Tab */}
            <TabsContent value="overview" className="mt-0">
              <div className="animate-fade-in space-y-8">
                {csvData.length > 0 && (
                  <>
                    {/* Filters */}
                    <Card className="shadow-lg border-0 bg-white/80 dark:bg-black/80 backdrop-blur-sm border border-indigo-100 dark:border-indigo-900">
                      <CardHeader>
                        <CardTitle className="text-xl font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                          <BarChart3 className="text-indigo-600 dark:text-indigo-400" size={24} />
                          Data Filters
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">From Date</label>
                            <Input
                              type="date"
                              value={filters.dateFrom}
                              onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                              className="border-indigo-200 dark:border-indigo-800 focus:border-indigo-500 dark:focus:border-indigo-400 bg-white dark:bg-black"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">To Date</label>
                            <Input
                              type="date"
                              value={filters.dateTo}
                              onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                              className="border-indigo-200 dark:border-indigo-800 focus:border-indigo-500 dark:focus:border-indigo-400 bg-white dark:bg-black"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Activity</label>
                            <Input
                              placeholder="Filter by activity..."
                              value={filters.activity}
                              onChange={(e) => setFilters(prev => ({ ...prev, activity: e.target.value }))}
                              className="border-indigo-200 dark:border-indigo-800 focus:border-indigo-500 dark:focus:border-indigo-400 bg-white dark:bg-black"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Resource</label>
                            <Input
                              placeholder="Filter by resource..."
                              value={filters.resource}
                              onChange={(e) => setFilters(prev => ({ ...prev, resource: e.target.value }))}
                              className="border-indigo-200 dark:border-indigo-800 focus:border-indigo-500 dark:focus:border-indigo-400 bg-white dark:bg-black"
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Data Preview */}
                    <DataPreview data={filteredData} />

                    {/* Charts */}
                    <ChartsSection data={filteredData} />
                  </>
                )}
              </div>
            </TabsContent>

            {/* Process Flow Tab */}
            <TabsContent value="process-flow" className="mt-0">
              <div className="animate-fade-in">
                {csvData.length > 0 ? (
                  <ProcessFlow data={filteredData} />
                ) : (
                  <Card className="shadow-lg border-0 bg-white/80 dark:bg-black/80 backdrop-blur-sm border border-indigo-100 dark:border-indigo-900">
                    <CardContent className="flex items-center justify-center h-96">
                      <div className="text-center">
                        <GitBranch className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600 mb-4" />
                        <p className="text-gray-500 dark:text-gray-400">Upload CSV data to view process flow</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            {/* Conformance Tab */}
            <TabsContent value="conformance" className="mt-0">
              <div className="animate-fade-in">
                {csvData.length > 0 ? (
                  <ConformanceAnalysis data={filteredData} />
                ) : (
                  <Card className="shadow-lg border-0 bg-white/80 dark:bg-black/80 backdrop-blur-sm border border-indigo-100 dark:border-indigo-900">
                    <CardContent className="flex items-center justify-center h-96">
                      <div className="text-center">
                        <CheckCircle className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600 mb-4" />
                        <p className="text-gray-500 dark:text-gray-400">Upload CSV data to view conformance analysis</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            {/* Root Cause Tab */}
            <TabsContent value="root-cause" className="mt-0">
              <div className="animate-fade-in">
                {csvData.length > 0 ? (
                  <RootCauseAnalysis data={filteredData} />
                ) : (
                  <Card className="shadow-lg border-0 bg-white/80 dark:bg-black/80 backdrop-blur-sm border border-indigo-100 dark:border-indigo-900">
                    <CardContent className="flex items-center justify-center h-96">
                      <div className="text-center">
                        <AlertTriangle className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600 mb-4" />
                        <p className="text-gray-500 dark:text-gray-400">Upload CSV data to view root cause analysis</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Index;
