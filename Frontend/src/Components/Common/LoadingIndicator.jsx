import { Radio } from 'lucide-react'

// pulsing dots for button/inline loading states
export const LoadingDots = ({ size = 'sm', className = '' }) => {
    const dotSize = {
        xs: 'w-1 h-1',
        sm: 'w-1.5 h-1.5',
        md: 'w-2 h-2',
        lg: 'w-2.5 h-2.5',
    }[size] || 'w-1.5 h-1.5'

    const gap = size === 'xs' ? 'gap-0.5' : 'gap-1'

    return (
        <span className={`inline-flex items-center ${gap} ${className}`} role="status" aria-label="Loading">
            {[0, 1, 2].map((i) => (
                <span
                    key={i}
                    className={`${dotSize} rounded-full bg-current`}
                    style={{
                        animation: 'loadingDot 1.4s ease-in-out infinite',
                        animationDelay: `${i * 0.16}s`,
                    }}
                />
            ))}
        </span>
    )
}

// branded pulse icon for page-level loading
export const LoadingPulse = ({ size = 'md', className = '' }) => {
    const iconSize = {
        sm: 'w-6 h-6',
        md: 'w-10 h-10',
        lg: 'w-14 h-14',
    }[size] || 'w-10 h-10'

    const containerSize = {
        sm: 'w-12 h-12',
        md: 'w-20 h-20',
        lg: 'w-28 h-28',
    }[size] || 'w-20 h-20'

    return (
        <div className={`flex items-center justify-center ${className}`} role="status" aria-label="Loading">
            <div className={`relative ${containerSize} flex items-center justify-center`}>
                {/* Outer glow ring */}
                <div
                    className="absolute inset-0 rounded-full bg-indigo-500/20 border border-indigo-500/30"
                    style={{ animation: 'loadingPulseRing 2s ease-in-out infinite' }}
                />
                {/* Inner icon */}
                <Radio
                    className={`${iconSize} text-indigo-400 relative z-10`}
                    style={{ animation: 'loadingPulseIcon 2s ease-in-out infinite' }}
                />
            </div>
        </div>
    )
}

export default { LoadingDots, LoadingPulse }
