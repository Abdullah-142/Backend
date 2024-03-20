import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import uploadImage from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/apiResponse.js";
import jwt from "jsonwebtoken";

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

export { registerHandler, loginHandler, logoutHandler, refreshTokenHandler }