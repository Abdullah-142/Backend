import mongoose, { isValidObjectId } from "mongoose"
import { Tweet } from "../models/tweet.model.js"
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/apiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
  //TODO: create tweet
  const { content } = req.body
  const { _id } = req.user
  if (!content.trim()) {
    throw new ApiError(400, "Tweet content is required")
  }

  if (!isValidObjectId(_id)) {
    throw new ApiError(400, "Invalid user ID")
  }

  const tweet = await Tweet.create({
    owner: req.user._id,
    content
  })

  if (!tweet) {
    throw new ApiError(400, "Failed to create tweet")
  }

  res.status(201).json(new ApiResponse(201, { tweet }, "Tweet created successfully"))
})

const getUserTweets = asyncHandler(async (req, res) => {
  // TODO: get user tweets
  const { userId } = req.user

  const tweets = await Tweet.findById({
    owner: userId
  })

  if (!tweets) {
    throw new ApiError(404, "No tweet found")
  }

  res.status(200).json(new ApiResponse(200, { tweets }, "User tweets retrieved successfully"))
})

const updateTweet = asyncHandler(async (req, res) => {
  //TODO: update tweet
  const { tweetId } = req.params

  if (!tweetId) {
    throw new ApiError(400, "Tweet ID is required")
  }

  const tweet = await Tweet.findByIdAndUpdate(tweetId, {
    $set: {
      content: req.body.content
    }
  }, {
    new: true
  })
  if (!tweet) {
    throw new ApiError(404, "Tweet not found")
  }

  res.status(200).json(new ApiResponse(200, { tweet }, "Tweet updated successfully"))
})

const deleteTweet = asyncHandler(async (req, res) => {
  //TODO: delete tweet

  const { tweetId } = req.params

  if (!tweetId) {
    throw new ApiError(400, "Tweet ID is required")
  }

  const tweet = await Tweet.findByIdAndDelete(tweetId)

  if (!tweet) {
    throw new ApiError(404, "Tweet not found")
  }

  res.status(200).json(new ApiResponse(200, {}, "Tweet deleted successfully"))
})

export {
  createTweet,
  getUserTweets,
  updateTweet,
  deleteTweet
}