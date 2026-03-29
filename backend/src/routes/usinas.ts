import { Router } from 'express'
import { authMiddleware, AuthRequest } from '../middleware/auth'
import { supabaseAdmin } from '../lib/supabase'

const router = Router()
router.use(authMiddleware as any)

// GET /api/usinas - List plants with filters
router.get('/', async (req: AuthRequest, res) => {
  try {
    const integradorId = req.integradorId!
    const { status, search, page = '1', limit = '20', sortBy = 'nome', sortOrder = 'asc' } = req.query

    let query = supabaseAdmin
      .from('usinas')
      .select(`
        *,
        cliente:clientes(id, nome),
        responsavel:colaboradores(id, nome),
        indicadores:indicadores_desempenho(periodo, valor)
      `, { count: 'exact' })
      .eq('integrador_id', integradorId)
      .eq('arquivada', false)

    if (status && status !== 'todos') {
      query = query.eq('status', status)
    }

    if (search) {
      query = query.or(`nome.ilike.%${search}%,cidade.ilike.%${search}%`)
    }

    const pageNum = parseInt(page as string)
    const limitNum = parseInt(limit as string)
    const from = (pageNum - 1) * limitNum
    const to = from + limitNum - 1

    query = query
      .order(sortBy as string, { ascending: sortOrder === 'asc' })
      .range(from, to)

    const { data, count, error } = await query

    if (error) throw error

    res.json({
      data: data || [],
      total: count || 0,
      page: pageNum,
      totalPages: Math.ceil((count || 0) / limitNum),
    })
  } catch (error) {
    console.error('List usinas error:', error)
    res.status(500).json({ error: 'Erro ao listar usinas' })
  }
})

// GET /api/usinas/:id - Plant detail
router.get('/:id', async (req: AuthRequest, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('usinas')
      .select(`
        *,
        cliente:clientes(id, nome, telefone, email),
        responsavel:colaboradores(id, nome),
        indicadores:indicadores_desempenho(periodo, valor),
        unidades:unidades_consumidoras(id, denominacao, contrato, concessionaria)
      `)
      .eq('id', req.params.id)
      .eq('integrador_id', req.integradorId!)
      .single()

    if (error) throw error
    if (!data) return res.status(404).json({ error: 'Usina não encontrada' })

    res.json(data)
  } catch (error) {
    console.error('Get usina error:', error)
    res.status(500).json({ error: 'Erro ao buscar usina' })
  }
})

// POST /api/usinas - Create plant
router.post('/', async (req: AuthRequest, res) => {
  try {
    const { nome, potencia_kwp, cidade, uf, data_homologacao, cliente_id, responsavel_id } = req.body

    const { data, error } = await supabaseAdmin
      .from('usinas')
      .insert({
        integrador_id: req.integradorId!,
        nome,
        potencia_kwp,
        cidade,
        uf,
        data_homologacao,
        cliente_id,
        responsavel_id,
      })
      .select()
      .single()

    if (error) throw error
    res.status(201).json(data)
  } catch (error) {
    console.error('Create usina error:', error)
    res.status(500).json({ error: 'Erro ao criar usina' })
  }
})

export { router as usinasRoutes }
