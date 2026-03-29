'use client'

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'

interface StatusFiltersCounts {
  todos: number
  normal: number
  alerta: number
  critico: number
  desconhecido: number
}

interface StatusFiltersProps {
  counts: StatusFiltersCounts
  active: string
  onChange: (status: string) => void
}

const tabs = [
  { value: 'todos', label: 'Todos', badgeClass: 'bg-zinc-500 text-white' },
  { value: 'normal', label: 'Normal', badgeClass: 'bg-green-500 text-white' },
  { value: 'alerta', label: 'Alerta', badgeClass: 'bg-amber-500 text-white' },
  { value: 'critico', label: 'Critico', badgeClass: 'bg-red-500 text-white' },
  { value: 'desconhecido', label: 'Desconhecido', badgeClass: 'bg-gray-400 text-white' },
] as const

export function StatusFilters({ counts, active, onChange }: StatusFiltersProps) {
  return (
    <Tabs
      value={active}
      onValueChange={(val) => onChange(val as string)}
    >
      <TabsList variant="line">
        {tabs.map((tab) => (
          <TabsTrigger key={tab.value} value={tab.value} className="gap-2">
            {tab.label}
            <Badge
              variant="secondary"
              className={`${tab.badgeClass} h-5 min-w-5 justify-center rounded-full px-1.5 text-[10px]`}
            >
              {counts[tab.value]}
            </Badge>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  )
}
