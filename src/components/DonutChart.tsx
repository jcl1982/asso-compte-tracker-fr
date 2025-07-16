import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
interface DonutChartProps {
  data: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  centerText?: {
    title: string;
    value: string;
  };
}
const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
  index,
  name,
  value
}: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize="12" fontWeight="bold">
      {`${(percent * 100).toFixed(0)}%`}
    </text>;
};
const renderCenterLabel = (centerText: {
  title: string;
  value: string;
}) => {
  return <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle">
      <tspan x="50%" dy="-0.5em" fontSize="14" fill="hsl(var(--muted-foreground))" fontWeight="500">
        {centerText.title}
      </tspan>
      <tspan x="50%" dy="1.5em" fontSize="20" fill="hsl(var(--foreground))" fontWeight="bold">
        {centerText.value}
      </tspan>
    </text>;
};
export function DonutChart({
  data,
  centerText
}: DonutChartProps) {
  return (
    <div className="w-full h-full flex flex-col">
      {/* Graphique principal */}
      <div className="flex-1 relative min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie 
              data={data} 
              cx="50%" 
              cy="50%" 
              labelLine={false} 
              label={renderCustomizedLabel} 
              outerRadius={100} 
              innerRadius={50} 
              fill="#8884d8" 
              dataKey="value" 
              strokeWidth={2} 
              stroke="hsl(var(--background))"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: number, name: string) => [
                new Intl.NumberFormat('fr-FR', {
                  style: 'currency',
                  currency: 'EUR'
                }).format(value), 
                name
              ]} 
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                zIndex: 50
              }} 
            />
            {centerText && renderCenterLabel(centerText)}
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}