interface Props {
  restaurant: string
  status: string
  total: number
  date: string
}

export default function OrderCard({restaurant,status,total,date}:Props) {
  return (
    <div className="card-hover bg-card border border-border rounded-xl p-4 flex justify-between items-center">

      <div>
        <h4 className="font-semibold">{restaurant}</h4>
        <p className="text-sm text-muted-foreground">{date}</p>
      </div>

      <div className="text-sm">
        <p className="text-muted-foreground">Total</p>
        <p className="font-semibold">Rs {total}</p>
      </div>

      <div className="px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-sm">
        {status}
      </div>

    </div>
  )
}