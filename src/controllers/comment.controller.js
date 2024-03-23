import mongoose from "mongoose"
import { Comment } from "../models/comment.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/apiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
  //TODO: get all comments for a video
  const { videoId } = req.params
  const { page = 1, limit = 10 } = req.query

})

const addComment = asyncHandler(async (req, res) => {
  // TODO: add a comment to a video
  const { videoId } = req.params
  const { content } = req.body

  const comment = await Comment.create({
    content,
    video: videoId,
    owner: req.user._id
  })

  if (!comment) {
    throw new ApiError(400, "Failed to add comment")
  }

  res.status(201).json(new ApiResponse(201, { comment }, "Comment added successfully"))
})

const updateComment = asyncHandler(async (req, res) => {
  // TODO: update a comment
})

const deleteComment = asyncHandler(async (req, res) => {
  // TODO: delete a comment
})

export {
  getVideoComments,
  addComment,
  updateComment,
  deleteComment
}