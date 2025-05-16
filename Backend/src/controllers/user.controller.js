import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);

    const accessToken = user.generateAccessToken();

    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating refresh and access token"
    );
  }
};

// POST Request
const registerUser = asyncHandler(async (req, res) => {
  console.log("Request Body-->>", req.body);
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json(new ApiResponse(400, {}, "All fields are required"));
  }

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    return res
      .status(409)
      .json(new ApiResponse(409, {}, "User already exists"));
  }

  const newUser = await User.create({
    email,
    password,
  });

  const createdUser = await User.findById(newUser._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    return res
      .status(500)
      .json(
        new ApiResponse(
          500,
          {},
          "Something went wrong while registering the user"
        )
      );
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User created successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email) {
    return res.status(400).json(new ApiResponse(400, {}, "Email is required"));
  }

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(404).json(new ApiResponse(404, {}, "User not found"));
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    return res
      .status(401)
      .json(new ApiResponse(401, {}, "Invalid credentials"));
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!loggedInUser) {
    return res
      .status(500)
      .json(new ApiResponse(500, {}, "Something went wrong while logging in"));
  }

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged in successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshToken: 1, // this removes the field from document
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies?.refreshToken ||
    req.header("Authorization")?.replace("Bearer ", "") ||
    req.body?.refreshToken;

  if (!incomingRefreshToken) {
    return res
      .status(401)
      .json(
        new ApiResponse(401, {}, "Refresh Token is required or Unauthorized")
      );
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken?._id);

    if (!user) {
      return res
        .status(401)
        .json(new ApiResponse(401, {}, "Invalid Refresh Token"));
    }
    if (user?.refreshToken !== incomingRefreshToken) {
      return res
        .status(401)
        .json(new ApiResponse(401, {}, "Refresh Token is Expired or Invalid"));
    }

    const options = {
      httpOnly: true,
      secure: true,
    };

    const { accessToken, newRefreshToken } =
      await generateAccessAndRefreshToken(user._id);

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          {
            accessToken,
            refreshToken: newRefreshToken,
          },
          "Access Token refreshed successfully"
        )
      );
  } catch (error) {
    return res
      .status(401)
      .json(
        new ApiResponse(401, {}, error?.message || "Invalid Refresh Token")
      );
  }
});

const uploadProfileImage = asyncHandler(async (req, res) => {
  try {
    console.log("Req Files-->>", req.files);

    const avatarLocalPath = req.files?.avatar[0].path;
    if (!avatarLocalPath) {
      return res
        .status(400)
        .json(new ApiResponse(400, {}, "Avatar File is required"));
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    if (!avatar) {
      return res
        .status(500)
        .json(
          new ApiResponse(500, {}, "Something went wrong while uploading image")
        );
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      {
        $set: {
          avatar: avatar?.url,
        },
      },
      {
        new: true,
      }
    ).select("-password -refreshToken");
    if (!updatedUser) {
      return res
        .status(500)
        .json(
          new ApiResponse(500, {}, "Something went wrong while updating user")
        );
    }
    return res
      .status(200)
      .json(
        new ApiResponse(200, updatedUser, "Profile image uploaded successfully")
      );
  } catch (error) {
    console.error("Error uploading profile image:", error);

    return res
      .status(500)
      .json(
        new ApiResponse(500, {}, "Something went wrong while uploading image")
      );
  }
});

const userRole = asyncHandler(async (req, res) => {
  const { role } = req.body;

  if (!role) {
    return res.status(400).json(new ApiResponse(400, {}, "Role is required"));
  }

  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        role,
      },
    },
    {
      new: true,
    }
  ).select("-password -refreshToken");
  if (!updatedUser) {
    return res
      .status(500)
      .json(
        new ApiResponse(500, {}, "Something went wrong while updating user")
      );
  }
  return res
    .status(200)
    .json(new ApiResponse(200, updatedUser, "User role updated successfully"));
});

const userMumOrBusinessDetails = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  if (!userId) {
    return res
      .status(400)
      .json(new ApiResponse(400, {}, "User ID is required"));
  }
  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json(new ApiResponse(404, {}, "User not found"));
  }

  if (user.role === "mum") {
    const { stage } = req.body;
    if (!stage) {
      return res
        .status(400)
        .json(new ApiResponse(400, {}, "Stage is required"));
    }
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          "mumDetails.stage": stage,
        },
      },
      {
        new: true,
      }
    ).select("-password -refreshToken");
    if (!updatedUser) {
      return res
        .status(500)
        .json(
          new ApiResponse(500, {}, "Something went wrong while updating user")
        );
    }
    return res
      .status(200)
      .json(
        new ApiResponse(200, updatedUser, "Mum details updated successfully")
      );
  } else if (user.role === "business") {
    const { businessName, businessDescription } = req.body;
    if (!businessName || !businessDescription) {
      return res
        .status(400)
        .json(
          new ApiResponse(400, {}, "Business name and description are required")
        );
    }
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          "businessDetails.businessName": businessName,
          "businessDetails.businessDescription": businessDescription,
        },
      },
      {
        new: true,
      }
    ).select("-password -refreshToken");
    if (!updatedUser) {
      return res
        .status(500)
        .json(
          new ApiResponse(500, {}, "Something went wrong while updating user")
        );
    }
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          updatedUser,
          "Business details updated successfully"
        )
      );
  } else {
    return res.status(400).json(new ApiResponse(400, {}, "Invalid role"));
  }
});

const userSubscriptionDetails = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  if (!userId) {
    return res
      .status(400)
      .json(new ApiResponse(400, {}, "User ID is required"));
  }
  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json(new ApiResponse(404, {}, "User not found"));
  }

  if (user.role === "mum") {
    const { mumPlan, mumPlanPrice } = req.body;
    if (!mumPlan || !mumPlanPrice) {
      return res
        .status(400)
        .json(new ApiResponse(400, {}, "Mum plan and price are required"));
    }
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          "mumDetails.mumPlan": mumPlan,
          "mumDetails.mumPlanPrice": mumPlanPrice,
        },
      },
      {
        new: true,
      }
    ).select("-password -refreshToken");
    if (!updatedUser) {
      return res
        .status(500)
        .json(
          new ApiResponse(500, {}, "Something went wrong while updating user")
        );
    }
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          updatedUser,
          "Mum subscription details updated successfully"
        )
      );
  } else if (user.role === "business") {
    const { businessPlan, businessPlanPrice } = req.body;
    if (!businessPlan || !businessPlanPrice) {
      return res
        .status(400)
        .json(new ApiResponse(400, {}, "Business plan and price are required"));
    }
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          "businessDetails.businessPlan": businessPlan,
          "businessDetails.businessPlanPrice": businessPlanPrice,
        },
      },
      {
        new: true,
      }
    ).select("-password -refreshToken");
    if (!updatedUser) {
      return res
        .status(500)
        .json(
          new ApiResponse(500, {}, "Something went wrong while updating user")
        );
    }
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          updatedUser,
          "Business subscription details updated successfully"
        )
      );
  } else {
    return res.status(400).json(new ApiResponse(400, {}, "Invalid role"));
  }
});

const updateUserDetails = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  if (!userId) {
   
    return res
      .status(400)
      .json(new ApiResponse(400, {}, "User ID is required"));
  }
  const user = await User.findById(userId);
  if (!user) {
    
    return res.status(404).json(new ApiResponse(404, {}, "User not found"));
  }

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    {
      $set: {
        ...req.body,
      },
    },
    {
      new: true,
    }
  ).select("-password -refreshToken");
  if (!updatedUser) {
  
    return res
      .status(500)
      .json(
        new ApiResponse(500, {}, "Something went wrong while updating user")
      );
  }
  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedUser, "User details updated successfully")
    );
});

// GET Request
const getUserDetails = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  if (!userId) {
   
    return res
      .status(400)
      .json(new ApiResponse(400, {}, "User ID is required"));
  }
  const user = await User.findById(userId).select("-password -refreshToken");
  if (!user) {
  
    return res.status(404).json(new ApiResponse(404, {}, "User not found"));
  }
  return res
    .status(200)
    .json(new ApiResponse(200, user, "User details fetched successfully"));
});

// DELETE Request

const deleteUser = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  if (!userId) {
   
    return res
      .status(400)
      .json(new ApiResponse(400, {}, "User ID is required"));
  }
  const user = await User.findByIdAndDelete(userId);
  if (!user) {
   
    return res.status(404).json(new ApiResponse(404, {}, "User not found"));
  }
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "User deleted successfully"));
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  uploadProfileImage,
  userRole,
  userMumOrBusinessDetails,
  userSubscriptionDetails,
  getUserDetails,
  deleteUser,
};
