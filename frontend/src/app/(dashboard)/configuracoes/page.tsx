'use client'

import { Settings } from 'lucide-react'

export default function ConfiguracoesPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <Settings className="size-16 text-muted-foreground/40" />
      <h1 className="mt-4 text-2xl font-bold tracking-tight">Configurações</h1>
      <p className="mt-2 text-muted-foreground">Em breve</p>
    </div>
  )
}
