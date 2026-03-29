import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { dashboardRoutes } from './routes/dashboard'
import { usinasRoutes } from './routes/usinas'
import { clientesRoutes } from './routes/clientes'
import { unidadesRoutes } from './routes/unidades'
import { portaisRoutes } from './routes/portais'
import { ticketsRoutes } from './routes/tickets'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Routes
app.use('/api/dashboard', dashboardRoutes)
app.use('/api/usinas', usinasRoutes)
app.use('/api/clientes', clientesRoutes)
app.use('/api/unidades', unidadesRoutes)
app.use('/api/portais', portaisRoutes)
app.use('/api/tickets', ticketsRoutes)

app.listen(PORT, () => {
  console.log(`🚀 Backend rodando em http://localhost:${PORT}`)
})
