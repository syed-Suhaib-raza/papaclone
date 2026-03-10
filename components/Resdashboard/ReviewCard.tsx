import { Star } from "lucide-react"

export default function ReviewCard({ name, comment }: any) {
  return (
    <div className="bg-card border border-border rounded-xl p-4">

      <div className="flex items-center gap-1 mb-2 text-yellow-500">
        <Star size={16}/>
        <Star size={16}/>
        <Star size={16}/>
        <Star size={16}/>
        <Star size={16}/>
      </div>

      <p className="text-sm text-muted-foreground mb-2">
        {comment}
      </p>

      <p className="text-sm font-medium">{name}</p>

    </div>
  )
}