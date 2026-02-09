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
    // Custom value formatter function
    valueFormatter?: (value: number) => string
    // Custom tooltip formatter function
    tooltipFormatter?: (value: number) => string
    // Custom data key to display (default: 'revenue')
    dataKey?: 'revenue' | 'users' | 'orders'
    // Custom chart title
    chartTitle?: string
    // Custom gradient colors
    gradientColors?: {
        start: string
        end: string
    }
    // Custom stroke color
    strokeColor?: string
}


const generateTicks = (max: number) => {
    if (max === 0) return [0,10, 20, 30, 40, 50, 60, 70, 80, 90, 100]; 

    // Calculate a nice step size
    // We want 5 intervals (0 to max split 4 times) so 5 ticks total including 0
    const roughStep = max / 10;

    // Round step to a "nice" number (like 10, 20, 25, 50, 100 etc)
    const magnitude = Math.pow(10, Math.floor(Math.log10(roughStep)));
    const normalizedStep = roughStep / magnitude;

    let niceStep;
    if (normalizedStep <= 1) niceStep = 1;
    else if (normalizedStep <= 2) niceStep = 2;
    else if (normalizedStep <= 2.5) niceStep = 2.5;
    else if (normalizedStep <= 5) niceStep = 5;
    else niceStep = 10;

    const step = niceStep * magnitude;

    const ticks = [];
    for (let i = 0; i <= 10; i++) {
        ticks.push(i * step);
    }
    return ticks;
};

const strKFormatter = (num: number) => {
    if (num > 999) {
        return (num / 1000).toFixed(0) + 'k'
    }
    return num.toString()
}

interface CustomTooltipProps {
    active?: boolean;
    payload?: Array<{
        value: number;
        payload?: ChartDataPoint;
    }>;
    label?: string;
    formatter?: (value: number) => string;
}

const CustomTooltip = ({ active, payload, label, formatter }: CustomTooltipProps) => {
    if (active && payload && payload.length && payload[0].payload) {
        const dataPoint = payload[0].payload;
        const formattedValue = formatter 
            ? formatter(payload[0].value)
            : strKFormatter(payload[0].value);
        return (
            <div className="bg-primary text-white px-5 py-3 rounded-lg text-sm font-medium shadow-lg relative border border-white/20">
                <p className="text-xs text-white/80 mb-1">Month: {label || dataPoint.month}</p>
                <p className="text-base font-semibold">Earning: {formattedValue}</p>
                {/* <div className="absolute left-1/2 -bottom-1 -translate-x-1/2 w-2 h-2 bg-primary rotate-45"></div> */}
            </div>
        )
    }
    return null
}

export function EarningsSummaryChart({ 
    chartData, 
    selectedYear, 
    onYearChange,
    valueFormatter = strKFormatter,
    tooltipFormatter,
    dataKey = 'revenue',
    chartTitle = 'Earnings Summary',
    gradientColors = { start: '#1E3A5F', end: '#1E3A5F' },
    strokeColor = '#1E3A5F'
}: EarningsSummaryChartProps) {

    // Get max value for the selected data key
    const maxValue = Math.max(...chartData.map(d => d[dataKey]));

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
        >
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>{chartTitle}</CardTitle>
                        <Select value={selectedYear} onValueChange={onYearChange} >
                            <SelectTrigger className="w-[120px] bg-card text-black">
                                <SelectValue placeholder="Year" />
                            </SelectTrigger>
                            <SelectContent>
                                {years.map((year) => (
                                    <SelectItem key={year} value={year.toString()}>
                                        {year}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    {/* <div className="mt-2">
                        <span className="inline-flex items-center px-4 py-2 rounded-sm bg-secondary text-white text-xs font-medium">
                            Total Earning
                        </span>
                    </div> */}
                </CardHeader>
                <CardContent>
                    <div className="h-[520px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart
                                data={chartData}
                                margin={{ top: 20, right: 10, left: 0, bottom: 0 }}
                            >
                                <defs>
                                    <linearGradient id="earningGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="10%" stopColor={gradientColors.start} stopOpacity={0.8} />
                                        <stop offset="95%" stopColor={gradientColors.end} stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={true} horizontal={false} stroke="#E5E7EB" />
                                <XAxis
                                    dataKey="month"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#9CA3AF', fontSize: 12 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#9CA3AF', fontSize: 12 }}
                                    tickFormatter={valueFormatter}
                                    allowDataOverflow={false}
                                    domain={[0, 'dataMax']}
                                    ticks={generateTicks(maxValue)}
                                />
                                <Tooltip 
                                    content={<CustomTooltip formatter={tooltipFormatter || valueFormatter} />}
                                    cursor={{ stroke: strokeColor, strokeWidth: 1, strokeDasharray: '3 3' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey={dataKey}
                                    stroke={strokeColor}
                                    strokeWidth={1}
                                    fill="url(#earningGradient)"
                                    dot={false}
                                    activeDot={{ r: 6, fill: strokeColor, stroke: '#fff', strokeWidth: 1 }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    )
}
