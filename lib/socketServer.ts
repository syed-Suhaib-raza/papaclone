import type { Server } from "socket.io"

function getIO(): Server | null {
  return (global as any).io ?? null
}

export function emitToRider(riderId: string, event: string, data: unknown) {
  const io = getIO()
  if (!io) return
  io.to(`rider:${riderId}`).emit(event, data)
}

export function emitToOrderTrackers(orderId: string, event: string, data: unknown) {
  const io = getIO()
  if (!io) return
  io.to(`order:${orderId}`).emit(event, data)
}
