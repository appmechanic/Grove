import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import crypto from "crypto";
import { sendEmail } from "../utils/sendEmail.js";
import { uploadToDO } from "../utils/digitalOcean.js";

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

  const token = crypto.randomBytes(64).toString("hex");

  const newUser = await User.create({
    email,
    password,
    emailVerificationToken: token,
  });

  const verificationLink = `${process.env.SERVER_URL}/api/v1/user/verify-email/${token}`;

  await sendEmail({
    to: email,
    subject: "Verify your email to activate your Grove account",
    html: `
    <div style="font-family: Arial, sans-serif; padding: 20px; line-height: 1.6;">
      <h2>Hi there,</h2>

      <p>Thank you for signing up for <strong>Grove</strong> – we're excited to have you on board!</p>

      <p>To complete your registration and start using Grove, please verify your email address by clicking the button below:</p>

      <p style="text-align: center;">
        <a href="${verificationLink}" target="_blank" style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;">
          Verify My Email
        </a>
      </p>

      <p>Or copy and paste the link below into your browser:</p>
      <p style="word-break: break-all;"><a href="${verificationLink}" target="_blank">${verificationLink}</a></p>

      <p>This link will expire in 24 hours for security reasons.</p>

      <p>If you didn’t create a Grove account, you can safely ignore this email.</p>

      <p>Welcome to a better way to grow with Grove.</p>

      <br />
      <p>Warm regards,<br /><strong>The Grove Team</strong></p>
    </div>
  `,
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
    .json(
      new ApiResponse(
        200,
        createdUser,
        "User created successfully and Verification email sent, please check your inbox and spam folder as well"
      )
    );
});

const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.params;

  if (!token) {
    return res
      .status(400)
      .json(new ApiResponse(400, {}, "Email verification token is required"));
  }

  const user = await User.findOne({
    emailVerificationToken: token,
  });

  if (!user) {
    // Return HTML response for invalid token
    return res.status(404).send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Email Verification Failed</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              text-align: center;
            }
            .container {
              border: 1px solid #e0e0e0;
              border-radius: 5px;
              padding: 30px;
              margin-top: 50px;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            h1 {
              color: #d9534f;
            }
            .message {
              margin: 20px 0;
              font-size: 18px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Email Verification Failed</h1>
            <div class="message">
              Sorry, we couldn't verify your email address. The verification link is invalid or has expired.
            </div>
            <p>Please try signing up again or contact support if you continue to experience issues.</p>
          </div>
        </body>
        </html>
      `);
  }

  if (user.isVerified) {
    // Return HTML response for already verified user
    return res.status(200).send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Already Verified</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              text-align: center;
            }
            .container {
              border: 1px solid #e0e0e0;
              border-radius: 5px;
              padding: 30px;
              margin-top: 50px;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            h1 {
              color: #5cb85c;
            }
            .message {
              margin: 20px 0;
              font-size: 18px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Already Verified</h1>
            <div class="message">
              Your email has already been verified. You can now login to your Grove account.
            </div>
            <p>Thank you for using Grove!</p>
          </div>
        </body>
        </html>
      `);
  }

  // Verify the user
  user.isVerified = true;
  user.emailVerificationToken = undefined;
  await user.save();

  // Return HTML response for successful verification
  return res.status(200).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Email Verified Successfully</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            text-align: center;
          }
          .container {
            border: 1px solid #e0e0e0;
            border-radius: 5px;
            padding: 30px;
            margin-top: 50px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          h1 {
            color: #5cb85c;
          }
          .message {
            margin: 20px 0;
            font-size: 18px;
          }
          .login-btn {
            display: inline-block;
            background-color: #4CAF50;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 5px;
            margin-top: 15px;
            font-weight: bold;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Email Verified Successfully!</h1>
          <div class="message">
            Your email has been verified successfully. You can now log in to your Grove account.
          </div>
          <p style="margin-top: 30px;">Thank you for choosing Grove!</p>
        </div>
      </body>
      </html>
    `);
});

const resendVerificationEmail = asyncHandler(async (req, res) => {
  const { email } = req.body;

  // Check if email is provided
  if (!email) {
    return res.status(400).json(new ApiResponse(400, {}, "Email is required"));
  }

  // Find the user by email
  const user = await User.findOne({ email });

  // If user doesn't exist
  if (!user) {
    return res.status(404).json(new ApiResponse(404, {}, "User not found"));
  }

  // Check if user is already verified
  if (user.isVerified) {
    return res
      .status(400)
      .json(new ApiResponse(400, {}, "Email is already verified"));
  }

  // Generate new verification token
  const token = crypto.randomBytes(64).toString("hex");

  // Update user with new token
  user.emailVerificationToken = token;
  await user.save();

  // Create verification link
  const verificationLink = `${process.env.SERVER_URL}/api/v1/user/verify-email/${token}`;

  // Send email
  await sendEmail({
    to: email,
    subject: "Verify your email to activate your Grove account",
    html: `
    <div style="font-family: Arial, sans-serif; padding: 20px; line-height: 1.6;">
      <h2>Hi there,</h2>
      
      <p>You requested a new verification email for your <strong>Grove</strong> account.</p>
      
      <p>To complete your registration and start using Grove, please verify your email address by clicking the button below:</p>
      
      <p style="text-align: center;">
        <a href="${verificationLink}" target="_blank" style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;">
          Verify My Email
        </a>
      </p>
      
      <p>Or copy and paste the link below into your browser:</p>
      <p style="word-break: break-all;"><a href="${verificationLink}" target="_blank">${verificationLink}</a></p>
      
      <p>This link will expire in 24 hours for security reasons.</p>
      
      <p>If you didn't request this email, you can safely ignore it.</p>
      
      <br />
      <p>Warm regards,<br /><strong>The Grove Team</strong></p>
    </div>
  `,
  });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        {},
        "Verification email sent successfully, please check your inbox and spam folder"
      )
    );
});

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json(new ApiResponse(404, {}, "User not found"));
  }
  if (!user.isVerified) {
    return res
      .status(400)
      .json(
        new ApiResponse(
          400,
          {},
          "User is not verified, please verify your email first"
        )
      );
  }

  const token = crypto.randomBytes(32).toString("hex");
  user.resetPasswordToken = token;
  user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
  await user.save({ validateBeforeSave: false });

  const resetLink = `${process.env.SERVER_URL}/api/v1/user/reset-password/${token}`;

  await sendEmail({
    to: email,
    subject: "Reset your Grove password",
    html: `
    <div style="font-family: Arial, sans-serif; padding: 20px; line-height: 1.6;">
      <h2>Hi there,},</h2>

      <p>We received a request to reset the password for your <strong>Grove</strong> account.</p>

      <p>To create a new password, please click the button below:</p>

      <p style="text-align: center;">
        <a href="${resetLink}" target="_blank" style="background-color: #f39c12; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;">
          🔁 Reset My Password
        </a>
      </p>

      <p>Or paste the following link into your browser:</p>
      <p style="word-break: break-all;"><a href="${resetLink}" target="_blank">${resetLink}</a></p>

      <p>If you didn’t request a password reset, you can safely ignore this email — your password will remain unchanged.</p>

      <p>Need help? Reach out to us.</p>

      <br />
      <p>Stay secure,<br /><strong>The Grove Team</strong></p>
    </div>
  `,
  });
  res.status(200).json(new ApiResponse(200, user, "Password reset email sent"));
});

// const resetPassword = asyncHandler(async (req, res) => {
//   const { token } = req.params;

//   const user = await User.findOne({
//     resetPasswordToken: token,
//     resetPasswordExpires: { $gt: Date.now() },
//   });

//   if (!user) {
//     return res.send(`
//       <!DOCTYPE html>
//       <html>
//       <head>
//         <title>Password Reset Error</title>
//         <style>
//           body {
//             font-family: Arial, sans-serif;
//             line-height: 1.6;
//             max-width: 600px;
//             margin: 0 auto;
//             padding: 20px;
//             text-align: center;
//           }
//           .error-container {
//             background-color: #ffe6e6;
//             border: 1px solid #ff8080;
//             border-radius: 5px;
//             padding: 20px;
//             margin-top: 40px;
//           }
//           h1 {
//             color: #333;
//           }
//           .error-message {
//             color: #cc0000;
//             font-weight: bold;
//           }
//         </style>
//       </head>
//       <body>
//         <div class="error-container">
//           <h1>Password Reset Error</h1>
//           <p class="error-message">Invalid or expired password reset link.</p>
//           <p>Please request a new password reset link from the login page.</p>
//         </div>
//       </body>
//       </html>
//     `);
//   }

//   user.password = newPassword;
//   user.resetPasswordToken = undefined;
//   user.resetPasswordExpires = undefined;

//   await user.save();
//   res.status(200).json(new ApiResponse(200, {}, "Password reset successful"));
// });

const resetPassword = asyncHandler(async (req, res) => {
  const { token, newPassword, confirmPassword } = req.body;

  // Server-side validation
  if (newPassword !== confirmPassword) {
    return res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Password Reset Error</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            text-align: center;
          }
          .error-container {
            background-color: #ffe6e6;
            border: 1px solid #ff8080;
            border-radius: 5px;
            padding: 20px;
            margin-top: 40px;
          }
          h1 {
            color: #333;
          }
          .error-message {
            color: #cc0000;
            font-weight: bold;
          }
          .back-button {
            display: inline-block;
            margin-top: 15px;
            background-color: #f39c12;
            color: white;
            text-decoration: none;
            padding: 10px 20px;
            border-radius: 4px;
          }
        </style>
      </head>
      <body>
        <div class="error-container">
          <h1>Password Reset Error</h1>
          <p class="error-message">Passwords do not match.</p>
          <a href="/api/v1/user/reset-password/${token}" class="back-button">Try Again</a>
        </div>
      </body>
      </html>
    `);
  }
   if (newPassword.length < 8) {
    return res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Password Reset Error</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            text-align: center;
          }
          .error-container {
            background-color: #ffe6e6;
            border: 1px solid #ff8080;
            border-radius: 5px;
            padding: 20px;
            margin-top: 40px;
          }
          h1 {
            color: #333;
          }
          .error-message {
            color: #cc0000;
            font-weight: bold;
          }
          .back-button {
            display: inline-block;
            margin-top: 15px;
            background-color: #f39c12;
            color: white;
            text-decoration: none;
            padding: 10px 20px;
            border-radius: 4px;
          }
        </style>
      </head>
      <body>
        <div class="error-container">
          <h1>Password Reset Error</h1>
          <p class="error-message">Password must be at least 8 characters long.</p>
          <a href="/api/v1/user/reset-password/${token}" class="back-button">Try Again</a>
        </div>
      </body>
      </html>
    `);
  }
  
  const specialCharRegex = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;
  if (!specialCharRegex.test(newPassword)) {
    return res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Password Reset Error</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            text-align: center;
          }
          .error-container {
            background-color: #ffe6e6;
            border: 1px solid #ff8080;
            border-radius: 5px;
            padding: 20px;
            margin-top: 40px;
          }
          h1 {
            color: #333;
          }
          .error-message {
            color: #cc0000;
            font-weight: bold;
          }
          .back-button {
            display: inline-block;
            margin-top: 15px;
            background-color: #f39c12;
            color: white;
            text-decoration: none;
            padding: 10px 20px;
            border-radius: 4px;
          }
        </style>
      </head>
      <body>
        <div class="error-container">
          <h1>Password Reset Error</h1>
          <p class="error-message">Password must contain at least one special character.</p>
          <a href="/api/v1/user/reset-password/${token}" class="back-button">Try Again</a>
        </div>
      </body>
      </html>
    `);
  }

  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) {
    return res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Password Reset Error</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            text-align: center;
          }
          .error-container {
            background-color: #ffe6e6;
            border: 1px solid #ff8080;
            border-radius: 5px;
            padding: 20px;
            margin-top: 40px;
          }
          h1 {
            color: #333;
          }
          .error-message {
            color: #cc0000;
            font-weight: bold;
          }
        </style>
      </head>
      <body>
        <div class="error-container">
          <h1>Password Reset Error</h1>
          <p class="error-message">Invalid or expired password reset link.</p>
          <p>Please request a new password reset link from the login page.</p>
        </div>
      </body>
      </html>
    `);
  }

  user.password = newPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;

  await user.save();

  // Send success page
  return res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Password Reset Success</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          text-align: center;
        }
        .success-container {
          background-color: #e6ffe6;
          border: 1px solid #80ff80;
          border-radius: 5px;
          padding: 20px;
          margin-top: 40px;
        }
        h1 {
          color: #333;
        }
        .success-message {
          color: #008800;
          font-weight: bold;
          font-size: 18px;
        }
        .login-button {
          display: inline-block;
          margin-top: 20px;
          background-color: #f39c12;
          color: white;
          text-decoration: none;
          padding: 12px 25px;
          border-radius: 4px;
          font-weight: bold;
        }
      </style>
    </head>
    <body>
      <div class="success-container">
        <h1>Password Reset Successful</h1>
        <p class="success-message">Your password has been successfully updated.</p>
        <p>You can now log in to your account with your new password.</p>
      </div>
    </body>
    </html>
  `);
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
  const user = await User.findByIdAndUpdate(
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
    .json(new ApiResponse(200, user, "User logged out successfully"));
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

const uploadProfileImageCloudinary = asyncHandler(async (req, res) => {
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

const uploadProfileImageDigitalOcean = asyncHandler(async (req, res) => {
  try {
    console.log("Req Files-->>", req.file);

    // Check if file exists
    if (!req.file) {
      return res
        .status(400)
        .json(new ApiResponse(400, {}, "Avatar file is required"));
    }

    // Upload to Digital Ocean Spaces
    const avatarUrl = await uploadToDO(req.file);

    // Update user in database with the new avatar URL
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      {
        $set: {
          avatar: avatarUrl,
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

const renderResetPasswordForm = asyncHandler(async (req, res) => {
  const { token } = req.params;

  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) {
    return res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Password Reset Error</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            text-align: center;
          }
          .error-container {
            background-color: #ffe6e6;
            border: 1px solid #ff8080;
            border-radius: 5px;
            padding: 20px;
            margin-top: 40px;
          }
          h1 {
            color: #333;
          }
          .error-message {
            color: #cc0000;
            font-weight: bold;
          }
        </style>
      </head>
      <body>
        <div class="error-container">
          <h1>Password Reset Error</h1>
          <p class="error-message">Invalid or expired password reset link.</p>
          <p>Please request a new password reset link from the login page.</p>
        </div>
      </body>
      </html>
    `);
  }

  // Render the password reset form
  // res.send(`
  //   <!DOCTYPE html>
  //   <html>
  //   <head>
  //     <title>Reset Your Password</title>
  //     <style>
  //       body {
  //         font-family: Arial, sans-serif;
  //         line-height: 1.6;
  //         max-width: 500px;
  //         margin: 0 auto;
  //         padding: 20px;
  //       }
  //       .form-container {
  //         background-color: #f9f9f9;
  //         border: 1px solid #ddd;
  //         border-radius: 5px;
  //         padding: 25px;
  //         margin-top: 40px;
  //       }
  //       h1 {
  //         color: #333;
  //         text-align: center;
  //         margin-bottom: 25px;
  //       }
  //       .form-group {
  //         margin-bottom: 20px;
  //       }
  //       label {
  //         display: block;
  //         margin-bottom: 8px;
  //         font-weight: bold;
  //       }
  //       input[type="password"] {
  //         width: 100%;
  //         padding: 10px;
  //         border: 1px solid #ddd;
  //         border-radius: 4px;
  //         font-size: 16px;
  //       }
  //       button {
  //         background-color: #f39c12;
  //         color: white;
  //         border: none;
  //         padding: 12px 20px;
  //         border-radius: 4px;
  //         font-size: 16px;
  //         cursor: pointer;
  //         width: 100%;
  //       }
  //       button:hover {
  //         background-color: #e67e22;
  //       }
  //       .error-message {
  //         color: #cc0000;
  //         margin-top: 5px;
  //         display: none;
  //       }
  //       .error-visible {
  //         display: block;
  //       }
  //     </style>
  //   </head>
  //   <body>
  //     <div class="form-container">
  //       <h1>Reset Your Password</h1>
  //       <form id="resetForm" action="/api/v1/user/reset-password" method="POST">
  //         <input type="hidden" name="token" value="${token}">
          
  //         <div class="form-group">
  //           <label for="password">New Password</label>
  //           <input type="password" id="password" name="newPassword" required>
  //         </div>
          
  //         <div class="form-group">
  //           <label for="confirmPassword">Confirm Password</label>
  //           <input type="password" id="confirmPassword" name="confirmPassword" required>
  //           <div id="passwordError" class="error-message">Passwords must match</div>
  //         </div>
          
  //         <button type="submit">Reset Password</button>
  //       </form>
  //     </div>

  //     <script>
  //       document.getElementById('resetForm').addEventListener('submit', function(event) {
  //         const password = document.getElementById('password').value;
  //         const confirmPassword = document.getElementById('confirmPassword').value;
  //         const passwordError = document.getElementById('passwordError');
          
  //         if (password !== confirmPassword) {
  //           event.preventDefault();
  //           passwordError.classList.add('error-visible');
  //         } else {
  //           passwordError.classList.remove('error-visible');
  //         }
  //       });
  //     </script>
  //   </body>
  //   </html>
  // `);
   res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Reset Your Password</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          max-width: 500px;
          margin: 0 auto;
          padding: 20px;
        }
        .form-container {
          background-color: #f9f9f9;
          border: 1px solid #ddd;
          border-radius: 5px;
          padding: 25px;
          margin-top: 40px;
        }
        h1 {
          color: #333;
          text-align: center;
          margin-bottom: 25px;
        }
        .form-group {
          margin-bottom: 20px;
        }
        label {
          display: block;
          margin-bottom: 8px;
          font-weight: bold;
        }
        input[type="password"] {
          width: 100%;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 16px;
        }
        button {
          background-color: #f39c12;
          color: white;
          border: none;
          padding: 12px 20px;
          border-radius: 4px;
          font-size: 16px;
          cursor: pointer;
          width: 100%;
        }
        button:hover {
          background-color: #e67e22;
        }
        .error-message {
          color: #cc0000;
          margin-top: 5px;
          display: none;
        }
        .error-visible {
          display: block;
        }
      </style>
    </head>
    <body>
      <div class="form-container">
        <h1>Reset Your Password</h1>
        <form id="resetForm" action="/api/v1/user/reset-password" method="POST">
          <input type="hidden" name="token" value="${token}">
          
          <div class="form-group">
            <label for="password">New Password</label>
            <input type="password" id="password" name="newPassword" required>
            <div id="passwordLengthError" class="error-message">Password must be at least 8 characters long</div>
            <div id="passwordSpecialCharError" class="error-message">Password must contain at least one special character</div>
          </div>
          
          <div class="form-group">
            <label for="confirmPassword">Confirm Password</label>
            <input type="password" id="confirmPassword" name="confirmPassword" required>
            <div id="passwordMatchError" class="error-message">Passwords must match</div>
          </div>
          
          <button type="submit">Reset Password</button>
        </form>
      </div>

      <script>
        document.getElementById('resetForm').addEventListener('submit', function(event) {
          const password = document.getElementById('password').value;
          const confirmPassword = document.getElementById('confirmPassword').value;
          const passwordMatchError = document.getElementById('passwordMatchError');
          const passwordLengthError = document.getElementById('passwordLengthError');
          const passwordSpecialCharError = document.getElementById('passwordSpecialCharError');
          
          let isValid = true;
          
          // Check password length
          if (password.length < 8) {
            passwordLengthError.classList.add('error-visible');
            isValid = false;
          } else {
            passwordLengthError.classList.remove('error-visible');
          }
          
          // Check for special character
          const specialCharRegex = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;
          if (!specialCharRegex.test(password)) {
            passwordSpecialCharError.classList.add('error-visible');
            isValid = false;
          } else {
            passwordSpecialCharError.classList.remove('error-visible');
          }
          
          // Check if passwords match
          if (password !== confirmPassword) {
            passwordMatchError.classList.add('error-visible');
            isValid = false;
          } else {
            passwordMatchError.classList.remove('error-visible');
          }
          
          if (!isValid) {
            event.preventDefault();
          }
        });
      </script>
    </body>
    </html>
  `);
});

// DELETE Request

const deleteUser = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  // Check if userId is provided
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
  verifyEmail,
  loginUser,
  logoutUser,
  resendVerificationEmail,
  refreshAccessToken,
  uploadProfileImageCloudinary,
  uploadProfileImageDigitalOcean,
  userRole,
  userMumOrBusinessDetails,
  userSubscriptionDetails,
  getUserDetails,
  deleteUser,
  forgotPassword,
  resetPassword,
  renderResetPasswordForm,
  updateUserDetails,
};
