"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { MapPin, Smile, ArrowLeft } from "lucide-react"
import useUsers from "@/hooks/user.zustand"
import { useRouter } from "next/navigation"

export default function CreatePost() {
  const [imageUrl, setImageUrl] = useState("")
  const [description, setDescription] = useState("")
  const [location, setLocation] = useState("")
  const [isValidImage, setIsValidImage] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter();
  // Handle Image URL Change
  const handleImageUrlChange = (e) => {
    setImageUrl(e.target.value)
    setIsValidImage(true)
  }
  const user= useUsers((state)=> (state.selectedUser))
 
  // Handle Image Load Success
  const handleImageLoad = () => {
    setIsLoading(false)
  }

  // Handle Image Load Error
  const handleImageError = () => {
    setIsLoading(false)
    setIsValidImage(false)
  }

  // Load Image Preview
  const loadImage = () => {
    if (imageUrl) {
      setIsLoading(true)
    }
  }

  // Get Current Location
  const handleAddLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          setLocation(`Latitude: ${latitude}, Longitude: ${longitude}`)
        },
        (error) => {
          console.error("Error fetching location:", error)
          setLocation("Unable to retrieve location")
        }
      )
    } else {
      setLocation("Geolocation is not supported by this browser")
    }
  }

  async function handleSubmit() {
    // Handle form submission logic here
    console.log("Image URL:", imageUrl)
    console.log("Description:", description)
    console.log("Location:", location)

    

    const posts = await fetch("/api/getAdjNodeByLabel", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        label: ["USER"],
        where: {"name": user.name,"email": user.email},
        edgeLabel: ["POSTED_BY"],
        edgeWhere: [],
        adjNodeLabel: ["POST"],
        adjWhere: [],
      }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        console.log("Response:", response);
        return response.json(); // Parse JSON correctly
        
      })
      .then((data) => {
        console.log("post :", data);
        return data;
      
      })
      .catch((error) => console.error("Error:", error));
    // Reset fields after submission
      console.log("Posts:", posts);

       const postCount = posts.length|| 0;
      // console.log("Current post count:", postCount);
  
      const newPostName = `${postCount + 1}`;
      console.log("New Post Name:", newPostName);


    const createResponse = await fetch("/api/createAdjacentNode", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        startNodeLabel: ["USER"],
        startNodeWhere: {"name": user.name,"email": user.email},
        endNodeLabel: ["POST"],
        endNodeWhere: {"name": newPostName,"imageUrl": imageUrl,"description": description,
          "location": location},
        edgeLabel: "POSTED_BY",
        properties: {
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
    // Reset fields after submission
    setImageUrl("")
    setDescription("")
    setLocation("")

    router.push("/profile")
  }
  
  async function handleBack() {
    router.push("/profile");
  }
  return (
    <div className="flex flex-col h-screen bg-black text-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
      <button onClick={handleBack} className="text-white">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-semibold">Create new post</h1>
        <Button onClick={handleSubmit} variant="link" className="text-blue-500 font-semibold">
        
          Share
        
        </Button>
      </div>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Image preview area */}
        <div className="flex-1 relative bg-gray-900 flex items-center justify-center">
          {!imageUrl && (
            <div className="text-center p-6">
              <div className="mb-4 text-gray-400">Enter an image URL to preview</div>
              <Input
                type="text"
                placeholder="Paste image URL here"
                className="max-w-md bg-gray-800 border-gray-700"
                value={imageUrl}
                onChange={handleImageUrlChange}
              />
              <Button
                className="mt-4 bg-blue-500 hover:bg-blue-600"
                onClick={loadImage}
                disabled={!imageUrl}
              >
                Load Image
              </Button>
            </div>
          )}

          {imageUrl && (
            <>
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}

              {!isValidImage ? (
                <div className="text-center p-6 text-red-500">
                  Invalid image URL. Please try another URL.
                  <Button className="mt-4 block mx-auto bg-gray-800" onClick={() => setImageUrl("")}>
                    Try Again
                  </Button>
                </div>
              ) : (
                <div className="relative w-full h-full">
                  <Image
                    src={imageUrl || "/placeholder.png"}
                    alt="Post preview"
                    fill
                    className="object-contain"
                    onLoad={handleImageLoad}
                    onError={handleImageError}
                  />
                </div>
              )}
            </>
          )}
        </div>

        {/* Sidebar */}
        <div className="w-80 border-l border-gray-800 flex flex-col">
          {/* User info */}
          <div className="p-4 flex items-center">
            <Avatar className="h-8 w-8 mr-2">
              <AvatarImage src="/placeholder.png?height=32&width=32" />
              <AvatarFallback>UN</AvatarFallback>
            </Avatar>
            <span className="font-semibold">saraswagh</span>
          </div>

          {/* Description */}
          <div className="p-4 border-b border-gray-800">
            <div className="text-sm text-gray-400 mb-2">Description:</div>
            <Textarea
              placeholder="Write a caption..."
              className="bg-transparent border-none resize-none h-24 focus-visible:ring-0 p-0"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <div className="flex justify-between items-center mt-2">
              <Smile className="w-5 h-5 text-gray-400" />
              <span className="text-xs text-gray-400">{description.length}/2,200</span>
            </div>
          </div>

          {/* Add Location */}
          <button
            className="p-4 flex items-center justify-between border-b border-gray-800"
            onClick={handleAddLocation}
          >
            <span>Add Location</span>
            <MapPin className="w-5 h-5 text-gray-400" />
          </button>

          {location && (
            <div className="p-4 text-xs text-blue-500 border-b border-gray-800">
              📍 {location}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
