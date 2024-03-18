import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import uploadImage from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/apiResponse.js";
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


export { registerHandler }