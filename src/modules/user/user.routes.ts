import { Router } from "express";
import UserController from "./user.controller.js";
import authentication from "../../middleware/authentication.js";

const router = Router();

router.get("/me", authentication(), UserController.getSession);
router.post("/select-role", authentication(), UserController.setRole);

export default router;
