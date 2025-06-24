import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, AlertTriangle, XCircle, TrendingUp } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

interface ProcessData {
  case_id: string;
  activity: string;
  timestamp: string;
  resource: string;
}

interface ConformanceAnalysisProps {
  data: ProcessData[];
}

const ConformanceAnalysis: React.FC<ConformanceAnalysisProps> = ({ data }) => {
  const conformanceData = useMemo(() => {
    // Mock ideal process flow for demonstration
    const idealFlow = [
      'Start Process',
      'Review Application',
      'Analyze Data',
      'Make Decision',
      'Complete Process'
    ];

    // Group data by case
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

    let conformingCases = 0;
    let partiallyConformingCases = 0;
    let nonConformingCases = 0;
    
    const deviations: Record<string, number> = {};
    const caseAnalysis: Array<{
      caseId: string;
      status: 'conforming' | 'partially-conforming' | 'non-conforming';
      score: number;
      deviations: string[];
    }> = [];

    Object.entries(caseGroups).forEach(([caseId, activities]) => {
      const actualFlow = activities.map(a => a.activity);
      let score = 0;
      const caseDeviations: string[] = [];

      // Simple conformance check (this would be more sophisticated in reality)
      const conformanceScore = actualFlow.length > 0 ? 
        actualFlow.filter(activity => idealFlow.includes(activity)).length / idealFlow.length : 0;

      // Check for common deviations
      if (actualFlow.length > idealFlow.length + 2) {
        caseDeviations.push('Extra activities detected');
        deviations['Extra Activities'] = (deviations['Extra Activities'] || 0) + 1;
      }
      
      if (actualFlow.length < idealFlow.length - 1) {
        caseDeviations.push('Missing activities');
        deviations['Missing Activities'] = (deviations['Missing Activities'] || 0) + 1;
      }

      // Check for wrong order (simplified)
      let orderDeviations = 0;
      for (let i = 1; i < actualFlow.length; i++) {
        const currentIdx = idealFlow.indexOf(actualFlow[i]);
        const prevIdx = idealFlow.indexOf(actualFlow[i-1]);
        if (currentIdx !== -1 && prevIdx !== -1 && currentIdx < prevIdx) {
          orderDeviations++;
        }
      }
      
      if (orderDeviations > 0) {
        caseDeviations.push('Wrong activity order');
        deviations['Wrong Order'] = (deviations['Wrong Order'] || 0) + 1;
      }

      score = Math.max(0, conformanceScore - (orderDeviations * 0.1));

      let status: 'conforming' | 'partially-conforming' | 'non-conforming';
      if (score >= 0.8 && caseDeviations.length === 0) {
        status = 'conforming';
        conformingCases++;
      } else if (score >= 0.5) {
        status = 'partially-conforming';
        partiallyConformingCases++;
      } else {
        status = 'non-conforming';
        nonConformingCases++;
      }

      caseAnalysis.push({
        caseId,
        status,
        score: Math.round(score * 100),
        deviations: caseDeviations
      });
    });

    const totalCases = Object.keys(caseGroups).length;
    const overallConformance = totalCases > 0 ? Math.round((conformingCases / totalCases) * 100) : 0;

    return {
      overallConformance,
      conformingCases,
      partiallyConformingCases,
      nonConformingCases,
      totalCases,
      deviations,
      caseAnalysis: caseAnalysis.slice(0, 10), // Show top 10 for demo
      idealFlow
    };
  }, [data]);

  const pieData = [
    { name: 'Conforming', value: conformanceData.conformingCases, color: '#10b981' },
    { name: 'Partially Conforming', value: conformanceData.partiallyConformingCases, color: '#f59e0b' },
    { name: 'Non-Conforming', value: conformanceData.nonConformingCases, color: '#ef4444' }
  ];

  const deviationData = Object.entries(conformanceData.deviations).map(([type, count]) => ({
    type,
    count
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 shadow-lg rounded-lg border border-indigo-100">
          <p className="font-medium text-gray-800">{payload[0].payload.name}</p>
          <p className="text-sm text-gray-600">{payload[0].value} cases</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Conformance Analysis</h2>
        <p className="text-gray-600">Process compliance and deviation analysis</p>
      </div>

      {/* Overall Conformance Score */}
      <Card className="shadow-lg border-0 bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200">
        <CardContent className="p-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-indigo-600 rounded-full mb-4">
              <span className="text-2xl font-bold text-white">{conformanceData.overallConformance}%</span>
            </div>
            <h3 className="text-2xl font-bold text-indigo-800 mb-2">Overall Conformance Score</h3>
            <p className="text-indigo-600">Based on {conformanceData.totalCases} analyzed cases</p>
            <Progress 
              value={conformanceData.overallConformance} 
              className="mt-4 h-3"
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Conformance Distribution */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <CheckCircle className="text-indigo-600" size={20} />
              Conformance Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2">
              {pieData.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                    <span className="text-sm font-medium text-gray-700">{item.name}</span>
                  </div>
                  <span className="text-sm text-gray-600">{item.value} cases</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Common Deviations */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <AlertTriangle className="text-yellow-600" size={20} />
              Common Deviations
            </CardTitle>
          </CardHeader>
          <CardContent>
            {deviationData.length > 0 ? (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={deviationData}margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis 
                      dataKey="type" 
                      fontSize={12}
                      stroke="#64748b"
                    />
                    <YAxis stroke="#64748b" />
                    <Tooltip />
                    <Bar 
                      dataKey="count" 
                      fill="url(#deviationGradient)"
                      radius={[4, 4, 0, 0]}
                    />
                    <defs>
                      <linearGradient id="deviationGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#f59e0b" />
                        <stop offset="100%" stopColor="#ef4444" />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-80 flex items-center justify-center">
                <div className="text-center">
                  <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
                  <p className="text-gray-500">No significant deviations detected!</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Ideal vs Actual Flow */}
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <TrendingUp className="text-indigo-600" size={20} />
            Ideal vs Actual Process Flow
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-semibold text-gray-700 mb-3">Ideal Process Flow</h4>
            <div className="flex flex-wrap gap-2">
              {conformanceData.idealFlow.map((activity, index) => (
                <div key={index} className="flex items-center">
                  <div className="px-3 py-2 bg-green-100 text-green-800 rounded-lg text-sm font-medium">
                    {activity}
                  </div>
                  {index < conformanceData.idealFlow.length - 1 && (
                    <div className="mx-2 text-gray-400">→</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-700 mb-3">Most Common Actual Flow</h4>
            <div className="text-sm text-gray-600 bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              Actual flows vary by case. Common variations include additional review steps, 
              parallel processing, and occasional rework loops. See case-by-case analysis below for details.
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Case Analysis Table */}
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-gray-800">Case-by-Case Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-3 font-medium text-gray-700">Case ID</th>
                  <th className="text-left py-2 px-3 font-medium text-gray-700">Status</th>
                  <th className="text-left py-2 px-3 font-medium text-gray-700">Score</th>
                  <th className="text-left py-2 px-3 font-medium text-gray-700">Deviations</th>
                </tr>
              </thead>
              <tbody>
                {conformanceData.caseAnalysis.map((caseItem, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-3 font-medium text-gray-800">{caseItem.caseId}</td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        {caseItem.status === 'conforming' && <CheckCircle size={16} className="text-green-500" />}
                        {caseItem.status === 'partially-conforming' && <AlertTriangle size={16} className="text-yellow-500" />}
                        {caseItem.status === 'non-conforming' && <XCircle size={16} className="text-red-500" />}
                        <span className={`text-sm font-medium ${
                          caseItem.status === 'conforming' ? 'text-green-700' :
                          caseItem.status === 'partially-conforming' ? 'text-yellow-700' :
                          'text-red-700'
                        }`}>
                          {caseItem.status.replace('-', ' ')}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              caseItem.score >= 80 ? 'bg-green-500' :
                              caseItem.score >= 50 ? 'bg-yellow-500' :
                              'bg-red-500'
                            }`}
                            style={{ width: `${caseItem.score}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600">{caseItem.score}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      {caseItem.deviations.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {caseItem.deviations.map((deviation, i) => (
                            <span key={i} className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                              {deviation}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">No deviations</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConformanceAnalysis;
