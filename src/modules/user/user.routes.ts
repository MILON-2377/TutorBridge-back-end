import { Router } from "express";
import UserController from "./user.controller.js";
import authentication from "../../middleware/authentication.js";

const router = Router();

router.use(authentication());

router.get("/me",  UserController.getSession);
router.post("/select-role",  UserController.setRole);


router.patch("/profile", UserController.updateProfile);

export default router;
