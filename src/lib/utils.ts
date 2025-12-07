import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Merge Tailwind CSS classes with proper precedence
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format phone number to Brazilian format
 * @param phone - Phone number string
 * @returns Formatted phone number (11) 99999-9999
 */
export function formatPhone(phone: string): string {
  const numbers = phone.replace(/\D/g, '')
  
  if (numbers.length <= 2) {
    return numbers
  } else if (numbers.length <= 7) {
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`
  } else if (numbers.length <= 11) {
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, -4)}-${numbers.slice(-4)}`
  }
  
  return phone
}

/**
 * Validate Brazilian phone number
 * @param phone - Phone number to validate
 * @returns true if valid
 */
export function isValidPhone(phone: string): boolean {
  const numbers = phone.replace(/\D/g, '')
  return numbers.length === 10 || numbers.length === 11
}

/**
 * Validate email address
 * @param email - Email to validate
 * @returns true if valid
 */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

/**
 * Truncate text to specified length
 * @param text - Text to truncate
 * @param maxLength - Maximum length
 * @returns Truncated text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return `${text.slice(0, maxLength)}...`
}

/**
 * Get initials from a name
 * @param name - Full name
 * @returns Initials (e.g., "John Doe" -> "JD")
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}
