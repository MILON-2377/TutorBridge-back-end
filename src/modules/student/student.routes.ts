import { Router } from "express";
import authentication from "../../middleware/authentication.js";
import StudentController from "./student.controller.js";

const router = Router();

router.use(authentication("STUDENT"));

export default router;
