"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, Music } from "lucide-react"

interface Song {
  title: string
  artist: string
  file: string
  duration: number
}

interface MusicUploadProps {
  onSongUpload: (song: Song) => void
}

export function MusicUpload({ onSongUpload }: MusicUploadProps) {
  const [title, setTitle] = useState("")
  const [artist, setArtist] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile && selectedFile.type.startsWith("audio/")) {
      setFile(selectedFile)

      // Auto-fill title from filename if empty
      if (!title) {
        const filename = selectedFile.name.replace(/\.[^/.]+$/, "")
        setTitle(filename)
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file || !title || !artist) return

    setIsUploading(true)

    try {
      // Convert file to base64 for localStorage storage
      const reader = new FileReader()
      reader.onload = (event) => {
        const fileData = event.target?.result as string

        // Get audio duration
        const audio = new Audio(fileData)
        audio.onloadedmetadata = () => {
          const song: Song = {
            title,
            artist,
            file: fileData,
            duration: audio.duration,
          }

          onSongUpload(song)

          // Reset form
          setTitle("")
          setArtist("")
          setFile(null)
          const fileInput = document.getElementById("music-file") as HTMLInputElement
          if (fileInput) fileInput.value = ""

          setIsUploading(false)
        }
      }
      reader.readAsDataURL(file)
    } catch (error) {
      console.error("Upload error:", error)
      setIsUploading(false)
    }
  }

  return (
    <Card className="bg-black/20 backdrop-blur-sm border-white/10">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Upload className="w-5 h-5" />
          Upload Music
        </CardTitle>
        <CardDescription className="text-white/70">Add new songs to your music library</CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div className="space-y-2">
            <Label htmlFor="music-file" className="text-white">
              Music File
            </Label>
            <div className="relative">
              <Input
                id="music-file"
                type="file"
                accept="audio/*"
                onChange={handleFileChange}
                className="bg-white/10 border-white/20 text-white file:bg-white/20 file:text-white file:border-0 file:rounded-md file:px-3 file:py-1 text-sm"
                required
              />
            </div>
            {file && (
              <div className="flex items-center gap-2 text-xs sm:text-sm text-white/70 flex-wrap">
                <Music className="w-4 h-4 flex-shrink-0" />
                <span className="truncate flex-1 min-w-0">{file.name}</span>
                <span className="flex-shrink-0">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-white">
                Song Title
              </Label>
              <Input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                placeholder="Enter song title"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="artist" className="text-white">
                Artist
              </Label>
              <Input
                id="artist"
                type="text"
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                placeholder="Enter artist name"
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={!file || !title || !artist || isUploading}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 transition-all duration-200"
          >
            {isUploading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Uploading...</span>
              </div>
            ) : (
              "Upload Song"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
