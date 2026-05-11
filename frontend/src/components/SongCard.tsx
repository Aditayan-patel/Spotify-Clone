import React from "react";
import { FaPlay } from "react-icons/fa";
import { FaBookmark } from "react-icons/fa6";

interface SongCardProps {
  image: string;
  name: string;
  desc: string;
  id: string;
}

const SongCard: React.FC<SongCardProps> = ({ image, name, desc, id }) => {

  return (
    <div className="min-w-45 p-2 px-3 m-1 rounded-2xl cursor-pointer hover:bg-[#333131] transition-shadow duration-300 hover:shadow-[0_0_10px_rgba(255,255,255,0.25)]">
      <div className="relative group ">
        <img src={image} alt={name} className="mr-1 w-40 rounded-md" />
        <div className="flex gap-2">
          <button className="absolute bottom-1 left-2 bg-green-600 text-black p-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:shadow-[0_0_10px_rgba(34,197,94,0.6)]">
            <FaPlay className="origin-center transition-transform duration-300 ease-in-out hover:scale-110"/>
          </button>
          <button className="absolute bottom-1 right-2 bg-green-600 text-black p-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:shadow-[0_0_10px_rgba(34,197,94,0.6)]">
            <FaBookmark className="origin-center transition-transform duration-300 ease-in-out hover:scale-110"/>
          </button>
        </div>
      </div>
      <p className="font-bold mt-2 mb-1">{name}</p>
      <p className="text-slate-200 text-sm ">{desc.slice(0, 20)}...</p>
    </div>
  );
};

export default SongCard;
