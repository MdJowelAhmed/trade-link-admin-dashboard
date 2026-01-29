import { Outlet, Navigate } from 'react-router-dom'
import { useAppSelector } from '@/redux/hooks'
import { motion } from 'framer-motion'

export default function AuthLayout() {
  const { isAuthenticated } = useAppSelector((state) => state.auth)

  // If already authenticated, redirect to dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
     <div className="hidden lg:block w-1/2 h-screen">
      <img src="/assets/auth.svg" alt="Motly" className="h-full w-full object-cover" />
     </div>

      {/* Right side - Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-[#F7F7F7] m-6 rounded-xl ">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          <Outlet />
        </motion.div>
      </div>
    </div>
  )
}












