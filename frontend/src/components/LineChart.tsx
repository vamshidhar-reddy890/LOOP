import { CartesianGrid, Line, LineChart as RechartsLineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface LineChartProps {
  data: Array<{ date: string; count: number; sentiment: string }>;
}

export default function LineChart({ data }: LineChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsLineChart data={data}>
        <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
        <XAxis dataKey="date" stroke="#94a3b8" />
        <YAxis stroke="#94a3b8" />
        <Tooltip />
        <Line type="monotone" dataKey="count" stroke="#60a5fa" strokeWidth={3} />
      </RechartsLineChart>
    </ResponsiveContainer>
  );
}
