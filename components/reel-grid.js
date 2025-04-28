"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Heart, MessageCircle, Play,DollarSign,House } from "lucide-react"
import { motion } from "framer-motion"
import useUser  from "@/hooks/user.zustand"

export default function GameGrid({ active }) {
  const [Games, setGames] = useState([])
  const user = useUser((state) => state.selectedUser)


  useEffect(() => {



    async function fetchGame() {
      try {
        const response = await fetch("/api/getAdjNodeByLabel", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            label: ["USER"],
            where: { name: user.name },
            edgeLabel: "HOSTED",
            edgeWhere: {},
            adjNodeLabel: "Game",
            adjWhere: {
              isActive: true,
            },
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const fetchedGame = await response.json();
        console.log("Game Response:", fetchedGame);

        if (Array.isArray(fetchedGame)) {
          const enhancedGame = fetchedGame.map((post) => ({
            ...post,
            id: Math.floor(Math.random() * 1000),
            likes: Math.floor(Math.random() * 1000),
            comments: Math.floor(Math.random() * 100),
          }));

          console.log("Enhanced games:", enhancedGame);
          setGames(enhancedGame);
          
        }
      } catch (error) {
        console.error("Error fetching Game:", error);
      }
    }
    fetchGame()

    // Mock Games data
    const mockGames = Array.from({ length: 6 }, (_, i) => ({
      id: i + 1,
      image: `/placeholder.svg?height=600&width=400&text=Game+${i + 1}`,
      likes: Math.floor(Math.random() * 5000),
      comments: Math.floor(Math.random() * 500),
      views: Math.floor(Math.random() * 50000),
    }))

    setGames(mockGames)
  }, [user])

  return (
    <div className="grid grid-cols-3 gap-1 md:gap-4">
      {Games.map((Game, index) => (
        <motion.div
          key={index}
          className="relative aspect-[9/16] group"
          initial={{ opacity: 0, y: 20 }}
          animate={active ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
        >
          <Image src={"/suiBattleField.png"} alt={`Game ${Game.id}`} fill className="object-cover" />
          <div className="absolute bottom-2 right-2">
            <Play className="h-6 w-6 text-white fill-white" />
          </div>
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 text-white">
            <motion.div
              className="flex items-center gap-1"
              initial={{ scale: 0.8 }}
              whileInView={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <DollarSign className="h-5 w-5 fill-white text-white" />
              <span>{Game.m?.properties?.stake}</span>
            </motion.div>
            <motion.div
              className="flex items-center gap-1"
              initial={{ scale: 0.8 }}
              whileInView={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 10, delay: 0.1 }}
            >
              <House className="h-5 w-5" />
              <span>{Game.m?.properties?.code}</span>
            </motion.div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

