import { cn } from "@/lib/utils"

interface SectionProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  variant?: 'default' | 'compact' | 'spacious'
}

export const Section = ({ children, variant = 'default', className, ...props }: SectionProps) => {
  const variants = {
    default: 'py-12 sm:py-16',
    compact: 'py-8 sm:py-12',
    spacious: 'py-16 sm:py-20'
  }

  return (
    <section className={cn(variants[variant], className)} {...props}>
      {children}
    </section>
  )
}

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export const Container = ({ children, className, ...props }: ContainerProps) => {
  return (
    <div className={cn("container mx-auto px-4", className)} {...props}>
      {children}
    </div>
  )
}

interface PageHeaderProps {
  title: string
  description?: string
  className?: string
}

export const PageHeader = ({ title, description, className }: PageHeaderProps) => {
  return (
    <div className={cn("mb-6 sm:mb-8", className)}>
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-800 mb-2">
        {title}
      </h1>
      {description && (
        <p className="text-sm sm:text-base text-slate-600">
          {description}
        </p>
      )}
    </div>
  )
}

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  variant?: 'default' | 'elevated' | 'admin'
}

export const Card = ({ children, variant = 'default', className, ...props }: CardProps) => {
  const variants = {
    default: 'bg-white rounded-lg shadow-md p-4 sm:p-6 border border-slate-200',
    elevated: 'card-elevated',
    admin: 'admin-card'
  }

  return (
    <div className={cn(variants[variant], className)} {...props}>
      {children}
    </div>
  )
}

interface StatusBadgeProps {
  children: React.ReactNode
  variant: 'success' | 'error' | 'warning' | 'info'
  className?: string
}

export const StatusBadge = ({ children, variant, className }: StatusBadgeProps) => {
  const variants = {
    success: 'badge-success',
    error: 'badge-error',
    warning: 'badge-warning',
    info: 'badge-info'
  }

  return (
    <span className={cn(variants[variant], className)}>
      {children}
    </span>
  )
}

interface AlertProps {
  children: React.ReactNode
  variant: 'success' | 'error' | 'warning' | 'info'
  className?: string
}

export const Alert = ({ children, variant, className }: AlertProps) => {
  const variants = {
    success: 'alert-success',
    error: 'alert-error',
    warning: 'alert-warning',
    info: 'alert-info'
  }

  return (
    <div className={cn(variants[variant], className)}>
      {children}
    </div>
  )
}
