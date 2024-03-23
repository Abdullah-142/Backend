import { Comment } from "../models/comment.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/apiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import mongoose from "mongoose"

const getVideoComments = asyncHandler(async (req, res) => {
  //TODO: get all comments for a video
  const { videoId } = req.params
  const { page = 1, limit = 10 } = req.query

  if (!videoId) {
    throw new ApiError(400, "Invalid video ID")
  }

  const video = await Comment.find({
    video: videoId
  })

  if (!video) {
    throw new ApiError(404, "Video not found")
  }

  const pageNumber = parseInt(page)
  const limitOfComments = parseInt(limit)

  const skip = (pageNumber - 1) * limitOfComments
  const pageSize = limitOfComments;

  const comment = await Comment.aggregate([
    {
      $match: {
        video: new mongoose.Types.ObjectId(videoId)
      }
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "commentOwner"
      }
    },
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "comment",
        as: "commentLikes"
      }
    },
    {
      $addFields: {
        commentLikesCount: {
          $size: "$commentLikes"
        },
        commentOwner: {
          $first: "$commentOwner"
        },
        isLiked: {
          $cond: {
            if: { $in: [req.user?._id, "$commentLikes.likedBy"] },
            then: true,
            else: false
          }
        }
      }
    },
    {
      $project: {
        "content": 1,
        "createdAt": 1,
        "commentOwner": {
          _id: 1,
          username: 1,
          profilePicture: 1
        },
        "commentLikesCount": 1,
        "isLiked": 1,
        // "_id": 1 // Include the _id field directly in the projection
      }
    },
    {
      $sort: {
        "createdAt": -1
      }
    },
    {
      $skip: skip
    },
    {
      $limit: pageSize
    }
  ]);


  if (!comment) {
    throw new ApiError(404, "No comment found")
  }

  res.status(200).json(new ApiResponse(200, comment[0], "Comments retrieved successfully"))


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

  res.status(201).json(new ApiResponse(201, {}, "Comment added successfully"))
})

const updateComment = asyncHandler(async (req, res) => {
  // TODO: update a comment
  const { commentId } = req.params
  const { content } = req.body
  const { _id } = req.user

  if (!content.trim()) {
    throw new ApiError(400, "Comment content is required")
  }

  const comment = await Comment.findById(commentId);

  if (!comment) {
    throw new ApiError(404, "Comment not found")
  }

  if (comment.owner.toString() !== _id.toString()) {
    throw new ApiError(401, "You are not authorized to update this comment")
  }

  const updatedComment = await Comment.findByIdAndUpdate(commentId, {
    $set: {
      content
    }
  }, {
    new: true
  })

  if (!updatedComment) {
    throw new ApiError(500, "Failed to update comment")
  }

  res.status(200).json(new ApiResponse(200, { updatedComment }, "Comment updated successfully"))
})

const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params
  const { _id } = req.user

  const comment = await Comment.findById(commentId);

  if (!comment) {
    throw new ApiError(404, "Comment not found")
  }

  if (comment.owner.toString() !== _id.toString()) {
    throw new ApiError(401, "You are not authorized to update this comment")
  }

  const deleteComment = await Comment.findByIdAndDelete(commentId);

  if (!deleteComment) {
    throw new ApiError(404, "Comment not found")
  }

  res.status(200).json(new ApiResponse(200, {}, "Comment deleted successfully"))
})

export {
  addComment, deleteComment, getVideoComments, updateComment
}
