// import {
//   ConnectButton,
//   useAccountBalance,
//   useWallet,
//   SuiChainId,
//   ErrorCode,
// } from "@suiet/wallet-kit";
// import { Transaction } from "@mysten/sui/transactions";
// import { useEffect, useMemo } from "react";
// import { Ed25519PublicKey } from "@mysten/sui/keypairs/ed25519";
// import { Buffer } from "buffer";

// const sampleNft = new Map([
//   [
//     "sui:devnet",
//     "0xe146dbd6d33d7227700328a9421c58ed34546f998acdc42a1d05b4818b49faa2::nft::mint",
//   ],
//   [
//     "sui:testnet",
//     "0x5ea6aafe995ce6506f07335a40942024106a57f6311cb341239abf2c3ac7b82f::nft::mint",
//   ],
//   [
//     "sui:mainnet",
//     "0x5b45da03d42b064f5e051741b6fed3b29eb817c7923b83b92f37a1d2abf4fbab::nft::mint",
//   ],
// ]);

// function App() {
//   const wallet = useWallet();
//   const { balance } = useAccountBalance();
//   const nftContractAddr = useMemo(() => {
//     if (!wallet.chain) return "";
//     return sampleNft.get(wallet.chain.id) ?? "";
//   }, [wallet]);

//   useEffect(() => {
//     console.log("useEffec called");
//     if (wallet.connected) {
//       console.log("wallet connected :",wallet);
        
      
//     }

//   }, [wallet]);


//   function uint8arrayToHex(value) {
//     if (!value) return "";
//     // @ts-ignore
//     return value.toString("hex");
//   }

//   async function handleExecuteMoveCall(target) {
//     if (!target) return;

//     try {
//       const tx = new Transaction();
//       tx.moveCall({
//         target: target,
//         arguments: [
//           tx.pure.string("Suiet NFT"),
//           tx.pure.string("Suiet Sample NFT"),
//           tx.pure.string(
//             "https://xc6fbqjny4wfkgukliockypoutzhcqwjmlw2gigombpp2ynufaxa.arweave.net/uLxQwS3HLFUailocJWHupPJxQsli7aMgzmBe_WG0KC4"
//           ),
//         ],
//       });
//       const resData = await wallet.signAndExecuteTransaction({
//         transaction: tx,
//       });
//       console.log("executeMoveCall success", resData);
//       alert("executeMoveCall succeeded (see response in the console)");
//     } catch (e) {
//       console.error("executeMoveCall failed", e);
//       alert("executeMoveCall failed (see response in the console)");
//     }
//   }

//   async function handleSignMsg() {
//     if (!wallet.account) return;
//     try {
//       const msg = "Hello world!";
//       const msgBytes = new TextEncoder().encode(msg);
//       const result = await wallet.signPersonalMessage({
//         message: msgBytes,
//       });
//       const verifyResult = await wallet.verifySignedMessage(
//         result,
//         wallet.account.publicKey
//       );
//       console.log("verify signedMessage", verifyResult);
//       if (!verifyResult) {
//         alert(`signMessage succeed, but verify signedMessage failed`);
//       } else {
//         alert(`signMessage succeed, and verify signedMessage succeed!`);
//       }
//     } catch (e) {
//       console.error("signMessage failed", e);
//       alert("signMessage failed (see response in the console)");
//     }
//   }

//   const handleSignTxnAndVerifySignature = async (contractAddress) => {
//     const txn = new Transaction();
//     txn.moveCall({
//       target: contractAddress ,
//       arguments: [
//         txn.pure.string("Suiet NFT"),
//         txn.pure.string("Suiet Sample NFT"),
//         txn.pure.string(
//           "https://xc6fbqjny4wfkgukliockypoutzhcqwjmlw2gigombpp2ynufaxa.arweave.net/uLxQwS3HLFUailocJWHupPJxQsli7aMgzmBe_WG0KC4"
//         ),
//       ],
//     });
//     txn.setSender(wallet.account?.address );

//     try {
//       const signedTxn = await wallet.signTransaction({
//         transaction: txn,
//       });

//       console.log(`Sign and verify txn:`);
//       console.log("--wallet: ", wallet.adapter?.name);
//       console.log("--account: ", wallet.account?.address);
//       const publicKey = wallet.account?.publicKey;
//       if (!publicKey) {
//         console.error("no public key provided by wallet");
//         return;
//       }
//       console.log("-- publicKey: ", publicKey);
//       const pubKey = new Ed25519PublicKey(publicKey);
//       console.log("-- signed txnBytes: ", signedTxn.bytes);
//       console.log("-- signed signature: ", signedTxn.signature);
//       const txnBytes = new Uint8Array(Buffer.from(signedTxn.bytes, "base64"));
//       const isValid = await pubKey.verifyTransaction(txnBytes, signedTxn.signature);
//       console.log("-- use pubKey to verify transaction: ", isValid);
//       if (!isValid) {
//         alert(`signTransaction succeed, but verify transaction failed`);
//       } else {
//         alert(`signTransaction succeed, and verify transaction succeed!`);
//       }
//     } catch (e) {
//       console.error("signTransaction failed", e);
//       alert("signTransaction failed (see response in the console)");
//     }
//   };

//   const chainName = (chainId) => {
//     switch (chainId) {
//       case SuiChainId.MAIN_NET:
//         return "Mainnet";
//       case SuiChainId.TEST_NET:
//         return "Testnet";
//       case SuiChainId.DEV_NET:
//         return "Devnet";
//       default:
//         return "Unknown";
//     }
//   };

//   return (
//     <div className="App">
//       <h1>Vite + Suiet Kit</h1>
//       <div className="card">
//         <ConnectButton
//           onConnectError={(error) => {
//             if (error.code === ErrorCode.WALLET__CONNECT_ERROR__USER_REJECTED) {
//               console.warn(
//                 "user rejected the connection to " + error.details?.wallet
//               );
//             } else {
//               console.warn("unknown connect error: ", error);
//             }
//           }}
//         />


//         {!wallet.connected ? (
//           <p>Connect DApp with Suiet wallet from now!</p>
//         ) : (
//           <div>
//             <div>
//               <p>current wallet: {wallet.adapter?.name}</p>
//               <p>
//                 wallet status:{" "}
//                 {wallet.connecting
//                   ? "connecting"
//                   : wallet.connected
//                   ? "connected"
//                   : "disconnected"}
//               </p>
//               <p>wallet address: {wallet.account?.address}</p>
//               <p>current network: {wallet.chain?.name}</p>
//               <p>wallet balance: {String(balance)} SUI</p>
//               <p>
//                 wallet publicKey: {uint8arrayToHex(wallet.account?.publicKey)}
//               </p>
//             </div>
//             <div className={"btn-group"} style={{ margin: "8px 0" }}>
//               {nftContractAddr && (
//                 <button onClick={() => handleExecuteMoveCall(nftContractAddr)}>
//                   Mint {chainName(wallet.chain?.id)} NFT
//                 </button>
//               )}
//               <button onClick={handleSignMsg}>signMessage</button>
//               {nftContractAddr && (
//                 <button onClick={() => handleSignTxnAndVerifySignature(nftContractAddr)}>
//                   Sign & Verify Transaction
//                 </button>
//               )}
//             </div>
//           </div>
//         )}
//       </div>
//       <p className="read-the-docs">
//         Click on the Vite and Suiet logos to learn more

//         yeh wallet
//       </p>


//     </div>
//   );
// }

// export default App;
"use client"

import {
  ConnectButton as SuietConnectButton,
  useAccountBalance,
  useWallet,
  SuiChainId,
  ErrorCode,
} from "@suiet/wallet-kit"
import { Transaction } from "@mysten/sui/transactions"
import { useEffect, useMemo, useState } from "react"
import { Ed25519PublicKey } from "@mysten/sui/keypairs/ed25519"
import { Buffer } from "buffer"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "./ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card"
import { Wallet, CreditCard, Shield, Award, ChevronDown, ChevronUp } from "lucide-react"

import useWalletStore from "@/hooks/wallet.zustand"






import styles from "./Home.module.css";
import {
  AllDefaultWallets,
  defineStashedWallet,
  WalletProvider,
} from "@suiet/wallet-kit";
import Head from "next/head";
import './suitWallet.css';
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

const sampleNft = new Map([
  ["sui:devnet", "0xe146dbd6d33d7227700328a9421c58ed34546f998acdc42a1d05b4818b49faa2::nft::mint"],
  ["sui:testnet", "0x5ea6aafe995ce6506f07335a40942024106a57f6311cb341239abf2c3ac7b82f::nft::mint"],
  ["sui:mainnet", "0x5b45da03d42b064f5e051741b6fed3b29eb817c7923b83b92f37a1d2abf4fbab::nft::mint"],
])

function App() {
  const wallet = useWallet()
  const { balance } = useAccountBalance()
  const [showDetails, setShowDetails] = useState(false)
  const [actionStatus, setActionStatus] = useState(null)

  const walletStore = useWalletStore((state) => state.connectWallet)

  const nftContractAddr = useMemo(() => {
    if (!wallet.chain) return ""
    return sampleNft.get(wallet.chain.id) ?? ""
  }, [wallet])

  useEffect(() => {
    if (wallet.connected) {
      console.log("wallet connected:", wallet);
      walletStore(wallet);

    }
  }, [wallet.connected])

  function uint8arrayToHex(value) {
    if (!value) return ""
    return value.toString("hex")
  }

   const getSerializedTransaction = async () => {
      try {
       
        // Create transaction block
        const txb = new Transaction();
        
        // // Set the sender address
        // txb.setSender(accounts.address);
        
        // // Set gas payment coins (SUI)
        // txb.setGasPayment([{
        //   objectId: suiFiltered[0].coinObjectId,
        //   version: suiFiltered[0].version,
        //   digest: suiFiltered[0].digest,
        // }]);
        
        // // Set gas price and budget (adjust these values as needed)
        // txb.setGasPrice(1000); // Higher gas price for better confirmation
        // txb.setGasBudget(1000000); // Sufficient gas budget
        
        // Transfer CGS_COIN
        //1. Get the CGS coin object
        txb.transferObjects(
        [txb.object("0xcd04deed1e329f3b368e0565364ba8b67524ec839fd615f88b34b4668e8e85c8")],
        txb.pure.address("0x88ff3daeca4f8fb67784ce1789db95a2ae5df910c91a1abbc919de536e382756")
      );
        
        // Build the transaction block
        // const transactionBlock = await txb.build(suiProvider);
        
        // // Return the hex-encoded transaction bytes
        // return `0x${Buffer.from(transactionBlock).toString('hex')}`;
       
        return txb
        

        
      } catch (error) {
        console.error("Error creating transaction:", error);
        alert(error.message);
        return null;
      }
    };

  async function handleExecuteMoveCall(target) {
    if (!target) return

    setActionStatus({ type: "loading", message: "Minting NFT..." })

    try {
      const tx = await getSerializedTransaction();
      const resData = await wallet.signAndExecuteTransaction({
        transaction: tx,
      })
      console.log("executeMoveCall success", resData)
      setActionStatus({ type: "success", message: "NFT minted successfully!" })
      setTimeout(() => setActionStatus(null), 3000)
    } catch (e) {
      console.error("executeMoveCall failed", e)
      setActionStatus({ type: "error", message: "Failed to mint NFT" })
      setTimeout(() => setActionStatus(null), 3000)
    }
  }

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

  const handleSignTxnAndVerifySignature = async (contractAddress) => {
    if (!contractAddress) return

    setActionStatus({ type: "loading", message: "Signing transaction..." })

    const txn = new Transaction()
    txn.moveCall({
      target: contractAddress,
      arguments: [
        txn.pure.string("Sui Battlefield NFT"),
        txn.pure.string("Exclusive Gaming NFT"),
        txn.pure.string(
          "https://xc6fbqjny4wfkgukliockypoutzhcqwjmlw2gigombpp2ynufaxa.arweave.net/uLxQwS3HLFUailocJWHupPJxQsli7aMgzmBe_WG0KC4",
        ),
      ],
    })
    txn.setSender(wallet.account?.address)

    try {
      const signedTxn = await wallet.signTransaction({
        transaction: txn,
      })

      console.log(`Sign and verify txn:`)
      console.log("--wallet: ", wallet.adapter?.name)
      console.log("--account: ", wallet.account?.address)
      const publicKey = wallet.account?.publicKey
      if (!publicKey) {
        console.error("no public key provided by wallet")
        setActionStatus({ type: "error", message: "No public key provided" })
        setTimeout(() => setActionStatus(null), 3000)
        return
      }

      const pubKey = new Ed25519PublicKey(publicKey)
      const txnBytes = new Uint8Array(Buffer.from(signedTxn.bytes, "base64"))
      const isValid = await pubKey.verifyTransaction(txnBytes, signedTxn.signature)

      if (!isValid) {
        setActionStatus({ type: "warning", message: "Transaction verification failed" })
      } else {
        setActionStatus({ type: "success", message: "Transaction signed and verified!" })
      }
      setTimeout(() => setActionStatus(null), 3000)
    } catch (e) {
      console.error("signTransaction failed", e)
      setActionStatus({ type: "error", message: "Failed to sign transaction" })
      setTimeout(() => setActionStatus(null), 3000)
    }
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



  const truncateAddress = (address) => {
    if (!address) return ""
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto py-8 px-4"
    >
      <motion.div
        initial={{ y: -20 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="text-center mb-8"
      >
        <h1 className="text-3xl md:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">
          SUI Wallet Integration
        </h1>
        <p className="text-gray-300 max-w-2xl mx-auto">
          Connect your SUI wallet to access exclusive gaming features, mint NFTs, and participate in tournaments.
        </p>
      </motion.div>

      <Card className="mb-8">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center">
            <Wallet className="mr-2 h-5 w-5 text-purple-400" />
            Wallet Connection
          </CardTitle>
        </CardHeader>
        <CardContent>
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
                    <span className="font-bold text-white">{Number.parseFloat(balance).toFixed(4)}</span>
                    <span className="ml-1 text-gray-400">SUI</span>
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
        </CardContent>
      </Card>

      {/* Status Messages */}
      <AnimatePresence>
        {actionStatus && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className={`fixed bottom-6 right-6 p-4 rounded-lg shadow-lg max-w-sm ${
              actionStatus.type === "success"
                ? "bg-green-900/80 border border-green-500"
                : actionStatus.type === "error"
                  ? "bg-red-900/80 border border-red-500"
                  : actionStatus.type === "warning"
                    ? "bg-yellow-900/80 border border-yellow-500"
                    : "bg-blue-900/80 border border-blue-500"
            }`}
          >
            <div className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                  actionStatus.type === "success"
                    ? "bg-green-500"
                    : actionStatus.type === "error"
                      ? "bg-red-500"
                      : actionStatus.type === "warning"
                        ? "bg-yellow-500"
                        : "bg-blue-500"
                }`}
              >
                {actionStatus.type === "success" && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-white"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
                {actionStatus.type === "error" && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-white"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
                {actionStatus.type === "warning" && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-white"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
                {actionStatus.type === "loading" && (
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                )}
              </div>
              <p className="text-white">{actionStatus.message}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="text-center mt-8 text-sm text-gray-400"
      >
        <p>Powered by SUI blockchain - Secure, fast, and built for gaming</p>
      </motion.div>
    </motion.div>
  )
}

export default function Home() {
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
        <Head>
          <title>Create Next App</title>
          <meta name="description" content="Generated by create next app" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <App />
      </div>
    </WalletProvider>
  );
}


