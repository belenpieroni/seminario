import { Award, Check } from "lucide-react"

export function StudentBeltProgress({ currentBelt, examHistory }) {
  const allBelts = [
    { name: "Cinturón Blanco", color: "bg-white border-2 border-gray-300" },
    { name: "Cinturón Amarillo", color: "bg-yellow-400" },
    { name: "Cinturón Naranja", color: "bg-orange-500" },
    { name: "Cinturón Verde", color: "bg-green-600" },
    { name: "Cinturón Azul", color: "bg-blue-600" },
    { name: "Cinturón Marrón", color: "bg-amber-800" },
    { name: "Cinturón Negro", color: "bg-black" }
  ]

  const getBeltProgress = () => {
    return allBelts.map(belt => {
      const exam = examHistory.find(e => e.belt === belt.name)
      return {
        belt: belt.name,
        achieved: exam !== undefined,
        date: exam?.date
      }
    })
  }

  const progress = getBeltProgress()
  const currentBeltIndex = allBelts.findIndex(b => b.name === currentBelt)

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-[#1a1a1a] mb-6">Progreso de graduaciones</h3>

      <div className="space-y-4">
        {allBelts.map((belt, index) => {
          const isAchieved = index <= currentBeltIndex
          const beltData = progress[index]

          return (
            <div key={belt.name} className="flex items-center gap-4">
              <div className="relative">
                <div
                  className={`w-16 h-10 rounded ${
                    belt.color
                  } flex items-center justify-center shadow-md ${
                    !isAchieved ? "opacity-30" : ""
                  }`}
                >
                  {isAchieved && (
                    <Check className="w-6 h-6 text-white drop-shadow-lg" />
                  )}
                </div>
              </div>

              <div className="flex-1">
                <p
                  className={`text-[#1a1a1a] ${
                    !isAchieved ? "opacity-50" : ""
                  }`}
                >
                  {belt.name}
                </p>
                {beltData.date && (
                  <p className="text-gray-600">
                    {new Date(beltData.date).toLocaleDateString("es-AR")}
                  </p>
                )}
              </div>

              {isAchieved && (
                <div className="text-green-600">
                  <Award className="w-6 h-6" />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
