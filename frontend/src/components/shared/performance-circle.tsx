'use client'

interface PerformanceCircleProps {
  value: number | null
  size?: number
}

export function PerformanceCircle({ value, size = 32 }: PerformanceCircleProps) {
  const strokeWidth = size * 0.12
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const center = size / 2

  let color = '#9ca3af' // gray for null
  if (value !== null) {
    if (value > 80) color = '#22c55e'
    else if (value >= 60) color = '#eab308'
    else color = '#ef4444'
  }

  const offset =
    value !== null
      ? circumference - (Math.min(Math.max(value, 0), 100) / 100) * circumference
      : circumference

  const fontSize = size * 0.3

  return (
    <svg width={size} height={size} className="shrink-0">
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        stroke="#e5e7eb"
        strokeWidth={strokeWidth}
      />
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform={`rotate(-90 ${center} ${center})`}
      />
      <text
        x={center}
        y={center}
        textAnchor="middle"
        dominantBaseline="central"
        fill={color}
        fontSize={fontSize}
        fontWeight={600}
      >
        {value !== null ? `${Math.round(value)}%` : '—'}
      </text>
    </svg>
  )
}
