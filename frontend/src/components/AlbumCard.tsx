import React from 'react';
import { useNavigate } from 'react-router-dom';


interface AlbumCardProps{
    image: string,
    name: string,
    desc: string,
    id: string,
}

const AlbumCard : React.FC<AlbumCardProps> = ({image,name,desc,id}) => {
    const navigate = useNavigate();
  return (
    <div onClick={()=>navigate("/album/" + id)} className='min-w-45 p-2 px-3 m-1 rounded-2xl cursor-pointer hover:bg-[#333131] transition-shadow duration-300 hover:shadow-[0_0_10px_rgba(255,255,255,0.25)]'>
      <img src={image} alt="" className='rounded-md w-40'/>
      <p className='font-bold mt-2 mb-1'>{name.slice(0,12)}...</p>
      <p className='text-slate-200 text-sm'>{desc.slice(0,18)}...</p>
    </div>
  )
}

export default AlbumCard
