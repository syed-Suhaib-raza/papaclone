"use client"

import { useEffect, useState } from "react"

type Review = {
  id: string
  rating: number
  comment: string | null
  created_at: string
  users: { name: string } | null
}

type ReviewsData = {
  avg: number
  total: number
  percentages: Record<string, number>
  reviews: Review[]
}

export default function RiderReviewsClient({ accessToken }: { accessToken: string }) {
  const [data, setData] = useState<ReviewsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/rider/reviews", {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setError(d.error)
        else setData(d)
      })
      .catch(() => setError("Failed to load reviews"))
      .finally(() => setLoading(false))
  }, [accessToken])

  if (loading) {
    return (
      <div className="space-y-4 max-w-2xl">
        {[1, 2, 3].map((i) => <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />)}
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-destructive/10 text-destructive border border-destructive/30 rounded-xl p-4 text-sm">
        {error}
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold">Customer Reviews</h1>

      {/* Summary */}
      <div className="bg-card border border-border rounded-xl p-5 space-y-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl font-bold">{(data?.avg ?? 0).toFixed(1)}</span>
          <div>
            <div className="text-yellow-500 text-lg tracking-wide">
              {"★".repeat(Math.round(data?.avg ?? 0))}{"☆".repeat(5 - Math.round(data?.avg ?? 0))}
            </div>
            <p className="text-sm text-muted-foreground">{data?.total ?? 0} reviews</p>
          </div>
        </div>

        {/* Star breakdown */}
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((star) => (
            <div key={star} className="flex items-center gap-3 text-sm">
              <span className="w-12 text-muted-foreground">{star} star</span>
              <div className="flex-1 bg-muted rounded-full h-2.5">
                <div
                  className="bg-yellow-500 h-2.5 rounded-full transition-all"
                  style={{ width: `${data?.percentages?.[star] ?? 0}%` }}
                />
              </div>
              <span className="w-8 text-right text-muted-foreground">
                {data?.percentages?.[star] ?? 0}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Reviews list */}
      <div className="space-y-3">
        <h2 className="text-base font-semibold">All Reviews</h2>

        {(data?.reviews?.length ?? 0) === 0 ? (
          <div className="bg-card border border-border rounded-xl p-6 text-center text-muted-foreground">
            No reviews yet
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {data?.reviews?.map((review) => (
              <div key={review.id} className="bg-card border border-border rounded-xl p-4 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{review.users?.name ?? "Anonymous"}</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(review.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="text-yellow-500 text-sm tracking-wide">
                  {"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}
                </div>
                {review.comment && (
                  <p className="text-sm text-muted-foreground">{review.comment}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
