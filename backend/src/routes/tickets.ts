import { Router } from 'express'
import { authMiddleware, AuthRequest } from '../middleware/auth'
import { supabaseAdmin } from '../lib/supabase'

const router = Router()
router.use(authMiddleware as any)

// GET /api/tickets - List tickets
router.get('/', async (req: AuthRequest, res) => {
  try {
    const integradorId = req.integradorId!
    const { status, page = '1', limit = '20' } = req.query

    let query = supabaseAdmin
      .from('tickets')
      .select(`
        *,
        usina:usinas(id, nome),
        cliente:clientes(id, nome),
        responsavel:colaboradores(id, nome)
      `, { count: 'exact' })
      .eq('integrador_id', integradorId)

    if (status && status !== 'todos') {
      query = query.eq('status', status)
    }

    const pageNum = parseInt(page as string)
    const limitNum = parseInt(limit as string)
    const from = (pageNum - 1) * limitNum
    const to = from + limitNum - 1

    query = query.order('created_at', { ascending: false }).range(from, to)

    const { data, count, error } = await query

    if (error) throw error

    res.json({
      data: data || [],
      total: count || 0,
      page: pageNum,
      totalPages: Math.ceil((count || 0) / limitNum),
    })
  } catch (error) {
    console.error('List tickets error:', error)
    res.status(500).json({ error: 'Erro ao listar tickets' })
  }
})

export { router as ticketsRoutes }
