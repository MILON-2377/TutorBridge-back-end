import { Router } from "express";
import TutorController from "./tutor.controller.js";
import authentication from "../../middleware/authentication.js";

const router = Router();

router.get("/", authentication(), TutorController.getTutors);

router.use(authentication());

router.post("/", TutorController.createTutor);

router.post("/", TutorController.createTutor);
router.get("/:id", TutorController.getTutorById);
// router.patch("/:id", TutorController.updateTutor);
router.delete("/:id", TutorController.deleteTutor);

router.post("/availability", TutorController.createAvailability);
router.post(
  "/availability/:id/generate",

  TutorController.generateAvailabilitySlots,
);
router.get("/availability", TutorController.getTutorAvailability);
router.patch(
  "/availability/:id",

  TutorController.toggleAvailabilityRule,
);
router.delete(
  "/availability/:id",

  TutorController.deleteAvailabilityRule,
);

export default router;
