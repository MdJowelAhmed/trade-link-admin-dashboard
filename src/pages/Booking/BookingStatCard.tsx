import { motion } from 'framer-motion'
import { bookingStats } from './bookingData'

export function BookingStatCard() {
    return (
        <div className="grid gap-4 lg:gap-8 md:grid-cols-2 lg:grid-cols-4">
            {bookingStats.map((stat, index) => {
                const Icon = stat.icon
                return (
                    <motion.div
                        key={stat.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className={`bg-[#FFF] rounded-xl p-5 shadow-sm`}
                    >
                        <div className="flex items-start gap-4">
                            <div className={`p-3 rounded-lg ${stat.iconBgColor}`}>
                                <Icon />
                            </div>
                            <div className="flex-1">
                                <p className="lg:text-xl font-medium lg:font-semibold text-gray-600">
                                    {stat.title}
                                </p>
                                <div className="flex items-center justify-between gap-2 mt-1">
                                    <h3 className="text-3xl font-bold text-gray-900">
                                        {stat.value}
                                    </h3>

                                    <p className="text-sm text-accent-foreground mt-1">
                                    {stat.description}
                                </p>
                                </div>
                              
                            </div>
                        </div>
                    </motion.div>
                )
            })}
        </div>
    )
}
