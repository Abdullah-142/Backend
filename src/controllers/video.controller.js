
import { User } from "../models/user.model.js"
import { Video } from "../models/video.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/apiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import uploadOnCloudinary from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query

})

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body

  if (!title.trim() || !description.trim()) {
    throw new ApiError(400, "Title and description is required")
  }

  const videoFilPath = req.files.videoFile[0].path


  if (!videoFilPath) {
    throw new ApiError(400, "Video file is required")
  }

  const thumbnailPath = req.files.thumbnail[0].path

  if (!thumbnailPath) {
    throw new ApiError(400, "Thumbnail is required")
  }

  const videoUrl = await uploadOnCloudinary(videoFilPath)
  const thumbnailUrl = await uploadOnCloudinary(thumbnailPath)

  if (!videoUrl || !thumbnailUrl) {
    throw new ApiError(500, "Failed to upload video or thumbnail")
  }

  const video = await Video.create({
    title,
    description,
    videoFile: videoUrl?.url,
    thumbnail: thumbnailUrl?.url,
    duration: videoUrl?.duration,
    owner: req.user._id
  });


  if (!video) {
    throw new ApiError(500, "Failed to publish video")
  }

  res.status(201).json(
    new ApiResponse(201, video, "Video published successfully")
  )

})

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params

  if (!videoId) {
    throw new ApiError(400, "Video ID is required")
  }

  const video = await Video.findById(videoId)

  if (!video) {
    throw new ApiError(404, "Video not found")
  }

  res.status(200).json(
    new ApiResponse(200, video, "Video retrieved successfully")
  )

})

const updateVideoDes = asyncHandler(async (req, res) => {
  const { title, description } = req.body
  const { videoId } = req.params
  const { _id } = req.user

  if (!videoId) {
    throw new ApiError(400, "Video ID is required")
  }


  const video = await Video.findById(videoId)

  if (!video) {
    throw new ApiError(404, "Video not found")
  }

  if (!title?.trim() && !description?.trim()) {
    throw new ApiError(400, "Title and description is required")
  }

  const user = await User.findById(_id)

  if (!user) {
    throw new ApiError(404, "User not found")
  }
  console.log(user._id, video.owner);

  if (!video.owner.equals(user._id)) {
    throw new ApiError(401, "only owner can update the video")
  }

  const updateVideo = await Video.findByIdAndUpdate(videoId, {
    $set: {
      title,
      description
    }
  },
    {
      new: true
    })


  if (!updateVideo) {
    throw new ApiError(500, "Failed to update video descrption or title")
  }

  res.status(200).json(
    new ApiResponse(200, updateVideo, "Video updated successfully")
  )
})


const updatethumbnailPath = asyncHandler(async (req, res) => {

  const { videoId } = req.file

  const { _id } = req.user

  //only owner can update the video 
  const user = await User.findById(_id)

  if (!user) {
    throw new ApiError(404, "User not found")
  }

  if (req.refreshToken !== user.refreshToken) {
    throw new ApiError(401, "only owner can update the video")
  }

  const thumbnailPathFilPath = req.file.thumbnailPath[0].path

  if (!thumbnailPathFilPath) {
    throw new ApiError(400, "Video file is required")
  }

  const thumbnailUrl = await uploadOnCloudinary(thumbnailPath)

  if (!thumbnailUrl) {
    throw new ApiError(500, "Failed to upload video or thumbnail")
  }

  const updateThumbnail = await Video.findByIdAndUpdate(videoId, {
    $set: {
      videoFile: thumbnailUrl.url
    }
  }, {
    new: true
  })

  if (!updateThumbnail) {
    throw new ApiError(500, "Failed to update video")
  }

  res.status(200).json(
    new ApiResponse(200, updateThumbnail, "Video updated successfully")
  )

})


const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params
  if (!videoId) {
    throw new ApiError(400, "Video ID is required")
  }

  const video = await Video.findByIdAndDelete(videoId)

  if (!video) {
    throw new ApiError(404, "Video not found")
  }

  res.status(200).json(
    new ApiResponse(200, null, "Video deleted successfully")
  )
})


const toggleVideoStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params
  if (!videoId) {
    throw new ApiError(400, "Video ID is required")
  }

  const video = await Video.findByIdAndUpdate(videoId, {
    isPublic: !video.isPublic
  }, { new: true })

  if (!video) {
    throw new ApiError(404, "Video not found")
  }

  res.status(200).json(
    new ApiResponse(200, video, "Video status updated successfully")
  )

})



export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideoDes,
  updatethumbnailPath,
  deleteVideo,
  toggleVideoStatus
}