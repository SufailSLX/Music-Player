"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Play, Pause, Trash2, Music, Clock } from "lucide-react"

interface Song {
  id: string
  title: string
  artist: string
  file: string
  duration: number
  uploadedAt: string
}

interface MusicLibraryProps {
  songs: Song[]
  currentSong: Song | null
  onSongSelect: (song: Song) => void
  onSongDelete: (songId: string) => void
}

export function MusicLibrary({ songs, currentSong, onSongSelect, onSongDelete }: MusicLibraryProps) {
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  if (songs.length === 0) {
    return (
      <Card className="bg-black/20 backdrop-blur-sm border-white/10">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Music className="w-16 h-16 text-white/50 mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No music yet</h3>
          <p className="text-white/70 text-center">Upload your first song to get started with your music library</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-black/20 backdrop-blur-sm border-white/10">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Music className="w-5 h-5" />
          Music Library
        </CardTitle>
        <CardDescription className="text-white/70">
          {songs.length} song{songs.length !== 1 ? "s" : ""} in your library
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="space-y-2">
          {songs.map((song) => (
            <div
              key={song.id}
              className={`flex items-center gap-2 sm:gap-4 p-3 sm:p-4 rounded-lg transition-colors ${
                currentSong?.id === song.id ? "bg-white/20 border border-white/30" : "bg-white/5 hover:bg-white/10"
              }`}
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onSongSelect(song)}
                className="text-white hover:bg-white/20 p-2 flex-shrink-0"
              >
                {currentSong?.id === song.id ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </Button>

              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-white truncate text-sm sm:text-base">{song.title}</h4>
                <p className="text-xs sm:text-sm text-white/70 truncate">{song.artist}</p>
              </div>

              <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm text-white/70 flex-shrink-0">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{formatDuration(song.duration)}</span>
                </div>
                <span className="hidden md:block">{formatDate(song.uploadedAt)}</span>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => onSongDelete(song.id)}
                className="text-red-400 hover:text-red-300 hover:bg-red-500/20 p-2 flex-shrink-0"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
