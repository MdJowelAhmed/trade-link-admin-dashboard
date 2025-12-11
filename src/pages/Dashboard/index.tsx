import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Users, Package, FolderTree, DollarSign, TrendingUp, TrendingDown, Clock } from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { formatCurrency, formatCompactNumber, formatPercentage } from '@/utils/formatters'
import { cn } from '@/utils/cn'
import { motion } from 'framer-motion'

// Generate mock data for different years
const generateYearData = (year: number) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const baseRevenue = 50000 + (year - 2021) * 15000
  const baseUsers = 500 + (year - 2021) * 200
  const baseOrders = 300 + (year - 2021) * 100

  return months.map((month, index) => {
    const seasonMultiplier = index >= 10 || index <= 1 ? 1.3 : index >= 5 && index <= 7 ? 0.85 : 1
    const randomVariation = () => 0.8 + Math.random() * 0.4

    return {
      month,
      revenue: Math.round(baseRevenue * seasonMultiplier * randomVariation() * (1 + index * 0.02)),
      users: Math.round(baseUsers * randomVariation() * (1 + index * 0.05)),
      orders: Math.round(baseOrders * seasonMultiplier * randomVariation() * (1 + index * 0.03)),
    }
  })
}

const yearlyData: Record<string, ReturnType<typeof generateYearData>> = {
  '2024': generateYearData(2024),
  '2023': generateYearData(2023),
  '2022': generateYearData(2022),
  '2021': generateYearData(2021),
}

interface StatCardProps {
  title: string
  value: string | number
  change: number
  icon: React.ElementType
  description: string
  index: number
}

function StatCard({ title, value, change, icon: Icon, description, index }: StatCardProps) {
  const isPositive = change >= 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
    >
      <Card className="overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Icon className="h-5 w-5 text-primary" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{value}</div>
          <div className="flex items-center gap-2 mt-1">
            <span
              className={cn(
                'flex items-center text-xs font-medium',
                isPositive ? 'text-success' : 'text-destructive'
              )}
            >
              {isPositive ? (
                <TrendingUp className="h-3 w-3 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 mr-1" />
              )}
              {formatPercentage(change)}
            </span>
            <span className="text-xs text-muted-foreground">{description}</span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// Custom tooltip for the chart
const CustomTooltip = ({ active, payload, label }: {
  active?: boolean
  payload?: Array<{ name: string; value: number; color: string }>
  label?: string
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-popover border rounded-lg shadow-lg p-3">
        <p className="font-semibold mb-2">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-muted-foreground">{entry.name}:</span>
            <span className="font-medium">
              {entry.name === 'Revenue' ? formatCurrency(entry.value) : formatCompactNumber(entry.value)}
            </span>
          </div>
        ))}
      </div>
    )
  }
  return null
}

export default function Dashboard() {
  const [selectedYear, setSelectedYear] = useState('2024')
  const [chartMetric, setChartMetric] = useState<'all' | 'revenue' | 'users' | 'orders'>('all')

  const chartData = useMemo(() => yearlyData[selectedYear], [selectedYear])

  const stats = [
    {
      title: 'Total Users',
      value: formatCompactNumber(12543),
      change: 12.5,
      icon: Users,
      description: 'vs last month',
    },
    {
      title: 'Total Products',
      value: formatCompactNumber(3420),
      change: 8.2,
      icon: Package,
      description: 'vs last month',
    },
    {
      title: 'Categories',
      value: '156',
      change: 3.1,
      icon: FolderTree,
      description: 'vs last month',
    },
    {
      title: 'Total Revenue',
      value: formatCurrency(845320),
      change: -2.4,
      icon: DollarSign,
      description: 'vs last month',
    },
  ]

  const recentActivity = [
    { id: 1, action: 'New user registered', user: 'John Doe', time: '2 min ago' },
    { id: 2, action: 'Product updated', user: 'Jane Smith', time: '15 min ago' },
    { id: 3, action: 'Order completed', user: 'Mike Johnson', time: '1 hour ago' },
    { id: 4, action: 'Category created', user: 'Sarah Williams', time: '2 hours ago' },
    { id: 5, action: 'User blocked', user: 'Admin', time: '3 hours ago' },
  ]

  const years = ['2024', '2023', '2022', '2021']

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <StatCard key={stat.title} {...stat} index={index} />
        ))}
      </div>

      {/* Chart Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle>Analytics Overview</CardTitle>
                <CardDescription>
                  Track your business performance over time
                </CardDescription>
              </div>
              <div className="flex items-center gap-3">
                <Select value={chartMetric} onValueChange={(v) => setChartMetric(v as typeof chartMetric)}>
                  <SelectTrigger className="w-[130px]">
                    <SelectValue placeholder="Metric" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Metrics</SelectItem>
                    <SelectItem value="revenue">Revenue</SelectItem>
                    <SelectItem value="users">Users</SelectItem>
                    <SelectItem value="orders">Orders</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger className="w-[100px]">
                    <SelectValue placeholder="Year" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((year) => (
                      <SelectItem key={year} value={year}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="month" 
                    className="text-xs"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <YAxis 
                    yAxisId="left"
                    className="text-xs"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    tickFormatter={(value) => `$${formatCompactNumber(value)}`}
                  />
                  <YAxis 
                    yAxisId="right" 
                    orientation="right"
                    className="text-xs"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    tickFormatter={(value) => formatCompactNumber(value)}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend 
                    wrapperStyle={{ paddingTop: '20px' }}
                    formatter={(value) => <span className="text-sm">{value}</span>}
                  />
                  {(chartMetric === 'all' || chartMetric === 'revenue') && (
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="revenue"
                      name="Revenue"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2.5}
                      dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, strokeWidth: 2 }}
                    />
                  )}
                  {(chartMetric === 'all' || chartMetric === 'users') && (
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="users"
                      name="Users"
                      stroke="hsl(var(--success))"
                      strokeWidth={2.5}
                      dot={{ fill: 'hsl(var(--success))', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, strokeWidth: 2 }}
                    />
                  )}
                  {(chartMetric === 'all' || chartMetric === 'orders') && (
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="orders"
                      name="Orders"
                      stroke="hsl(var(--warning))"
                      strokeWidth={2.5}
                      dot={{ fill: 'hsl(var(--warning))', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, strokeWidth: 2 }}
                    />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Year Comparison Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t">
              {years.map((year) => {
                const data = yearlyData[year]
                const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0)
                const isSelected = year === selectedYear
                
                return (
                  <button
                    key={year}
                    onClick={() => setSelectedYear(year)}
                    className={cn(
                      'p-4 rounded-lg text-left transition-all',
                      isSelected 
                        ? 'bg-primary/10 border-2 border-primary' 
                        : 'bg-muted/50 border-2 border-transparent hover:border-muted-foreground/20'
                    )}
                  >
                    <p className="text-sm text-muted-foreground">{year}</p>
                    <p className="text-lg font-bold mt-1">{formatCurrency(totalRevenue)}</p>
                    <p className="text-xs text-muted-foreground mt-1">Total Revenue</p>
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Content Grid */}
      <div className="">
   

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.6 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest actions in your dashboard</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Clock className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{activity.action}</p>
                      <p className="text-xs text-muted-foreground">by {activity.user}</p>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {activity.time}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
