import { cn } from "@/lib/utils"

interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode
  level?: 1 | 2 | 3 | 4
}

export const Heading = ({ children, level = 1, className, ...props }: HeadingProps) => {
  const styles = {
    1: 'text-2xl sm:text-3xl md:text-4xl font-bold text-slate-800 leading-tight',
    2: 'text-xl sm:text-2xl md:text-3xl font-bold text-slate-800 leading-tight',
    3: 'text-lg sm:text-xl font-semibold text-slate-800 leading-snug',
    4: 'text-base sm:text-lg font-semibold text-slate-700'
  }

  const HeadingTag = `h${level}` as 'h1' | 'h2' | 'h3' | 'h4'

  return (
    <HeadingTag className={cn(styles[level], className)} {...props}>
      {children}
    </HeadingTag>
  )
}

interface TextProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode
  size?: 'sm' | 'base' | 'lg'
  variant?: 'primary' | 'secondary' | 'muted'
}

export const Text = ({ 
  children, 
  size = 'base', 
  variant = 'primary',
  className, 
  ...props 
}: TextProps) => {
  const sizes = {
    sm: 'text-xs sm:text-sm',
    base: 'text-sm sm:text-base',
    lg: 'text-base sm:text-lg'
  }

  const variants = {
    primary: 'text-slate-700',
    secondary: 'text-slate-600',
    muted: 'text-slate-500'
  }

  return (
    <p className={cn(sizes[size], variants[variant], 'leading-normal', className)} {...props}>
      {children}
    </p>
  )
}

interface LabelTextProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode
}

export const LabelText = ({ children, className, ...props }: LabelTextProps) => {
  return (
    <span className={cn('text-sm font-medium text-slate-700', className)} {...props}>
      {children}
    </span>
  )
}

interface CodeTextProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode
}

export const CodeText = ({ children, className, ...props }: CodeTextProps) => {
  return (
    <code 
      className={cn(
        'px-1.5 py-0.5 bg-slate-100 text-slate-800 rounded text-sm font-mono',
        className
      )} 
      {...props}
    >
      {children}
    </code>
  )
}
