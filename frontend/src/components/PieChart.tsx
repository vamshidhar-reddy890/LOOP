import { Cell, Pie, PieChart as RechartsPieChart, ResponsiveContainer, Tooltip } from 'recharts';

interface PieChartProps {
  data: Array<{ name: string; value: number; color?: string }>;
}

const defaultColors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];

export default function PieChart({ data }: PieChartProps) {
  const chartData = data.length === 0 ? [{ name: 'No data', value: 1, color: '#475569' }] : data.map((item, index) => ({ ...item, color: item.color ?? defaultColors[index % defaultColors.length] }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsPieChart>
        <Pie data={chartData} dataKey="value" nameKey="name" innerRadius={70} outerRadius={110} paddingAngle={2}>
          {chartData.map((entry) => (
            <Cell key={entry.name} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip />
      </RechartsPieChart>
    </ResponsiveContainer>
  );
}
