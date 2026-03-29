import { Router } from 'express'
import { authMiddleware, AuthRequest } from '../middleware/auth'
import { supabaseAdmin } from '../lib/supabase'

const router = Router()
router.use(authMiddleware as any)

// GET /api/unidades - List consumer units
router.get('/', async (req: AuthRequest, res) => {
  try {
    const integradorId = req.integradorId!
    const { filter, search, page = '1', limit = '20' } = req.query

    let query = supabaseAdmin
      .from('unidades_consumidoras')
      .select(`
        *,
        cliente:clientes(id, nome),
        usina:usinas(id, nome, arquivada)
      `, { count: 'exact' })
      .eq('integrador_id', integradorId)

    if (search) {
      query = query.or(`denominacao.ilike.%${search}%,contrato.ilike.%${search}%`)
    }

    switch (filter) {
      case 'sem_concessionaria':
        query = query.is('concessionaria', null)
        break
      case 'arquivadas':
        query = query.not('usina_id', 'is', null)
        // Further filter after query for archived usinas
        break
    }

    const pageNum = parseInt(page as string)
    const limitNum = parseInt(limit as string)
    const from = (pageNum - 1) * limitNum
    const to = from + limitNum - 1

    query = query.order('denominacao', { ascending: true }).range(from, to)

    const { data, count, error } = await query

    if (error) throw error

    let result = data || []
    if (filter === 'arquivadas') {
      result = result.filter((u: any) => u.usina?.arquivada === true)
    }

    res.json({
      data: result,
      total: count || 0,
      page: pageNum,
      totalPages: Math.ceil((count || 0) / limitNum),
    })
  } catch (error) {
    console.error('List unidades error:', error)
    res.status(500).json({ error: 'Erro ao listar unidades' })
  }
})

// POST /api/unidades - Create consumer unit
router.post('/', async (req: AuthRequest, res) => {
  try {
    const { denominacao, contrato, concessionaria, cliente_id, usina_id } = req.body

    const { data, error } = await supabaseAdmin
      .from('unidades_consumidoras')
      .insert({
        integrador_id: req.integradorId!,
        denominacao,
        contrato,
        concessionaria,
        cliente_id,
        usina_id,
      })
      .select()
      .single()

    if (error) throw error
    res.status(201).json(data)
  } catch (error) {
    console.error('Create unidade error:', error)
    res.status(500).json({ error: 'Erro ao criar unidade' })
  }
})

// PUT /api/unidades/:id - Update consumer unit
router.put('/:id', async (req: AuthRequest, res) => {
  try {
    const { denominacao, contrato, concessionaria, cliente_id, usina_id } = req.body

    const { data, error } = await supabaseAdmin
      .from('unidades_consumidoras')
      .update({ denominacao, contrato, concessionaria, cliente_id, usina_id, updated_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .eq('integrador_id', req.integradorId!)
      .select()
      .single()

    if (error) throw error
    res.json(data)
  } catch (error) {
    console.error('Update unidade error:', error)
    res.status(500).json({ error: 'Erro ao atualizar unidade' })
  }
})

export { router as unidadesRoutes }
