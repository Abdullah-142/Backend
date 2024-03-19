import jwt from 'jsonwebtoken';
import { asyncHandler } from '../utils/asyncHandler.js';
import { User } from '../models/user.model.js';
import { ApiError } from '../utils/ApiError.js';


export const verifyJwt = asyncHandler(async (req, _, next) => {
  const token = req.cookies.accessToken || req.headers('Authorization').replace('Bearer ', '');

  if (!token) {
    throw new ApiError(401, 'Unauthorized');
  }

  try {
    const decodeToken = jwt.verify(token, process.env.JWT_SECRET);


    console.log(decodeToken);

    const user = await User.findById(decodeToken.id).select('-password -refreshToken');

    if (!user) {
      throw new ApiError(201, 'Unvalid user token');
    }

    req.user = user;
    next();

  } catch (error) {
    console.log("Error verifying token: ", error);
  }
});