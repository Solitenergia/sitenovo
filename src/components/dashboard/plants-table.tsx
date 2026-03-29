'use client'

import { format } from 'date-fns'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { PerformanceCircle } from '@/components/shared/performance-circle'
import type { Usina } from '@/types'

interface PlantsTableProps {
  usinas: Usina[]
  loading?: boolean
}

const statusColors: Record<string, string> = {
  normal: 'bg-green-500',
  alerta: 'bg-amber-500',
  critico: 'bg-red-500',
  desconhecido: 'bg-gray-400',
}

function getIndicator(usina: Usina, periodo: '1d' | '15d' | '30d' | '12m'): number | null {
  const ind = usina.indicadores?.find((i) => i.periodo === periodo)
  return ind?.valor ?? null
}

function SkeletonRow() {
  return (
    <TableRow>
      {Array.from({ length: 9 }).map((_, i) => (
        <TableCell key={i}>
          <div className="h-4 w-full animate-pulse rounded bg-muted" />
        </TableCell>
      ))}
    </TableRow>
  )
}

export function PlantsTable({ usinas, loading }: PlantsTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Usina</TableHead>
          <TableHead>Cliente</TableHead>
          <TableHead>Cidade</TableHead>
          <TableHead>Responsavel</TableHead>
          <TableHead>Homologacao</TableHead>
          <TableHead className="text-center">1D</TableHead>
          <TableHead className="text-center">15D</TableHead>
          <TableHead className="text-center">30D</TableHead>
          <TableHead className="text-center">12M</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
        ) : usinas.length === 0 ? (
          <TableRow>
            <TableCell colSpan={9} className="h-24 text-center text-muted-foreground">
              Nenhuma usina encontrada.
            </TableCell>
          </TableRow>
        ) : (
          usinas.map((usina) => (
            <TableRow key={usina.id}>
              <TableCell>
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-block size-2.5 shrink-0 rounded-full ${statusColors[usina.status] ?? statusColors.desconhecido}`}
                  />
                  <span className="font-medium">{usina.nome}</span>
                  {usina.potencia_kwp != null && (
                    <Badge variant="secondary" className="ml-1 text-[10px]">
                      {usina.potencia_kwp.toLocaleString('pt-BR')} kWp
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell>{usina.cliente?.nome ?? '\u2014'}</TableCell>
              <TableCell>
                {usina.cidade && usina.uf
                  ? `${usina.cidade} - ${usina.uf}`
                  : usina.cidade ?? usina.uf ?? '\u2014'}
              </TableCell>
              <TableCell>{usina.responsavel?.nome ?? '\u2014'}</TableCell>
              <TableCell>
                {usina.data_homologacao
                  ? format(new Date(usina.data_homologacao), 'dd/MM/yyyy')
                  : '\u2014'}
              </TableCell>
              <TableCell className="text-center">
                <div className="flex justify-center">
                  <PerformanceCircle value={getIndicator(usina, '1d')} />
                </div>
              </TableCell>
              <TableCell className="text-center">
                <div className="flex justify-center">
                  <PerformanceCircle value={getIndicator(usina, '15d')} />
                </div>
              </TableCell>
              <TableCell className="text-center">
                <div className="flex justify-center">
                  <PerformanceCircle value={getIndicator(usina, '30d')} />
                </div>
              </TableCell>
              <TableCell className="text-center">
                <div className="flex justify-center">
                  <PerformanceCircle value={getIndicator(usina, '12m')} />
                </div>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  )
}
