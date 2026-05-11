import React, { useEffect, useRef, useState } from "react";
import { useSongData } from "../context/SongContext";

const Player = () => {
  const {
    song,
    fetchSingleSong,
    selectedSong,
    isPlaying,
    setIsPlaying,
    prevSong,
    nextSong,
  } = useSongData();

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [volume, setVolume] = useState<number>(1);
  const [progress, setProgress] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);

  useEffect(()=>{
    const audio = audioRef.current;

    if(!audio) return ;

    const handelLoadedMetaData = ()=>{
      setDuration(audio.duration || 0);
    };

    const handelTimeUpdate = ()=>{
      setProgress(audio.currentTime|| 0);
    };

    audio.addEventListener("loadedmetadata", handelLoadedMetaData);
    audio.addEventListener("timeupdate", handelTimeUpdate);

    return ()=>{
      audio.removeEventListener("loadedmetadata", handelLoadedMetaData);
      audio.removeEventListener("timeupdate", handelTimeUpdate);
    }
  },[song]);

  const handelPlayPause = ()=>{
    if(audioRef.current){
      if(isPlaying){
        audioRef.current.pause();
      }else{
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const volumeChange = (e: React.ChangeEvent<HTMLInputElement>) =>{
     const newVolume = parseFloat(e.target.value);
     setVolume(newVolume)
     if(audioRef.current){
      audioRef.current.volume = newVolume;
     }
  }

  const durationChange = (e: React.ChangeEvent<HTMLInputElement>) =>{
    const newTime = (parseFloat(e.target.value)/100)* duration;
    if(audioRef.current){
      audioRef.current.currentTime = newTime;
     }
     setProgress(newTime);
  }

  useEffect(() => {
    fetchSingleSong();
  }, [selectedSong]);
  return (
    <div>
      {song && (
        <div className="h-[10%] bg-black flex justify-between items-center text-white px-4">
          <div className="lg:flex items-center gap-4 ">
            <img
              src={song.thumbnail ? song.thumbnail : "/custum thumbnail.webp"}
              alt=""
              className="w-12"
            />
            <div className="hidden md:block ">
              <p className="text-md font-bold ">{song.title}</p>
              <p className="text-sm font-medium">{song.description?.slice(0, 30)}...</p>
            </div>
          </div>
          <div className="flex flex-col items-center gap-1 m-auto">
            {song.audio && (
              <audio ref={audioRef} src={song.audi} autoPlay={isPlaying} />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Player;
