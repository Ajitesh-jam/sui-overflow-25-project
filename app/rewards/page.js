"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import styles from "../styles/Home.module.css"
import { AllDefaultWallets, defineStashedWallet, WalletProvider } from "@suiet/wallet-kit"

export default function Rewards() {
  const [isWalletConnected, setIsWalletConnected] = useState(false)
  const [rewards, setRewards] = useState([
    { id: 1, game: "Sui Battlefield", amount: 200, claimed: false, date: "2023-04-15" },
    { id: 2, game: "Crypto Racers", amount: 150, claimed: true, date: "2023-04-10" },
    { id: 3, game: "NFT Legends", amount: 300, claimed: false, date: "2023-04-05" },
  ])

  const handleConnectWallet = () => {
    setIsWalletConnected(true)
  }

  const handleClaimReward = (rewardId) => {
    setRewards(rewards.map((reward) => (reward.id === rewardId ? { ...reward, claimed: true } : reward)))
  }

  const totalUnclaimed = rewards.filter((reward) => !reward.claimed).reduce((sum, reward) => sum + reward.amount, 0)

  const totalClaimed = rewards.filter((reward) => reward.claimed).reduce((sum, reward) => sum + reward.amount, 0)

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
          className="max-w-4xl mx-auto py-16 px-4"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-12 text-gradient">Your Gaming Rewards</h1>

          {!isWalletConnected ? (
            <div className="text-center mb-8">
              <p className="text-gray-300 mb-6">Connect your wallet to view and claim your rewards</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleConnectWallet}
                className="bg-gradient-to-r from-purple-600 to-blue-500 text-white font-bold py-3 px-8 rounded-full text-lg shadow-glow"
              >
                Connect Wallet
              </motion.button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 shadow-glow"
                >
                  <h3 className="text-xl text-gray-300 mb-2">Unclaimed Rewards</h3>
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full mr-4 flex items-center justify-center">
                      <span className="text-xl">🪙</span>
                    </div>
                    <span className="text-4xl font-bold">{totalUnclaimed}</span>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 shadow-glow"
                >
                  <h3 className="text-xl text-gray-300 mb-2">Total Claimed</h3>
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-green-600 rounded-full mr-4 flex items-center justify-center">
                      <span className="text-xl">✓</span>
                    </div>
                    <span className="text-4xl font-bold">{totalClaimed}</span>
                  </div>
                </motion.div>
              </div>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 shadow-glow"
              >
                <h2 className="text-2xl font-bold mb-6">Your Rewards</h2>

                <div className="space-y-4">
                  {rewards.length > 0 ? (
                    rewards.map((reward) => (
                      <motion.div
                        key={reward.id}
                        whileHover={{ scale: 1.02 }}
                        className="bg-gray-800 rounded-lg p-4 border border-gray-700 flex flex-col sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="mb-4 sm:mb-0">
                          <h3 className="font-semibold text-lg mb-1">{reward.game}</h3>
                          <div className="flex space-x-4 text-sm text-gray-400">
                            <span>{reward.amount} Tokens</span>
                            <span>Won on {reward.date}</span>
                          </div>
                        </div>
                        {reward.claimed ? (
                          <div className="flex items-center text-green-500">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5 mr-1"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                            <span>Claimed</span>
                          </div>
                        ) : (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleClaimReward(reward.id)}
                            className="bg-gradient-to-r from-purple-600 to-blue-500 text-white font-bold py-2 px-6 rounded-lg shadow-glow"
                          >
                            Claim Reward
                          </motion.button>
                        )}
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-center py-10">
                      <p className="text-gray-400">You don't have any rewards yet. Play games to earn rewards!</p>
                    </div>
                  )}
                </div>
              </motion.div>
            </>
          )}
        </motion.div>
      </div>
    </WalletProvider>
  )
}

