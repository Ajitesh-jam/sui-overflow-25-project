// "use client";

// import { useEffect, useRef } from "react";
// import { motion, useAnimation, useInView } from "framer-motion";
// import HeroSlider from "@/components/HeroSlider";
// import GameCard from "@/components/PostCard";
// import HeroGeometric from "@/components/Geometry";

// const posts = [
//   {
//     id: 1,
//     user: {
//       name: "Jessica Parker",
//       avatar: "/placeholder.png?height=40&width=40",
//     },
//     image: "/ema.png",
//     likes: 234,
//     caption:
//       "Enjoying the beautiful sunset at the beach! 🌅 #sunset #beach #vibes",
//     comments: [
//       { user: "mike_smith", text: "Looks amazing! 😍" },
//       { user: "travel_lover", text: "I need to visit this place!" },
//     ],
//     timestamp: "2 hours ago",
//   },
//   {
//     id: 2,
//     user: {
//       name: "Alex Johnson",
//       avatar: "/placeholder.png?height=40&width=40",
//     },
//     image: "/ema.png",
//     likes: 156,
//     caption:
//       "Just finished my morning hike! The view was worth every step 🏔️ #hiking #nature #adventure",
//     comments: [
//       { user: "nature_enthusiast", text: "This view is breathtaking!" },
//       { user: "hiker101", text: "Which trail is this?" },
//     ],
//     timestamp: "5 hours ago",
//   },
//   {
//     id: 3,
//     user: {
//       name: "Emma Wilson",
//       avatar: "/placeholder.png?height=40&width=40",
//     },
//     image: "/ema.png",
//     likes: 342,
//     caption:
//       "Coffee and a good book - perfect Sunday morning ☕📚 #coffeetime #bookworm #relaxing",
//     comments: [
//       { user: "book_lover", text: "What are you reading?" },
//       { user: "coffee_addict", text: "That coffee looks delicious!" },
//     ],
//     timestamp: "7 hours ago",
//   },
//   {
//     id: 4,
//     user: {
//       name: "David Brown",
//       avatar: "/placeholder.png?height=40&width=40",
//     },
//     image: "/placeholder.png?height=600&width=800",
//     likes: 189,
//     caption:
//       "Just got my new camera! Can't wait to capture some amazing shots 📸 #photography #newgear #excited",
//     comments: [
//       { user: "photo_enthusiast", text: "Which model did you get?" },
//       { user: "camera_pro", text: "You're going to love it!" },
//     ],
//     timestamp: "1 day ago",
//   },
// ];

// const games = [
//   {
//     id: 1,
//     name:"Sui Battlefield",
//     link:"https://suiBattleField.com",
//     pageLink:"suiBattleField",
//     image: "/suiBattleField.png",
//     likes: 234,
//     caption:
//       "Fight against zoombies and monsters in this thrilling game! #suiBattleField #gaming and see if you beat your friend" ,
//     comments: [
//       { user: "mike_smith", text: "Looks amazing!!" },
//       { user: "travel_lover", text: "In love with game" },
//     ],
//   },
//   {
//     id: 2,
//     name:"Sui Battlefield",
//     image: "/suiBattleField.png",
//     likes: 237,
//     caption:
//       "Fight against zoombies and monsters in this thrilling game! #suiBattleField #gaming and see if you beat your friend" ,
//     comments: [
//       { user: "mike_smith", text: "Looks amazing!!" },
//       { user: "travel_lover", text: "In love with game" },
//     ],
//   },
  
// ];

// export default function Home() {
//   const controls = useAnimation();
//   const ref = useRef(null);
//   const inView = useInView(ref, { once: false, amount: 0.1 });

//   useEffect(() => {
//     if (inView) {
//       controls.start("visible");
//     }
//   }, [controls, inView]);

//   // useEffect(() => {
//   //   const whereCondition = [{ name: "Tobias Harris" }, { weight: 100 }];

//   //   fetch("/api/getNodeByLabel", {
//   //     method: "POST",
//   //     headers: {
//   //       "Content-Type": "application/json",
//   //     },
//   //     body: JSON.stringify({
//   //       label: "PLAYER",
//   //       where: whereCondition, // Send the 'where' conditions properly
//   //     }),
//   //   })
//   //     .then((response) => {
//   //       if (!response.ok) {
//   //         throw new Error(`HTTP error! Status: ${response.status}`);
//   //       }
//   //       return response.json(); // Parse JSON correctly
//   //     })
//   //     .then((data) => console.log(data))
//   //     .catch((error) => console.error("Error:", error));
//   // }, []);

//   return (
//     <div className="w-full">
//       <HeroSlider></HeroSlider>

//       <section className="max-w-4xl mx-auto px-4 py-12 ">
//         <motion.h2
//           className="text-3xl font-bold text-center mb-12"
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 1 }}
//         >
//           Latest Games
//         </motion.h2>

//         <div ref={ref} className="space-y-12">
//           {games.map((game, index) => (
//             <motion.div
//               key={game.id}
//               initial="hidden"
//               animate={controls}
//               variants={{
//                 hidden: { opacity: 0, y: 50 },
//                 visible: {
//                   opacity: 1,
//                   y: 0,
//                   transition: {
//                     duration: 0.5,
//                     delay: index * 0.2,
//                   },
//                 },
//               }}
//             >
//               <GameCard game={game} />
//             </motion.div>
//           ))}
//         </div>
//       </section>
//     </div>
//   );
// }
"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import styles from "./styles/Home.module.css"
import { AllDefaultWallets, defineStashedWallet, WalletProvider } from "@suiet/wallet-kit"
import GameCard from "../components/GameCard"
import FloatingIcons from "../components/floating-icons"
import GameCarousel from "../components/GameCarousel"

export default function Home() {
  const [games, setGames] = useState([
    {
      id: 1,
      name: "Sui Battlefield",
      link: "https://suiBattleField.com",
      pageLink: "suiBattleField",
      image: "/suiBattleField.png",
      likes: 234,
      caption:
        "Fight against zombies and monsters in this thrilling game! #suiBattleField #gaming and see if you beat your friend",
    },
    {
      id: 2,
      name: "Crypto Racers",
      link: "https://cryptoRacers.com",
      pageLink: "cryptoRacers",
      image: "/suiBattleField.png",
      likes: 189,
      caption: "Race against other players in this high-octane blockchain racing game! #CryptoRacers #Racing",
    },
    {
      id: 3,
      name: "NFT Legends",
      link: "https://nftLegends.com",
      pageLink: "nftLegends",
      image: "/suiBattleField.png",
      likes: 312,
      caption: "Collect, trade and battle with your NFT characters in epic showdowns! #NFTLegends #Trading",
    },
  ])

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
        <FloatingIcons />

        <GameCarousel games={games} />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="hero-section"
        >
          <h1 className="text-5xl md:text-7xl font-bold text-center mb-6 text-gradient">Challenge. Play. Win.</h1>
          <p className="text-xl md:text-2xl text-center mb-10 text-gray-300">
            Join thousands of players in epic multiplayer battles
          </p>
        </motion.div>

     

        <section className="game-cards-section mt-20 mb-20">
          <motion.h2
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="text-3xl md:text-4xl font-bold mb-10 text-center"
          >
            Popular Games
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {games.map((game, index) => (
              <GameCard key={game.id} game={game} index={index} />
            ))}
          </div>
        </section>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="cta-section text-center mb-20"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Play?</h2>
          <p className="text-xl mb-8 text-gray-300">Get tokens and start challenging players now!</p>
          <Link href="/buyTokens">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-purple-600 to-blue-500 text-white font-bold py-3 px-8 rounded-full text-lg shadow-glow"
            >
              Buy Tokens
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </WalletProvider>
  )
}


