
import { User } from "../models/user.model.js"
import { Video } from "../models/video.model.js"
import { Like } from "../models/like.model.js"
import { Playlist } from "../models/playlist.model.js"
import { Comment } from "../models/comment.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/apiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import uploadOnCloudinary from "../utils/cloudinary.js"

async function removeLikesCommentsPlaylistWatchHistoryForVideo(videoId) {
  try {
    // Delete all likes for the video
    const LikeDelete = await Like.deleteMany({ video: videoId });

    const getComments = await Comment.find({ video: videoId });

    const commentIds = getComments.map(comment => comment._id);
    // Delete likes for the comments
    const commentLikeDelete = await Like.deleteMany({ comment: { $in: commentIds } });

    // Delete all comments for the video
    const deleteComment = await Comment.deleteMany({ video: videoId });


    // Remove playlist entries for the video
    const playlistDelete = await Playlist.updateMany({}, { $pull: { videos: videoId } });

    await Promise.all([
      LikeDelete,
      commentLikeDelete,
      deleteComment,
      playlistDelete
    ]);

    // Return true if all operations succeed
    return true;

  } catch (error) {
    console.error('Error deleting likes, comments, playlist entries, and watch history for video:', error);
    throw error; // Re-throw the error for handling at a higher level if needed
  }
}


const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType } = req.query;

  const user = await User.find({
    refreshToken: req.cookies.refreshToken,
  });

  const pageNumber = parseInt(page);
  const limitOfComments = parseInt(limit);

  if (!user) {
    throw new ApiError(400, "User is required.");
  }

  const skip = (pageNumber - 1) * limitOfComments;
  const pageSize = limitOfComments;

  const videos = await Video.aggregatePaginate(
    Video.aggregate([
      {
        $match: {
          $or: [
            { title: { $regex: query, $options: 'i' } },
            { description: { $regex: query, $options: 'i' } }
          ],
          isPublished: true,
          owner: user._id
        }
      },
      {
        $lookup: {
          from: "likes",
          localField: "_id",
          foreignField: "video",
          as: "likes",
        }
      },
      {
        $addFields: {
          likes: { $size: "$likes" }
        }
      },
      {
        $project: {
          "_id": 1,
          "videoFile": 1,
          "thumbnail": 1,
          "title": 1,
          "description": 1,
          "duration": 1,
          "views": 1,
          "isPublished": 1,
          "owner": 1,
          "createdAt": 1,
          "updatedAt": 1,
          "likes": 1
        }
      },
      { $sort: { [sortBy]: sortType === 'asc' ? 1 : -1 } },
      { $skip: skip },
      { $limit: pageSize }
    ])
  );

  if (videos.length === 0) {
    return res.status(200).json(new ApiResponse(400, "No videos available."));
  }

  // Return the videos
  res.status(200).json(new ApiResponse(200, videos, "Videos fetched successfully"));
});

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
  console.log(videoUrl);
  const video = await Video.create({
    title,
    description,
    videoFile: videoUrl?.url,
    thumbnail: thumbnailUrl?.url,
    duration: Math.floor(videoUrl?.duration) + ' s',
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

  if (!video.owner.toString() === user._id.toString()) {
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

  const { videoId } = req.params

  const { _id } = req.user

  const video = await Video.findById(videoId)

  //only owner can update the video 
  const user = await User.findById(_id)

  if (!user) {
    throw new ApiError(404, "User not found")
  }

  if (!video) {
    throw new ApiError(404, "video not found")
  }


  if (!video.owner.toString() === user._id.toString()) {
    throw new ApiError(401, "only owner can update the video")
  }

  const thumbnailPathFilPath = req.file.path

  if (!thumbnailPathFilPath) {
    throw new ApiError(400, "thumbnail file is required")
  }

  const thumbnailUrl = await uploadOnCloudinary(thumbnailPathFilPath)

  if (!thumbnailUrl) {
    throw new ApiError(500, "no url found for thumbnail")
  }

  const updateThumbnail = await Video.findByIdAndUpdate(videoId, {
    $set: {
      videoFile: thumbnailUrl.url
    }
  }, {
    new: true
  })

  if (!updateThumbnail) {
    throw new ApiError(500, "Failed to update thumbnail")
  }

  res.status(200).json(
    new ApiResponse(200, {}, "thumbnail updated successfully")
  )

})


const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params
  const { _id } = req.user

  if (!videoId) {
    throw new ApiError(400, "Video ID is required")
  }

  const video = await Video.findById(videoId)

  if (!video) {
    throw new ApiError(404, "Video not found")
  }


  if (!video.owner.toString() === _id.toString()) {
    throw new ApiError(401, "only owner can delete the video")
  }

  const deletelikes = await removeLikesCommentsPlaylistWatchHistoryForVideo(videoId);

  if (!deletelikes) {
    throw new ApiError(400, "Failed to delete likes and comments for video")
  }

  const deleteVideo = await Video.findByIdAndDelete(videoId)


  if (!deleteVideo) {
    throw new ApiError(400, "Failed to delete video")
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
    $set: {
      isPublic: !video.isPublic
    }
  }, { new: true })

  if (!video) {
    throw new ApiError(404, "Video not found")
  }

  res.status(200).json(
    new ApiResponse(200, {}, "Video status updated successfully")
  )

})



export {
  deleteVideo, getAllVideos, getVideoById, publishAVideo, toggleVideoStatus, updatethumbnailPath, updateVideoDes
}
