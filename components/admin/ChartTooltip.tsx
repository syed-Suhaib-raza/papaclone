// components/ui/ChartTooltip.tsx

export default function ChartTooltip({
  active,
  payload,
  label,
  prefix = "",
}: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-card border border-border rounded-xl px-3 py-2 shadow-lg">
      <p className="text-[11px] font-black text-muted-foreground">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} className="text-sm font-black" style={{ color: p.color || p.fill }}>
          {p.name}: {prefix}{p.value}
        </p>
      ))}
    </div>
  )
}