"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import styles from "../styles/Home.module.css"
import { AllDefaultWallets, defineStashedWallet, WalletProvider } from "@suiet/wallet-kit"

export default function BuyTokens() {
  const [tokenAmount, setTokenAmount] = useState(100)
  const [isWalletConnected, setIsWalletConnected] = useState(false)
  const [userTokens, setUserTokens] = useState(0)

  const handleConnectWallet = () => {
    setIsWalletConnected(true)
    setUserTokens(Math.floor(Math.random() * 500))
  }

  const handleBuyTokens = () => {
    if (isWalletConnected) {
      setUserTokens((prev) => prev + tokenAmount)






      alert(`Successfully purchased ${tokenAmount} tokens!`)


    } else {
      alert("Please connect your wallet first!")
    }
  }

  return (
   
      <div className={styles.container}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto py-16 px-4"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-12 text-gradient">
            Power Up Your Gaming Experience
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              <div className="token-balance-card bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 shadow-glow mb-8">
                <h3 className="text-xl text-gray-300 mb-2">Your Token Balance</h3>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full mr-4 flex items-center justify-center">
                    <span className="text-xl">🪙</span>
                  </div>
                  <span className="text-4xl font-bold">{userTokens}</span>
                </div>
              </div>

              <div className="benefits-list space-y-4">
                <motion.div
                  className="flex items-start"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-500 rounded-full flex items-center justify-center mr-3 mt-1 flex-shrink-0">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 text-white"
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
                  <div>
                    <h4 className="text-lg font-semibold">Higher Stakes, Bigger Rewards</h4>
                    <p className="text-gray-300">Stake more tokens to enter high-reward game lobbies</p>
                  </div>
                </motion.div>

                <motion.div
                  className="flex items-start"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-500 rounded-full flex items-center justify-center mr-3 mt-1 flex-shrink-0">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 text-white"
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
                  <div>
                    <h4 className="text-lg font-semibold">Exclusive Game Access</h4>
                    <p className="text-gray-300">Unlock premium games only available to token holders</p>
                  </div>
                </motion.div>

                <motion.div
                  className="flex items-start"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-500 rounded-full flex items-center justify-center mr-3 mt-1 flex-shrink-0">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 text-white"
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
                  <div>
                    <h4 className="text-lg font-semibold">Instant Withdrawals</h4>
                    <p className="text-gray-300">Cash out your winnings instantly to your wallet</p>
                  </div>
                </motion.div>
              </div>
            </motion.div>

            <motion.div
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 shadow-glow"
            >
              <h2 className="text-2xl font-bold mb-6 text-center">Buy Game Tokens</h2>

              {!isWalletConnected ? (
                <div className="text-center mb-8">
                  <p className="text-gray-300 mb-6">Connect your wallet to buy tokens</p>
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
                <div className="space-y-6">
                  <div>
                    <label className="block text-gray-300 mb-2">Amount of Tokens</label>
                    <div className="relative">
                      <input
                        type="number"
                        min="10"
                        value={tokenAmount}
                        onChange={(e) => setTokenAmount(Number.parseInt(e.target.value) || 0)}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                        <button
                          onClick={() => setTokenAmount((prev) => Math.max(10, prev - 10))}
                          className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center hover:bg-gray-600"
                        >
                          -
                        </button>
                        <button
                          onClick={() => setTokenAmount((prev) => prev + 10)}
                          className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center hover:bg-gray-600"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-800 rounded-lg p-4">
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-300">Price</span>
                      <span className="font-medium">{tokenAmount * 0.01} SUI</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">You will receive</span>
                      <span className="font-medium">{tokenAmount} Tokens</span>
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleBuyTokens}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-500 text-white font-bold py-3 px-8 rounded-lg text-lg shadow-glow"
                  >
                    Buy Tokens
                  </motion.button>
                </div>
              )}

              <div className="mt-6 pt-6 border-t border-gray-700">
                <div className="flex items-center justify-center space-x-4">
                  <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center">
                    <span className="text-xl">🔒</span>
                  </div>
                  <p className="text-sm text-gray-400">Secure transactions powered by SUI blockchain</p>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>

  )
}


