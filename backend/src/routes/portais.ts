import { Router } from 'express'
import { authMiddleware, AuthRequest } from '../middleware/auth'
import { supabaseAdmin } from '../lib/supabase'

const router = Router()
router.use(authMiddleware as any)

// GET /api/portais - List monitoring portals
router.get('/', async (req: AuthRequest, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('portais')
      .select('*, usinas:portal_usinas(usina_id)')
      .eq('integrador_id', req.integradorId!)
      .order('fabricante', { ascending: true })

    if (error) throw error

    const portais = (data || []).map(p => ({
      ...p,
      totalUsinas: p.usinas?.length || 0,
      usinas: undefined,
    }))

    res.json({ data: portais })
  } catch (error) {
    console.error('List portais error:', error)
    res.status(500).json({ error: 'Erro ao listar portais' })
  }
})

export { router as portaisRoutes }
