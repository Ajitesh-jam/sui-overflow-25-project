"use client"

import { useState,useMemo ,useEffect} from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"

import useUsers from "@/hooks/user.zustand"

import { AllDefaultWallets, defineStashedWallet, WalletProvider } from "@suiet/wallet-kit"
import {
  ConnectButton as SuietConnectButton,
  useAccountBalance,
  useWallet,
  SuiChainId,
  ErrorCode,
} from "@suiet/wallet-kit"
import { Wallet, CreditCard, Shield, Award, ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"

import useWalletStore from "@/hooks/wallet.zustand"

const sampleNft = new Map([
  ["sui:devnet", "0xe146dbd6d33d7227700328a9421c58ed34546f998acdc42a1d05b4818b49faa2::nft::mint"],
  ["sui:testnet", "0x5ea6aafe995ce6506f07335a40942024106a57f6311cb341239abf2c3ac7b82f::nft::mint"],
  ["sui:mainnet", "0x5b45da03d42b064f5e051741b6fed3b29eb817c7923b83b92f37a1d2abf4fbab::nft::mint"],
])

import '../styles/suitWallet.css';
import styles from "../styles/Home.module.css";
import '@suiet/wallet-kit/style.css';


// Custom styled connect button that wraps the Suiet ConnectButton
const ConnectButton = ({ onConnectError }) => {
  return (
    <div className="relative z-10">
      <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-500 rounded-lg blur opacity-75 group-hover:opacity-100 transition duration-200"></div>
      <div className="relative">
        <SuietConnectButton
          onConnectError={onConnectError}
          className="!bg-gradient-to-r !from-purple-600 !to-blue-500 !text-white !font-bold !py-3 !px-8 !rounded-lg !shadow-glow !border-none !transition-all !duration-300 hover:!shadow-[0_0_20px_rgba(139,92,246,0.7)]"
        />
      </div>
    </div>
  )
}


export default function GamePage() {
  
  const router = useRouter()
  const gamename="suiBattleField"

  const user = useUsers((state) => state.selectedUser)

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

  useEffect(() => {

    function fetchGames(){
       fetch("/api/getNodeByLabel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          label: "Game",
          where:{isActive:true}
        }),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          console.log("Gamess ", response)

          return response.json(); // Parse JSON correctly
        })
        .then((data) => {
          
          console.log(data)
          setHostedGames(data);
        
        })
        .catch((error) => console.error("Error:", error));
    }
    fetchGames();


  },[]);

  const wallet = useWallet();
  // const wallet = useWalletStore((state)=>state.wallet);

  async function handleSignMsg() {
    if (!wallet.account) return

    setActionStatus({ type: "loading", message: "Signing message..." })

    try {
      const msg = "Hello Sui Battlefield!"
      const msgBytes = new TextEncoder().encode(msg)
      const result = await wallet.signPersonalMessage({
        message: msgBytes,
      })
      const verifyResult = await wallet.verifySignedMessage(result, wallet.account.publicKey)
      console.log("verify signedMessage", verifyResult)

      if (!verifyResult) {
        setActionStatus({ type: "warning", message: "Signature verification failed" })
      } else {
        setActionStatus({ type: "success", message: "Message signed and verified!" })
      }
      setTimeout(() => setActionStatus(null), 3000)
    } catch (e) {
      console.error("signMessage failed", e)
      setActionStatus({ type: "error", message: "Failed to sign message" })
      setTimeout(() => setActionStatus(null), 3000)
    }
  }

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

    console.log("yeh sui ka waalet ; ",wallet);
    handleSignMsg();
  }

  const handleCreateRoom = () => {
    if (!wallet) {
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
      hostWallet:wallet.account?.publicKey,
      isActive: true,
      hostUserName:user.name

    }

    fetch("/api/createNode", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          label: ["Game"],
          properties: newRoom,
        }),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          return response.json(); // Parse JSON correctly
        })
        .then((data) => console.log(data))
        .catch((error) => console.error("Error:", error));

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
      code: hostedGame.n.properties.code,
      stake: hostedGame.n.properties.stake.low,
      link: game.link,
    })

    fetch("/api/updateNode", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        label: "Game",
        where: {code: hostedGame.n.properties.code},
        updates: {
          isActive: false,
          players: hostedGame.n.properties.players + 1,
          playerWallet: wallet.account?.publicKey,
          playerUserName: user.name,
        },
      }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json(); // Parse JSON correctly
      })
      .then((data) => console.log(data))
      .catch((error) => console.error("Error:", error));

    setShowModal(true)

  }

  const chainName = (chainId) => {
    switch (chainId) {
      case SuiChainId.MAIN_NET:
        return "Mainnet"
      case SuiChainId.TEST_NET:
        return "Testnet"
      case SuiChainId.DEV_NET:
        return "Devnet"
      default:
        return "Unknown"
    }
  }

  const [showDetails, setShowDetails] = useState(false)
  const [actionStatus, setActionStatus] = useState(null)
  const nftContractAddr = useMemo(() => {
    if (!wallet.chain) return ""
    return sampleNft.get(wallet.chain.id) ?? ""
  }, [wallet])


  const truncateAddress = (address) => {
    if (!address) return ""
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  

  return (

      <div className={styles.container}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="max-w-10xl mx-auto py-12 px-4"
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
                      Then you will be redirected to the game. Wait for someone to join the room and play the game. 
                       If you win, you can claim your reward from the rewards page, else you will lose all stake.
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

                    {/* {!isWalletConnected && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleConnectWallet}
                        className="w-full bg-gradient-to-r from-blue-600 to-blue-800 text-white font-bold py-3 rounded-lg text-lg shadow-glow"
                      >
                        Connect Wallet
                      </motion.button>
                    )} */}

                    <WalletProvider
                      defaultWallets={[
                        ...AllDefaultWallets,
                        defineStashedWallet({
                          appName: "Suiet Kit Playground",
                        }),
                      ]}
                    >
                      
                    <div className="flex flex-col items-center justify-center py-6">
                              <ConnectButton
                                onConnectError={(error) => {
                                  if (error.code === ErrorCode.WALLET__CONNECT_ERROR__USER_REJECTED) {
                                    console.warn("user rejected the connection to " + error.details?.wallet)
                                    setActionStatus({ type: "warning", message: "Connection rejected" })
                                    setTimeout(() => setActionStatus(null), 3000)
                                  } else {
                                    console.warn("unknown connect error: ", error)
                                    setActionStatus({ type: "error", message: "Connection failed" })
                                    setTimeout(() => setActionStatus(null), 3000)
                                  }
                                }}
                                />

                          {!wallet.connected ? (
                            <motion.p
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 0.3 }}
                              className="mt-6 text-gray-400 text-center"
                            >
                              Connect your wallet to access gaming features and rewards
                            </motion.p>
                          ) : (
                            <motion.div
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.5 }}
                              className="w-full mt-6"
                            >
                              <div className="flex flex-col sm:flex-row items-center justify-between bg-gray-800/50 rounded-lg p-4 mb-4">
                                <div className="flex items-center mb-4 sm:mb-0">
                                  <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-500 rounded-full flex items-center justify-center mr-3">
                                    <Wallet className="h-5 w-5 text-white" />
                                  </div>
                                  <div>
                                    <p className="font-medium text-white">{wallet.adapter?.name}</p>
                                    <p className="text-sm text-gray-400">{truncateAddress(wallet.account?.address)}</p>
                                  </div>
                                </div>
                                <div className="flex items-center bg-gray-900 rounded-lg px-4 py-2">
                                  <CreditCard className="h-4 w-4 text-purple-400 mr-2" />
                                  
                                </div>
                              </div>

                              <div className="flex justify-between items-center mb-2">
                                <p className="text-sm text-gray-400">
                                  Network: <span className="text-white">{chainName(wallet.chain?.id)}</span>
                                </p>
                                <button
                                  onClick={() => setShowDetails(!showDetails)}
                                  className="flex items-center text-sm text-purple-400 hover:text-purple-300"
                                >
                                  {showDetails ? (
                                    <>
                                      Hide Details <ChevronUp className="ml-1 h-4 w-4" />
                                    </>
                                  ) : (
                                    <>
                                      Show Details <ChevronDown className="ml-1 h-4 w-4" />
                                    </>
                                  )}
                                </button>
                              </div>

                              <AnimatePresence>
                                {showDetails && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="overflow-hidden"
                                  >
                                    <div className="bg-gray-800/30 rounded-lg p-4 mb-4 text-sm">
                                      <p className="mb-2">
                                        <span className="text-gray-400">Address: </span>
                                        <span className="text-white break-all">{wallet.account?.address}</span>
                                      </p>
                                      <p className="mb-2">
                                        <span className="text-gray-400">Public Key: </span>
                                        <span className="text-white break-all">{uint8arrayToHex(wallet.account?.publicKey)}</span>
                                      </p>
                                      <p>
                                        <span className="text-gray-400">Status: </span>
                                        <span className="text-green-400">
                                          {wallet.connecting ? "Connecting" : wallet.connected ? "Connected" : "Disconnected"}
                                        </span>
                                      </p>
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>

                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6">
                                {nftContractAddr && (
                                  <Button
                                    variant="gaming"
                                    onClick={() => handleExecuteMoveCall(nftContractAddr)}
                                    className="flex items-center justify-center"
                                  >
                                    <Award className="mr-2 h-4 w-4" />
                                    Mint Gaming NFT
                                  </Button>
                                )}
                                <Button variant="neon" onClick={handleSignMsg} className="flex items-center justify-center">
                                  <Shield className="mr-2 h-4 w-4" />
                                  Sign Message
                                </Button>
                                {nftContractAddr && (
                                  <Button
                                    variant="default"
                                    onClick={() => handleSignTxnAndVerifySignature(nftContractAddr)}
                                    className="flex items-center justify-center"
                                  >
                                    <Shield className="mr-2 h-4 w-4" />
                                    Sign & Verify Txn
                                  </Button>
                                )}
                              </div>
                            </motion.div>
                          )}   
                   </div>
                    
                    
                    </WalletProvider> 



                      

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
                    {hostedGames.map((hostedGame,index) => (
                      <motion.div
                        key={index}
                        whileHover={{ scale: 1.02 }}
                        className="bg-gray-800 rounded-lg p-4 border border-gray-700 flex flex-col md:flex-row md:items-center md:justify-between"
                      >
                        <div className="mb-4 md:mb-0">
                          <div className="flex items-center mb-2">
                            <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-500 rounded-full flex items-center justify-center mr-2">
                              <span className="text-sm">👑</span>
                            </div>
                            <h3 className="font-semibold">{hostedGame.n.properties.hostUserName}</h3>
                          </div>
                          <div className="flex space-x-4 text-sm text-gray-400">
                            <span>Stake: {hostedGame.n.properties.stake.low} Tokens</span>
                            <span>
                              Players: 1
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
                    onClick={() => {


                      
                      
                      
                      setShowModal(false)
                    
                    }}
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
    
  )
}



