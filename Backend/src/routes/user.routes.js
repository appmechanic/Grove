import { Router } from "express";
import {
  deleteUser,
  forgotPassword,
  getUserDetails,
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
  renderResetPasswordForm,
  resendVerificationEmail,
  resetPassword,
  updateUserDetails,
  uploadProfileImageCloudinary,
  uploadProfileImageDigitalOcean,
  userMumOrBusinessDetails,
  userRole,
  userSubscriptionDetails,
  verifyEmail,
} from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { uploadSingle } from "../middlewares/multer.middleware.js";

const router = Router();

router.route("/register").post(registerUser);

router.route("/verify-email/:token").get(verifyEmail);

router.route("/resend-verification-email").post(resendVerificationEmail);

router.route("/forgot-password").post(forgotPassword);

router.route("/reset-password/:token").get(renderResetPasswordForm);

router.route("/reset-password").post(resetPassword);

router.route("/login").post(loginUser);

// Secure Routes
router.route("/upload-avatar").post(
  verifyJWT,
  uploadSingle("avatar"), // avatar must be same name as in the frontend
  uploadProfileImageDigitalOcean
);
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/user-role").post(verifyJWT, userRole);
router.route("/user-description").post(verifyJWT, userMumOrBusinessDetails);
router.route("/user-subscription").post(verifyJWT, userSubscriptionDetails);
router.route("/user-details").get(verifyJWT, getUserDetails);
router.route("/update-user").patch(verifyJWT, updateUserDetails);
router.route("/user-delete").delete(verifyJWT, deleteUser);


export default router;
