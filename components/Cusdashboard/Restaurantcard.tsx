interface Props {
  name: string
  image: string
  rating: number
  description: string
}

export default function RestaurantCard({ name, image, rating, description }: Props) {
  return (
    <div className="card-hover border rounded-xl overflow-hidden bg-card">

      <img
        src={image || "/placeholder.png"}
        alt={name}
        className="w-full h-40 object-cover"
      />

      <div className="p-4">

        <h2 className="text-lg font-semibold">
          {name}
        </h2>

        <p className="text-sm text-muted-foreground mt-1">
          {description}
        </p>

        <p className="mt-2 text-sm">
          ⭐ {rating || "New"}
        </p>

      </div>

    </div>
  )
}