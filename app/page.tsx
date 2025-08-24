"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { MusicPlayer } from "@/components/music-player"
import { MusicLibrary } from "@/components/music-library"
import { MusicUpload } from "@/components/music-upload"
import { Music, LogOut } from "lucide-react"

interface Song {
  id: string
  title: string
  artist: string
  file: string
  duration: number
  uploadedAt: string
}

export default function MusicApp() {
  const [user, setUser] = useState<any | null>(null)
  const [songs, setSongs] = useState<Song[]>([])
  const [currentSong, setCurrentSong] = useState<Song | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  // Load user and songs from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem("musicapp_user")
    const savedSongs = localStorage.getItem("musicapp_songs")

    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
    if (savedSongs) {
      setSongs(JSON.parse(savedSongs))
    }
    setIsLoading(false)
  }, [])

  // Save songs to localStorage whenever songs change
  useEffect(() => {
    if (songs.length > 0) {
      localStorage.setItem("musicapp_songs", JSON.stringify(songs))
    }
  }, [songs])

  const handleLogin = (email: string, password: string) => {
    // Simple localStorage-based auth
    const users = JSON.parse(localStorage.getItem("musicapp_users") || "[]")
    const existingUser = users.find((u: any) => u.email === email && u.password === password)

    if (existingUser) {
      const userData = { id: existingUser.id, email: existingUser.email, name: existingUser.name }
      setUser(userData)
      localStorage.setItem("musicapp_user", JSON.stringify(userData))
      toast({ title: "Welcome back!", description: "Successfully logged in." })
    } else {
      toast({ title: "Error", description: "Invalid email or password.", variant: "destructive" })
    }
  }

  const handleRegister = (name: string, email: string, password: string) => {
    const users = JSON.parse(localStorage.getItem("musicapp_users") || "[]")
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
    localStorage.setItem("musicapp_users", JSON.stringify(users))

    const userData = { id: newUser.id, email: newUser.email, name: newUser.name }
    setUser(userData)
    localStorage.setItem("musicapp_user", JSON.stringify(userData))
    toast({ title: "Welcome!", description: "Account created successfully." })
  }

  const handleLogout = () => {
    setUser(null)
    setCurrentSong(null)
    localStorage.removeItem("musicapp_user")
    toast({ title: "Goodbye!", description: "Successfully logged out." })
  }

  const handleSongUpload = (song: Omit<Song, "id" | "uploadedAt">) => {
    const newSong: Song = {
      ...song,
      id: Date.now().toString(),
      uploadedAt: new Date().toISOString(),
    }
    setSongs((prev) => [...prev, newSong])
    toast({ title: "Success!", description: "Song uploaded successfully." })
  }

  const handleSongSelect = (song: Song) => {
    setCurrentSong(song)
  }

  const handleSongDelete = (songId: string) => {
    setSongs((prev) => prev.filter((s) => s.id !== songId))
    if (currentSong?.id === songId) {
      setCurrentSong(null)
    }
    toast({ title: "Deleted", description: "Song removed from library." })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return <AuthScreen onLogin={handleLogin} onRegister={handleRegister} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <Music className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white">SoundWave</h1>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <div className="hidden sm:flex items-center gap-2 text-white/80">
              <div className="w-4 h-4" /> {/* Placeholder for User icon */}
              <span className="text-sm sm:text-base">{user.name}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-white/80 hover:text-white hover:bg-white/10 text-xs sm:text-sm"
            >
              <LogOut className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-4 sm:py-8 pb-32">
        <Tabs defaultValue="library" className="space-y-4 sm:space-y-6">
          <TabsList className="bg-black/20 backdrop-blur-sm border border-white/10 w-full sm:w-auto">
            <TabsTrigger value="library" className="data-[state=active]:bg-white/20 flex-1 sm:flex-none">
              <span className="sm:hidden">Library</span>
              <span className="hidden sm:inline">Music Library</span>
            </TabsTrigger>
            <TabsTrigger value="upload" className="data-[state=active]:bg-white/20 flex-1 sm:flex-none">
              <span className="sm:hidden">Upload</span>
              <span className="hidden sm:inline">Upload Music</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="library">
            <MusicLibrary
              songs={songs}
              currentSong={currentSong}
              onSongSelect={handleSongSelect}
              onSongDelete={handleSongDelete}
            />
          </TabsContent>

          <TabsContent value="upload">
            <MusicUpload onSongUpload={handleSongUpload} />
          </TabsContent>
        </Tabs>
      </main>

      {/* Music Player */}
      {currentSong && <MusicPlayer song={currentSong} songs={songs} onSongChange={handleSongSelect} />}
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
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-black/20 backdrop-blur-sm border-white/10">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Music className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl text-white">SoundWave</CardTitle>
          <CardDescription className="text-white/70">Your personal music streaming platform</CardDescription>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="login" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2 bg-white/10">
              <TabsTrigger value="login" className="data-[state=active]:bg-white/20">
                Login
              </TabsTrigger>
              <TabsTrigger value="register" className="data-[state=active]:bg-white/20">
                Register
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email" className="text-white">
                    Email
                  </Label>
                  <Input
                    id="login-email"
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                    placeholder="Enter your email"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password" className="text-white">
                    Password
                  </Label>
                  <Input
                    id="login-password"
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                    placeholder="Enter your password"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                >
                  Login
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register">
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="register-name" className="text-white">
                    Name
                  </Label>
                  <Input
                    id="register-name"
                    type="text"
                    value={registerName}
                    onChange={(e) => setRegisterName(e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                    placeholder="Enter your name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-email" className="text-white">
                    Email
                  </Label>
                  <Input
                    id="register-email"
                    type="email"
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                    placeholder="Enter your email"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-password" className="text-white">
                    Password
                  </Label>
                  <Input
                    id="register-password"
                    type="password"
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                    placeholder="Create a password"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                >
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
