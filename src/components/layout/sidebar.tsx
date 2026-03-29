'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  FileText,
  BarChart3,
  Building2,
  Users,
  Ticket,
  Monitor,
  Lightbulb,
  Settings,
  Sun,
  Mail,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/faturas', label: 'Faturas', icon: FileText },
  { href: '/relatorios', label: 'Relat\u00f3rios', icon: BarChart3 },
  { href: '/unidades', label: 'Unidades', icon: Building2 },
  { href: '/clientes', label: 'Clientes', icon: Users },
  { href: '/tickets', label: 'Tickets', icon: Ticket },
  { href: '/mensagens', label: 'Mensagens Aut.', icon: Mail },
  { href: '/portais', label: 'Portais', icon: Monitor },
  { href: '/oportunidades', label: 'Oportunidades', icon: Lightbulb },
  { href: '/configuracoes', label: 'Configura\u00e7\u00f5es', icon: Settings },
]

interface SidebarProps {
  open?: boolean
  onClose?: () => void
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside
      className={cn(
        'flex h-full w-64 flex-col border-r bg-white',
        // Mobile: overlay
        'fixed inset-y-0 left-0 z-50 transform transition-transform duration-200 ease-in-out lg:static lg:translate-x-0',
        open ? 'translate-x-0' : '-translate-x-full'
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b px-6">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Sun className="h-7 w-7 text-amber-500" />
          <span className="text-xl font-bold text-gray-900">SolarZ</span>
        </Link>
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onClose}
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            const Icon = item.icon
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-amber-50 text-amber-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  )}
                >
                  <Icon className={cn('h-5 w-5', isActive ? 'text-amber-600' : 'text-gray-400')} />
                  {item.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="border-t px-4 py-3">
        <p className="text-xs text-gray-400">SolarZ Platform v1.0</p>
      </div>
    </aside>
  )
}
