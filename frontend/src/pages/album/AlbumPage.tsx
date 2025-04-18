import { Button } from "@/components/ui/button";
import { useMusicStore } from "@/stores/useMusicStore";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Clock, Music, Pause, Play } from "lucide-react";
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { usePlayerStore } from "@/stores/usePlayerStore";

export const formatDuration = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

const AlbumPage = () => {
  const { albumId } = useParams();
  const { fetchAlbumById, currentAlbum, isLoading } = useMusicStore();
  const { currentSong, isPlaying, playAlbum, togglePlay } = usePlayerStore();
  useEffect(() => {
    if (albumId) {
      fetchAlbumById(albumId);
    }
  }, [albumId]);

  if (isLoading) return null;

  const handlePlayAlbum = () => {
    if (!currentAlbum) return;
    const isCurrentAlbumPlaying = currentAlbum?.songs.some(
      (song) => song._id === currentSong?._id
    );
    if (isCurrentAlbumPlaying) togglePlay();
    else {
      playAlbum(currentAlbum?.songs, 0);
    }
  };

  const handlePlaySong = (index: number) => {
    if (!currentAlbum) return;
    const selectedSong = currentAlbum.songs[index];
    const isCurrentSongPlaying =
      currentSong?._id === selectedSong._id && isPlaying;
    if (isCurrentSongPlaying) {
      togglePlay();
    } else {
      playAlbum(currentAlbum?.songs, index);
    }
  };

  return (
    <div className="h-full">
      <ScrollArea className="h-full rounded-md">
        <div className="relative min-h-full">
          <div
            className="absolute inset-0 bg-gradient-to-b from-[#5038a0]/80 via-zinc-900/80 to-zinc-900 pointer-events-none"
            aria-hidden="true"
          />
          <div className="relative z-10">
            <div className="flex flex-col sm:flex-row p-4 sm:p-6 gap-4 sm:gap-6 pb-6 sm:pb-8">
              <img
                src={currentAlbum?.imageUrl}
                alt={currentAlbum?.title}
                className="w-full sm:w-[240px] h-auto sm:h-[240px] max-w-xs sm:max-w-none shadow-xl rounded"
              />
              <div className="flex flex-col justify-end text-center sm:text-left">
                <p className="text-xs sm:text-sm font-medium">Album</p>
                <h1 className="text-4xl sm:text-7xl font-bold my-2 sm:my-4">
                  {currentAlbum?.title}
                </h1>
                <div className="flex flex-wrap justify-center sm:justify-start items-center gap-2 text-xs sm:text-sm text-zinc-100">
                  <span className="font-medium text-white">
                    {currentAlbum?.artist}
                  </span>
                  <span>• {currentAlbum?.songs.length} Songs</span>
                  <span>• {currentAlbum?.releaseYear}</span>
                </div>
              </div>
            </div>

            {/* Play Button */}
            <div className="px-4 sm:px-6 pb-4 flex items-center gap-4 sm:gap-6">
              <Button
                onClick={handlePlayAlbum}
                size="icon"
                className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-green-500 hover:bg-green-400 hover:scale-105 transition-all"
              >
                {isPlaying &&
                currentAlbum?.songs.some(
                  (song) => song._id == currentSong?._id
                ) ? (
                  <Pause className="h-6 w-6 sm:h-7 sm:w-7 text-black" />
                ) : (
                  <Play className="h-6 w-6 sm:h-7 sm:w-7 text-black" />
                )}
              </Button>
            </div>

            {/* Table Section */}
            <div className="bg-black/20 backdrop:blur-sm">
              <div className="hidden sm:grid grid-cols-[16px_4fr_2fr_1fr] gap-4 px-10 py-2 text-sm text-zinc-400 border-white/5">
                <div>#</div>
                <div>Title</div>
                <div>Released Date</div>
                <div>
                  <Clock className="h-4 w-4" />
                </div>
              </div>

              <div className="px-4 sm:px-6">
                <div className="space-y-2 py-4">
                  {currentAlbum?.songs.map((song, index) => {
                    const isCurrentSong = currentSong?._id === song._id;
                    return (
                      <div
                        onClick={() => handlePlaySong(index)}
                        className="group grid grid-cols-[1fr_3fr] sm:grid-cols-[16px_4fr_2fr_1fr] gap-2 sm:gap-4 px-3 py-2 text-sm text-zinc-400 hover:bg-white/5 rounded-md cursor-pointer"
                        key={song._id}
                      >
                        <div className="flex items-center justify-center">
                          {isCurrentSong ? (
                            isPlaying ? (
                              <Music className="h-4 w-4 text-green-500" />
                            ) : (
                              <Play className="h-4 w-4 text-white" />
                            )
                          ) : (
                            <span className="group-hover:hidden">
                              {index + 1}
                            </span>
                          )}
                          {!isCurrentSong && (
                            <Play className="h-4 w-4 hidden group-hover:block text-white" />
                          )}
                        </div>

                        <div className="flex items-center gap-3">
                          <img
                            src={song.imageUrl}
                            alt={song.title}
                            className="size-10"
                          />
                          <div>
                            <div className="font-medium text-white">
                              {song.title}
                            </div>
                            <div className="text-xs">{song.artist}</div>
                            <div className="text-xs sm:hidden">
                              {song.createdAt.split("T")[0]} • {formatDuration(song.duration)}
                            </div>
                          </div>
                        </div>

                        {/* Released Date */}
                        <div className="hidden sm:flex items-center">
                          {song.createdAt.split("T")[0]}
                        </div>

                        {/* Duration */}
                        <div className="hidden sm:flex items-center">
                          {formatDuration(song.duration)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};

export default AlbumPage;