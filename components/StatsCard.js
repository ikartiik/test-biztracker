'use client';

import Link from 'next/link';
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon } from '@heroicons/react/24/outline';

export default function StatsCard({ name, value, subtext, icon: Icon, trend, trendUp, href }) {
  return (
    <Link href={href} className="glass-card group relative col-span-1 overflow-hidden hover:shadow-2xl hover:shadow-primary/25 dark:hover:shadow-primary/10 transition-all duration-300 cursor-pointer hover:-translate-y-1">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/10 group-hover:from-primary/10 dark:group-hover:from-primary/20 opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="relative p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="glass p-3 rounded-2xl bg-primary/10 shadow-lg group-hover:scale-105 transition-all">
            <Icon className="w-7 h-7 text-primary" />
          </div>
          <div className={`flex items-center text-sm font-semibold px-3 py-1 rounded-xl ${
            trendUp 
              ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300' 
              : 'bg-destructive/10 dark:bg-destructive/25 text-destructive dark:text-destructive-foreground/80'
          }`}>
            {trendUp ? <ArrowTrendingUpIcon className="w-4 h-4 mr-1" /> : <ArrowTrendingDownIcon className="w-4 h-4 mr-1" />}
            {trend}
          </div>
        </div>
        <h3 className="text-sm font-medium text-muted-foreground mb-1">{name}</h3>
        <p className="text-3xl font-black text-foreground mb-1 leading-tight">
          {value}
        </p>
        <p className="text-sm text-muted-foreground font-medium">{subtext}</p>
      </div>
      <div className="h-1.5 bg-gradient-to-r from-primary via-blue-500 to-indigo-500 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-700" />
    </Link>
  );
}
