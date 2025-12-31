import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { motion } from 'framer-motion'
import { Search, Filter, RefreshCw, Calendar, CheckCircle } from 'lucide-react'
import { carBookingsData } from './dashboardData'

export function RecentActivityCard() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.6 }}
            className="col-span-1 border-none shadow-sm"
        >
            <Card className="bg-white border-0 shadow-none">
                <CardHeader className="flex flex-row items-center justify-between pb-6">
                    <CardTitle className="text-xl font-bold text-slate-800">Car Bookings</CardTitle>
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search client name & car etc."
                                className="pl-9 pr-4 py-2 border rounded-md text-sm w-[280px] focus:outline-none focus:ring-1 focus:ring-primary/50"
                            />
                        </div>
                        <button className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-md text-sm font-medium hover:bg-amber-600 transition-colors">
                            <Filter className="h-4 w-4" />
                            Filter
                        </button>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="w-full overflow-auto">
                        <table className="w-full min-w-[800px]">
                            <thead>
                                <tr className="bg-[#E2FBFB] text-slate-800">
                                    <th className="px-6 py-4 text-left text-sm font-bold">Booking ID</th>
                                    <th className="px-6 py-4 text-left text-sm font-bold">Date</th>
                                    <th className="px-6 py-4 text-left text-sm font-bold">Client Name</th>
                                    <th className="px-6 py-4 text-left text-sm font-bold">Car Model</th>
                                    <th className="px-6 py-4 text-left text-sm font-bold">Plan</th>
                                    <th className="px-6 py-4 text-center text-sm font-bold">payment</th>
                                    <th className="px-6 py-4 text-right text-sm font-bold">status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {carBookingsData.map((booking, index) => (
                                    <motion.tr
                                        key={booking.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.1 * index }}
                                        className="hover:bg-gray-50/50"
                                    >
                                        <td className="px-6 py-4 text-sm font-medium text-slate-700">
                                            {booking.id}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1 text-xs">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-gray-500 w-8">Start</span>
                                                    <span className="bg-amber-400/90 text-white px-2 py-0.5 rounded text-[11px] font-medium min-w-[80px] text-center">
                                                        {booking.startDate}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-gray-500 w-8">End</span>
                                                    <span className="bg-[#5C7CFA] text-white px-2 py-0.5 rounded text-[11px] font-medium min-w-[80px] text-center">
                                                        {booking.endDate}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-700 font-medium">
                                            {booking.clientName}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-sm font-medium text-slate-700">{booking.carModel}</span>
                                                <span className="bg-gray-100 text-gray-500 text-xs px-2 py-0.5 rounded w-fit">
                                                    {booking.licensePlate}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-700 font-medium">
                                            {booking.plan}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col items-center gap-1">
                                                <span className="text-sm font-semibold text-slate-700">{booking.payment}</span>
                                                <span
                                                    className={`text-xs px-3 py-0.5 rounded-full font-medium ${booking.paymentStatus === 'Paid'
                                                            ? 'bg-green-100 text-green-600'
                                                            : 'bg-red-50 text-red-500'
                                                        }`}
                                                >
                                                    {booking.paymentStatus}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                className={`inline-flex items-center gap-2 px-4 py-2 rounded-md text-white text-xs font-semibold w-[120px] justify-center transition-colors ${booking.status === 'Completed'
                                                        ? 'bg-emerald-500 hover:bg-emerald-600'
                                                        : booking.status === 'Running'
                                                            ? 'bg-cyan-500 hover:bg-cyan-600'
                                                            : 'bg-indigo-600 hover:bg-indigo-700'
                                                    }`}
                                            >
                                                {booking.status === 'Completed' && <CheckCircle className="h-3.5 w-3.5" />}
                                                {booking.status === 'Running' && <RefreshCw className="h-3.5 w-3.5 animate-spin-slow" />}
                                                {booking.status === 'Upcoming' && <Calendar className="h-3.5 w-3.5" />}
                                                {booking.status}
                                            </button>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    )
}
