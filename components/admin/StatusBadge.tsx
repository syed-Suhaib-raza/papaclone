// components/ui/StatusBadge.tsx

const STATUS_MAP: Record<string, string> = {
  Active:       "bg-green-500/15 text-green-600 dark:text-green-400",
  Approved:     "bg-green-500/15 text-green-600 dark:text-green-400",
  Completed:    "bg-green-500/15 text-green-600 dark:text-green-400",
  Delivered:    "bg-green-500/15 text-green-600 dark:text-green-400",
  Available:    "bg-green-500/15 text-green-600 dark:text-green-400",
  Pending:      "bg-yellow-500/15 text-yellow-600 dark:text-yellow-400",
  Preparing:    "bg-yellow-500/15 text-yellow-600 dark:text-yellow-400",
  "Off Duty":   "bg-yellow-500/15 text-yellow-600 dark:text-yellow-400",
  "On the way": "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  Banned:       "bg-red-500/15 text-red-500",
  Suspended:    "bg-red-500/15 text-red-500",
  Cancelled:    "bg-red-500/15 text-red-500",
  Refunded:     "bg-red-500/15 text-red-500",
  Unavailable:  "bg-red-500/15 text-red-500",
  Customer:     "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  Rider:        "bg-primary/15 text-primary",
  Owner:        "bg-yellow-500/15 text-yellow-600 dark:text-yellow-400",
}

export default function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`text-[10px] font-black px-2.5 py-1 rounded-full ${
        STATUS_MAP[status] ?? "bg-muted text-muted-foreground"
      }`}
    >
      {status}
    </span>
  )
}