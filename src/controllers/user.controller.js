import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import uploadImage from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/apiResponse.js";


const generateAccessToken = async (userid) => {
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


  const tempFilePath = req.files?.avatar[0]?.path
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
  const { email, password, username } = req.body;

  if (!(email && password && username)) {
    throw new ApiError(400, 'Email and password are required');
  }

  const user = await User.findOne(
    {
      $or: [{ email }, { username }],
    }
  );

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  const isPasswordMatch = await user.comparePassword(password);

  if (!isPasswordMatch) {
    throw new ApiError(401, 'Invalid credentials');
  }

  const { accessToken, refreshToken } = await generateAccessToken(user._id);


  const loggedInUser = await User.findOne(user._id).select('-password -refreshToken');

  const options = {
    httpOnly: true,
    secure: true
  }

  res.status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(200,
        'Login successful',
        {
          user: loggedInUser,
          accessToken, refreshToken
        }
      )
    )
})

const logoutHandler = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.user._id,
    {
      $set: {
        refreshToken: undefined,

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

  res.status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, 'Logged out successfully', null))


})



export { registerHandler, loginHandler, logoutHandler }