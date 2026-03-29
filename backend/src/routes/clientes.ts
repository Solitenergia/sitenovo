import { Router } from 'express'
import { authMiddleware, AuthRequest } from '../middleware/auth'
import { supabaseAdmin } from '../lib/supabase'

const router = Router()
router.use(authMiddleware as any)

// GET /api/clientes - List clients with filters
router.get('/', async (req: AuthRequest, res) => {
  try {
    const integradorId = req.integradorId!
    const { filter, search, page = '1', limit = '48' } = req.query

    let query = supabaseAdmin
      .from('clientes')
      .select('*', { count: 'exact' })
      .eq('integrador_id', integradorId)

    if (search) {
      query = query.or(`nome.ilike.%${search}%,cpf_cnpj.ilike.%${search}%,email.ilike.%${search}%`)
    }

    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    switch (filter) {
      case 'sem_usinas':
        // Clients without plants - handled after query
        break
      case 'acesso_recente':
        query = query.gte('ultimo_acesso', thirtyDaysAgo.toISOString())
        break
      case 'acesso_antigo':
        query = query.lt('ultimo_acesso', thirtyDaysAgo.toISOString()).not('ultimo_acesso', 'is', null)
        break
      case 'sem_acesso':
        query = query.is('ultimo_acesso', null)
        break
    }

    const pageNum = parseInt(page as string)
    const limitNum = parseInt(limit as string)
    const from = (pageNum - 1) * limitNum
    const to = from + limitNum - 1

    query = query.order('nome', { ascending: true }).range(from, to)

    const { data, count, error } = await query

    if (error) throw error

    // For 'sem_usinas' filter, get usinas count per client
    let clientsData = data || []
    if (filter === 'sem_usinas') {
      const clientIds = clientsData.map(c => c.id)
      const { data: usinas } = await supabaseAdmin
        .from('usinas')
        .select('cliente_id')
        .in('cliente_id', clientIds)

      const clientsWithUsinas = new Set(usinas?.map(u => u.cliente_id))
      clientsData = clientsData.filter(c => !clientsWithUsinas.has(c.id))
    }

    res.json({
      data: clientsData,
      total: count || 0,
      page: pageNum,
      totalPages: Math.ceil((count || 0) / limitNum),
    })
  } catch (error) {
    console.error('List clientes error:', error)
    res.status(500).json({ error: 'Erro ao listar clientes' })
  }
})

// POST /api/clientes - Create client
router.post('/', async (req: AuthRequest, res) => {
  try {
    const { nome, cpf_cnpj, telefone, email } = req.body

    const { data, error } = await supabaseAdmin
      .from('clientes')
      .insert({
        integrador_id: req.integradorId!,
        nome,
        cpf_cnpj,
        telefone,
        email,
      })
      .select()
      .single()

    if (error) throw error
    res.status(201).json(data)
  } catch (error) {
    console.error('Create cliente error:', error)
    res.status(500).json({ error: 'Erro ao criar cliente' })
  }
})

// PUT /api/clientes/:id - Update client
router.put('/:id', async (req: AuthRequest, res) => {
  try {
    const { nome, cpf_cnpj, telefone, email } = req.body

    const { data, error } = await supabaseAdmin
      .from('clientes')
      .update({ nome, cpf_cnpj, telefone, email, updated_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .eq('integrador_id', req.integradorId!)
      .select()
      .single()

    if (error) throw error
    res.json(data)
  } catch (error) {
    console.error('Update cliente error:', error)
    res.status(500).json({ error: 'Erro ao atualizar cliente' })
  }
})

// DELETE /api/clientes/:id
router.delete('/:id', async (req: AuthRequest, res) => {
  try {
    const { error } = await supabaseAdmin
      .from('clientes')
      .delete()
      .eq('id', req.params.id)
      .eq('integrador_id', req.integradorId!)

    if (error) throw error
    res.status(204).send()
  } catch (error) {
    console.error('Delete cliente error:', error)
    res.status(500).json({ error: 'Erro ao excluir cliente' })
  }
})

export { router as clientesRoutes }
