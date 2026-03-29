export interface Integrador {
  id: string
  nome: string
  cnpj?: string
  email?: string
  telefone?: string
  logo_url?: string
  plano: string
  created_at: string
}

export interface Colaborador {
  id: string
  integrador_id: string
  nome: string
  email?: string
  grupo: 'admin' | 'operador'
  ultimo_acesso?: string
  created_at: string
}

export interface Cliente {
  id: string
  integrador_id: string
  nome: string
  cpf_cnpj?: string
  telefone?: string
  email?: string
  ultimo_acesso?: string
  created_at: string
  updated_at: string
}

export interface IndicadorDesempenho {
  periodo: '1d' | '15d' | '30d' | '12m'
  valor: number | null
}

export interface Usina {
  id: string
  integrador_id: string
  cliente_id?: string
  nome: string
  potencia_kwp?: number
  cidade?: string
  uf?: string
  data_homologacao?: string
  status: 'normal' | 'alerta' | 'critico' | 'desconhecido'
  arquivada: boolean
  responsavel_id?: string
  created_at: string
  // Joined
  cliente?: { id: string; nome: string }
  responsavel?: { id: string; nome: string }
  indicadores?: IndicadorDesempenho[]
}

export interface UnidadeConsumidora {
  id: string
  integrador_id: string
  cliente_id?: string
  usina_id?: string
  denominacao?: string
  contrato?: string
  concessionaria?: string
  created_at: string
  // Joined
  cliente?: { id: string; nome: string }
  usina?: { id: string; nome: string; arquivada: boolean }
}

export interface Portal {
  id: string
  integrador_id: string
  fabricante: string
  descricao?: string
  login?: string
  status: 'ativo' | 'inativo'
  totalUsinas: number
  created_at: string
}

export interface Ticket {
  id: string
  integrador_id: string
  usina_id?: string
  cliente_id?: string
  titulo: string
  descricao?: string
  status: 'aberto' | 'em_andamento' | 'concluido' | 'em_espera' | 'cancelado'
  tipo?: string
  responsavel_id?: string
  prazo?: string
  created_at: string
  // Joined
  usina?: { id: string; nome: string }
  cliente?: { id: string; nome: string }
  responsavel?: { id: string; nome: string }
}

export interface DashboardStats {
  totalUsinas: number
  usinasMonitoradas: number
  usinasArquivadas: number
  potenciaInstalada: number
  totalClientes: number
  clientesAtivos: number
  ticketsAbertos: number
  statusCounts: {
    normal: number
    alerta: number
    critico: number
    desconhecido: number
  }
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  totalPages: number
}
