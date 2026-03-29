import { Request, Response, NextFunction } from 'express'
import { supabaseAdmin } from '../lib/supabase'

export interface AuthRequest extends Request {
  userId?: string
  integradorId?: string
}

export async function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token de autenticação não fornecido' })
  }

  const token = authHeader.split(' ')[1]

  try {
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token)
    if (error || !user) {
      return res.status(401).json({ error: 'Token inválido' })
    }

    // Get integrador_id from colaboradores table
    const { data: colaborador, error: colabError } = await supabaseAdmin
      .from('colaboradores')
      .select('integrador_id')
      .eq('id', user.id)
      .single()

    if (colabError || !colaborador) {
      return res.status(403).json({ error: 'Usuário não vinculado a um integrador' })
    }

    req.userId = user.id
    req.integradorId = colaborador.integrador_id
    next()
  } catch {
    return res.status(401).json({ error: 'Erro na autenticação' })
  }
}
