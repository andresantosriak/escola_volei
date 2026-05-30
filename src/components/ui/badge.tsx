import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold',
  {
    variants: {
      tone: {
        neutral: 'bg-sunken text-fg-2',
        win: 'bg-green-50 text-green-700',
        loss: 'bg-[#FDEAEA] text-[#B4282D]',
        warn: 'bg-[#FFF0DD] text-[#A85A00]',
        bal: 'bg-[#E6ECFB] text-ink-700',
        accent: 'bg-yellow-400 text-ink-900',
      },
    },
    defaultVariants: { tone: 'neutral' },
  },
)

interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, tone, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />
}
