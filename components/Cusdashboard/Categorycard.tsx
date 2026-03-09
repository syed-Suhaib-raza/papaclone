import Image from "next/image"

interface Props {
  name: string
  image: string
}

export default function CategoryCard({name,image}:Props) {
  return (
    <div className="card-hover bg-card border border-border rounded-xl p-4 flex flex-col items-center gap-3 cursor-pointer">

      <div className="relative w-16 h-16">
        <Image src={image} alt={name} fill className="object-contain"/>
      </div>

      <p className="text-sm font-medium">{name}</p>

    </div>
  )
}