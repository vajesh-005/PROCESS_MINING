
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area } from 'recharts';
import { BarChart3, TrendingUp, Clock } from 'lucide-react';

interface ProcessData {
  case_id: string;
  activity: string;
  timestamp: string;
  resource: string;
}

interface ChartsSectionProps {
  data: ProcessData[];
}

const ChartsSection: React.FC<ChartsSectionProps> = ({ data }) => {
  const chartData = useMemo(() => {
    // Activity frequency
    const activityCount = data.reduce((acc, row) => {
      acc[row.activity] = (acc[row.activity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const activityFrequency = Object.entries(activityCount)
      .map(([activity, count]) => ({ activity, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Cases over time
    const casesOverTime = data.reduce((acc, row) => {
      const date = new Date(row.timestamp).toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = new Set();
      }
      acc[date].add(row.case_id);
      return acc;
    }, {} as Record<string, Set<string>>);

    const timelineData = Object.entries(casesOverTime)
      .map(([date, cases]) => ({ date, cases: cases.size }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Average lead time per activity (mock calculation)
    const leadTimeData = Object.entries(activityCount)
      .map(([activity, count]) => ({
        activity,
        avgLeadTime: Math.round((Math.random() * 5 + 1) * 10) / 10, // Mock data
        volume: count
      }))
      .sort((a,b) => b.avgLeadTime - a.avgLeadTime)
      .slice(0, 8);

    return {
      activityFrequency,
      timelineData,
      leadTimeData
    };
  }, [data]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 shadow-lg rounded-lg border border-indigo-100">
          <p className="font-medium text-gray-800">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Process Analytics</h2>
        <p className="text-gray-600">Comprehensive insights from your process data</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Activity Frequency Chart */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 animate-scale-in">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <BarChart3 className="text-indigo-600" size={20} />
              Activity Frequency
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData.activityFrequency} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="activity" 
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    fontSize={12}
                    stroke="#64748b"
                  />
                  <YAxis stroke="#64748b" />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar 
                    dataKey="count" 
                    fill="url(#activityGradient)"
                    radius={[4, 4, 0, 0]}
                  />
                  <defs>
                    <linearGradient id="activityGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" />
                      <stop offset="100%" stopColor="#8b5cf6" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Cases Over Time Chart */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 animate-scale-in">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <TrendingUp className="text-indigo-600" size={20} />
              Cases Over Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData.timelineData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="date" 
                    fontSize={12}
                    stroke="#64748b"
                  />
                  <YAxis stroke="#64748b" />
                  <Tooltip content={<CustomTooltip />} />
                  <Line 
                    type="monotone" 
                    dataKey="cases" 
                    stroke="#6366f1" 
                    strokeWidth={3}
                    dot={{ fill: '#6366f1', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lead Time Chart - Full Width */}
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 animate-scale-in">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Clock className="text-indigo-600" size={20} />
            Average Lead Time by Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData.leadTimeData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis 
                  dataKey="activity" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  fontSize={12}
                  stroke="#64748b"
                />
                <YAxis stroke="#64748b" />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="avgLeadTime" 
                  stroke="#6366f1" 
                  strokeWidth={2}
                  fill="url(#leadTimeGradient)"
                />
                <defs>
                  <linearGradient id="leadTimeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-md border-0 bg-gradient-to-br from-indigo-500 to-indigo-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-indigo-100 text-sm font-medium">Total Cases</p>
                <p className="text-2xl font-bold">{new Set(data.map(d => d.case_id)).size}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-indigo-200" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-md border-0 bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Total Activities</p>
                <p className="text-2xl font-bold">{data.length}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-200" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-md border-0 bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Unique Resources</p>
                <p className="text-2xl font-bold">{new Set(data.map(d => d.resource)).size}</p>
              </div>
              <Clock className="h-8 w-8 text-purple-200" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ChartsSection;
