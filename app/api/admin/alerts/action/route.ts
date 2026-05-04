import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)
export async function POST(req: NextRequest) {
  try {
    const { type, action, id } = await req.json()
    // type:   'delivery' | 'payment' | 'cancellation'
    // action: 'resolved' | 'escalated'
    // id:     reference_id

    // ── 1. Write to alert_logs ───────────────────────────────────────
    // UNIQUE constraint (reference_id, action) means duplicate clicks are ignored
    const { error: logError } = await supabase
      .from('alert_logs')
      .upsert(
        { alert_type: type, reference_id: id, action },
        { onConflict: 'reference_id,action', ignoreDuplicates: true }
      )

    if (logError) {
      console.error('alert_logs error:', logError)
      return NextResponse.json({ error: 'Failed to log action' }, { status: 500 })
    }

    // ── 2. On resolve: also update the actual source table ───────────
    if (action === 'resolved') {

      if (type === 'delivery') {
        // Get order_id first
        const { data: delivery } = await supabase
          .from('deliveries')
          .select('order_id')
          .eq('id', id)
          .single()

        // Mark delivery done
        await supabase
          .from('deliveries')
          .update({ status: 'delivered', delivery_time: new Date().toISOString() })
          .eq('id', id)

        // Mark order done and record commission
        if (delivery?.order_id) {
          await supabase
            .from('orders')
            .update({ status: 'delivered' })
            .eq('id', delivery.order_id)

          const { data: order } = await supabase
            .from('orders')
            .select('total_amount, restaurant_id')
            .eq('id', delivery.order_id)
            .single()

          if (order?.total_amount && order?.restaurant_id) {
            const { data: restaurant } = await supabase
              .from('restaurants')
              .select('commission_percentage')
              .eq('id', order.restaurant_id)
              .single()

            const pct = Number(restaurant?.commission_percentage ?? 0)
            if (pct > 0) {
              const commissionAmount = Number(order.total_amount) * pct
              const { data: existing } = await supabase
                .from('commissions')
                .select('id')
                .eq('order_id', delivery.order_id)
                .maybeSingle()

              if (!existing) {
                await supabase
                  .from('commissions')
                  .insert({ order_id: delivery.order_id, commission_amount: commissionAmount })
              }
            }
          }
        }
      }

      if (type === 'payment') {
        // Mark for manual retry
        await supabase
          .from('payments')
          .update({ payment_status: 'requires_action' })
          .eq('id', id)
      }

      // type === 'cancellation': alert_logs entry is sufficient
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Alert action error:', error)
    return NextResponse.json({ error: 'Action failed' }, { status: 500 })
  }
}