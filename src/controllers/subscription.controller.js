import mongoose from "mongoose"
import { isValidObjectId } from "mongoose"
import { Subscription } from "../models/subscription.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/apiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {

  // TODO: toggle subscription
  const { channelId } = req.params

  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, "Invalid channel ID")
  }


  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, "Invalid channel ID")
  }

  if (req.user._id.toString() === channelId.toString()) {
    throw new ApiError(400, "You cannot subscribe to your own channel.")
  }


  const subscription = await Subscription.findOne({
    channel: req.user._id,
    subscriber: req.user._id
  })

  if (subscription) {
    await Subscription.findByIdAndDelete({ _id: subscription._id })
    return res.status(200).json(new ApiResponse(200, "Subscription removed"))
  }

  const subscribed = await Subscription.create({
    channel: channelId,
    subscriber: req.user._id
  })

  if (!subscribed) {
    throw new ApiError(500, "Unable to subscribe to channel")
  }

  return res.status(200).json(new ApiResponse(200, "Subscription added"))
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
 const {channelId} = req.params

  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, "Invalid channel ID")
  }
  const subscribers = await Subscription.aggregate([
    {
      $match: {
        channel: new mongoose.Types.ObjectId(channelId)
      }
    },
    {
      $lookup: {
        from: "users",
        localField: "subscriber",
        foreignField: "_id",
        as: "subscriber"
      }
    },
    {
      $addFields: {
        subscriber: { $arrayElemAt: ["$subscriber", 0] }
      }
    },
    {
      $project: {
        subscriber: {
          _id: 1,
          username: 1,
          email: 1,
          avatar: 1
        }
      }
    }
  ])

  if (!subscribers) {
    throw new ApiError(404, "No subscribers found")
  }

  return res.status(200).json(new ApiResponse(200, subscribers, "Subscribers"))
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { _id } = req.user

  if (!isValidObjectId(_id)) {
    throw new ApiError(400, "Invalid user ID")
  }

  const channels = await Subscription.aggregate([
    {
      $match: {
        subscriber: new mongoose.Types.ObjectId(_id)
      }
    },
    {
      $lookup: {
        from: "users",
        localField: "channel",
        foreignField: "_id",
        as: "channel"
      }
    },
    {
      $addFields: {
        channel: { $arrayElemAt: ["$channel", 0] }
      }
    },
    {
      $project: {
        channel: {
          _id: 1,
          username: 1,
          email: 1,
          avatar: 1
        }
      }
    }
  ])

  if (!channels) {
    throw new ApiError(404, "No channels found")
  }

  return res.status(200).json(new ApiResponse(200, channels, "Subscribed channels"))


})

export {
  getSubscribedChannels, getUserChannelSubscribers, toggleSubscription
}
