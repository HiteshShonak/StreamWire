import React from 'react'
import { motion } from 'framer-motion'
import { Eye, Users, Heart, Film } from 'lucide-react'
import { formatViews } from '../../utils/formatters'

const StatsOverview = ({ stats }) => {
    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
                { label: 'Total Views', value: formatViews(stats?.totalViews || 0), icon: Eye },
                { label: 'Subscribers', value: formatViews(stats?.totalSubscribers || 0), icon: Users },
                { label: 'Total Likes', value: formatViews(stats?.totalLikes || 0), icon: Heart },
                { label: 'Total Videos', value: stats?.totalVideos || 0, icon: Film },
            ].map((stat, i) => (
                <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="p-6 bg-zinc-900 border border-zinc-800 rounded-2xl"
                >
                    <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center mb-4">
                        <stat.icon className="w-5 h-5 text-zinc-400" />
                    </div>
                    <p className="text-3xl font-black text-white mb-1">{stat.value}</p>
                    <p className="text-sm text-zinc-500">{stat.label}</p>
                </motion.div>
            ))}
        </div>
    )
}

export default StatsOverview
