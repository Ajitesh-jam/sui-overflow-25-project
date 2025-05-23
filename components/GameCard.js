// "use client"

// import { useState, useRef } from "react"
// import Image from "next/image"
// import Link from "next/link"
// import { motion, useAnimation } from "framer-motion"
// import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal } from "lucide-react"
// import { useRouter } from "next/navigation"

// export default function GameCard({ game }) {
//   const [liked, setLiked] = useState(false)
//   const [likes, setLikes] = useState(game.likes)
//   const [showComments, setShowComments] = useState(false)
//   const [comment, setComment] = useState("")
//   const [comments, setComments] = useState(game.comments)
//   const controls = useAnimation()
//   const cardRef = useRef(null)
//   const router = useRouter();

//   const handleLike = () => {
//     if (liked) {
//       setLikes(likes - 1)
      
//     } else {
//       setLikes(likes + 1)
//       controls.start({
//         scale: [1, 12, 1],
//         transition: { duration: 0.3 },
//       })
//     }
//     setLiked(!liked)
//   }

//   const handleAddComment = (e) => {
//     e.preventDefault()
//     if (comment.trim()) {
//       setComments([...comments, { user: "you", text: comment }])
//       setComment("")
//     }
//   }


//   return (
//     <motion.div
//       ref={cardRef}
//       className="bg-white dark:bg-red-900 rounded-lg shadow-md overflow-hidden"
//       whileHover={{
//         y: -10,
//         boxShadow: "0 20px 25px -5px rgba(47, 30, 201, 0.1), 0 10px 10px -5px rgba(15, 27, 158, 0.04)",
//       }}
//       transition={{ duration: 0.2 }}
//       style={{color:'black'}}
//     >
//       <div className="p-4 flex items-center">
//         <Image
//           src={game.image || "/placeholder.png"}
//           alt={game.name}
//           width={40}
//           height={40}
//           className="rounded-full"
//         />
//         <div className="ml-3">
//           <Link href={`/${game.pageLink}`} className="font-medium hover:underline ">
//             {game.name}
//           </Link>
//         </div>
//         <button className="ml-auto p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
//           <MoreHorizontal className="h-5 w-5" />
//         </button>
//       </div>

//       <div className="relative aspect-square">
//         <Image
//           src={game.image || "/placeholder.png"}
//           alt={game.name}
//           fill
//           style={{ objectFit: "cover" }}
//           onClick={() => {
//             //naviagte to {game.pageLink}
//             router.push(`/${game.pageLink}`)
//           }}
//           className="cursor-pointer"
//         />
//       </div>

//       <div className="p-4">
//         <div className="flex items-center mb-4">
//           <motion.button
//             className={`p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 like-button ${liked ? "active" : ""}`}
//             onClick={handleLike}
//             animate={controls}
//           >
//             <Heart className={`h-6 w-6 ${liked ? "fill-current" : ""}`} />
//           </motion.button>
//           <span className="ml-1 font-medium">{likes}</span>

//           <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 ml-2">
//             <MessageCircle className="h-6 w-6" />
//           </button>
//           <span className="ml-1">{comments.length}</span>

//           <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 ml-2">
//             <Send className="h-6 w-6" />
//           </button>

//           <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 ml-auto">
//             <Bookmark className="h-6 w-6" />
//           </button>
//         </div>

//         <div>
//           <p className="mb-2">
//             <Link href={`/${game.pageLink}`} className="font-medium hover:underline">
//               {game.name}
//             </Link>{" "}
//             {game.caption}
//           </p>
//           <p className="text-gray-500 text-sm">{game.timestamp}</p>
//         </div>

//         <AnimatePresence>
           
//             <motion.div
//               className="mt-4 border-t pt-4"
//               initial={{ opacity: 0, height: 0 }}
//               animate={{ opacity: 1, height: "auto" }}
//               exit={{ opacity: 0, height: 0 }}
//               transition={{ duration: 0.3 }}
//             >
//               <h4 className="font-medium mb-2">Comments</h4>
//               <div className="space-y-2 max-h-40 overflow-y-auto mb-4">
//                 {comments.map((comment, index) => (
//                   <div key={index} className="flex">
//                     <span className="font-medium mr-2">{comment.user}</span>
//                     <span>{comment.text}</span>
//                   </div>
//                 ))}
//               </div>
//               <form onSubmit={handleAddComment} className="flex">
//                 <input
//                   type="text"
//                   placeholder="Add a comment..."
//                   className="flex-1 border rounded-l-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-pink-500 dark:bg-gray-800 dark:border-gray-700"
//                   value={comment}
//                   onChange={(e) => setComment(e.target.value)}
//                 />
//                 <button
//                   type="submit"
//                   className="bg-gradient-to-r from-pink-500 to-violet-500 text-white px-4 rounded-r-md"
//                 >
//                   Post
//                 </button>
//               </form>
//             </motion.div>
          
//         </AnimatePresence>
//       </div>
//     </motion.div>
//   )
// }

// function AnimatePresence({ children }) {
//   return children
// }

"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import Image from "next/image"

export default function GameCard({ game, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -10, transition: { duration: 0.2 } }}
      className="game-card bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl overflow-hidden shadow-glow"
    >
      <div className="relative h-48 w-full">
        <Image
          src={game.image || "/placeholder.png"}
          alt={game.name}
          layout="fill"
          objectFit="cover"
          className="transition-transform duration-300 hover:scale-110"
        />
        <div className="absolute top-3 right-3 bg-black bg-opacity-70 rounded-full px-3 py-1 flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 text-red-500 mr-1"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
              clipRule="evenodd"
            />
          </svg>
          <span className="text-sm text-white">{game.likes}</span>
        </div>
      </div>
      <div className="p-5">
        <h3 className="text-xl font-bold mb-2 text-white">{game.name}</h3>
        <p className="text-gray-300 mb-4 text-sm">{game.caption}</p>
        <Link href={`/${game.pageLink}`}>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 rounded-lg font-medium"
          >
            Play Now
          </motion.button>
        </Link>
      </div>
    </motion.div>
  )
}

