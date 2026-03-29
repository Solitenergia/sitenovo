'use client'

import { BarChart3 } from 'lucide-react'

export default function RelatoriosPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <BarChart3 className="size-16 text-muted-foreground/40" />
      <h1 className="mt-4 text-2xl font-bold tracking-tight">Relat\u00f3rios</h1>
      <p className="mt-2 text-muted-foreground">Em breve</p>
    </div>
  )
}
