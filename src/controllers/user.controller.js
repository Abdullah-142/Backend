import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import uploadImage from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/apiResponse.js";
import jwt from "jsonwebtoken";


// Generate access and refresh tokens

const generateAccessAndRefereshTokens = async (userid) => {
  try {
    const user = await User.findOne(userid);

    const accessToken = user.createAccessToken();
    const refreshToken = user.createRefreshToken();

    user.refreshToken = refreshToken;

    await user.save({
      validateBeforeSave: false,
    });

    return { accessToken, refreshToken };

  } catch (error) {
    console.log(error);
  }
}

// Reister handler

const registerHandler = asyncHandler(async (req, res, next) => {
  const { fullname, email, password, username } = req.body;

  if ([username, email, password, fullname].some((key) => key?.trim() === "")) {
    throw new ApiError(400, 'All fields are required');
  }
  const existingUser = await User.findOne({
    $or: [{ email }, { username }],
  })

  if (existingUser) {
    throw new ApiError(400, 'User already exists');
  }

  const tempFilePath = req.files.avatar[0].path;

  let tempCoverPath;
  if (req.files && Array.isArray(req.files.backgroundImage) && req.files.backgroundImage.length > 0) {
    tempCoverPath = req.files.backgroundImage[0].path;
  }


  if (!tempFilePath) {
    throw new ApiError(400, 'There is no image file');
  }


  const uploadAvatarPath = await uploadImage(tempFilePath);
  const uploadCoverPath = await uploadImage(tempCoverPath);

  if (!uploadAvatarPath) {
    throw new ApiError(500, 'Image upload failed');
  }

  const createUser = await User.create({
    fullname,
    email,
    backgroundImage: uploadCoverPath?.url || "",
    password,
    username: username.toLowerCase(),
    avatar: uploadAvatarPath.url,
  })

  const checkUser = await User.findOne(
    createUser._id
  ).select('-password -refreshToken');

  if (!checkUser) {
    throw new ApiError(500, 'User not found');
  }

  res.status(201).json(
    new ApiResponse(201, 'User created successfully', checkUser)
  )
})


//Login handler

const loginHandler = asyncHandler(async (req, res) => {

  const { email, username, password } = req.body

  if (!(username || email)) {
    throw new ApiError(400, "username or email is required")

  }

  const user = await User.findOne({
    $or: [{ username }, { email }]
  })

  if (!user) {
    throw new ApiError(404, "User does not exist")
  }

  const isPasswordValid = await user.isPasswordCorrect(password)

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials")
  }

  const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(user._id)

  const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

  const options = {
    httpOnly: true,
    secure: true
  }

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser, accessToken, refreshToken
        },
        "User logged In Successfully"
      )
    )

})


// logoutHandler

const logoutHandler = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshToken: 1 // this removes the field from document
      }
    },
    {
      new: true
    }
  )

  const options = {
    httpOnly: true,
    secure: true
  }

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"))

})


// generateRefreshToken

const refreshTokenHandler = asyncHandler(async (req, res) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    throw new ApiError(401, "User not authenticated")
  }

  try {
    const decodeToken = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET)

    const user = await User.findById(decodeToken._id).select("-password")

    if (!user) {
      throw new ApiError(404, "User not found")
    }

    if (user.refreshToken !== refreshToken) {
      throw new ApiError(401, "Invalid refresh token")
    }

    const { accessToken, refreshToken: newRefreshToken } = await generateAccessAndRefereshTokens(user._id)

    const options = {
      httpOnly: true,
      secure: true
    }

    res.status(200).cookie("accessToken", accessToken, options).cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(200, {
          accessToken, refreshToken: newRefreshToken
        })
      )
  } catch (error) {
    throw new ApiError(401, error.message || "User not authenticated")
  }
})


// update password 


const updatepasswordHanlder = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    throw new ApiError(400, "Old password and new password are required")
  }

  const user = await User.findById(req.user._id)

  const isPasswordValid = await user.isPasswordCorrect(oldPassword)

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials")
  }

  user.password = newPassword;


  await user.save({
    validateBeforeSave: false
  })

  res.status(200).json(new ApiResponse(200, {}, "Password updated successfully"))
})

//getcurrntnuser


const getCurrentUser = asyncHandler(async (req, res) => {
  res.status(200)
    .json
    (
      new ApiResponse
        (
          200, req.user, "User found"
        )
    )

})

//update user profile

const updateUserProfile = asyncHandler(async (req, res) => {
  const { fullname, username, email } = req.body;


  if (!fullname && !username && !email) {
    // None of the fields are filled
    return res.status(400).json({ error: 'At least one field (fullname, username, or email) must be filled.' });
  }

  const user = await User.findByIdAndUpdate(req.user?._id, {
    $set: {
      fullname,
      username,
      email
    }
  }, // Add this comma
    {
      new: true
    }
  ).select("-password")

  if (!user) {
    throw new ApiError(404, "There was an error updating user profile")
  }

  res.status(200).json(new ApiResponse(200, {}, "User updated successfully"))
})

//updateAvatar

const updateAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar is required")
  }


  const avatar = await uploadImage(avatarLocalPath);

  if (!avatar) {
    throw new ApiError(500, "Image upload failed")
  }

  const user = await User.findByIdAndUpdate(req.user._id, {
    $set: {
      avatar: avatar.url
    }
  }, {
    new: true
  }).select("-password")

  if (!user) {
    throw new ApiError(404, "There was an error updating user avatar")
  }

  res.status(200).json(new ApiResponse(200, {}, "User avatar updated successfully"))


})


//updatecpverimage

const updateCoverImage = asyncHandler(async (req, res) => {
  const coverImageLocalPath = req.file.path;

  if (!coverImageLocalPath) {
    throw new ApiError(400, "Avatar is required")
  }


  const coverImage = await uploadImage(coverImageLocalPath);

  if (!coverImage) {
    throw new ApiError(500, "Image upload failed")
  }

  const user = await User.findByIdAndUpdate(req.user._id, {
    $set: {
      avatar: coverImage.url
    }
  }, {
    new: true
  }).select("-password")

  if (!user) {
    throw new ApiError(404, "There was an error updating user coverImage")
  }

  res.status(200).json(new ApiResponse(200, {}, "User coverImage updated successfully"))


})


const getUserProfile = asyncHandler(async (req, res) => {
  const { username } = req.params;

  if (!username?.trim()) {
    throw new ApiError(400, "Username Not Found in params")
  }

  const channel = await User.aggregate - [
    {
      $match: {
        username: username?.toLowerCase()
      }
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers"
      }
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedTo"
      }
    },
    {
      $addFields: {
        subscriberCount: { $size: "$subscribers" },
        subscribedToCount: { $size: "$subscribedTo" },
        isSubscribed: {
          $cond: {
            if: {
              $in: [req.user?._id, "$subscribers.subscriber"]
            },
            then: true,
            else: false
          }
        }
      }
    },
    {
      $project: {
        email: 1,
        username: 1,
        fullname: 1,
        avatar: 1,
        backgroundImage: 1,
        subscriberCount: 1,
        subscribedToCount: 1,
        isSubscribed: 1
      }
    }
  ]

  if (!channel?.length) {
    throw new ApiError(404, "Channel not found")
  }

  console.log(channel);


  res.status(200)
    .json
    (
      new ApiResponse
        (
          200,
          channel[0],
          "Channel found Successfully"
        )
    )
})


export {
  registerHandler,
  loginHandler,
  logoutHandler,
  refreshTokenHandler,
  updatepasswordHanlder,
  getCurrentUser,
  updateUserProfile,
  updateAvatar,
  updateCoverImage,
  getUserProfile
}