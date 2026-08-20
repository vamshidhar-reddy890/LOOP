import { Bar, BarChart as RechartsBarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface BarChartProps {
  data: Array<{ name: string; count: number }>;
}

export default function BarChart({ data }: BarChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsBarChart data={data}>
        <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
        <XAxis dataKey="name" stroke="#94a3b8" />
        <YAxis stroke="#94a3b8" />
        <Tooltip />
        <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} />
      </RechartsBarChart>
    </ResponsiveContainer>
  );
}
