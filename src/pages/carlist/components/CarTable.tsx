import { motion } from 'framer-motion'
import { DoorOpen, Gauge, Users } from 'lucide-react'
import { CarActionButtons } from './CarActionButtons'
import { cn } from '@/utils/cn'
import type { Car } from '@/types'

interface CarTableProps {
  cars: Car[]
  onEdit: (car: Car) => void
  onView: (car: Car) => void
  onDelete: (car: Car) => void
}

export function CarTable({ cars, onEdit, onView, onDelete }: CarTableProps) {
  return (
    <div className="w-full overflow-auto">
      <table className="w-full min-w-[900px]">
        <thead>
          <tr className="bg-[#E2FBFB] text-slate-800">
            <th className="px-6 py-4 text-left text-sm font-bold">Car Name</th>
            <th className="px-6 py-4 text-left text-sm font-bold">Doors</th>
            <th className="px-6 py-4 text-left text-sm font-bold">Transmission</th>
            <th className="px-6 py-4 text-left text-sm font-bold">Car Seats</th>
            <th className="px-6 py-4 text-left text-sm font-bold">Amount</th>
            <th className="px-6 py-4 text-right text-sm font-bold">status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {cars.length === 0 ? (
            <tr>
              <td
                colSpan={6}
                className="px-6 py-8 text-center text-gray-500"
              >
                No cars found
              </td>
            </tr>
          ) : (
            cars.map((car, index) => (
              <motion.tr
                key={car.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * index }}
                className={cn(
                  'hover:bg-gray-50/50 transition-colors',
                  index === 0 && ''
                )}
              >
                {/* Car Name Column */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={car.image}
                      alt={car.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-slate-800">
                        {car.name}
                      </span>
                      <span className="text-xs text-gray-500 mt-1">
                        {car.description}
                      </span>
                    </div>
                  </div>
                </td>

                {/* Doors Column */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <DoorOpen className="h-5 w-5 text-gray-600" />
                    <span className="text-sm text-slate-700">
                      {car.doors} Doors
                    </span>
                  </div>
                </td>

                {/* Transmission Column */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Gauge className="h-5 w-5 text-gray-600" />
                    <span className="text-sm text-slate-700">
                      {car.transmission}
                    </span>
                  </div>
                </td>

                {/* Car Seats Column */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-gray-600" />
                    <span className="text-sm text-slate-700">
                      {car.seats} Seats
                    </span>
                  </div>
                </td>

                {/* Amount Column */}
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="text-lg font-bold text-slate-800">
                      €{car.amount.toFixed(2)}
                    </span>
                    <span className="text-xs text-gray-500 mt-1">
                      {car.priceDuration}
                    </span>
                  </div>
                </td>

                {/* Actions Column */}
                <td className="px-6 py-4">
                  <CarActionButtons
                    car={car}
                    onEdit={onEdit}
                    onView={onView}
                    onDelete={onDelete}
                  />
                </td>
              </motion.tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}

