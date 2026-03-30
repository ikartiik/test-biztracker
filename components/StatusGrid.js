'use client';

import { CheckCircleIcon, ExclamationTriangleIcon, ChartBarIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleIconSolid, ExclamationTriangleIcon as ExclamationTriangleIconSolid, ChartBarIcon as ChartBarIconSolid } from '@heroicons/react/24/solid';

export default function StatusGrid({ stats }) {
  const statusCards = [
    {
      title: 'Completed',
      icon: CheckCircleIconSolid,
      color: 'green',
      stats: [
        { label: 'Purchased Items', value: stats?.summary?.purchases?.purchased || 0 },
        { label: 'Received Items', value: stats?.summary?.pending?.received || 0 },
        { label: 'Shipped Orders', value: stats?.summary?.shipping?.shipped || 0 },
      ]
    },
    {
      title: 'Pending & Urgent',
      icon: ExclamationTriangleIconSolid,
      color: 'orange',
      stats: [
        { label: 'Urgent Items', value: stats?.summary?.pending?.urgent || 0, highlight: true },
        { label: 'Pending Items', value: stats?.summary?.pending?.pending || 0 },
        { label: 'Quotations', value: stats?.summary?.purchases?.quotations || 0 },
      ]
    },
    {
      title: 'Financial Summary',
      icon: ChartBarIconSolid,
      color: 'blue',
      stats: [
        { label: 'Total Credits', value: `AED ${(stats?.summary?.expenses?.totalCredit || 0).toLocaleString()}`, color: 'green' },
        { label: 'Total Debits', value: `AED ${(stats?.summary?.expenses?.totalDebit || 0).toLocaleString()}`, color: 'red' },
        { 
          label: 'Balance', 
          value: `AED ${(stats?.summary?.expenses?.balance || 0).toLocaleString()}`, 
          highlight: true,
          color: 'gradient'
        },
      ]
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {statusCards.map((card, index) => (
        <div
          key={card.title}
          className={`glass-card p-8 border border-border/50 group hover:shadow-xl transition-all ${
            card.color === 'green' ? 'hover:shadow-green-500/10 dark:hover:shadow-green-400/20' :
            card.color === 'orange' ? 'hover:shadow-orange-500/10 dark:hover:shadow-orange-400/20' :
            'hover:shadow-blue-500/10 dark:hover:shadow-blue-400/20'
          }`}
        >
          <div className="flex items-center mb-8 group-hover:scale-105 transition-transform duration-300">
            <div className={`glass p-4 rounded-3xl shadow-xl ${
              card.color === 'green' ? 'border border-green-500/30 bg-green-500/5' :
              card.color === 'orange' ? 'border border-orange-500/30 bg-orange-500/5' :
              'border border-blue-500/30 bg-blue-500/5'
            }`}>
              <card.icon className={`w-12 h-12 shadow-lg ${
                card.color === 'green' ? 'text-green-600 dark:text-green-400' :
                card.color === 'orange' ? 'text-orange-600 dark:text-orange-400' :
                'text-blue-600 dark:text-blue-400'
              }`} />
            </div>
            <h3 className="ml-4 text-2xl font-black bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
              {card.title}
            </h3>
          </div>
          <div className="space-y-4">
            {card.stats.map((stat, statIndex) => (
              <div key={statIndex} className={`glass-card flex justify-between p-5 rounded-2xl transition-all group-hover:scale-[1.02] ${stat.highlight ? 'border border-primary/30 shadow-xl ring-1 ring-primary/20' : ''}`}>
                <span className={`font-semibold text-muted-foreground ${stat.highlight ? 'text-lg font-black' : 'text-base'}`}>
                  {stat.label}
                </span>
                <span className={`font-black text-2xl ${stat.color === 'green' ? 'text-emerald-600' : stat.color === 'red' ? 'text-destructive' : stat.highlight && stat.color === 'gradient' ? 'bg-gradient-to-r from-primary via-blue-600 to-indigo-600 bg-clip-text text-transparent drop-shadow-lg' : 'text-foreground'}`}>
                  {stat.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
