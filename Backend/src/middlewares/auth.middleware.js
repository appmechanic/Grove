import User from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

export const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    console.log("Token-->>", token);

    if (!token) {
      return res
        .status(401)
        .json(new ApiResponse(401, {}, "Unauthorized Request"));
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await User.findById(decodedToken?._id).select(
      "-password -refreshToken"
    );
    if (!user) {
      return res
        .status(401)
        .json(new ApiResponse(401, {}, "Invalid Access Token"));
    }

    req.user = user;
    next();
  } catch (error) {
    return res
      .status(401)
      .json(
        new ApiResponse(401, {}, error.message || "Unauthorized Access Token")
      );
  }
});
