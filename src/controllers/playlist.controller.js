
import mongoose, { isValidObjectId } from "mongoose"
import { Playlist } from "../models/playlist.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/apiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body

  //TODO: create playlist
  // add video to the database
  // return the new playlist

  if (!name.trim() || !description.trim()) {
    throw new ApiError(400, "Playlist name and description is required")
  }

  const playlist = await Playlist.create({
    name,
    description,
    user: req.user._id
  });

  if (!playlist) {
    throw new ApiError(400, "Failed to create playlist")
  }

  res.status(201).json(new ApiResponse(201, { playlist }, "Playlist created successfully"))

})

















const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params
  //TODO: get user playlists
})

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params
  //TODO: get playlist by id
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params
  // TODO: remove video from playlist

})

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params
  // TODO: delete playlist
})

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params
  const { name, description } = req.body
  //TODO: update playlist
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
