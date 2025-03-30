"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { User, Shield, Crown, Award } from "lucide-react"

const UserList = React.forwardRef(({ className, users = [], ...props }, ref) => {
  return (
    <motion.div
      ref={ref}
      className={cn("bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl shadow-glow overflow-hidden", className)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      {...props}
    >
      <div className="p-4 border-b border-gray-700 bg-gray-800/50">
        <h3 className="text-lg font-semibold text-white">Players</h3>
      </div>
      <div className="divide-y divide-gray-700">
        <AnimatePresence>
          {users.length > 0 ? (
            users.map((user, index) => <UserItem key={user.id} user={user} index={index} />)
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 text-center text-gray-400">
              No players found
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
})
UserList.displayName = "UserList"

const UserItem = ({ user, index }) => {
  // Get icon based on user role
  const getIcon = () => {
    switch (user.role) {
      case "admin":
        return <Shield className="h-4 w-4 text-red-400" />
      case "moderator":
        return <Shield className="h-4 w-4 text-blue-400" />
      case "vip":
        return <Crown className="h-4 w-4 text-yellow-400" />
      case "pro":
        return <Award className="h-4 w-4 text-green-400" />
      default:
        return <User className="h-4 w-4 text-gray-400" />
    }
  }

  return (
    <motion.div
      className="flex items-center p-4 hover:bg-gray-800/50 transition-colors"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileHover={{ x: 5, transition: { duration: 0.2 } }}
    >
      <div className="relative">
        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-blue-500 flex items-center justify-center text-white font-bold">
          {user.avatar ? (
            <img
              src={user.avatar || "/placeholder.svg"}
              alt={user.name}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            user.name.charAt(0).toUpperCase()
          )}
        </div>
        {user.status === "online" && (
          <motion.div
            className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-800"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.2, delay: 0.2 + index * 0.05 }}
          />
        )}
      </div>
      <div className="ml-3 flex-1">
        <div className="flex items-center">
          <p className="font-medium text-white">{user.name}</p>
          {user.role && (
            <motion.div
              className="ml-2 flex items-center"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2, delay: 0.3 + index * 0.05 }}
            >
              {getIcon()}
            </motion.div>
          )}
        </div>
        <p className="text-xs text-gray-400">{user.level ? `Level ${user.level}` : "New Player"}</p>
      </div>
      {user.score !== undefined && (
        <div className="text-right">
          <div className="text-sm font-semibold text-purple-400">{user.score}</div>
          <div className="text-xs text-gray-400">points</div>
        </div>
      )}
    </motion.div>
  )
}

// Example usage:
// <UserList users={[
//   { id: 1, name: "Player1", status: "online", role: "admin", level: 42, score: 1250 },
//   { id: 2, name: "GamerX", status: "online", role: "vip", level: 28, score: 980 },
//   { id: 3, name: "CryptoKing", status: "offline", level: 15, score: 540 },
// ]} />

export { UserList, UserItem }

