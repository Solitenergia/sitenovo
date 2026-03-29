'use client'

import { useState, useEffect, useMemo } from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { KpiCards } from '@/components/dashboard/kpi-cards'
import { StatusFilters } from '@/components/dashboard/status-filters'
import { PlantsTable } from '@/components/dashboard/plants-table'
import api from '@/lib/api'
import type { DashboardStats, Usina } from '@/types'

const mockUsinas: Usina[] = [
  {
    id: '1',
    integrador_id: 'int-1',
    nome: 'Solar Residence Alphaville',
    potencia_kwp: 12.5,
    cidade: 'Barueri',
    uf: 'SP',
    data_homologacao: '2024-03-15',
    status: 'normal',
    arquivada: false,
    created_at: '2024-01-10T00:00:00Z',
    cliente: { id: 'c1', nome: 'Maria Silva' },
    responsavel: { id: 'r1', nome: 'Carlos Henrique' },
    indicadores: [
      { periodo: '1d', valor: 95 },
      { periodo: '15d', valor: 91 },
      { periodo: '30d', valor: 88 },
      { periodo: '12m', valor: 85 },
    ],
  },
  {
    id: '2',
    integrador_id: 'int-1',
    nome: 'Usina Fazenda Boa Vista',
    potencia_kwp: 250,
    cidade: 'Ribeirao Preto',
    uf: 'SP',
    data_homologacao: '2023-11-20',
    status: 'normal',
    arquivada: false,
    created_at: '2023-10-05T00:00:00Z',
    cliente: { id: 'c2', nome: 'Agropecuaria Boa Vista Ltda' },
    responsavel: { id: 'r2', nome: 'Ana Paula' },
    indicadores: [
      { periodo: '1d', valor: 98 },
      { periodo: '15d', valor: 94 },
      { periodo: '30d', valor: 92 },
      { periodo: '12m', valor: 90 },
    ],
  },
  {
    id: '3',
    integrador_id: 'int-1',
    nome: 'Comercial Centro BH',
    potencia_kwp: 45,
    cidade: 'Belo Horizonte',
    uf: 'MG',
    data_homologacao: '2024-06-01',
    status: 'alerta',
    arquivada: false,
    created_at: '2024-04-12T00:00:00Z',
    cliente: { id: 'c3', nome: 'Loja Mineira ME' },
    responsavel: { id: 'r1', nome: 'Carlos Henrique' },
    indicadores: [
      { periodo: '1d', valor: 72 },
      { periodo: '15d', valor: 68 },
      { periodo: '30d', valor: 75 },
      { periodo: '12m', valor: 78 },
    ],
  },
  {
    id: '4',
    integrador_id: 'int-1',
    nome: 'Residencial Jardins',
    potencia_kwp: 8.4,
    cidade: 'Goiania',
    uf: 'GO',
    data_homologacao: '2024-01-10',
    status: 'critico',
    arquivada: false,
    created_at: '2023-12-01T00:00:00Z',
    cliente: { id: 'c4', nome: 'Joao Pedro Almeida' },
    responsavel: { id: 'r2', nome: 'Ana Paula' },
    indicadores: [
      { periodo: '1d', valor: 12 },
      { periodo: '15d', valor: 35 },
      { periodo: '30d', valor: 40 },
      { periodo: '12m', valor: 55 },
    ],
  },
  {
    id: '5',
    integrador_id: 'int-1',
    nome: 'Industria Metalurgica Sul',
    potencia_kwp: 500,
    cidade: 'Curitiba',
    uf: 'PR',
    data_homologacao: '2023-08-22',
    status: 'normal',
    arquivada: false,
    created_at: '2023-07-15T00:00:00Z',
    cliente: { id: 'c5', nome: 'MetalSul Industria S.A.' },
    responsavel: { id: 'r3', nome: 'Roberto Dias' },
    indicadores: [
      { periodo: '1d', valor: 89 },
      { periodo: '15d', valor: 87 },
      { periodo: '30d', valor: 85 },
      { periodo: '12m', valor: 83 },
    ],
  },
  {
    id: '6',
    integrador_id: 'int-1',
    nome: 'Condominio Solar das Palmeiras',
    potencia_kwp: 75,
    cidade: 'Salvador',
    uf: 'BA',
    data_homologacao: '2024-09-05',
    status: 'normal',
    arquivada: false,
    created_at: '2024-08-01T00:00:00Z',
    cliente: { id: 'c6', nome: 'Cond. Solar das Palmeiras' },
    responsavel: { id: 'r1', nome: 'Carlos Henrique' },
    indicadores: [
      { periodo: '1d', valor: 93 },
      { periodo: '15d', valor: 90 },
      { periodo: '30d', valor: 91 },
      { periodo: '12m', valor: 88 },
    ],
  },
  {
    id: '7',
    integrador_id: 'int-1',
    nome: 'Escola Municipal Monteiro Lobato',
    potencia_kwp: 30,
    cidade: 'Campinas',
    uf: 'SP',
    data_homologacao: '2024-04-18',
    status: 'desconhecido',
    arquivada: false,
    created_at: '2024-03-10T00:00:00Z',
    cliente: { id: 'c7', nome: 'Prefeitura de Campinas' },
    responsavel: { id: 'r2', nome: 'Ana Paula' },
    indicadores: [
      { periodo: '1d', valor: null },
      { periodo: '15d', valor: null },
      { periodo: '30d', valor: null },
      { periodo: '12m', valor: null },
    ],
  },
  {
    id: '8',
    integrador_id: 'int-1',
    nome: 'Posto Bandeirantes',
    potencia_kwp: 18,
    cidade: 'Uberlandia',
    uf: 'MG',
    data_homologacao: '2025-01-12',
    status: 'alerta',
    arquivada: false,
    created_at: '2024-12-01T00:00:00Z',
    cliente: { id: 'c8', nome: 'Rede Bandeirantes Combustiveis' },
    responsavel: { id: 'r3', nome: 'Roberto Dias' },
    indicadores: [
      { periodo: '1d', valor: 65 },
      { periodo: '15d', valor: 70 },
      { periodo: '30d', valor: 63 },
      { periodo: '12m', valor: 71 },
    ],
  },
  {
    id: '9',
    integrador_id: 'int-1',
    nome: 'Supermercado Tropical',
    potencia_kwp: 120,
    cidade: 'Manaus',
    uf: 'AM',
    data_homologacao: '2024-07-30',
    status: 'normal',
    arquivada: false,
    created_at: '2024-06-20T00:00:00Z',
    cliente: { id: 'c9', nome: 'Tropical Alimentos Ltda' },
    responsavel: { id: 'r1', nome: 'Carlos Henrique' },
    indicadores: [
      { periodo: '1d', valor: 82 },
      { periodo: '15d', valor: 84 },
      { periodo: '30d', valor: 81 },
      { periodo: '12m', valor: 86 },
    ],
  },
  {
    id: '10',
    integrador_id: 'int-1',
    nome: 'Fazenda Esperanca',
    potencia_kwp: 350,
    cidade: 'Rondonopolis',
    uf: 'MT',
    data_homologacao: '2023-05-14',
    status: 'critico',
    arquivada: false,
    created_at: '2023-04-01T00:00:00Z',
    cliente: { id: 'c10', nome: 'Agro Esperanca S.A.' },
    responsavel: { id: 'r3', nome: 'Roberto Dias' },
    indicadores: [
      { periodo: '1d', valor: 0 },
      { periodo: '15d', valor: 18 },
      { periodo: '30d', valor: 25 },
      { periodo: '12m', valor: 45 },
    ],
  },
]

const mockStats: DashboardStats = {
  totalUsinas: 10,
  usinasMonitoradas: 9,
  usinasArquivadas: 0,
  potenciaInstalada: 1408900,
  totalClientes: 10,
  clientesAtivos: 10,
  ticketsAbertos: 3,
  statusCounts: {
    normal: 5,
    alerta: 2,
    critico: 2,
    desconhecido: 1,
  },
}

export default function DashboardPage() {
  const [statusFilter, setStatusFilter] = useState('todos')
  const [usinas, setUsinas] = useState<Usina[]>(mockUsinas)
  const [stats, setStats] = useState<DashboardStats>(mockStats)
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')

  useEffect(() => {
    let cancelled = false

    async function fetchData() {
      setLoading(true)
      try {
        const statusParam = statusFilter === 'todos' ? '' : `?status=${statusFilter}`
        const [statsRes, usinasRes] = await Promise.all([
          api.get<DashboardStats>('/dashboard/stats'),
          api.get<{ data: Usina[] }>(`/usinas${statusParam}`),
        ])
        if (!cancelled) {
          setStats(statsRes.data)
          setUsinas(usinasRes.data.data ?? usinasRes.data as unknown as Usina[])
        }
      } catch {
        if (!cancelled) {
          setStats(mockStats)
          const filtered =
            statusFilter === 'todos'
              ? mockUsinas
              : mockUsinas.filter((u) => u.status === statusFilter)
          setUsinas(filtered)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchData()
    return () => {
      cancelled = true
    }
  }, [statusFilter])

  const filteredUsinas = useMemo(() => {
    if (!search.trim()) return usinas
    const term = search.toLowerCase()
    return usinas.filter(
      (u) =>
        u.nome.toLowerCase().includes(term) ||
        u.cliente?.nome.toLowerCase().includes(term) ||
        u.cidade?.toLowerCase().includes(term) ||
        u.uf?.toLowerCase().includes(term) ||
        u.responsavel?.nome.toLowerCase().includes(term)
    )
  }, [usinas, search])

  const statusCounts = {
    todos: stats.totalUsinas,
    normal: stats.statusCounts.normal,
    alerta: stats.statusCounts.alerta,
    critico: stats.statusCounts.critico,
    desconhecido: stats.statusCounts.desconhecido,
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>

      <KpiCards stats={stats} />

      <div className="space-y-4">
        <StatusFilters
          counts={statusCounts}
          active={statusFilter}
          onChange={setStatusFilter}
        />

        <div className="relative max-w-sm">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar usina, cliente, cidade..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <PlantsTable usinas={filteredUsinas} loading={loading} />
      </div>
    </div>
  )
}
