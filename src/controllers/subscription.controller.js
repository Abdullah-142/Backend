import mongoose, { isValidObjectId } from "mongoose"
import { User } from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/apiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params
  // TODO: toggle subscription

  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, "Invalid channel ID")
  }

  const channel = await User.findById(channelId)


  const subscriberId = req.user._id

  if (channel._id.toString() === req.user?._id.toString()) {
    throw new ApiError(400, "You cannot subscribe to your own channel.");
  }

  const subscription = await Subscription.findOne({
    channel: channelId,
    subscriber: subscriberId
  })

  if (subscription) {
    await Subscription.findByIdAndDelete(subscription._id)
    return res.status(200).json(new ApiResponse(200, "Subscription removed"))
  }

  const subscribed = await Subscription.create({
    channel: channelId,
    subscriber: subscriberId
  })

  if (!subscribed) {
    throw new ApiError(500, "Unable to subscribe to channel")
  }

  return res.status(200).json(new ApiResponse(200, "Subscription added"))
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params
})

export {
  toggleSubscription,
  getUserChannelSubscribers,
  getSubscribedChannels
}