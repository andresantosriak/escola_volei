import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

// Fiel a design-system/preview/comp-buttons.html (.btn):
// Archivo (font-display) 700; radius 14px; gap 8; md h48 px18 text15 svg18; full h56 text17.
// primary green-500 + shadow 0 8px 20px -8px green-600; secondary(.btn.ghost) green-50/green-700;
// ghost(.btn.outline) transparente + borda 1.5px border-2.
const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[14px] font-display font-bold transition-all duration-150 active:scale-[0.97] disabled:bg-gray-100 disabled:text-fg-4 disabled:shadow-none disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-app [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        primary:
          'bg-green-500 text-white shadow-[0_8px_20px_-8px_var(--color-green-600)] hover:bg-green-600',
        secondary: 'bg-green-50 text-green-700 hover:bg-green-100',
        ghost: 'border-[1.5px] border-border-2 bg-transparent text-fg-2 hover:bg-sunken',
        danger: 'bg-loss-500 text-white hover:opacity-90',
        outline: 'border-[1.5px] border-border-2 bg-surface text-fg-1 hover:bg-sunken',
      },
      size: {
        sm: 'h-9 px-3.5 text-sm [&_svg]:size-4',
        md: 'h-12 px-[18px] text-[15px] [&_svg]:size-[18px]',
        lg: 'h-14 px-6 text-[17px] [&_svg]:size-[18px]',
        icon: 'size-12 [&_svg]:size-[22px]',
      },
      full: { true: 'w-full', false: '' },
    },
    defaultVariants: { variant: 'primary', size: 'md', full: false },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, full, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp className={cn(buttonVariants({ variant, size, full, className }))} ref={ref} {...props} />
    )
  },
)
Button.displayName = 'Button'

export { buttonVariants }
