
import React, { useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GitBranch, Zap, Clock, Users } from 'lucide-react';

interface ProcessData {
  case_id: string;
  activity: string;
  timestamp: string;
  resource: string;
}

interface ProcessFlowProps {
  data: ProcessData[];
}

interface FlowNode {
  id: string;
  activity: string;
  frequency: number;
  avgDuration: number;
  resources: string[];
}

interface FlowEdge {
  from: string;
  to: string;
  frequency: number;
  avgDuration: number;
}

const ProcessFlow: React.FC<ProcessFlowProps> = ({ data }) => {
  const flowData = useMemo(() => {
    // Group data by case to build process flow
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

    // Build nodes
    const nodeMap = new Map<string, FlowNode>();
    const edgeMap = new Map<string, FlowEdge>();

    Object.values(caseGroups).forEach(caseActivities => {
      caseActivities.forEach((activity, index) => {
        // Update or create node
        if (!nodeMap.has(activity.activity)) {
          nodeMap.set(activity.activity, {
            id: activity.activity,
            activity: activity.activity,
            frequency: 0,
            avgDuration: 0,
            resources: []
          });
        }

        const node = nodeMap.get(activity.activity)!;
        node.frequency += 1;
        if (!node.resources.includes(activity.resource)) {
          node.resources.push(activity.resource);
        }

        // Create edges
        if (index > 0) {
          const prevActivity = caseActivities[index - 1];
          const edgeKey = `${prevActivity.activity}->${activity.activity}`;
          
          if (!edgeMap.has(edgeKey)) {
            edgeMap.set(edgeKey, {
              from: prevActivity.activity,
              to: activity.activity,
              frequency: 0,
              avgDuration: 0
            });
          }

          const edge = edgeMap.get(edgeKey)!;
          edge.frequency += 1;
          
          // Calculate duration (mock calculation)
          const duration = Math.abs(new Date(activity.timestamp).getTime() - new Date(prevActivity.timestamp).getTime()) / (1000 * 60 * 60); // hours
          edge.avgDuration = ((edge.avgDuration * (edge.frequency - 1)) + duration) / edge.frequency;
        }
      });
    });

    return {
      nodes: Array.from(nodeMap.values()).sort((a, b) => b.frequency - a.frequency),
      edges: Array.from(edgeMap.values()).sort((a, b) => b.frequency - a.frequency)
    };
  }, [data]);

  const getNodeColor = (frequency: number, maxFreq: number) => {
    const intensity = frequency / maxFreq;
    if (intensity > 0.7) return 'bg-gradient-to-br from-indigo-600 to-indigo-700 text-white';
    if (intensity > 0.4) return 'bg-gradient-to-br from-indigo-400 to-indigo-500 text-white';
    return 'bg-gradient-to-br from-indigo-100 to-indigo-200 text-indigo-800';
  };

  const getEdgeWidth = (frequency: number, maxFreq: number) => {
    const intensity = frequency / maxFreq;
    if (intensity > 0.7) return 'h-2';
    if (intensity > 0.4) return 'h-1.5';
    return 'h-1';
  };

  const maxNodeFreq = Math.max(...flowData.nodes.map(n => n.frequency));
  const maxEdgeFreq = Math.max(...flowData.edges.map(e => e.frequency));

  return (
    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm animate-fade-in">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <GitBranch className="text-indigo-600" size={24} />
          Process Flow Visualization
        </CardTitle>
        <p className="text-gray-600">Interactive process flow showing activity frequencies and transitions</p>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Process Flow Diagram */}
        <div className="bg-gradient-to-br from-gray-50 to-indigo-50 rounded-lg p-8 border border-indigo-100">
          <div className="space-y-8">
            {/* Nodes */}
            <div className="flex flex-wrap gap-4 justify-center">
              {flowData.nodes.map((node, index) => (
                <div
                  key={node.id}
                  className={`
                    relative group cursor-pointer transition-all duration-300 hover:scale-105
                    ${getNodeColor(node.frequency, maxNodeFreq)}
                    rounded-xl p-4 shadow-lg hover:shadow-xl
                    min-w-[200px] max-w-[250px]
                  `}
                >
                  <div className="text-center">
                    <h3 className="font-bold text-sm mb-2 truncate">{node.activity}</h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-center gap-2 text-xs">
                        <Zap size={12} />
                        <span>{node.frequency} times</span>
                      </div>
                      <div className="flex items-center justify-center gap-2 text-xs">
                        <Users size={12} />
                        <span>{node.resources.length} resources</span>
                      </div>
                    </div>
                  </div>

                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                    <div className="bg-black text-white text-xs rounded py-2 px-3 whitespace-nowrap">
                      <div>Frequency: {node.frequency}</div>
                      <div>Resources: {node.resources.join(', ')}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Connection Legend */}
            <div className="text-center">
              <h4 className="font-semibold text-gray-700 mb-4">Process Transitions</h4>
              <div className="space-y-2">
                {flowData.edges.slice(0, 8).map((edge, index) => (
                  <div key={`${edge.from}-${edge.to}`} className="flex items-center justify-center gap-4 text-sm">
                    <span className="font-medium text-gray-700 min-w-[120px] text-right">{edge.from}</span>
                    <div className="flex items-center gap-2">
                      <div className={`bg-indigo-500 ${getEdgeWidth(edge.frequency, maxEdgeFreq)} w-8 rounded`}></div>
                      <Badge variant="secondary" className="text-xs">{edge.frequency}x</Badge>
                    </div>
                    <span className="font-medium text-gray-700 min-w-[120px] text-left">{edge.to}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Flow Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 border-indigo-200">
            <CardContent className="p-6 text-center">
              <GitBranch className="mx-auto h-8 w-8 text-indigo-600 mb-2" />
              <p className="text-2xl font-bold text-indigo-800">{flowData.nodes.length}</p>
              <p className="text-sm text-indigo-600">Unique Activities</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-emerald-100 border-emerald-200">
            <CardContent className="p-6 text-center">
              <Zap className="mx-auto h-8 w-8 text-emerald-600 mb-2" />
              <p className="text-2xl font-bold text-emerald-800">{flowData.edges.length}</p>
              <p className="text-sm text-emerald-600">Process Transitions</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-6 text-center">
              <Clock className="mx-auto h-8 w-8 text-purple-600 mb-2" />
              <p className="text-2xl font-bold text-purple-800">
                {Math.round(flowData.edges.reduce((sum, edge) => sum + edge.avgDuration, 0) / flowData.edges.length * 10) / 10 || 0}h
              </p>
              <p className="text-sm text-purple-600">Avg. Transition Time</p>
            </CardContent>
          </Card>
        </div>

        {/* Top Transitions Table */}
        <Card className="bg-white border border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-800">Most Frequent Transitions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-3 font-medium text-gray-700">From</th>
                    <th className="text-left py-2 px-3 font-medium text-gray-700">To</th>
                    <th className="text-left py-2 px-3 font-medium text-gray-700">Frequency</th>
                    <th className="text-left py-2 px-3 font-medium text-gray-700">Avg. Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {flowData.edges.slice(0, 10).map((edge, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="py-2 px-3 text-sm text-gray-800">{edge.from}</td>
                      <td className="py-2 px-3 text-sm text-gray-800">{edge.to}</td>
                      <td className="py-2 px-3">
                        <Badge variant="outline" className="text-indigo-600 border-indigo-200">
                          {edge.frequency}
                        </Badge>
                      </td>
                      <td className="py-2 px-3 text-sm text-gray-600">
                        {Math.round(edge.avgDuration * 10) / 10}h
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
};

export default ProcessFlow;
