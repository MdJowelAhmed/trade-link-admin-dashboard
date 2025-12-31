// Generate mock data for different years
export const generateYearData = (year: number) => {
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

export const yearlyData: Record<string, ReturnType<typeof generateYearData>> = {
    '2024': generateYearData(2024),
    '2023': generateYearData(2023),
    '2022': generateYearData(2022),
    '2021': generateYearData(2021),
}

export const years = ['2024', '2023', '2022', '2021']

export const carBookingsData = [
    {
        id: 'Ik-20248',
        startDate: '21 Aug 2026',
        endDate: '26 Aug 2026',
        clientName: 'Alice Jhonson',
        carModel: 'Toyota Corolla',
        licensePlate: 'TX1234',
        plan: '2 Days',
        payment: '€350',
        paymentStatus: 'Paid',
        status: 'Completed',
    },
    {
        id: 'Ik-20249',
        startDate: '21 Aug 2026',
        endDate: '26 Aug 2026',
        clientName: 'Alice Jhonson',
        carModel: 'Toyota Corolla',
        licensePlate: 'TX1234',
        plan: '2 Days',
        payment: '$500',
        paymentStatus: 'Pending',
        status: 'Upcoming',
    },
    {
        id: 'Ik-20250',
        startDate: '21 Aug 2026',
        endDate: '26 Aug 2026',
        clientName: 'Alice Jhonson',
        carModel: 'Toyota Corolla',
        licensePlate: 'TX1234',
        plan: '2 Days',
        payment: '$500',
        paymentStatus: 'Pending',
        status: 'Running',
    },
    {
        id: 'Ik-20251',
        startDate: '21 Aug 2026',
        endDate: '26 Aug 2026',
        clientName: 'Alice Jhonson',
        carModel: 'Toyota Corolla',
        licensePlate: 'TX1234',
        plan: '2 Days',
        payment: '$500',
        paymentStatus: 'Paid',
        status: 'Completed',
    },
    {
        id: 'Ik-20252',
        startDate: '21 Aug 2026',
        endDate: '26 Aug 2026',
        clientName: 'Alice Jhonson',
        carModel: 'Toyota Corolla',
        licensePlate: 'TX1234',
        plan: '2 Days',
        payment: '$500',
        paymentStatus: 'Pending',
        status: 'Upcoming',
    },
]

export const recentActivityData = [
    { id: 1, action: 'New user registered', user: 'John Doe', time: '2 min ago' },
    { id: 2, action: 'Product updated', user: 'Jane Smith', time: '15 min ago' },
    { id: 3, action: 'Order completed', user: 'Mike Johnson', time: '1 hour ago' },
    { id: 4, action: 'Category created', user: 'Sarah Williams', time: '2 hours ago' },
    { id: 5, action: 'User blocked', user: 'Admin', time: '3 hours ago' },
]

export const rentStatusData = [
    { name: 'Upcoming', value: 45, color: '#3B82F6' },
    { name: 'Running', value: 58, color: '#06B6D4' },
    { name: 'Completed', value: 45, color: '#10B981' },
]
