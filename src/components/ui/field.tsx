import * as React from 'react'
import { cn } from '@/lib/utils'
import { Label } from './label'

interface FieldProps {
  label?: string
  error?: string
  hint?: string
  htmlFor?: string
  className?: string
  children: React.ReactNode
}

export function Field({ label, error, hint, htmlFor, className, children }: FieldProps) {
  return (
    <div className={cn('mb-4', className)}>
      {label && <Label htmlFor={htmlFor}>{label}</Label>}
      {children}
      {hint && !error && <p className="mt-1 text-xs text-fg-4">{hint}</p>}
      {error && <p className="mt-1 text-xs text-loss">{error}</p>}
    </div>
  )
}
