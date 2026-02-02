import { Router } from "express";
import AuthController from "./auth.controller.js";

const router = Router();

router.post("/sign-out", AuthController.signOut);

export default router;
