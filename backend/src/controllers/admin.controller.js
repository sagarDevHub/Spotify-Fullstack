import { Song } from "../models/song.model.js";
import { Album } from "../models/album.model.js";
import cloudinary from "../lib/cloudinary.js";

// Helper function for Cloudinary uploads
const uploadToCloudinary = async (file) => {
  try {
    const result = await cloudinary.uploader.upload(file.tempFilePath, {
      resource_type: "auto",
    });
    return result.secure_url;
  } catch (error) {
    console.error(`Error in uploadToCloudinary: ${error}`);
    throw new Error("File upload failed");
  }
};

// Create a new song
export const createSong = async (req, res, next) => {
  try {
    if (!req.files || !req.files.audioFile || !req.files.imageFile) {
      return res.status(400).json({ message: "Please upload all files" });
    }

    const { title, artist, albumId, duration } = req.body;
    const audioFile = req.files.audioFile;
    const imageFile = req.files.imageFile;

    const audioUrl = await uploadToCloudinary(audioFile);
    const imageUrl = await uploadToCloudinary(imageFile);

    const song = new Song({
      title,
      artist,
      audioUrl,
      imageUrl,
      duration,
      albumId: albumId || null,
    });

    await song.save();

    // If song belongs to an album, update the album's songs array
    if (albumId) {
      await Album.findByIdAndUpdate(albumId, {
        $push: { songs: song._id },
      });
    }

    res.status(201).json(song);
  } catch (error) {
    console.error(`Error in createSong: ${error}`);
    next(error);
  }
};

// Delete a song
export const deleteSong = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Find the song first
    const song = await Song.findById(id);
    if (!song) {
      return res.status(404).json({ message: "Song not found" });
    }

    // If the song belongs to an album, remove it from the album's song list
    if (song.albumId) {
      await Album.findByIdAndUpdate(song.albumId, {
        $pull: { songs: song._id },
      });
    }

    // Delete the song from the database
    await Song.findByIdAndDelete(id);

    res.status(200).json({ message: "Song deleted successfully" });
  } catch (error) {
    console.error(`Error in deleteSong: ${error}`);
    next(error);
  }
};

// Create a new album
export const createAlbum = async (req, res, next) => {
  try {
    if (!req.files || !req.files.imageFile) {
      return res.status(400).json({ message: "Album image is required" });
    }

    const { title, artist, releaseYear } = req.body;
    const imageFile = req.files.imageFile;

    const imageUrl = await uploadToCloudinary(imageFile);

    const album = new Album({
      title,
      artist,
      imageUrl,
      releaseYear,
    });

    await album.save();
    res.status(201).json(album);
  } catch (error) {
    console.error(`Error in createAlbum: ${error}`);
    next(error);
  }
};

// Delete an album
export const deleteAlbum = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Delete all songs in the album
    await Song.deleteMany({ albumId: id });

    // Delete the album itself
    const album = await Album.findByIdAndDelete(id);

    if (!album) {
      return res.status(404).json({ message: "Album not found" });
    }

    res.status(200).json({ message: "Album deleted successfully" });
  } catch (error) {
    console.error(`Error in deleteAlbum: ${error}`);
    next(error);
  }
};

// Check if user is an admin
export const checkAdmin = async (req, res, next) => {
  res.status(200).json({ admin: true });
};
