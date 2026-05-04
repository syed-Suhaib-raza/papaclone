"use client"

import { useState } from "react"
import { Star, CheckCircle } from "lucide-react"
import { supabase } from "@/lib/supaBaseClient"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface RatingPopupProps {
  open: boolean
  orderId: string
  restaurantId: string
  restaurantName: string
  riderId: string | null
  riderName: string | null
  onClose: () => void
}

function StarRow({
  value,
  hover,
  onSelect,
  onHover,
  onLeave,
}: {
  value: number
  hover: number
  onSelect: (v: number) => void
  onHover: (v: number) => void
  onLeave: () => void
}) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((i) => {
        const filled = i <= (hover || value)
        return (
          <button
            key={i}
            type="button"
            onClick={() => onSelect(i)}
            onMouseEnter={() => onHover(i)}
            onMouseLeave={onLeave}
            className="p-0.5 transition-transform hover:scale-110"
          >
            <Star
              size={24}
              className={filled ? "text-yellow-400" : "text-muted-foreground"}
              fill={filled ? "currentColor" : "none"}
            />
          </button>
        )
      })}
    </div>
  )
}

export default function RatingPopup({
  open,
  orderId,
  restaurantId,
  restaurantName,
  riderId,
  riderName,
  onClose,
}: RatingPopupProps) {
  const [restaurantRating, setRestaurantRating] = useState(0)
  const [restaurantComment, setRestaurantComment] = useState("")
  const [riderRating, setRiderRating] = useState(0)
  const [riderComment, setRiderComment] = useState("")
  const [hoverRestaurant, setHoverRestaurant] = useState(0)
  const [hoverRider, setHoverRider] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  function handleSkip() {
    localStorage.setItem(`reviewed_${orderId}`, "1")
    onClose()
  }

  async function handleSubmit() {
    if (restaurantRating === 0) {
      setError("Please rate the restaurant before submitting.")
      return
    }
    if (riderId && riderRating === 0) {
      setError("Please rate the rider before submitting.")
      return
    }

    setSubmitting(true)
    setError(null)

    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.access_token) {
      setError("Session expired. Please refresh the page.")
      setSubmitting(false)
      return
    }

    const res = await fetch("/api/customer/reviews", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        orderId,
        restaurantId,
        restaurantRating,
        restaurantComment,
        riderId,
        riderRating: riderId ? riderRating : null,
        riderComment,
      }),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? "Something went wrong. Please try again.")
      setSubmitting(false)
      return
    }

    localStorage.setItem(`reviewed_${orderId}`, "1")
    setSubmitted(true)
    setTimeout(() => onClose(), 1500)
  }

  const textareaClass =
    "w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs resize-none outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 placeholder:text-muted-foreground"

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v && !submitting) onClose() }}>
      <DialogContent className="sm:max-w-md" showCloseButton={!submitting}>
        <DialogHeader>
          <DialogTitle>How was your order?</DialogTitle>
          <DialogDescription>Your feedback helps improve the experience.</DialogDescription>
        </DialogHeader>

        {submitted ? (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <CheckCircle size={48} className="text-green-500" />
            <p className="font-semibold text-foreground">Thank you for your feedback!</p>
            <p className="text-sm text-muted-foreground">Your review has been submitted.</p>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Restaurant section */}
            <div className="space-y-2">
              <p className="text-sm font-medium">Rate {restaurantName}</p>
              <StarRow
                value={restaurantRating}
                hover={hoverRestaurant}
                onSelect={setRestaurantRating}
                onHover={setHoverRestaurant}
                onLeave={() => setHoverRestaurant(0)}
              />
              <textarea
                rows={3}
                className={textareaClass}
                placeholder="Share your experience (optional)"
                value={restaurantComment}
                onChange={(e) => setRestaurantComment(e.target.value)}
              />
            </div>

            {/* Rider section */}
            {riderId && (
              <>
                <div className="border-t border-border" />
                <div className="space-y-2">
                  <p className="text-sm font-medium">Rate {riderName ?? "your rider"}</p>
                  <StarRow
                    value={riderRating}
                    hover={hoverRider}
                    onSelect={setRiderRating}
                    onHover={setHoverRider}
                    onLeave={() => setHoverRider(0)}
                  />
                  <textarea
                    rows={3}
                    className={textareaClass}
                    placeholder="Any comments about the delivery? (optional)"
                    value={riderComment}
                    onChange={(e) => setRiderComment(e.target.value)}
                  />
                </div>
              </>
            )}

            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
        )}

        {!submitted && (
          <DialogFooter>
            <Button variant="outline" onClick={handleSkip} disabled={submitting}>
              Skip
            </Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? "Submitting…" : "Submit"}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}
