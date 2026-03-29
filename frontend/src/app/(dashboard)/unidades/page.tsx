'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Search, Loader2 } from 'lucide-react'

import api from '@/lib/api'
import type { UnidadeConsumidora, PaginatedResponse } from '@/types'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

const MOCK_UNITS: UnidadeConsumidora[] = [
  {
    id: '1',
    integrador_id: 'int-1',
    cliente_id: 'c1',
    usina_id: 'u1',
    denominacao: 'Residência Carlos Silva - Campinas',
    contrato: '3008547621',
    concessionaria: 'CPFL Paulista',
    created_at: '2024-03-10T10:00:00Z',
    cliente: { id: 'c1', nome: 'Carlos Alberto da Silva' },
    usina: { id: 'u1', nome: 'Usina Solar Campinas I', arquivada: false },
  },
  {
    id: '2',
    integrador_id: 'int-1',
    cliente_id: 'c2',
    usina_id: 'u2',
    denominacao: 'Apartamento Maria Oliveira - Niterói',
    contrato: '7120983456',
    concessionaria: 'Enel Rio',
    created_at: '2024-04-22T14:30:00Z',
    cliente: { id: 'c2', nome: 'Maria Fernanda Oliveira' },
    usina: { id: 'u2', nome: 'Usina Solar Niterói', arquivada: false },
  },
  {
    id: '3',
    integrador_id: 'int-1',
    cliente_id: 'c3',
    usina_id: 'u3',
    denominacao: 'Escritório Horizonte - Porto Alegre',
    contrato: '4509871234',
    concessionaria: undefined,
    created_at: '2024-01-15T08:45:00Z',
    cliente: { id: 'c3', nome: 'Construtora Horizonte Ltda' },
    usina: { id: 'u3', nome: 'Usina POA Norte', arquivada: false },
  },
  {
    id: '4',
    integrador_id: 'int-1',
    cliente_id: 'c4',
    usina_id: 'u4',
    denominacao: 'Casa Rafael Pereira - Brasília',
    contrato: '6103458792',
    concessionaria: 'CEB Distribuição',
    created_at: '2024-05-08T11:20:00Z',
    cliente: { id: 'c4', nome: 'Rafael Santos Pereira' },
    usina: { id: 'u4', nome: 'Usina BSB Lago Sul', arquivada: true },
  },
  {
    id: '5',
    integrador_id: 'int-1',
    cliente_id: 'c5',
    usina_id: 'u5',
    denominacao: 'Galpão Industrial - Contagem',
    contrato: '2087634159',
    concessionaria: 'Cemig',
    created_at: '2024-02-20T09:00:00Z',
    cliente: { id: 'c5', nome: 'João Pedro Mendes' },
    usina: { id: 'u5', nome: 'Usina Contagem II', arquivada: false },
  },
  {
    id: '6',
    integrador_id: 'int-1',
    cliente_id: 'c6',
    usina_id: 'u6',
    denominacao: 'Loja Centro - Curitiba',
    contrato: '8931245670',
    concessionaria: undefined,
    created_at: '2024-06-12T16:10:00Z',
    cliente: { id: 'c6', nome: 'Ana Beatriz Costa' },
    usina: { id: 'u6', nome: 'Usina Curitiba Centro', arquivada: false },
  },
  {
    id: '7',
    integrador_id: 'int-1',
    cliente_id: 'c7',
    usina_id: 'u7',
    denominacao: 'Fazenda Solar - Ribeirão Preto',
    contrato: '5476123089',
    concessionaria: 'CPFL Paulista',
    created_at: '2024-07-03T13:40:00Z',
    cliente: { id: 'c7', nome: 'Luciana Martins Rocha' },
    usina: { id: 'u7', nome: 'Usina Rural Ribeirão', arquivada: true },
  },
  {
    id: '8',
    integrador_id: 'int-1',
    cliente_id: 'c8',
    usina_id: 'u8',
    denominacao: 'Comércio Belém - Ananindeua',
    contrato: '1298764530',
    concessionaria: 'Equatorial Pará',
    created_at: '2024-08-19T07:55:00Z',
    cliente: { id: 'c8', nome: 'Thiago Ribeiro Nascimento' },
    usina: { id: 'u8', nome: 'Usina Belém Norte', arquivada: false },
  },
]

const ITEMS_PER_PAGE = 10

type FilterTab = 'todos' | 'concessionaria_ausente' | 'usinas_arquivadas'

export default function UnidadesPage() {
  const [filter, setFilter] = useState<FilterTab>('todos')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [units, setUnits] = useState<UnidadeConsumidora[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [formDenominacao, setFormDenominacao] = useState('')
  const [formContrato, setFormContrato] = useState('')
  const [formConcessionaria, setFormConcessionaria] = useState('')

  const fetchUnits = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await api.get<PaginatedResponse<UnidadeConsumidora>>('/unidades', {
        params: { filter, search, page },
      })
      setUnits(data.data)
      setTotal(data.total)
    } catch {
      let filtered = [...MOCK_UNITS]
      if (search) {
        const q = search.toLowerCase()
        filtered = filtered.filter(
          (u) =>
            (u.denominacao && u.denominacao.toLowerCase().includes(q)) ||
            (u.contrato && u.contrato.toLowerCase().includes(q)) ||
            (u.concessionaria && u.concessionaria.toLowerCase().includes(q))
        )
      }
      if (filter === 'concessionaria_ausente') {
        filtered = filtered.filter((u) => !u.concessionaria)
      } else if (filter === 'usinas_arquivadas') {
        filtered = filtered.filter((u) => u.usina?.arquivada === true)
      }
      setTotal(filtered.length)
      const start = (page - 1) * ITEMS_PER_PAGE
      setUnits(filtered.slice(start, start + ITEMS_PER_PAGE))
    } finally {
      setLoading(false)
    }
  }, [filter, search, page])

  useEffect(() => {
    fetchUnits()
  }, [fetchUnits])

  useEffect(() => {
    setPage(1)
  }, [filter, search])

  const totalPages = Math.max(1, Math.ceil(total / ITEMS_PER_PAGE))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      await api.post('/unidades', {
        denominacao: formDenominacao,
        contrato: formContrato,
        concessionaria: formConcessionaria || undefined,
      })
    } catch {
      // silently handle - mock environment
    } finally {
      setSubmitting(false)
      setDialogOpen(false)
      setFormDenominacao('')
      setFormContrato('')
      setFormConcessionaria('')
      fetchUnits()
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Unidades Consumidoras</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger render={<Button />}>
            <Plus className="size-4" />
            Adicionar Unidade
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Nova Unidade Consumidora</DialogTitle>
              <DialogDescription>
                Preencha os dados da nova unidade consumidora.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="denominacao">Denominacao</Label>
                <Input
                  id="denominacao"
                  placeholder="Ex: Residência principal - São Paulo"
                  value={formDenominacao}
                  onChange={(e) => setFormDenominacao(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contrato">Contrato</Label>
                <Input
                  id="contrato"
                  placeholder="Número do contrato"
                  value={formContrato}
                  onChange={(e) => setFormContrato(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="concessionaria">Concessionária</Label>
                <Input
                  id="concessionaria"
                  placeholder="Ex: CPFL, Cemig, Enel..."
                  value={formConcessionaria}
                  onChange={(e) => setFormConcessionaria(e.target.value)}
                />
              </div>
              <DialogFooter>
                <Button type="submit" disabled={submitting || !formDenominacao}>
                  {submitting && <Loader2 className="size-4 animate-spin" />}
                  Salvar
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs
        defaultValue="todos"
        onValueChange={(value) => setFilter(value as FilterTab)}
      >
        <TabsList>
          <TabsTrigger value="todos">Todos</TabsTrigger>
          <TabsTrigger value="concessionaria_ausente">Concessionária Ausente</TabsTrigger>
          <TabsTrigger value="usinas_arquivadas">De Usinas Arquivadas</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="relative max-w-sm">
        <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por denominação, contrato..."
          className="pl-8"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="rounded-lg border bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Denominação</TableHead>
              <TableHead>Contrato</TableHead>
              <TableHead>Concessionária</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={3} className="h-32 text-center">
                  <Loader2 className="mx-auto size-6 animate-spin text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : units.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="h-32 text-center text-muted-foreground">
                  Nenhuma unidade consumidora encontrada.
                </TableCell>
              </TableRow>
            ) : (
              units.map((unit) => (
                <TableRow key={unit.id}>
                  <TableCell>
                    <div className="font-medium">{unit.denominacao || '—'}</div>
                  </TableCell>
                  <TableCell>{unit.contrato || '—'}</TableCell>
                  <TableCell>{unit.concessionaria || '—'}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Mostrando {units.length} de {total} unidades
        </span>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Anterior
          </Button>
          <span>
            Página {page} de {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Próxima
          </Button>
        </div>
      </div>
    </div>
  )
}
