"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import Link from "next/link"

export default function GameCarousel({ games }) {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % games.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [games.length])

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % games.length)
  }

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + games.length) % games.length)
  }

  return (
    <div className="carousel-container relative mt-10 mb-16 h-[500px] w-full overflow-hidden rounded-2xl">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="relative h-full w-full"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent z-10"></div>
          <Image
            src={games[currentIndex].image || "/placeholder.png"}
            alt={games[currentIndex].name}
            layout="fill"
            objectFit="cover"
          />
          <div className="absolute bottom-0 left-0 right-0 p-8 z-20">
            <h2 className="text-4xl font-bold text-white mb-3">{games[currentIndex].name}</h2>
            <p className="text-xl text-gray-200 mb-6">{games[currentIndex].caption}</p>
            <Link href={`/${games[currentIndex].pageLink}`}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-purple-600 to-blue-500 text-white font-bold py-3 px-8 rounded-full text-lg shadow-glow"
              >
                Play Now
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </AnimatePresence>

      <button
        onClick={handlePrev}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 rounded-full p-2 z-30 hover:bg-opacity-70 transition-all"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 text-white"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <button
        onClick={handleNext}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 rounded-full p-2 z-30 hover:bg-opacity-70 transition-all"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 text-white"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-30">
        {games.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-3 h-3 rounded-full ${index === currentIndex ? "bg-white" : "bg-gray-500"}`}
          />
        ))}
      </div>
    </div>
  )
}



