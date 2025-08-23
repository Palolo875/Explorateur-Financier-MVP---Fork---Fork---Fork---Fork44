import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';

interface ChartData {
  year: number;
  [key: string]: number;
}

interface SimulationChartProps {
  data: ChartData[];
  chartType: 'line' | 'area';
  lines: { dataKey: string; stroke: string; name?: string; fill?: string; fillOpacity?: number }[];
  yAxisLabel?: string;
}

export function SimulationChart({ data, chartType, lines, yAxisLabel }: SimulationChartProps) {
  const ChartComponent = chartType === 'line' ? LineChart : AreaChart;
  const ChartPrimitive = chartType === 'line' ? Line : Area;

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <ChartComponent
          data={data}
          margin={{
            top: 10,
            right: 30,
            left: 0,
            bottom: 0,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#444" />
          <XAxis dataKey="year" stroke="#aaa" />
          <YAxis stroke="#aaa" />
          <Tooltip
            formatter={(value: number) => [`${value.toLocaleString('fr-FR')}€`, yAxisLabel || '']}
            contentStyle={{
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
            }}
          />
          <Legend />
          {lines.map((line) => (
            <ChartPrimitive
              key={line.dataKey}
              type="monotone"
              dataKey={line.dataKey}
              name={line.name}
              stroke={line.stroke || '#8884d8'}
              fill={chartType === 'area' ? line.fill || '#8884d8' : undefined}
              fillOpacity={chartType === 'area' ? line.fillOpacity || 0.3 : undefined}
              activeDot={{ r: 8 }}
            />
          ))}
        </ChartComponent>
      </ResponsiveContainer>
    </div>
  );
}
