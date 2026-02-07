// Fixed monthly earnings data (in thousands - will be multiplied by 1000)
// You can easily modify these values here
const fixedMonthlyEarnings: Record<string, number[]> = {
    '2024': [24, 30, 20, 40, 35, 45, 50, 38, 42, 48, 75, 55], // Jan-Dec in k
    '2023': [20, 25, 18, 35, 30, 40, 65, 33, 38, 42, 30, 50],
    '2022': [18, 22, 16, 90, 28, 35, 55, 30, 35, 38, 28, 45],
    '2021': [15, 20, 14, 25, 25, 30, 70, 28, 32, 49, 25, 40],
    '2025': [26, 32, 22, 42, 38, 48, 90, 40, 45, 50, 38, 38],
    '2026': [28, 48, 25, 45, 40, 50, 85, 43, 48, 40, 60, 27],
}

// Generate fixed data for different years
export const generateYearData = (year: number) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const yearKey = year.toString()
    const earnings = fixedMonthlyEarnings[yearKey] || fixedMonthlyEarnings['2026']
    
    // Base values for users and orders (you can also make these fixed if needed)
    const baseUsers = 500 + (year - 2021) * 200
    const baseOrders = 300 + (year - 2021) * 100

    return months.map((month, index) => {
        // Fixed revenue from the array (multiply by 1000 to convert k to actual value)
        const revenue = earnings[index] * 1000
        
        // Users and orders can remain dynamic or you can make them fixed too
        const users = Math.round(baseUsers * (0.9 + (index * 0.02)))
        const orders = Math.round(baseOrders * (0.9 + (index * 0.02)))

        return {
            month,
            revenue,
            users,
            orders,
        }
    })
}

export const yearlyData: Record<string, ReturnType<typeof generateYearData>> = {
    '2026': generateYearData(2026),
    '2025': generateYearData(2025),
    '2024': generateYearData(2024),
    '2023': generateYearData(2023),
    '2022': generateYearData(2022),
    '2021': generateYearData(2021),
}

// Generate years array dynamically (current year and 5 previous years)
const currentYear = new Date().getFullYear()
export const years = Array.from({ length: 6 }, (_, i) => currentYear - i)

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
