import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import Admin from "../models/admin.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerAdmin = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  const superAdminId = req.params.id;

  // Validate superadmin existence and role
  const superAdmin = await Admin.findById(superAdminId);

  if (!superAdmin || superAdmin.role !== "superadmin") {
    throw new ApiError(403, "Only Super Admin can create a new admin");
  }

  if (!firstName || !lastName || !email || !password) {
    throw new ApiError(400, "All fields are required");
  }

  const existingAdmin = await Admin.findOne({ email });

  if (existingAdmin) {
    throw new ApiError(409, "Admin already exists");
  }

  const newAdmin = await Admin.create({
    firstName,
    lastName,
    email,
    password,
    // role: "admin",
  });

  const createdAdmin = await Admin.findById(newAdmin._id).select(
    "-password -refreshToken"
  );

  if (!createdAdmin) {
    throw new ApiError(500, "Something went wrong while registering the admin");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdAdmin, "Admin registered successfully"));
});

export { registerAdmin };
