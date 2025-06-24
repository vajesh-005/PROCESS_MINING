
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Clock, Users, Zap, TrendingDown } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line } from 'recharts';

interface ProcessData {
  case_id: string;
  activity: string;
  timestamp: string;
  resource: string;
}

interface RootCauseAnalysisProps {
  data: ProcessData[];
}

const RootCauseAnalysis: React.FC<RootCauseAnalysisProps> = ({ data }) => {
  const analysisData = useMemo(() => {
    // Analyze bottlenecks
    const activityDurations = new Map<string, number[]>();
    const resourceWorkload = new Map<string, number>();
    const resourceErrors = new Map<string, number>();
    
    // Group by case for duration analysis
    const caseGroups = data.reduce((acc, row) => {
      if (!acc[row.case_id]) {
        acc[row.case_id] = [];
      }
      acc[row.case_id].push(row);
      return acc;
    }, {} as Record<string, ProcessData[]>);

    // Sort activities by timestamp for each case
    Object.keys(caseGroups).forEach(caseId => {
      caseGroups[caseId].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    });

    // Calculate durations and workloads
    Object.values(caseGroups).forEach(caseActivities => {
      caseActivities.forEach((activity, index) => {
        // Resource workload
        resourceWorkload.set(activity.resource, (resourceWorkload.get(activity.resource) || 0) + 1);
        
        // Mock some resource errors for demonstration
        if (Math.random() < 0.1) { // 10% error rate for demo
          resourceErrors.set(activity.resource, (resourceErrors.get(activity.resource) || 0) + 1);
        }

        if (index > 0) {
          const prevActivity = caseActivities[index - 1];
          const duration = Math.abs(new Date(activity.timestamp).getTime() - new Date(prevActivity.timestamp).getTime()) / (1000 * 60 * 60); // hours
          
          const key = `${prevActivity.activity} → ${activity.activity}`;
          if (!activityDurations.has(key)) {
            activityDurations.set(key, []);
          }
          activityDurations.get(key)!.push(duration);
        }
      });
    });

    // Identify bottlenecks (activities with high average duration)
    const bottlenecks = Array.from(activityDurations.entries())
      .map(([transition, durations]) => ({
        transition,
        avgDuration: durations.reduce((sum, d) => sum + d, 0) / durations.length,
        maxDuration: Math.max(...durations),
        occurrences: durations.length,
        variability: Math.sqrt(durations.reduce((sum, d) => sum + Math.pow(d - (durations.reduce((s, d) => s + d, 0) / durations.length), 2), 0) / durations.length)
      }))
      .sort((a, b) => b.avgDuration - a.avgDuration)
      .slice(0, 8);

    // Resource performance analysis
    const resourcePerformance = Array.from(resourceWorkload.entries())
      .map(([resource, workload]) => ({
        resource,
        workload,
        errors: resourceErrors.get(resource) || 0,
        errorRate: workload > 0 ? ((resourceErrors.get(resource) || 0) / workload * 100) : 0
      }))
      .sort((a, b) => b.errorRate - a.errorRate);

    // Categorize issues
    const issueCategories = [
      {
        category: 'Process Bottlenecks',
        count: bottlenecks.filter(b => b.avgDuration > 2).length,
        severity: 'high',
        color: '#ef4444'
      },
      {
        category: 'Resource Overload',
        count: resourcePerformance.filter(r => r.workload > 10).length,
        severity: 'medium',
        color: '#f59e0b'
      },
      {
        category: 'Quality Issues',
        count: resourcePerformance.filter(r => r.errorRate > 5).length,
        severity: 'high',
        color: '#ef4444'
      },
      {
        category: 'Timing Variability',
        count: bottlenecks.filter(b => b.variability > 1).length,
        severity: 'low',
        color: '#10b981'
      }
    ];

    // Time-based trend analysis (mock data for demonstration)
    const trendData = Array.from({ length: 7 }, (_, i) => ({
      date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toLocaleDateString(),
      issues: Math.floor(Math.random() * 10) + 5,
      resolved: Math.floor(Math.random() * 8) + 3
    }));

    return {
      bottlenecks,
      resourcePerformance,
      issueCategories,
      trendData
    };
  }, [data]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high': return <AlertTriangle size={16} className="text-red-500" />;
      case 'medium': return <Clock size={16} className="text-yellow-500" />;
      case 'low': return <Zap size={16} className="text-green-500" />;
      default: return <Users size={16} className="text-gray-500" />;
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Root Cause Analysis</h2>
        <p className="text-gray-600">Identify and analyze process bottlenecks and performance issues</p>
      </div>

      {/* Issue Categories Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {analysisData.issueCategories.map((category, index) => (
          <Card key={index} className="shadow-lg border-0 bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                {getSeverityIcon(category.severity)}
                <Badge className={getSeverityColor(category.severity)}>
                  {category.severity}
                </Badge>
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">{category.category}</h3>
              <p className="text-2xl font-bold text-gray-900">{category.count}</p>
              <p className="text-sm text-gray-600">Issues identified</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Issue Distribution */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <AlertTriangle className="text-red-600" size={20} />
              Issue Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analysisData.issueCategories}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="count"
                    nameKey="category"
                  >
                    {analysisData.issueCategories.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2">
              {analysisData.issueCategories.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                    <span className="text-sm font-medium text-gray-700">{item.category}</span>
                  </div>
                  <span className="text-sm text-gray-600">{item.count} issues</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Issue Trends */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <TrendingDown className="text-indigo-600" size={20} />
              Issue Trends (Last 7 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analysisData.trendData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="date" fontSize={12} stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="issues" 
                    stroke="#ef4444" 
                    strokeWidth={3}
                    name="New Issues"
                    dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="resolved" 
                    stroke="#10b981" 
                    strokeWidth={3}
                    name="Resolved Issues"
                    dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Process Bottlenecks */}
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Clock className="text-orange-600" size={20} />
            Process Bottlenecks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-3 font-medium text-gray-700">Transition</th>
                  <th className="text-left py-2 px-3 font-medium text-gray-700">Avg Duration</th>
                  <th className="text-left py-2 px-3 font-medium text-gray-700">Max Duration</th>
                  <th className="text-left py-2 px-3 font-medium text-gray-700">Occurrences</th>
                  <th className="text-left py-2 px-3 font-medium text-gray-700">Variability</th>
                  <th className="text-left py-2 px-3 font-medium text-gray-700">Severity</th>
                </tr>
              </thead>
              <tbody>
                {analysisData.bottlenecks.map((bottleneck, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-3 text-sm font-medium text-gray-800 max-w-xs truncate">
                      {bottleneck.transition}
                    </td>
                    <td className="py-3 px-3 text-sm text-gray-600">
                      {Math.round(bottleneck.avgDuration * 10) / 10}h
                    </td>
                    <td className="py-3 px-3 text-sm text-gray-600">
                      {Math.round(bottleneck.maxDuration * 10) / 10}h
                    </td>
                    <td className="py-3 px-3">
                      <Badge variant="outline" className="text-indigo-600 border-indigo-200">
                        {bottleneck.occurrences}
                      </Badge>
                    </td>
                    <td className="py-3 px-3 text-sm text-gray-600">
                      {Math.round(bottleneck.variability * 10) / 10}h
                    </td>
                    <td className="py-3 px-3">
                      <Badge 
                        className={
                          bottleneck.avgDuration > 4 ? 'text-red-600 bg-red-100' :
                          bottleneck.avgDuration > 2 ? 'text-yellow-600 bg-yellow-100' :
                          'text-green-600 bg-green-100'
                        }
                      >
                        {bottleneck.avgDuration > 4 ? 'High' : bottleneck.avgDuration > 2 ? 'Medium' : 'Low'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Resource Performance */}
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Users className="text-blue-600" size={20} />
            Resource Performance Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {analysisData.resourcePerformance.slice(0, 6).map((resource, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-800">{resource.resource}</h4>
                    <Badge 
                      className={
                        resource.errorRate > 10 ? 'text-red-600 bg-red-100' :
                        resource.errorRate > 5 ? 'text-yellow-600 bg-yellow-100' :
                        'text-green-600 bg-green-100'
                      }
                    >
                      {Math.round(resource.errorRate * 10) / 10}% error rate
                    </Badge>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Workload:</span>
                      <span className="font-medium">{resource.workload} tasks</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Errors:</span>
                      <span className="font-medium text-red-600">{resource.errors}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div 
                        className={`h-2 rounded-full ${
                          resource.errorRate > 10 ? 'bg-red-500' :
                          resource.errorRate > 5 ? 'bg-yellow-500' :
                          'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(resource.errorRate * 2, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card className="shadow-lg border-0 bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-indigo-800 flex items-center gap-2">
            <Zap className="text-indigo-600" size={20} />
            Recommended Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold text-indigo-800">High Priority</h4>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-indigo-200">
                  <AlertTriangle size={16} className="text-red-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-800 text-sm">Address Process Bottlenecks</p>
                    <p className="text-xs text-gray-600">Review and optimize high-duration transitions</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-indigo-200">
                  <Users size={16} className="text-orange-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-800 text-sm">Redistribute Resource Load</p>
                    <p className="text-xs text-gray-600">Balance workload across team members</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold text-indigo-800">Medium Priority</h4>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-indigo-200">
                  <Clock size={16} className="text-yellow-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-800 text-sm">Standardize Process Timing</p>
                    <p className="text-xs text-gray-600">Reduce variability in process execution</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-indigo-200">
                  <Zap size={16} className="text-green-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-800 text-sm">Implement Quality Controls</p>
                    <p className="text-xs text-gray-600">Add checkpoints to reduce error rates</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RootCauseAnalysis;
