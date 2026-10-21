import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  variant?: 'blue' | 'teal' | 'amber' | 'rose' | 'slate' | 'indigo';
  alertBadge?: string;
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'slate',
  alertBadge,
  onClick
}) => {
  const variantMap = {
    blue: {
      bg: 'bg-blue-50/60',
      text: 'text-blue-700',
      border: 'border-blue-100',
      hover: 'hover:border-blue-300'
    },
    teal: {
      bg: 'bg-teal-50/60',
      text: 'text-teal-700',
      border: 'border-teal-100',
      hover: 'hover:border-teal-300'
    },
    amber: {
      bg: 'bg-amber-50/60',
      text: 'text-amber-700',
      border: 'border-amber-100',
      hover: 'hover:border-amber-300'
    },
    rose: {
      bg: 'bg-rose-50/60',
      text: 'text-rose-700',
      border: 'border-rose-100',
      hover: 'hover:border-rose-300'
    },
    indigo: {
      bg: 'bg-indigo-50/60',
      text: 'text-indigo-700',
      border: 'border-indigo-100',
      hover: 'hover:border-indigo-300'
    },
    slate: {
      bg: 'bg-slate-50',
      text: 'text-slate-700',
      border: 'border-slate-200',
      hover: 'hover:border-slate-300'
    }
  };

  const currentVariant = variantMap[variant];

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl border ${currentVariant.border} p-5 shadow-xs transition-all duration-150 ${onClick ? 'cursor-pointer ' + currentVariant.hover : ''} flex flex-col justify-between`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{title}</p>
          <div className="flex items-baseline gap-2 mt-1.5">
            <h3 className="text-2xl font-bold text-slate-900 tracking-tight">{value}</h3>
            {alertBadge && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 border border-rose-200">
                {alertBadge}
              </span>
            )}
          </div>
        </div>
        <div className={`p-2.5 rounded-lg ${currentVariant.bg} ${currentVariant.text}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      {subtitle && (
        <p className="text-xs text-slate-500 mt-3 pt-2.5 border-t border-slate-100 flex items-center gap-1.5">
          {subtitle}
        </p>
      )}
    </div>
  );
};
