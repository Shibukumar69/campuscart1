import React from 'react';

export const StatCard = ({ title, value, subtitle, icon: Icon, trend, trendLabel, color = 'indigo' }) => {
  const colorMap = {
    indigo: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/50 dark:text-indigo-400',
    emerald: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 dark:text-emerald-400',
    amber: 'text-amber-600 bg-amber-50 dark:bg-amber-950/50 dark:text-amber-400',
    rose: 'text-rose-600 bg-rose-50 dark:bg-rose-950/50 dark:text-rose-400',
    purple: 'text-purple-600 bg-purple-50 dark:bg-purple-950/50 dark:text-purple-400',
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{value}</h3>
        </div>
        {Icon && (
          <div className={`p-3 rounded-lg ${colorMap[color] || colorMap.indigo}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
      {(subtitle || trend) && (
        <div className="mt-3 flex items-center text-xs">
          {trend && (
            <span
              className={`font-semibold mr-1.5 ${
                trend > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
              }`}
            >
              {trend > 0 ? `+${trend}%` : `${trend}%`}
            </span>
          )}
          <span className="text-slate-500 dark:text-slate-400">{trendLabel || subtitle}</span>
        </div>
      )}
    </div>
  );
};
