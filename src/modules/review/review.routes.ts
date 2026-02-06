import { Router } from "express";
import authentication from "../../middleware/authentication.js";
import ReviewController from "./review.controller.js";

const router = Router();

router.use(authentication("STUDENT"));
router.post("/:id", ReviewController.createReview);

export default router;
