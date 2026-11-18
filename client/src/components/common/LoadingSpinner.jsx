import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingSpinner = ({ text = 'Loading data...', size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <Loader2 className={`${sizeClasses[size] || sizeClasses.md} text-indigo-600 dark:text-indigo-400 animate-spin`} />
      {text && <p className="mt-3 text-sm font-medium text-slate-500 dark:text-slate-400">{text}</p>}
    </div>
  );
};
