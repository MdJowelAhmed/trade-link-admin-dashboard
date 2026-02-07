import { useState, useMemo } from 'react'
import { formatCurrency, formatCompactNumber } from '@/utils/formatters'
import { totalCustomers, TotalLeads, TotalRevenue, totalTradePerson } from '@/components/common/svg/DashboardSVG'
import { StatCard } from './StatCard'
import { EarningsSummaryChart } from './EarningsSummaryChart'
// import { RentStatusChart } from './RentStatusChart'
// import { RecentActivityCard } from './RecentActivityCard'
import { useGetDashboardDataQuery, useGetEarningsDataQuery } from '@/redux/api/dashboardApi'
import { years } from './dashboardData'

// Month names mapping
const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export default function Dashboard() {
  const currentYear = new Date().getFullYear().toString()
  const [selectedYear, setSelectedYear] = useState(currentYear)

  // Fetch dashboard summary data
  const { data: dashboardData, isLoading: isLoadingDashboard } = useGetDashboardDataQuery()

  // Fetch earnings data for selected year
  const { data: earningsData, isLoading: isLoadingEarnings } = useGetEarningsDataQuery({
    year: selectedYear,
  })

  // Transform earnings data from API format to chart format
  const chartData = useMemo(() => {
    if (!earningsData) return []

    // Create a map of month number to earnings
    const earningsMap = new Map(earningsData.map(item => [item.month, item.totalEarnings]))

    // Generate chart data for all 12 months
    return monthNames.map((monthName, index) => {
      const monthNumber = index + 1
      const totalEarnings = earningsMap.get(monthNumber) || 0

      return {
        month: monthName,
        revenue: totalEarnings,
        users: 0, // Not provided by API
        orders: 0, // Not provided by API
      }
    })
  }, [earningsData])

  // Prepare stats from dashboard data
  const stats = useMemo(() => {
    if (!dashboardData) return []

    return [
      {
        title: 'Total Customers',
        value: formatCompactNumber(dashboardData.totalCustomers),
        change: 0, // API doesn't provide change data
        icon: totalCustomers,
        description: 'Total registered',
        background: "#1E3A5F",
      },
      {
        title: 'Trade Persons',
        value: formatCompactNumber(dashboardData.totalProfessionals),
        change: 0, // API doesn't provide change data
        icon: totalTradePerson,
        description: 'Total registered',
        background: "#3E6B5B",
      },
      {
        title: 'Total Leads',
        value: formatCompactNumber(0), // Not provided by API
        change: 0,
        icon: TotalLeads,
        description: 'Not available',
        background: "#F4A261",
      },
      {
        title: 'Total Earnings',
        value: formatCurrency(dashboardData.totalEarnings),
        change: 0, // API doesn't provide change data
        icon: TotalRevenue,
        description: 'All time',
        background: "#E8A469",
      },
    ]
  }, [dashboardData])

  // Show loading state
  if (isLoadingDashboard || isLoadingEarnings) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-muted-foreground">Loading dashboard data...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <StatCard key={stat.title} {...stat} index={index} />
        ))}
      </div>

      {/* Chart Section - Two Column Layout */}
      <div className="">
        <EarningsSummaryChart
          chartData={chartData}
          selectedYear={selectedYear}
          onYearChange={setSelectedYear}
          tooltipFormatter={(value) => formatCurrency(value)}
          valueFormatter={(value) => {
            if (value >= 1000000) {
              return `$${(value / 1000000).toFixed(1)}M`
            }
            if (value >= 1000) {
              return `$${(value / 1000).toFixed(0)}k`
            }
            return `$${value}`
          }}
          dataKey="revenue"
        />

        {/* <div className='col-span-4'>
        <RentStatusChart />
       </div> */}
      </div>

      {/* Recent Activity */}
      {/* <div>
        <RecentActivityCard />
      </div> */}
    </div>
  )
}
