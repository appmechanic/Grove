import { Router } from "express";
import { registerAdmin } from "../controllers/admin.controller.js";

const router = Router();

router.route("/register/:id").post(registerAdmin);


export default router;