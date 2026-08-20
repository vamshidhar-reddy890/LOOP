import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  trend: string;
}

export default function StatsCard({ title, value, icon: Icon, trend }: StatsCardProps) {
  return (
    <div className="card-hover">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-dark-400">{title}</p>
          <p className="mt-3 text-3xl font-semibold text-dark-100">{value}</p>
        </div>
        <div className="rounded-2xl bg-primary-600/15 p-3 text-primary-400">
          <Icon size={20} />
        </div>
      </div>
      <p className="mt-4 text-sm text-dark-400">{trend}</p>
    </div>
  );
}
