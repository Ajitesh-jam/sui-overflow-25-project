"use client"

import { useState,useEffect} from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import styles from "../styles/Home.module.css";
import useUsers from "@/hooks/user.zustand"
import { Transaction } from '@mysten/sui/transactions';
import React from "react"
import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';

import { Button } from "@/components/ui/button"


const CHAIN_NAME = 'sui';
const SUI_RPC_URL = 'https://fullnode.devnet.sui.io:443';

// Recipient address that will receive the SUI
const RECIPIENT_ADDRESS = '0xf8ad2061b08e7ce8ef247ecd09530903597c39e2f4a79d85dd7c6fd489b1f672'; // owner address


export default function GamePage() {
  const router = useRouter()
  const gamename="suiBattleField"
  const user = useUsers((state) => state.selectedUser)
  const [activeTab, setActiveTab] = useState("host")

  const [lobbyCode, setLobbyCode] = useState("")
  const [stakeAmount, setStakeAmount] = useState(35)
  const [showModal, setShowModal] = useState(false)
  const [createdRoom, setCreatedRoom] = useState(null)
  const [hostedGames, setHostedGames] = useState([
    { id: 1, host: "Player123", stake: 100, players: 1, maxPlayers: 2 },
    { id: 2, host: "GameMaster", stake: 200, players: 1, maxPlayers: 2 },
    { id: 3, host: "CryptoChamp", stake: 150, players: 1, maxPlayers: 2 },  
  ])
  const [isPrivate,setIsPrivate]=useState(false);
  

  const [accounts, setAccounts] = React.useState(null);
  const [txHash, setTxHash] = React.useState(null);

  useEffect(() => {

    function fetchGames(){
       fetch("/api/getNodeByLabel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          label: "Game",
          where:{isActive:true,isPrivate:false}
        }),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          console.log("Feetched Games : ", response)

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

  const request = async (method, params) => {
    const res = await fetch(SUI_RPC_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: 0,
        jsonrpc: '2.0',
        method,
        params: params || [],
      }),
    });

    const { result } = await res.json();
    return result;
  };

  const suiProvider = {
    provider: {
      getReferenceGasPrice: async () => {
        const result = await request('suix_getReferenceGasPrice', []);
        return result;
      },
      getCoins: async ({ owner, coinType }) => {
        const result = await request('suix_getCoins', [owner, coinType]);
        return result;
      },
      multiGetObjects: async ({ ids, options }) => {
        const result = await request('sui_multiGetObjects', [ids, options]);
        return result;
      },
      dryRunTransactionBlock: async ({ transactionBlock }) => {
        const result = await request('sui_dryRunTransactionBlock', [
          typeof transactionBlock === 'string'
            ? transactionBlock
            : Buffer.from(transactionBlock).toString('base64'),
        ]);
        return result;
      },
    },
  };

  // const getSerializedTransaction = async () => {
  //   try {
  //     const coins = await request('suix_getCoins', [accounts.address]);

  //     const coinType = '0x2::sui::SUI';
  //     // const coinType = '0x9229fd48ca1698e2e058b17f344b90b76a96be78ccdca6dbf0de351eb11c8a75::CGSCOIN::CGSCOIN';
  //     const filtered = coins.data.filter((item) => item.coinType === coinType);

  //     const txb = new Transaction();

  //     // Set the sender address
  //     txb.setSender(accounts.address);

  //     // Set gas payment coins
  //     if (filtered.length > 0) {
  //       txb.setGasPayment(
  //         filtered.slice(0, 1).map((item) => {
  //           return {
  //             objectId: item.coinObjectId,
  //             version: item.version,
  //             digest: item.digest,
  //           };
  //         })
  //       );
  //     }
      

      
  //       // Split out the amount to transfer using proper BCS serialization
  //     const [coin] = txb.splitCoins(
  //       txb.gas,
  //       [txb.pure.u64(1000000)]  // Use the convenience method for u64
  //     );

  //     // Transfer to the specified recipient address using proper BCS serialization
  //     txb.transferObjects(
  //       [coin],
  //       txb.pure.address(RECIPIENT_ADDRESS)  // Use the convenience method for address
  //     );

  //     txb.setGasPrice(50000);
  //     txb.setGasBudget(100000000);
  //     const transactionBlock = await txb.build(suiProvider);
  //     console.log("Transaction Block: ", transactionBlock);
  //     return `0x${Buffer.from(transactionBlock).toString('hex')}`;
      
  //   } catch (error) {
  //     console.error("Error creating transaction:", error);
  //     alert(error.message);
  //     return null;
  //   }
  // };


  // const getSerializedTransaction = async () => {
  //   try {
  //     // First, get SUI coins for gas payment
  //     const suiCoins = await request('suix_getCoins', [
  //       accounts.address,
  //       '0x2::sui::SUI'
  //     ]);
      
  //     // Then, get CGS_COIN coins for transfer
  //     const cgsCoins = await request('suix_getCoins', [
  //       accounts.address, 
  //       '0x9229fd48ca1698e2e058b17f344b90b76a96be78ccdca6dbf0de351eb11c8a75::CGSCOIN::CGSCOIN'
  //     ]);
      
  //     // Filter and verify we have both coin types
  //     const suiFiltered = suiCoins.data.filter(coin => 
  //       coin.coinType === '0x2::sui::SUI'
  //     );
      
  //     const cgsFiltered = cgsCoins.data.filter(coin => 
  //       coin.coinType === '0x9229fd48ca1698e2e058b17f344b90b76a96be78ccdca6dbf0de351eb11c8a75::CGSCOIN::CGSCOIN'
  //     );

  //     console.log("SUI Coins: ", suiFiltered);
  //     console.log("CGS Coins: ", cgsFiltered);
      
  //     if (suiFiltered.length === 0) {
  //       throw new Error("No SUI coins found for gas payment");
  //     }
      
  //     if (cgsFiltered.length === 0) {
  //       throw new Error("No CGS_COIN coins found for transfer");
  //     }
      
  //     // Create transaction block
  //     const txb = new Transaction();
      
  //     // Set the sender address
  //     txb.setSender(accounts.address);
      
  //     // Set gas payment coins (SUI)
  //     txb.setGasPayment([{
  //       objectId: suiFiltered[0].coinObjectId,
  //       version: suiFiltered[0].version,
  //       digest: suiFiltered[0].digest,
  //     }]);
      
  //     // Set gas price and budget
  //     txb.setGasPrice(5);
  //     txb.setGasBudget(10);
      
  //     // // PART 1: Transfer SUI
  //     // // Split out SUI to transfer
  //     // const [suiCoin] = txb.splitCoins(
  //     //   txb.gas,
  //     //   [txb.pure.u64(1000000)] // 0.001 SUI
  //     // );
      
  //     // // Transfer SUI to recipient
  //     // txb.transferObjects(
  //     //   [suiCoin],
  //     //   txb.pure.address(RECIPIENT_ADDRESS)
  //     // );
      
  //     // PART 2: Transfer CGS_COIN
  //     // First, get the CGS coin object

  //     console.log("SUI Coin Input: ", txb.gas);
  //     const cgsCoinInput = txb.object(cgsFiltered[0].coinObjectId);

  //     console.log("CGS Coin Input: ", cgsCoinInput);
      
  //     // // Split the CGS coin
  //     const [cgsCoin] = txb.splitCoins(
  //       txb.object(cgsFiltered[0].coinObjectId),
  //       [txb.pure.u64(1000000)] // Amount of CGS to transfer (adjust as needed)
  //     );
  //     console.log("CGS Coin: ", cgsCoin);
      
  //     // // Transfer the CGS coin to recipient
  //     txb.transferObjects(
  //       [cgsCoin],
  //       txb.pure.address(RECIPIENT_ADDRESS)
  //     );
  //     console.log("Transfer Objects: ", txb);


  //     // do sui client pay --recipients 0x88ff3daeca4f8fb67784ce1789db95a2ae5df910c91a1abbc919de536e382756 --input-coins 0xc956c1e8cdd96c0befc4f2f937b517cc45dc039e86fb5a078eada213b0efd64c --amounts 10 --gas-budget 1000000000
  //     // // Transfer CGS_COIN to recipient
  //     // txb.transferObjects(
  //     //   [txb.object("0x95e918ac319fbd8c39e5f2f5189f683008566ecb0932cf5b1ff229c5cbd66834")],
  //     //   txb.pure.address(RECIPIENT_ADDRESS)
  //     // );
  //     // console.log("Transfer Objects: ", txb);
      
      

      
      
  //     // Build the transaction block
  //     const transactionBlock = await txb.build(suiProvider);
  //     console.log("Transaction Block: ", transactionBlock);
      
  //     // Return the hex-encoded transaction bytes
  //     return `0x${Buffer.from(transactionBlock).toString('hex')}`;
      
  //   } catch (error) {
  //     console.error("Error creating transaction:", error);
  //     alert(error.message);
  //     return null;
  //   }
  // };
  
  const getSerializedTransaction = async () => {
    try {

      //transfer CGS COIn  of stake amount 
     
      // Then, get CGS_COIN coins for transfer
      const cgsCoins = await request('suix_getCoins', [
        accounts.address, 
        '0x9229fd48ca1698e2e058b17f344b90b76a96be78ccdca6dbf0de351eb11c8a75::CGSCOIN::CGSCOIN'
      ]);
      
     
      const cgsFiltered = cgsCoins.data.filter(coin => 
        coin.coinType === '0x9229fd48ca1698e2e058b17f344b90b76a96be78ccdca6dbf0de351eb11c8a75::CGSCOIN::CGSCOIN'
      );
      
      if (cgsFiltered.length === 0) {
        throw new Error("No CGS_COIN coins found for transfer");
      }
      
      // Create transaction block
      const txb = new Transaction();
      
      // Set the sender address
      txb.setSender(accounts.address);

      console.log("Sui gas payment: ", txb.gas);
      

      
      // Transfer CGS_COIN
      // 1. Get the CGS coin object
      const cgsCoinObjectID = cgsFiltered[0].coinObjectId;
      // 2. Split the CGS coin (adjust amount as needed)
      const cgsCoinToTransfer = txb.splitCoins(
        txb.object(cgsCoinObjectID),
        [txb.pure.u64(stakeAmount)]
      );


      // 3. Transfer the split coin
      txb.transferObjects(
        [cgsCoinToTransfer],
        txb.pure.address(RECIPIENT_ADDRESS)
      );
      txb.setGasBudget(10000000); // Sufficient gas budget

      const client = new SuiClient({ url: getFullnodeUrl('devnet') });
      //const transactionBlock = await txb.build(suiProvider);
      const transactionBlock = await  txb.build({ client });
      console.log("Transaction Block: ", transactionBlock);
 
      
      // Return the hex-encoded transaction bytes
      return `0x${Buffer.from(transactionBlock).toString('hex')}`;
      
    } catch (error) {
      console.error("Error creating transaction:", error);
      alert(error.message);
      return null;
    }
  };

  async function handleSendTransaction() {
    try {
      const HEX_STRING_TX_DATA = await getSerializedTransaction();
      if (!HEX_STRING_TX_DATA) {
        throw new Error('Failed to create transaction');
      }
      
      const response = await dapp.request(CHAIN_NAME, {
        method: 'dapp:signAndSendTransaction',
        params: [`${HEX_STRING_TX_DATA}`],
      });
      
      const txHash = response[0];
      console.log("Transaction successful! Hash:", txHash);
      setTxHash(txHash);
      return true;
    } catch (error) {
      //console.error("Transaction error:", error);
      alert(`Error Message: ${error.message}\nError Code: ${error.code}`);
      return false;
    }
  }
  async function handleGetAccount() {
    try {
      const accounts = await dapp.request(CHAIN_NAME, {
        method: 'dapp:accounts',
      });
      if (Object.keys(accounts).length === 0) {
        throw new Error('There are no accounts.');
      }
      const chainId = await window.dapp.networks.sui.chain;

      if ((chainId === 'mainnet') || (chainId === 'testnet')) {
        throw new Error('Please change to SUI devnet in WELLDONE Wallet');
      }
      setAccounts(accounts[CHAIN_NAME]);
    } catch (error) {
      console.error("Error getting account:", error);
      alert(error.message);
    }
  }
 
  const handleCreateRoom = async () => {
    // if(user.name === "Dummy User"){
    //   alert("Please Login first!")
    //   return
    // }
    if(accounts === null){
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
      hostWallet:accounts.address,
      isActive: true,
      hostUserName:user.name,
      isPrivate:isPrivate,
    }

    // All SUI Transaction and game logic goes here

    //Step 1 -> transfer stake to owner of the game
    await handleSendTransaction();


    //Step 2 -> create a new room in the database   

    fetch("/api/createAdjacentNode", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          startNodeLabel: ["USER"],
          startNodeWhere: { name: user.name },
          endNodeLabel: ["Game"],
          endNodeWhere: newRoom,
          edgeLabel: "HOSTED",
          properties: {
            stake: stakeAmount,
            code: lobbyCode,
            isActive: true,
            players: 1,
            hostUserName:user.name,
            playerWallet: accounts.address,
            isPrivate:isPrivate,
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

    setCreatedRoom(newRoom)
    setShowModal(true)
  }

  const handleJoinGame = async (hostedGame) => {
    try{

      if(accounts === null){
        alert("Please connect your wallet first!")
        return
      }
  
  
      setCreatedRoom({
        id: hostedGame.id,
        code: hostedGame.n.properties.code,
        stake: hostedGame.n.properties.stake.low,
        link: game.link,
      })
  
      setStakeAmount(hostedGame.n.properties.stake.low);
  
      //give stake amount to the game owner
      const status= await handleSendTransaction();

      if(!status){
        return
      }
  
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
            JoinPlayerWallet: accounts.address,
            JoinPlayerUserName: user.name,
          },
        }),
      }).then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          setShowModal(true)
          return response.json(); // Parse JSON correctly
        })
        .then((data) => console.log(data))
        .catch((error) => console.error("Error:", error));
    }
    catch(error){
      console.error("Error in joining game: ", error)
      alert("Error in joining game: ");
      return;
    }

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
              <Image src={"/placeholder.png"} alt={game.name} layout="fill" objectFit="cover" />
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
                      <label className="block text-gray-300 mb-2">Stake Amount / 100 CGS_COIN </label>
                      <input
                        type="number"
                        min="0.0001"
                        value={stakeAmount}
                        onChange={(e) => setStakeAmount(Number.parseInt(e.target.value) || 0)}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                      <br></br>

                      <>
              {accounts ? (
                <>
                <div>
                  <b>Your Account:</b> {accounts.address}
                </div>
                
                <div>
                  <b>Amount:</b> {stakeAmount/100 } CGS_COIN
                </div>
                </>
              ) : (
                <>
                  <Button onClick={handleGetAccount} type="button">
                    Connect Wallet
                  </Button>
                  <div>You need to connect your wallet first!</div>
                </>
              )}
              {txHash && (
                <div>
                  <b>Transaction Hash:</b> {txHash}
                </div>
              )}
            </>
                         
                    <div className="flex items-center mb-2">
                      <input
                        type="checkbox"
                        id="privateGame"
                        checked={isPrivate}
                        onChange={(e) => setIsPrivate(e.target.checked)}
                        className="mr-2"
                        />
                      <label htmlFor="privateGame" className="text-gray-400">
                        Private Game
                      </label>
                     
                    </div>

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

                  {accounts ? (
                <>
                <div>
                  <b>Your Account:</b> {accounts.address}
                </div>
                
                <div>
                  <b>Amount:</b> {stakeAmount/100 } CGS_COIN
                </div>
                </>
              ) : (
                <>
                  <Button onClick={handleGetAccount} type="button">
                    Connect Wallet
                  </Button>
                  <div>You need to connect your wallet first!</div>
                </>
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
                            <span>code: {hostedGame.n.properties.code} Tokens</span>
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
                    href="unitydl://mylink?name=Alice&player_id=12345&wallet_address=0xABC123DEF456&tokens=500&room_code=NEWROOM&skin_ids=1,3,5"
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
