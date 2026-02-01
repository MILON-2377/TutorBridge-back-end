import { Router } from "express";
import CategoryController from "./category.controller.js";
import authentication from "../../middleware/authentication.js";

const router = Router();

router.use(authentication());

router.get("/", CategoryController.getCategories)
router.post("/", CategoryController.createCategory);
router.put("/:id", CategoryController.updateCategory);
router.delete("/:id", CategoryController.deleteCategory)

export default router;
