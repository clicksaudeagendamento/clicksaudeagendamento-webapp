import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"

interface IconProps {
  icon: LucideIcon
  size?: 'sm' | 'default' | 'md' | 'lg'
  className?: string
}

/**
 * Standardized icon component wrapper
 * Ensures consistent icon sizes across the application
 */
export const Icon = ({ icon: IconComponent, size = 'default', className }: IconProps) => {
  const sizes = {
    sm: 'w-4 h-4',       // 16px - Labels, small buttons
    default: 'w-5 h-5',  // 20px - Normal buttons, inputs
    md: 'w-6 h-6',       // 24px - Headers, cards
    lg: 'w-8 h-8'        // 32px - Features, hero sections
  }

  return <IconComponent className={cn(sizes[size], className)} />
}

// Export commonly used icons with consistent sizing
export { 
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  X,
  Plus,
  Minus,
  Edit,
  Trash2,
  Save,
  Calendar,
  Clock,
  User,
  Users,
  Phone,
  Mail,
  MapPin,
  Search,
  Settings,
  LogOut,
  Menu,
  Home,
  Building,
  FileText,
  AlertCircle,
  CheckCircle,
  XCircle,
  Info,
  AlertTriangle,
  Loader2,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Star,
  Heart,
  Share2,
  Download,
  Upload,
  Copy,
  ExternalLink,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  MoreVertical,
  MoreHorizontal,
  Filter,
  SortAsc,
  SortDesc,
  Zap,
  Shield,
  Award,
  MessageCircle,
  Bell,
  Smartphone
} from 'lucide-react'
