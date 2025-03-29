"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UserHeader from "@/components/user-header";
import StoryCircles from "@/components/story-circles";
import PostGrid from "@/components/post-grid";
import ReelGrid from "@/components/reel-grid";
import PostModal from "@/components/post-modal";
import useUsers from "@/hooks/user.zustand";


// Inside your JSX where UserHeader is rendered




export default function UserProfilePage() {
  const [activeTab, setActiveTab] = useState("posts");

  const user = useUsers((state) => state.selectedUser);
  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Mock user data
  const [userData, setUserData] = useState({
    followers: 0,
    following: 0,
    posts: 0,
  });

  // ✅ Fetch posts dynamically from API
  useEffect(() => {
    setUserData({
      ...user,
      followers: 0,
      following: 0,
      posts: 0,
    });

    async function fetchPosts() {
      try {
        const response = await fetch("/api/getAdjNodeByLabel", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            label: ["USER"],
            where: { name: user.name },
            edgeLabel: "POSTED_BY",
            edgeWhere: {},
            adjNodeLabel: "POST",
            adjWhere: {},
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const fetchedPosts = await response.json();
        console.log("Posts Response:", fetchedPosts);

        if (Array.isArray(fetchedPosts)) {
          const enhancedPosts = fetchedPosts.map((post) => ({
            ...post,
            id: Math.floor(Math.random() * 1000),
            likes: Math.floor(Math.random() * 1000),
            comments: Math.floor(Math.random() * 100),
          }));

          setPosts(enhancedPosts);

          // Update post count dynamically in FriendData
          setUserData((prev) => ({
            ...prev,
            posts: enhancedPosts.length,
          }));
        }
      } catch (error) {
        console.error("Error fetching posts:", error);
      }
    }

    setUserData({
      ...user,
      followers: user.followers || 0,
      following: user.following || 0,
      posts: 0,
    });

    if (user.name) {
      fetchPosts();
    }
  }, [user]);

  // ✅ Handle post selection to open modal
  const handlePostClick = (post) => {
    setSelectedPost(post);
    setModalOpen(true);
  };

  // ✅ Remove post from state after deleting
  const handleDeletePost = (postId) => {
    setPosts((prevPosts) => prevPosts.filter((post) => post.id !== postId));
  };

  // ✅ Mock stories data
  const stories = [
    { id: 1, image: "/placeholder.svg?height=80&width=80", title: "Travel" },
    { id: 2, image: "/placeholder.svg?height=80&width=80", title: "Food" },
    { id: 3, image: "/placeholder.svg?height=80&width=80", title: "Pets" },
    { id: 4, image: "/placeholder.svg?height=80&width=80", title: "Nature" },
    { id: 5, image: "/placeholder.svg?height=80&width=80", title: "Music" },
  ];

  return (
    <main className="container max-w-4xl mx-auto px-4 py-8">
      <UserHeader user={userData} />
      <StoryCircles stories={stories} />

      {/* ✅ Post Modal */}
      {selectedPost && (
        <PostModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          post={selectedPost}
          onDelete={handleDeletePost}
        />
      )}

      <Tabs defaultValue="posts" className="mt-8" onValueChange={setActiveTab}>
        <TabsList className="w-full grid grid-cols-2">
          <TabsTrigger value="posts">Posts</TabsTrigger>
          <TabsTrigger value="reels">Reels</TabsTrigger>
        </TabsList>
        <TabsContent value="posts" className="mt-6">
          {/* ✅ Pass handlePostClick to PostGrid */}
          <PostGrid active={activeTab === "posts"} posts={posts} onPostClick={handlePostClick} />
        </TabsContent>
        <TabsContent value="reels" className="mt-6">
          <ReelGrid active={activeTab === "reels"} />
        </TabsContent>
      </Tabs>
    </main>
  );
}
