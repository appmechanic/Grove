import { Router } from "express";
import {
  deleteUser,
  getUserDetails,
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
  uploadProfileImage,
  userMumOrBusinessDetails,
  userRole,
  userSubscriptionDetails,
} from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.route("/register").post(registerUser);

router.route("/login").post(loginUser);

// Secure Routes
router
  .route("/upload-avatar")
  .post(
    verifyJWT,
    upload.fields([{ name: "avatar", maxCount: 1 }]), // avatar must be same name as in the frontend
    uploadProfileImage
  );
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/user-role").post(verifyJWT, userRole);
router.route("/user-description").post(verifyJWT, userMumOrBusinessDetails);
router.route("/user-subscription").post(verifyJWT, userSubscriptionDetails);
router.route("/user-details").get(verifyJWT, getUserDetails);
router.route("/user-delete").delete(verifyJWT, deleteUser);

export default router;
