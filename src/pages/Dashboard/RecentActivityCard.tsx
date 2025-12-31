import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Clock } from 'lucide-react'
import { motion } from 'framer-motion'

interface Activity {
    id: number
    action: string
    user: string
    time: string
}

interface RecentActivityCardProps {
    activities: Activity[]
}

export function RecentActivityCard({ activities }: RecentActivityCardProps) {
    return (
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
                        {activities.map((activity) => (
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
    )
}
