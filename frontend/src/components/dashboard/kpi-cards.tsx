'use client'

import {
  Zap,
  Radio,
  BatteryCharging,
  Users,
  TicketCheck,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { DashboardStats } from '@/types'

interface KpiCardsProps {
  stats: DashboardStats
}

export function KpiCards({ stats }: KpiCardsProps) {
  const cards = [
    {
      title: 'Total de Usinas',
      value: stats.totalUsinas,
      icon: Zap,
      format: (v: number) => v.toLocaleString('pt-BR'),
    },
    {
      title: 'Usinas Monitoradas',
      value: stats.usinasMonitoradas,
      icon: Radio,
      format: (v: number) => v.toLocaleString('pt-BR'),
    },
    {
      title: 'Potencia Instalada',
      value: stats.potenciaInstalada,
      icon: BatteryCharging,
      format: (v: number) => `${(v / 1000).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} MWp`,
    },
    {
      title: 'Total de Clientes',
      value: stats.totalClientes,
      icon: Users,
      format: (v: number) => v.toLocaleString('pt-BR'),
    },
    {
      title: 'Tickets Abertos',
      value: stats.ticketsAbertos,
      icon: TicketCheck,
      format: (v: number) => v.toLocaleString('pt-BR'),
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5">
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <Icon className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.format(card.value)}</div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
