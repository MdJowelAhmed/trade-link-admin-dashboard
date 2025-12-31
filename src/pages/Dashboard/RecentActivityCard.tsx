import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { motion } from 'framer-motion'
import {  RefreshCw, Calendar, CheckCircle } from 'lucide-react'
import { carBookingsData } from './dashboardData'

export function RecentActivityCard() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.6 }}
            className="col-span-1 border-none shadow-sm"
        >
            <Card className="bg-white border-0">
                <CardHeader className="flex flex-row items-center justify-between pb-6">
                    <CardTitle className="text-xl font-bold text-slate-800">Car Bookings</CardTitle>
                
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
                            <tbody className="divide-y divide-gray-100 text-accent-foreground">
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
                                                    <span className="text-accent-foreground w-8">Start</span>
                                                    <span className="bg-secondary text-white px-3 py-1 rounded text-[11px] font-medium min-w-[80px] text-center">
                                                        {booking.startDate}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-accent-foreground w-8">End</span>
                                                    <span className="bg-primary-foreground text-white px-3 py-1 rounded text-[11px] font-medium min-w-[80px] text-center">
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
                                                <span className="bg-gray-100 text-accent-foreground text-xs px-2 py-0.5 rounded w-fit">
                                                    {booking.licensePlate}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-700 font-medium">
                                            {booking.plan}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col items-center gap-1">
                                                <span className="text-sm font-semiboldv bg-gray-100 text-accent-foreground text-slate-700">{booking.payment}</span>
                                                <span
                                                    className={`text-xs px-3 py-1 rounded-full font-medium ${booking.paymentStatus === 'Paid'
                                                            ? 'bg-gray-100 text-accent-foreground'
                                                            : 'bg-gray-100 text-accent-foreground'
                                                        }`}
                                                >
                                                    {booking.paymentStatus}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                className={`inline-flex items-center gap-2 px-4 py-2 rounded-md text-white text-xs font-semibold w-[120px] justify-center transition-colors ${booking.status === 'Completed'
                                                        ? 'bg-primary hover:bg-primary/80'
                                                        : booking.status === 'Running'
                                                            ? 'bg-secondary-foreground hover:bg-secondary/80'
                                                            : 'bg-primary-foreground hover:bg-primary/80'
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
