'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Search, Loader2 } from 'lucide-react'
import { formatDistanceToNow, format } from 'date-fns'
import { ptBR } from 'date-fns/locale/pt-BR'

import api from '@/lib/api'
import type { Cliente, PaginatedResponse } from '@/types'

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

const MOCK_CLIENTS: Cliente[] = [
  {
    id: '1',
    integrador_id: 'int-1',
    nome: 'Carlos Alberto da Silva',
    cpf_cnpj: '123.456.789-00',
    telefone: '(11) 98765-4321',
    email: 'carlos.silva@email.com',
    ultimo_acesso: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: '2024-06-15T10:30:00Z',
    updated_at: '2024-06-15T10:30:00Z',
  },
  {
    id: '2',
    integrador_id: 'int-1',
    nome: 'Maria Fernanda Oliveira',
    cpf_cnpj: '987.654.321-00',
    telefone: '(21) 99876-5432',
    email: 'maria.oliveira@email.com',
    ultimo_acesso: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: '2024-03-22T14:00:00Z',
    updated_at: '2024-03-22T14:00:00Z',
  },
  {
    id: '3',
    integrador_id: 'int-1',
    nome: 'Jo\u00e3o Pedro Mendes',
    cpf_cnpj: '456.789.123-00',
    telefone: '(31) 97654-3210',
    email: 'joao.mendes@email.com',
    ultimo_acesso: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: '2024-01-10T09:15:00Z',
    updated_at: '2024-01-10T09:15:00Z',
  },
  {
    id: '4',
    integrador_id: 'int-1',
    nome: 'Ana Beatriz Costa',
    cpf_cnpj: '321.654.987-00',
    telefone: '(41) 96543-2109',
    email: 'ana.costa@email.com',
    ultimo_acesso: undefined,
    created_at: '2024-08-05T16:45:00Z',
    updated_at: '2024-08-05T16:45:00Z',
  },
  {
    id: '5',
    integrador_id: 'int-1',
    nome: 'Construtora Horizonte Ltda',
    cpf_cnpj: '12.345.678/0001-90',
    telefone: '(51) 3456-7890',
    email: 'contato@horizonte.com.br',
    ultimo_acesso: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: '2023-11-20T08:00:00Z',
    updated_at: '2023-11-20T08:00:00Z',
  },
  {
    id: '6',
    integrador_id: 'int-1',
    nome: 'Rafael Santos Pereira',
    cpf_cnpj: '654.321.987-00',
    telefone: '(61) 95432-1098',
    email: 'rafael.pereira@email.com',
    ultimo_acesso: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: '2024-02-14T11:30:00Z',
    updated_at: '2024-02-14T11:30:00Z',
  },
  {
    id: '7',
    integrador_id: 'int-1',
    nome: 'Luciana Martins Rocha',
    cpf_cnpj: '789.123.456-00',
    telefone: '(71) 94321-0987',
    email: 'luciana.rocha@email.com',
    ultimo_acesso: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: '2024-07-01T13:20:00Z',
    updated_at: '2024-07-01T13:20:00Z',
  },
  {
    id: '8',
    integrador_id: 'int-1',
    nome: 'Fernando Almeida Souza',
    cpf_cnpj: '147.258.369-00',
    telefone: '(81) 93210-9876',
    email: 'fernando.souza@email.com',
    ultimo_acesso: undefined,
    created_at: '2024-09-10T07:50:00Z',
    updated_at: '2024-09-10T07:50:00Z',
  },
  {
    id: '9',
    integrador_id: 'int-1',
    nome: 'Gabriela Lima Ferreira',
    cpf_cnpj: '258.369.147-00',
    telefone: '(85) 92109-8765',
    email: 'gabriela.ferreira@email.com',
    ultimo_acesso: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: '2024-04-18T15:10:00Z',
    updated_at: '2024-04-18T15:10:00Z',
  },
  {
    id: '10',
    integrador_id: 'int-1',
    nome: 'Thiago Ribeiro Nascimento',
    cpf_cnpj: '369.147.258-00',
    telefone: '(91) 91098-7654',
    email: 'thiago.nascimento@email.com',
    ultimo_acesso: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: '2024-05-30T12:00:00Z',
    updated_at: '2024-05-30T12:00:00Z',
  },
]

const ITEMS_PER_PAGE = 10

type FilterTab = 'todos' | 'sem_usinas' | 'acesso_recente' | 'acesso_antigo' | 'sem_acesso'

function formatUltimoAcesso(dateStr: string | undefined): string {
  if (!dateStr) return 'Nunca'
  try {
    return formatDistanceToNow(new Date(dateStr), {
      addSuffix: true,
      locale: ptBR,
    })
  } catch {
    return 'Nunca'
  }
}

function formatCreatedAt(dateStr: string): string {
  try {
    return format(new Date(dateStr), 'dd/MM/yyyy')
  } catch {
    return '\u2014'
  }
}

export default function ClientesPage() {
  const [filter, setFilter] = useState<FilterTab>('todos')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [clients, setClients] = useState<Cliente[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [formNome, setFormNome] = useState('')
  const [formCpfCnpj, setFormCpfCnpj] = useState('')
  const [formTelefone, setFormTelefone] = useState('')
  const [formEmail, setFormEmail] = useState('')

  const fetchClients = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await api.get<PaginatedResponse<Cliente>>('/clientes', {
        params: { filter, search, page },
      })
      setClients(data.data)
      setTotal(data.total)
    } catch {
      // Fallback to mock data
      let filtered = [...MOCK_CLIENTS]
      if (search) {
        const q = search.toLowerCase()
        filtered = filtered.filter(
          (c) =>
            c.nome.toLowerCase().includes(q) ||
            (c.cpf_cnpj && c.cpf_cnpj.toLowerCase().includes(q))
        )
      }
      if (filter === 'sem_acesso') {
        filtered = filtered.filter((c) => !c.ultimo_acesso)
      } else if (filter === 'acesso_recente') {
        const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000
        filtered = filtered.filter(
          (c) => c.ultimo_acesso && new Date(c.ultimo_acesso).getTime() > thirtyDaysAgo
        )
      } else if (filter === 'acesso_antigo') {
        const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000
        filtered = filtered.filter(
          (c) => c.ultimo_acesso && new Date(c.ultimo_acesso).getTime() <= thirtyDaysAgo
        )
      }
      setTotal(filtered.length)
      const start = (page - 1) * ITEMS_PER_PAGE
      setClients(filtered.slice(start, start + ITEMS_PER_PAGE))
    } finally {
      setLoading(false)
    }
  }, [filter, search, page])

  useEffect(() => {
    fetchClients()
  }, [fetchClients])

  useEffect(() => {
    setPage(1)
  }, [filter, search])

  const totalPages = Math.max(1, Math.ceil(total / ITEMS_PER_PAGE))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      await api.post('/clientes', {
        nome: formNome,
        cpf_cnpj: formCpfCnpj,
        telefone: formTelefone,
        email: formEmail,
      })
    } catch {
      // silently handle - mock environment
    } finally {
      setSubmitting(false)
      setDialogOpen(false)
      setFormNome('')
      setFormCpfCnpj('')
      setFormTelefone('')
      setFormEmail('')
      fetchClients()
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Clientes</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger render={<Button />}>
            <Plus className="size-4" />
            Adicionar Cliente
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Novo Cliente</DialogTitle>
              <DialogDescription>
                Preencha os dados do novo cliente.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome</Label>
                <Input
                  id="nome"
                  placeholder="Nome completo ou raz\u00e3o social"
                  value={formNome}
                  onChange={(e) => setFormNome(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cpf_cnpj">CPF/CNPJ</Label>
                <Input
                  id="cpf_cnpj"
                  placeholder="000.000.000-00"
                  value={formCpfCnpj}
                  onChange={(e) => setFormCpfCnpj(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone</Label>
                <Input
                  id="telefone"
                  placeholder="(00) 00000-0000"
                  value={formTelefone}
                  onChange={(e) => setFormTelefone(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@exemplo.com"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                />
              </div>
              <DialogFooter>
                <Button type="submit" disabled={submitting || !formNome}>
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
          <TabsTrigger value="sem_usinas">Sem usinas</TabsTrigger>
          <TabsTrigger value="acesso_recente">Acesso recente</TabsTrigger>
          <TabsTrigger value="acesso_antigo">Acesso antigo</TabsTrigger>
          <TabsTrigger value="sem_acesso">Sem acesso</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="relative max-w-sm">
        <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome ou CPF..."
          className="pl-8"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="rounded-lg border bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>\u00daltimo acesso</TableHead>
              <TableHead>Criado em</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center">
                  <Loader2 className="mx-auto size-6 animate-spin text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : clients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                  Nenhum cliente encontrado.
                </TableCell>
              </TableRow>
            ) : (
              clients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{client.nome}</div>
                      {client.cpf_cnpj && (
                        <div className="text-xs text-muted-foreground">
                          {client.cpf_cnpj}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{client.telefone || '\u2014'}</TableCell>
                  <TableCell>{client.email || '\u2014'}</TableCell>
                  <TableCell>{formatUltimoAcesso(client.ultimo_acesso)}</TableCell>
                  <TableCell>{formatCreatedAt(client.created_at)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Mostrando {clients.length} de {total} clientes
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
            P\u00e1gina {page} de {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Pr\u00f3xima
          </Button>
        </div>
      </div>
    </div>
  )
}
