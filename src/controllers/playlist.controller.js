
import mongoose, { isValidObjectId } from "mongoose"
import { Video } from "../models/video.model.js"
import { Playlist } from "../models/playlist.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/apiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"


//create playlist

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body

  //TODO: create playlist
  // create  playlist to the database
  // return the new playlist

  if (!name.trim() || !description.trim()) {
    throw new ApiError(400, "Playlist name and description is required")
  }

  const playlist = await Playlist.create({
    name,
    description,
    owner: req.user._id
  });

  if (!playlist) {
    throw new ApiError(400, "Failed to create playlist")
  }

  res.status(201).json(new ApiResponse(201, { playlist }, "Playlist created successfully"))

})

// get User  Playlists

const getUserPlaylists = asyncHandler(async (req, res) => {
  1
  const { userId } = req.params
  //TODO: get user playlists

  const getPlaylists = await Playlist.find({
    owner: userId
  })

  if (!getPlaylists) {
    throw new ApiError(404, "No playlist found")
  }

  res.status(200).json(new ApiResponse(200, { playlists: getPlaylists }, "User playlists retrieved successfully"))
})

//get playlist by id

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params
  //TODO: get playlist by id

  const playlist = await Playlist.findById(playlistId)

  if (!playlist) {
    throw new ApiError(404, "Playlist not found")
  }

  res.status(200).json(new ApiResponse(200, { playlist }, "Playlist retrieved successfully"))
})

//add video to playlist

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params

  const video = await Video.findById(videoId);


  if (!video) {
    throw new ApiError(404, "video not found")
  }

  const addVideo = await Playlist.findByIdAndUpdate(playlistId, {
    $push: { videos: videoId }
  }, {
    new: true
  })

  if (!addVideo) {
    throw new ApiError(400, "Failed to add video to playlist")
  }

  res.status(200).json(new ApiResponse(200, { playlist: addVideo }, "Video added to playlist successfully"))



})

//remove video from playlist

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "video not found")
  }

  const removeVideo = await Playlist.findByIdAndUpdate(playlistId, {
    $pull: { videos: videoId }
  }, {
    new: true
  })

  if (!removeVideo) {
    throw new ApiError(400, "Failed to remove video to playlist")
  }

  res.status(200).json(new ApiResponse(200, {}, "Video removed to playlist successfully"))

})


//delete playlist


const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params
  // TODO: delete playlist

  const playlist = await Playlist.findByIdAndDelete(playlistId)

  if (!playlist) {
    throw new ApiError(400, "Failed to delete playlist")
  }

  res.status(200).json(new ApiResponse(200, {}, "Playlist deleted successfully"))
})


//update playlist

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params
  const { name, description } = req.body

  if (!name.trim() && !description.trim()) {
    throw new ApiError(400, "Playlist name and description is required")
  }


  const playlist = await Playlist.findByIdAndUpdate(playlistId, {
    name,
    description
  }, {
    new: true

  })

  if (!playlist) {
    throw new ApiError(400, "Failed to update playlist")
  }

  res.status(200).json(new ApiResponse(200, { playlist }, "Playlist updated successfully"))
})

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist
}
