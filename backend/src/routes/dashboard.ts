import { Router } from 'express'
import { authMiddleware, AuthRequest } from '../middleware/auth'
import { supabaseAdmin } from '../lib/supabase'

const router = Router()
router.use(authMiddleware as any)

// GET /api/dashboard/stats - KPI aggregations
router.get('/stats', async (req: AuthRequest, res) => {
  try {
    const integradorId = req.integradorId!

    // Fetch counts in parallel
    const [usinasRes, clientesRes, ticketsRes] = await Promise.all([
      supabaseAdmin
        .from('usinas')
        .select('id, potencia_kwp, status, arquivada')
        .eq('integrador_id', integradorId),
      supabaseAdmin
        .from('clientes')
        .select('id, ultimo_acesso')
        .eq('integrador_id', integradorId),
      supabaseAdmin
        .from('tickets')
        .select('id, status, responsavel_id')
        .eq('integrador_id', integradorId),
    ])

    const usinas = usinasRes.data || []
    const clientes = clientesRes.data || []
    const tickets = ticketsRes.data || []

    const usinasAtivas = usinas.filter(u => !u.arquivada)
    const potenciaTotal = usinas.reduce((sum, u) => sum + (Number(u.potencia_kwp) || 0), 0)

    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const clientesAtivos = clientes.filter(c =>
      c.ultimo_acesso && new Date(c.ultimo_acesso) > thirtyDaysAgo
    ).length

    const ticketsAbertos = tickets.filter(t =>
      t.status !== 'concluido' && t.status !== 'cancelado'
    ).length

    // Count by status
    const statusCounts = {
      normal: usinasAtivas.filter(u => u.status === 'normal').length,
      alerta: usinasAtivas.filter(u => u.status === 'alerta').length,
      critico: usinasAtivas.filter(u => u.status === 'critico').length,
      desconhecido: usinasAtivas.filter(u => u.status === 'desconhecido').length,
    }

    res.json({
      totalUsinas: usinas.length,
      usinasMonitoradas: usinasAtivas.length,
      usinasArquivadas: usinas.filter(u => u.arquivada).length,
      potenciaInstalada: potenciaTotal,
      totalClientes: clientes.length,
      clientesAtivos,
      ticketsAbertos,
      statusCounts,
    })
  } catch (error) {
    console.error('Dashboard stats error:', error)
    res.status(500).json({ error: 'Erro ao buscar estatísticas' })
  }
})

export { router as dashboardRoutes }
