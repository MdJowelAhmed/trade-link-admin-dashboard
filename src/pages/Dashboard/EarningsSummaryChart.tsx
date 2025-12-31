import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts'
import { motion } from 'framer-motion'
import { years } from './dashboardData'

interface ChartDataPoint {
    month: string
    revenue: number
    users: number
    orders: number
}

interface EarningsSummaryChartProps {
    chartData: ChartDataPoint[]
    selectedYear: string
    onYearChange: (year: string) => void
}

export function EarningsSummaryChart({ chartData, selectedYear, onYearChange }: EarningsSummaryChartProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
        >
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Earnings Summary</CardTitle>
                        <Select value={selectedYear} onValueChange={onYearChange}>
                            <SelectTrigger className="w-[120px]">
                                <SelectValue placeholder="Year" />
                            </SelectTrigger>
                            <SelectContent>
                                {years.map((year) => (
                                    <SelectItem key={year} value={year}>
                                        Last {year}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="mt-2">
                        <span className="inline-flex items-center px-3 py-1 rounded-md bg-orange-500 text-white text-xs font-medium">
                            Total Earning
                        </span>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="h-[280px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart
                                data={chartData}
                                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                            >
                                <defs>
                                    <linearGradient id="earningGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#FF9F43" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#FF9F43" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                                <XAxis
                                    dataKey="month"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#999', fontSize: 12 }}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#999', fontSize: 12 }}
                                    tickFormatter={(value) => `${value / 1000}k`}
                                    domain={[0, 100000]}
                                    ticks={[0, 25000, 50000, 75000, 100000]}
                                />
                                <Tooltip
                                    content={({ active, payload }) => {
                                        if (active && payload && payload.length) {
                                            return (
                                                <div className="bg-gray-800 text-white px-3 py-2 rounded-md shadow-lg">
                                                    <p className="font-semibold">
                                                        {(payload[0].value as number / 1000).toFixed(1)}k
                                                    </p>
                                                </div>
                                            )
                                        }
                                        return null
                                    }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="#FF9F43"
                                    strokeWidth={3}
                                    fill="url(#earningGradient)"
                                    dot={false}
                                    activeDot={{ r: 6, fill: '#FF9F43', stroke: '#fff', strokeWidth: 2 }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    )
}
