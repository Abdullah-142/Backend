
import mongoose from "mongoose"
import { Video } from "../models/video.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/apiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
  // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.

  const channel = req.user._id


  if (!mongoose.isValidObjectId(channel)) {
    throw new ApiError(400, "Invalid channel ID")

  }

  const channelStatus = await Video.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(channel)
      }
    },
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "video",
        as: "totalLikes"
      }
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "owner",
        foreignField: "channel",
        as: "totalSubscribers"
      }
    },
    {
      $group: {
        _id: null,
        TotalVideos: { $sum: 1 },
        TotalViews: { $sum: "$views" },
        TotalSubscribers: {
          $first: {
            $size: "$totalSubscribers"
          }
        },
        TotalLikes: {
          $first: {
            $size: "$totalLikes"
          }
        },

      }
    },
    {
      $project: {
        TotalVideos: 1,
        TotalSubscribers: 1,
        TotalViews: 1,
        TotalLikes: 1,

      }
    }
  ])

  if (!channelStatus) {
    throw new ApiError(404, "Channel not found")
  }


  res.status(200).json(new ApiResponse(200, channelStatus, "Channel stats retrieved successfully"))


})

const getChannelVideos = asyncHandler(async (req, res) => {
  // TODO: Get all the videos uploaded by the channel

  const channel = req.user._id
  console.log(channel);
  if (!mongoose.isValidObjectId(channel)) {
    throw new ApiError(400, "Invalid channel ID")

  }

  const videos = await Video.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(channel)
      }
    },
    {
      $project: {
        title: 1,
        thumbnail: 1,
        views: 1,
        duration: 1,
        createdAt: 1,
        updatedAt: 1,
        videofile: 1
      }
    }
  ])

  if (!videos) {
    throw new ApiError(404, "No videos found")
  }

  res.status(200).json(new ApiResponse(200, videos, "Videos retrieved successfully"))
})

export {
  getChannelStats,
  getChannelVideos
}

