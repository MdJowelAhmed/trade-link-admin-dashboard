import { useState, useMemo } from 'react'
import { formatCurrency, formatCompactNumber } from '@/utils/formatters'
import { AvailableCars, RentalCars, TotalBooking, TotalRevenue } from '@/components/common/svg/DashboardSVG'
import { StatCard } from './StatCard'
import { EarningsSummaryChart } from './EarningsSummaryChart'
// import { RentStatusChart } from './RentStatusChart'
// import { RecentActivityCard } from './RecentActivityCard'
import { yearlyData } from './dashboardData'

export default function Dashboard() {
  const [selectedYear, setSelectedYear] = useState('2024')

  const chartData = useMemo(() => yearlyData[selectedYear], [selectedYear])

  const stats = [
    {
      title: 'Total Revenue',
      value: formatCompactNumber(12543),
      change: 12.5,
      icon: TotalRevenue,
      description: 'vs last month',
    },
    {
      title: 'Total Products',
      value: formatCompactNumber(3420),
      change: 8.2,
      icon: TotalBooking,
      description: 'vs last month',
    },
    {
      title: 'Categories',
      value: '156',
      change: 3.1,
      icon: RentalCars,
      description: 'vs last month',
    },
    {
      title: 'Total Revenue',
      value: formatCurrency(845320),
      change: -2.4,
      icon: AvailableCars,
      description: 'vs last month',
    },
  ]

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
