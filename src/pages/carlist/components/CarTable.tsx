import { motion } from 'framer-motion'
// import { DoorOpen, Gauge, Users } from 'lucide-react'
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
            <th className="px-6 py-4 text-left text-sm font-bold">Car Number</th>
            <th className="px-6 py-4 text-left text-sm font-bold">Location</th>
            <th className="px-6 py-4 text-left text-sm font-bold">Class</th>
            <th className="px-6 py-4 text-left text-sm font-bold">Doors</th>
            <th className="px-6 py-4 text-left text-sm font-bold">Transmission</th>
            <th className="px-6 py-4 text-left text-sm font-bold">Seats</th>
            <th className="px-6 py-4 text-right text-sm font-bold">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {cars.length === 0 ? (
            <tr>
              <td
                colSpan={8}
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
                  'hover:bg-gray-50 transition-colors',
                )}
              >
                {/* Car Name Column */}
                <td className="px-6 py-2">
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

                {/* Car Number Column */}
                <td className="px-6 py-2">
                  <span className="text-sm text-slate-700">
                    {car.carNumber || 'N/A'}
                  </span>
                </td>

                {/* Location Column */}
                <td className="px-6 py-2">
                  <span className="text-sm text-slate-700">
                    {car.location || 'N/A'}
                  </span>
                </td>

                {/* Car Class Column */}
                <td className="px-6 py-2">
                  <span className="text-sm font-medium text-slate-700">
                    {car.carClass}
                  </span>
                </td>

                {/* Doors Column */}
                <td className="px-6 py-2">
                  <span className="text-sm text-slate-700">
                    {car.doors} Doors
                  </span>
                </td>

                {/* Transmission Column */}
                <td className="px-6 py-2">
                  <span className="text-sm text-slate-700">
                    {car.transmission}
                  </span>
                </td>

                {/* Seats Column */}
                <td className="px-6 py-2">
                  <span className="text-sm text-slate-700">
                    {car.seats} Seats
                  </span>
                </td>

                {/* Actions Column */}
                <td className="px-6 py-2">
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

