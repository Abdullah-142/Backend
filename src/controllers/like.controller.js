import { isValidObjectId } from "mongoose"
import { Like } from "../models/like.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/apiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video id")
  }

  const like = await Like.findOne({ video: videoId, likedby: req.user._id })

  if (like) {
    await Like.findByIdAndDelete(like._id)
    return res.status(200).json(new ApiResponse(200, "Like removed"))
  }

  const liked = await Like.create({ video: videoId, likedby: req.user._id })

  if (!liked) {
    throw new ApiError(500, "Unable to like video")
  }

  return res.status(200).json(new ApiResponse(200, "Like added"))
})


const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params

  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, "Invalid comment id")
  }

  const like = await Like.findOne({ comment: commentId, likedby: req.user._id })

  if (like) {
    await Like.findByIdAndDelete(like._id)
    return res.status(200).json(new ApiResponse(200, "Like removed"))
  }

  const liked = await Like.create({ comment: commentId, likedby: req.user._id })

  if (!liked) {
    throw new ApiError(500, "Unable to like comment")
  }

  return res.status(200).json(new ApiResponse(200, "Like added"))

})


const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params
  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, "Invalid tweet id")
  }

  const like = await Like.findOne({ tweet: tweetId, likedby: req.user._id })

  if (like) {
    await Like.findByIdAndDelete(like._id)
    return res.status(200).json(new ApiResponse(200, "Like removed"))
  }

  const liked = await Like.create({ tweet: tweetId, likedby: req.user._id })

  if (!liked) {
    throw new ApiError(500, "Unable to like tweet")
  }

  return res.status(200).json(new ApiResponse(200, "Like added"))
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
  //TODO: get all liked videos

  const likedVideos = await Like.aggregate([
    {
      $match: {
        likedby: req.user._id,
      }
    },
    {
      $lookup: {
        from: "videos",
        localField: "video",
        foreignField: "_id",
        as: "likedVideos"
      }
    },
    {
      $addFields: {
        likedVideos: {
          $first: "$likedVideos"
        }
      }
    },
    {
      $project: {
        likedVideos: {
          _id: 1,
          title: 1,
        }
      },
    }
  ])

  if (!likedVideos) {
    throw new ApiError(404, "No liked videos found")
  }

  res.status(200).json(new ApiResponse(200, likedVideos, "Liked videos retrieved successfully"))
})

export {
  getLikedVideos, toggleCommentLike,
  toggleTweetLike,
  toggleVideoLike
}
