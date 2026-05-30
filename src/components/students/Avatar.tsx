import { avatarColor, initials } from '@/lib/format'
import { cn } from '@/lib/utils'

interface AvatarProps {
  name: string
  size?: number
  photoUrl?: string | null
  ring?: string
  className?: string
}

export function Avatar({ name, size = 38, photoUrl, ring, className }: AvatarProps) {
  const [bg, fg] = avatarColor(name)
  if (photoUrl) {
    return (
      <img
        src={photoUrl}
        alt={name}
        width={size}
        height={size}
        className={cn('shrink-0 rounded-full object-cover', className)}
        style={{ width: size, height: size, boxShadow: ring ? `0 0 0 2px ${ring}` : undefined }}
      />
    )
  }
  return (
    <div
      className={cn('flex shrink-0 items-center justify-center rounded-full font-display font-bold', className)}
      style={{
        width: size,
        height: size,
        background: bg,
        color: fg,
        fontSize: Math.round(size * 0.38),
        boxShadow: ring ? `0 0 0 2px ${ring}` : undefined,
      }}
    >
      {initials(name)}
    </div>
  )
}
