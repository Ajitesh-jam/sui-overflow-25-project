"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import styles from "../styles/Home.module.css"
import { AllDefaultWallets, defineStashedWallet, WalletProvider } from "@suiet/wallet-kit"

export default function GamePage() {
  const router = useRouter()
  const gamename="suiBattleField"

  const [activeTab, setActiveTab] = useState("host")
  const [isWalletConnected, setIsWalletConnected] = useState(false)
  const [lobbyCode, setLobbyCode] = useState("")
  const [stakeAmount, setStakeAmount] = useState(50)
  const [showModal, setShowModal] = useState(false)
  const [createdRoom, setCreatedRoom] = useState(null)
  const [hostedGames, setHostedGames] = useState([
    { id: 1, host: "Player123", stake: 100, players: 1, maxPlayers: 2 },
    { id: 2, host: "GameMaster", stake: 200, players: 1, maxPlayers: 2 },
    { id: 3, host: "CryptoChamp", stake: 150, players: 1, maxPlayers: 2 },
  ])

  // Mock game data
  const game = {
    id: 1,
    name: "Sui Battlefield",
    link: "https://suiBattleField.com",
    pageLink: "suiBattleField",
    image: "/suiBattleField.png",
    likes: 234,
    caption:
      "Fight against zombies and monsters in this thrilling game! #suiBattleField #gaming and see if you beat your friend",
  }

  const handleConnectWallet = () => {
    setIsWalletConnected(true)
  }

  const handleCreateRoom = () => {
    if (!isWalletConnected) {
      alert("Please connect your wallet first!")
      return
    }

    if (!lobbyCode || stakeAmount <= 0) {
      alert("Please enter a valid lobby code and stake amount!")
      return
    }

    const newRoom = {
      id: Math.floor(Math.random() * 1000),
      code: lobbyCode,
      stake: stakeAmount,
      link: game.link,
    }

    setCreatedRoom(newRoom)
    setShowModal(true)
  }

  const handleJoinGame = (hostedGame) => {
    if (!isWalletConnected) {
      alert("Please connect your wallet first!")
      return
    }

    setCreatedRoom({
      id: hostedGame.id,
      code: `GAME${hostedGame.id}`,
      stake: hostedGame.stake,
      link: game.link,
    })

    setShowModal(true)
  }

  return (
    <WalletProvider
      defaultWallets={[
        ...AllDefaultWallets,
        defineStashedWallet({
          appName: "Suiet Kit Playground",
        }),
      ]}
    >
      <div className={styles.container}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="max-w-6xl mx-auto py-12 px-4"
        >
          <div className="relative h-[400px] w-full rounded-2xl overflow-hidden mb-10">
            <Image src={game.image || "/placeholder.svg"} alt={game.name} layout="fill" objectFit="cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent"></div>
            <div className="absolute bottom-0 left-0 right-0 p-8">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{game.name}</h1>
              <p className="text-xl text-gray-200 max-w-3xl">{game.caption}</p>
            </div>
          </div>

          <div className="game-tabs mb-10">
            <div className="flex border-b border-gray-700 mb-8">
              <button
                onClick={() => setActiveTab("host")}
                className={`py-3 px-6 font-medium text-lg ${
                  activeTab === "host" ? "text-white border-b-2 border-purple-500" : "text-gray-400 hover:text-gray-200"
                }`}
              >
                Host Game
              </button>
              <button
                onClick={() => setActiveTab("join")}
                className={`py-3 px-6 font-medium text-lg ${
                  activeTab === "join" ? "text-white border-b-2 border-purple-500" : "text-gray-400 hover:text-gray-200"
                }`}
              >
                Join Game
              </button>
            </div>

            <AnimatePresence mode="wait">
              {activeTab === "host" ? (
                <motion.div
                  key="host"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 shadow-glow"
                >
                  <h2 className="text-2xl font-bold mb-6">Host a New Game</h2>

                  <div className="mb-8 p-4 bg-gray-800 rounded-lg border border-gray-700">
                    <h3 className="text-lg font-semibold mb-2 text-purple-400">Instructions</h3>
                    <p className="text-gray-300 mb-2">Choose any lobby code and stake some amount to play.</p>
                    <p className="text-gray-300">
                      Then you will be redirected to the game. Wait for someone to join the room and play the game. If
                      you win, you can claim your reward from the rewards page, else you will lose all stake.
                    </p>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-gray-300 mb-2">Lobby Code</label>
                      <input
                        type="text"
                        value={lobbyCode}
                        onChange={(e) => setLobbyCode(e.target.value)}
                        placeholder="Enter a unique lobby code"
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-300 mb-2">Stake Amount (Tokens)</label>
                      <input
                        type="number"
                        min="10"
                        value={stakeAmount}
                        onChange={(e) => setStakeAmount(Number.parseInt(e.target.value) || 0)}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>

                    {!isWalletConnected && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleConnectWallet}
                        className="w-full bg-gradient-to-r from-blue-600 to-blue-800 text-white font-bold py-3 rounded-lg text-lg shadow-glow"
                      >
                        Connect Wallet
                      </motion.button>
                    )}

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleCreateRoom}
                      className="w-full bg-gradient-to-r from-purple-600 to-blue-500 text-white font-bold py-3 rounded-lg text-lg shadow-glow"
                    >
                      Create Room
                    </motion.button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="join"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 shadow-glow"
                >
                  <h2 className="text-2xl font-bold mb-6">Join a Game</h2>

                  <div className="mb-8 p-4 bg-gray-800 rounded-lg border border-gray-700">
                    <h3 className="text-lg font-semibold mb-2 text-purple-400">Instructions</h3>
                    <p className="text-gray-300 mb-2">Stake the required amount to play. You will get the room code.</p>
                    <p className="text-gray-300">Go to the game link and join the lobby using the room code.</p>
                  </div>

                  {!isWalletConnected && (
                    <div className="text-center mb-8">
                      <p className="text-gray-300 mb-4">Connect your wallet to join games</p>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleConnectWallet}
                        className="bg-gradient-to-r from-blue-600 to-blue-800 text-white font-bold py-3 px-8 rounded-lg text-lg shadow-glow"
                      >
                        Connect Wallet
                      </motion.button>
                    </div>
                  )}

                  <div className="space-y-4">
                    {hostedGames.map((hostedGame) => (
                      <motion.div
                        key={hostedGame.id}
                        whileHover={{ scale: 1.02 }}
                        className="bg-gray-800 rounded-lg p-4 border border-gray-700 flex flex-col md:flex-row md:items-center md:justify-between"
                      >
                        <div className="mb-4 md:mb-0">
                          <div className="flex items-center mb-2">
                            <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-500 rounded-full flex items-center justify-center mr-2">
                              <span className="text-sm">👑</span>
                            </div>
                            <h3 className="font-semibold">{hostedGame.host}</h3>
                          </div>
                          <div className="flex space-x-4 text-sm text-gray-400">
                            <span>Stake: {hostedGame.stake} Tokens</span>
                            <span>
                              Players: {hostedGame.players}/{hostedGame.maxPlayers}
                            </span>
                          </div>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleJoinGame(hostedGame)}
                          className="bg-gradient-to-r from-purple-600 to-blue-500 text-white font-bold py-2 px-6 rounded-lg shadow-glow"
                        >
                          Join Game
                        </motion.button>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Modal for room creation confirmation */}
        <AnimatePresence>
          {showModal && createdRoom && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 px-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 shadow-glow max-w-md w-full"
              >
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full mx-auto flex items-center justify-center mb-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-8 w-8 text-white"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold mb-2">Room Created!</h2>
                  <p className="text-gray-300">Your game room has been successfully created.</p>
                </div>

                <div className="bg-gray-800 rounded-lg p-4 mb-6">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-400">Room Code:</span>
                    <span className="font-bold">{createdRoom.code}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-400">Stake Amount:</span>
                    <span>{createdRoom.stake} Tokens</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <a
                    href={createdRoom.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full bg-gradient-to-r from-purple-600 to-blue-500 text-white font-bold py-3 rounded-lg text-center text-lg shadow-glow"
                  >
                    Go to Game
                  </a>
                  <button
                    onClick={() => setShowModal(false)}
                    className="block w-full bg-gray-700 text-white font-bold py-3 rounded-lg text-center"
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </WalletProvider>
  )
}

