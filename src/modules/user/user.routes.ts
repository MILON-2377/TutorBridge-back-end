import { Router } from "express";
import UserController from "./user.controller.js";
import authentication from "../../middleware/authentication.js";

const router = Router();

router.post("/select-role", authentication(), UserController.setRole);

export default router;
