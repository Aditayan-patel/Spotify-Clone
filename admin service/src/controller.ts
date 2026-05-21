import type { Request } from "express";
import TryCatch from "./TryCatch.js";
import cloudinary from "cloudinary";
import { sql } from "./config/db.js";
import { redisClient } from "./index.js";
import streamifier from "streamifier";
import getBuffer from "./config/dataUri.js";

interface AuthenticatedRequest extends Request {
  user?: {
    _id: string;
    role: string;
  };
}

export const addAlbum = TryCatch(async (req: AuthenticatedRequest, res) => {
  if (req.user?.role !== "admin") {
    res.status(403).json({
      message: "You are not Admin",
    });
    return;
  }

  const { title, description } = req.body;

  const file = req.file;

  if (!file) {
    res.status(400).json({
      message: "No file to Upload",
    });
    return;
  }

  const fileBuffer = getBuffer(file);

  if (!fileBuffer || !fileBuffer.content) {
    res.status(500).json({
      message: "Failed to generate file Buffer",
    });
    return;
  }

  const cloud = await cloudinary.v2.uploader.upload(fileBuffer.content, {
    folder: "albums",
  });

  const result = await sql`
    INSERT INTO albums (title, description, thumbnail) VALUES (${title}, ${description}, ${cloud.secure_url}) RETURNING *
    `;

  if (redisClient.isReady) {
    await redisClient.del("albums");
    console.log("Cache Invalidatd for albums");
  }

  res.json({
    message: "Album Created",
    album: result[0],
  });
});

export const addSong = TryCatch(async (req: AuthenticatedRequest, res) => {
  if (req.user?.role !== "admin") {
    res.status(403).json({ message: "You are not Admin" });
    return;
  }

  const { title, description, album } = req.body;

  const isAlbum = await sql`SELECT * FROM albums WHERE id = ${album}`;
  if (isAlbum.length === 0) {
    res.status(404).json({ message: "No album with this id" });
    return;
  }

  const file = req.file;
  if (!file) {
    res.status(400).json({ message: "No file to Upload" });
    return;
  }

  // File size check — 50MB limit
  const MAX_SIZE = 50 * 1024 * 1024;
  if (file.size > MAX_SIZE) {
    res.status(400).json({ message: "File too large. Max 50MB allowed." });
    return;
  }

  let cloudUrl: string;

  try {
    const uploadResult: any = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.v2.uploader.upload_stream(
        {
          folder: "songs",
          resource_type: "video",
          chunk_size: 20 * 1024 * 1024, // 20MB chunks
          timeout: 600000,
          eager_async: true,
        },
        (error, result) => {
          if (error) {
            console.error("Cloudinary upload error:", error);
            return reject(error);
          }
          if (!result) return reject(new Error("No result from Cloudinary"));
          resolve(result);
        },
      );

      // Pipe buffer as stream
      const bufferStream = streamifier.createReadStream(file.buffer);

      bufferStream.on("error", (err) => {
        console.error("Buffer stream error:", err);
        reject(err);
      });

      uploadStream.on("error", (err) => {
        console.error("Upload stream error:", err);
        reject(err);
      });

      bufferStream.pipe(uploadStream);
    });

    cloudUrl = uploadResult.secure_url;
  } catch (error: any) {
    console.error("Song upload failed:", error);
    res.status(500).json({
      message: `Upload failed: ${error?.message || "Cloudinary error"}`,
    });
    return;
  }

  const result = await sql`
    INSERT INTO songs (title, description, audio, album_id)
    VALUES (${title}, ${description}, ${cloudUrl}, ${album})
    RETURNING *
  `;

  if (redisClient.isReady) {
    await redisClient.del("songs");
  }

  res.json({ message: "Song Added", song: result[0] });
});

export const addThumbnail = TryCatch(async (req: AuthenticatedRequest, res) => {
  if (req.user?.role !== "admin") {
    res.status(403).json({
      message: "You are not Admin",
    });
    return;
  }

  const song = await sql`
      SELECT * FROM songs
      WHERE id = ${req.params.id}
    `;

  if (song.length === 0) {
    res.status(404).json({
      message: "No song with this id",
    });
    return;
  }

  const file = req.file;

  if (!file) {
    res.status(400).json({
      message: "No file to Upload",
    });
    return;
  }

  const cloud: any = await new Promise((resolve, reject) => {
    const uploadStream = cloudinary.v2.uploader.upload_stream(
      {
        folder: "thumbnails",
        resource_type: "image",
      },
      (error, result) => {
        if (error || !result) {
          return reject(error || new Error("Thumbnail upload failed"));
        }

        resolve(result);
      },
    );

    streamifier.createReadStream(file.buffer).pipe(uploadStream);
  });

  const result = await sql`
      UPDATE songs
      SET thumbnail = ${cloud.secure_url}
      WHERE id = ${req.params.id}
      RETURNING *
    `;

  if (redisClient.isReady) {
    await redisClient.del("songs");
  }

  res.json({
    message: "Thumbnail Added",
    song: result[0],
  });
});

export const deleteAlbum = TryCatch(async (req: AuthenticatedRequest, res) => {
  if (req.user?.role !== "admin") {
    res.status(403).json({
      message: "You are not Admin",
    });
    return;
  }

  const { id } = req.params;

  const isAlbum = await sql`SELECT * FROM albums WHERE id = ${id}`;

  if (isAlbum.length === 0) {
    res.status(404).json({
      message: "No album with this id ",
    });
    return;
  }

  await sql`DELETE FROM songs WHERE album_id = ${id}`;

  await sql`DELETE FROM  albums WHERE id = ${id}`;

  if (redisClient.isReady) {
    await redisClient.del("albums");
    await redisClient.del("songs");
    console.log("Cache Invalidated for albums and songs");
  }

  res.json({
    message: "Album deleted Successfully",
  });
});

export const deleteSong = TryCatch(async (req: AuthenticatedRequest, res) => {
  if (req.user?.role !== "admin") {
    res.status(403).json({
      message: "You are not Admin",
    });
    return;
  }

  const { id } = req.params;

  const song = await sql`SELECT * FROM songs WHERE id = ${id}`;
  if (song.length === 0) {
    res.status(404).json({
      message: "No song with this id ",
    });
    return;
  }

  await sql`DELETE FROM songs WHERE id = ${id}`;

  if (redisClient.isReady) {
    await redisClient.del("songs");
    console.log("Cache Invalidated for songs");
  }

  res.json({
    message: "Song delete successfully",
  });
});
