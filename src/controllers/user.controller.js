import { asyncHandler } from "../utils/asyncHandler.js";


const registerHandler = asyncHandler(async (req, res, next) => {
  res.status(201).json({
    message: "User registered successfully!"
  });
})


export { registerHandler }