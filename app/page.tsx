"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { YouTubeSearch } from "@/components/youtube-search"
import { YouTubePlayer } from "@/components/youtube-player"
import { FavoritesList } from "@/components/favorites-list"
import { GhostFooter } from "@/components/ghost-footer"
import { Music, LogOut, Search, Heart } from "lucide-react"

interface YouTubeVideo {
  id: string
  title: string
  channelTitle: string
  thumbnail: string
  duration?: string
}

interface AppUser {
  id: string
  email: string
  name: string
}

export default function YouTubeMusicApp() {
  const [user, setUser] = useState<AppUser | null>(null)
  const [favorites, setFavorites] = useState<YouTubeVideo[]>([])
  const [currentVideo, setCurrentVideo] = useState<YouTubeVideo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  // Load user and favorites from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem("youtube_music_user")
    const savedFavorites = localStorage.getItem("youtube_music_favorites")

    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites))
    }
    setIsLoading(false)
  }, [])

  // Save favorites to localStorage whenever favorites change
  useEffect(() => {
    if (favorites.length >= 0) {
      localStorage.setItem("youtube_music_favorites", JSON.stringify(favorites))
    }
  }, [favorites])

  const handleLogin = (email: string, password: string) => {
    const users = JSON.parse(localStorage.getItem("youtube_music_users") || "[]")
    const existingUser = users.find((u: any) => u.email === email && u.password === password)

    if (existingUser) {
      const userData = { id: existingUser.id, email: existingUser.email, name: existingUser.name }
      setUser(userData)
      localStorage.setItem("youtube_music_user", JSON.stringify(userData))
      toast({ title: "Welcome back!", description: "Successfully logged in." })
    } else {
      toast({ title: "Error", description: "Invalid email or password.", variant: "destructive" })
    }
  }

  const handleRegister = (name: string, email: string, password: string) => {
    const users = JSON.parse(localStorage.getItem("youtube_music_users") || "[]")
    const existingUser = users.find((u: any) => u.email === email)

    if (existingUser) {
      toast({ title: "Error", description: "User already exists.", variant: "destructive" })
      return
    }

    const newUser = {
      id: Date.now().toString(),
      name,
      email,
      password,
    }

    users.push(newUser)
    localStorage.setItem("youtube_music_users", JSON.stringify(users))

    const userData = { id: newUser.id, email: newUser.email, name: newUser.name }
    setUser(userData)
    localStorage.setItem("youtube_music_user", JSON.stringify(userData))
    toast({ title: "Welcome!", description: "Account created successfully." })
  }

  const handleLogout = () => {
    setUser(null)
    setCurrentVideo(null)
    localStorage.removeItem("youtube_music_user")
    toast({ title: "Goodbye!", description: "Successfully logged out." })
  }

  const handleVideoSelect = (video: YouTubeVideo) => {
    setCurrentVideo(video)
  }

  const handleAddToFavorites = (video: YouTubeVideo) => {
    const isAlreadyFavorite = favorites.some((fav) => fav.id === video.id)
    if (!isAlreadyFavorite) {
      setFavorites((prev) => [...prev, video])
      toast({ title: "Added to favorites!", description: `${video.title} saved to your library.` })
    } else {
      toast({ title: "Already in favorites", description: "This video is already in your favorites." })
    }
  }

  const handleRemoveFromFavorites = (videoId: string) => {
    setFavorites((prev) => prev.filter((fav) => fav.id !== videoId))
    if (currentVideo?.id === videoId) {
      setCurrentVideo(null)
    }
    toast({ title: "Removed", description: "Video removed from favorites." })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center animate-pulse">
            <Music className="w-6 h-6 text-primary-foreground" />
          </div>
          <div className="text-foreground text-lg font-medium">Loading YouTube Music...</div>
        </div>
      </div>
    )
  }

  if (!user) {
    return <AuthScreen onLogin={handleLogin} onRegister={handleRegister} />
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-40 backdrop-blur-sm bg-card/95">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary rounded-full flex items-center justify-center">
              <Music className="w-4 h-4 sm:w-6 sm:h-6 text-primary-foreground" />
            </div>
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground">{"Liminis Play"}</h1>
          </div>

          <div className="flex items-center gap-1 sm:gap-2 lg:gap-4">
            <div className="hidden md:flex items-center gap-2 text-muted-foreground">
              <Music className="w-4 h-4" />
              <span className="text-sm lg:text-base truncate max-w-32">{user.name}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-muted-foreground hover:text-foreground text-xs sm:text-sm"
            >
              <LogOut className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 lg:py-8 pb-28 sm:pb-32">
        <Tabs defaultValue="search" className="space-y-4 sm:space-y-6">
          <TabsList className="bg-muted w-full sm:w-auto grid grid-cols-2 sm:flex">
            <TabsTrigger value="search" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <Search className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>Search</span>
            </TabsTrigger>
            <TabsTrigger value="favorites" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <Heart className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>Favorites</span>
              {favorites.length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 bg-primary text-primary-foreground text-xs rounded-full">
                  {favorites.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="search" className="mt-4 sm:mt-6">
            <YouTubeSearch
              onVideoSelect={handleVideoSelect}
              onAddToFavorites={handleAddToFavorites}
              favorites={favorites}
            />
          </TabsContent>

          <TabsContent value="favorites" className="mt-4 sm:mt-6">
            <FavoritesList
              favorites={favorites}
              currentVideo={currentVideo}
              onVideoSelect={handleVideoSelect}
              onRemoveFromFavorites={handleRemoveFromFavorites}
            />
          </TabsContent>
        </Tabs>
      </main>

      {/* YouTube Player */}
      {currentVideo && <YouTubePlayer video={currentVideo} favorites={favorites} onVideoChange={handleVideoSelect} />}

      {/* Ghost Footer */}
      <GhostFooter />
    </div>
  )
}

function AuthScreen({
  onLogin,
  onRegister,
}: {
  onLogin: (email: string, password: string) => void
  onRegister: (name: string, email: string, password: string) => void
}) {
  const [loginEmail, setLoginEmail] = useState("")
  const [loginPassword, setLoginPassword] = useState("")
  const [registerName, setRegisterName] = useState("")
  const [registerEmail, setRegisterEmail] = useState("")
  const [registerPassword, setRegisterPassword] = useState("")

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onLogin(loginEmail, loginPassword)
  }

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onRegister(registerName, registerEmail, registerPassword)
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-3 sm:p-4">
      <Card className="w-full max-w-sm sm:max-w-md">
        <CardHeader className="text-center space-y-3 sm:space-y-4">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary rounded-full flex items-center justify-center mx-auto">
            <Music className="w-6 h-6 sm:w-8 sm:h-8 text-primary-foreground" />
          </div>
          <div className="space-y-1 sm:space-y-2">
            <CardTitle className="text-xl sm:text-2xl">YouTube Music Player</CardTitle>
            <CardDescription className="text-sm sm:text-base">
              Stream and save your favorite music from YouTube
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <Tabs defaultValue="login" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login" className="text-sm">
                Login
              </TabsTrigger>
              <TabsTrigger value="register" className="text-sm">
                Register
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLoginSubmit} className="space-y-3 sm:space-y-4">
                <div className="space-y-1 sm:space-y-2">
                  <Label htmlFor="login-email" className="text-sm">
                    Email
                  </Label>
                  <Input
                    id="login-email"
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="text-sm"
                    required
                  />
                </div>
                <div className="space-y-1 sm:space-y-2">
                  <Label htmlFor="login-password" className="text-sm">
                    Password
                  </Label>
                  <Input
                    id="login-password"
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="text-sm"
                    required
                  />
                </div>
                <Button type="submit" className="w-full text-sm">
                  Login
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register">
              <form onSubmit={handleRegisterSubmit} className="space-y-3 sm:space-y-4">
                <div className="space-y-1 sm:space-y-2">
                  <Label htmlFor="register-name" className="text-sm">
                    Name
                  </Label>
                  <Input
                    id="register-name"
                    type="text"
                    value={registerName}
                    onChange={(e) => setRegisterName(e.target.value)}
                    placeholder="Enter your name"
                    className="text-sm"
                    required
                  />
                </div>
                <div className="space-y-1 sm:space-y-2">
                  <Label htmlFor="register-email" className="text-sm">
                    Email
                  </Label>
                  <Input
                    id="register-email"
                    type="email"
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="text-sm"
                    required
                  />
                </div>
                <div className="space-y-1 sm:space-y-2">
                  <Label htmlFor="register-password" className="text-sm">
                    Password
                  </Label>
                  <Input
                    id="register-password"
                    type="password"
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    placeholder="Create a password"
                    className="text-sm"
                    required
                  />
                </div>
                <Button type="submit" className="w-full text-sm">
                  Register
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
