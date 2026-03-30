'use client';

import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { ChartBarIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';
import { BuildingOfficeIcon as BuildingOfficeIconSolid } from '@heroicons/react/24/solid';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export default function ChartSection({ stats }) {
  const expenseData = stats?.charts?.expenses || [];
  const vendorData = stats?.charts?.vendors || [];
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Expense Trends */}
      <div className="glass-card p-8">
        <div className="flex items-center mb-8">
          <ChartBarIcon className="h-10 w-10 text-primary mr-4" />
          <div>
            <h3 className="text-2xl font-bold text-foreground">Expense Trends</h3>
            <p className="text-muted-foreground">Monthly overview</p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={expenseData}>
            <defs>
              <linearGradient id="expenses" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#ef4444" stopOpacity={0.6}/>
                <stop offset="100%" stopColor="#ef4444" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="credits" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity={0.6}/>
                <stop offset="100%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="4" vertical={false} stroke="hsl(var(--border))" />
            <XAxis dataKey="month" axisLine={false} tickLine={false} tickMargin={12} stroke="hsl(var(--muted-foreground))" fontSize={13} />
            <YAxis axisLine={false} tickLine={false} tickMargin={12} stroke="hsl(var(--muted-foreground))" fontSize={13} />
            <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '1rem' }} />
            <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={4} fill="url(#expenses)" dot={false} />
            <Line type="monotone" dataKey="credits" stroke="#10b981" strokeWidth={4} fill="url(#credits)" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Vendor Distribution */}
      <div className="glass-card p-8">
        <div className="flex items-center mb-8">
          <BuildingOfficeIconSolid className="h-10 w-10 text-primary mr-4" />
          <div>
            <h3 className="text-2xl font-bold text-foreground">Vendor Distribution</h3>
            <p className="text-muted-foreground">Spend by vendor</p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={350}>
          <PieChart>
            <Pie
              data={vendorData}
              cx="55%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={3}
              dataKey="value"
              nameKey="name"
              cornerRadius={6}
            >
              {vendorData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
            <Legend iconSize={12} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
