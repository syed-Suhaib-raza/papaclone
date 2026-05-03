import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  try {
    const now = new Date()
    const thirtyMinsAgo       = new Date(now.getTime() - 30 * 60 * 1000).toISOString()
    const twentyFourHoursAgo  = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString()

    // ── Pull all logged actions from alert_logs ──────────────────────
    const { data: logs } = await supabase
      .from('alert_logs')
      .select('reference_id, action')

    const resolvedIds  = new Set(logs?.filter(l => l.action === 'resolved') .map(l => l.reference_id) || [])
    const escalatedIds = new Set(logs?.filter(l => l.action === 'escalated').map(l => l.reference_id) || [])

    const withStatus = (id: string) => ({
      isResolved:  resolvedIds.has(id),
      isEscalated: escalatedIds.has(id),
    })

    // ── 1. Late Deliveries ───────────────────────────────────────────
    const { data: lateDeliveries } = await supabase
      .from('deliveries')
      .select(`
        id, order_id, rider_id, status, pickup_time,
        orders (
          id, total_amount, created_at, status,
          restaurants ( name ),
          users!orders_customer_id_fkey ( email )
        )
      `)
      .in('status', ['assigned', 'picked_up'])
      .lt('pickup_time', thirtyMinsAgo)

    // ── 2. Payment Failures ──────────────────────────────────────────
    const { data: paymentFailures } = await supabase
      .from('payments')
      .select(`
        id, order_id, amount, currency, payment_status, created_at,
        orders (
          id, status,
          users!orders_customer_id_fkey ( email )
        )
      `)
      .eq('payment_status', 'failed')
      .gte('created_at', twentyFourHoursAgo)

    // ── 3. High Cancellations ────────────────────────────────────────
    const { data: cancelledOrders } = await supabase
      .from('orders')
      .select(`id, restaurant_id, created_at, restaurants ( id, name )`)
      .eq('status', 'cancelled')
      .gte('created_at', twentyFourHoursAgo)

    const cancellationMap: Record<string, { name: string; count: number; restaurantId: string }> = {}
    cancelledOrders?.forEach((order: any) => {
      const rid = order.restaurant_id
      if (!cancellationMap[rid]) {
        cancellationMap[rid] = { restaurantId: rid, name: order.restaurants?.name || 'Unknown', count: 0 }
      }
      cancellationMap[rid].count++
    })
    const highCancellations = Object.values(cancellationMap).filter(r => r.count >= 3)

    return NextResponse.json({
      lateDeliveries:   (lateDeliveries  || []).map((d: any) => ({ ...d, ...withStatus(d.id) })),
      paymentFailures:  (paymentFailures || []).map((p: any) => ({ ...p, ...withStatus(p.id) })),
      highCancellations: highCancellations.map(c => ({ ...c, ...withStatus(c.restaurantId) })),
    })
  } catch (error) {
    console.error('Alerts API error:', error)
    return NextResponse.json({ error: 'Failed to fetch alerts' }, { status: 500 })
  }
}