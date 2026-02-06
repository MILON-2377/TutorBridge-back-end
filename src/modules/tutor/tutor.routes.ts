import { Router } from "express";
import TutorController from "./tutor.controller.js";
import authentication from "../../middleware/authentication.js";

const router = Router();

/* =========================
   Protected Routes
========================= */
router.use(authentication());

/* ===== Availability (PUT THESE FIRST) ===== */
router.get("/availability", TutorController.getTutorAvailability);
router.get("/availability/:id", TutorController.getAvailabilityById);
router.get("/availability/slots/:id", TutorController.getAvailabilitySlots);
router.post("/availability", TutorController.createAvailability);
router.put("/availability/:id", TutorController.updateAvailabilityRule);
router.patch("/availability/:id", TutorController.toggleAvailabilityRule);

router.delete("/availability/:id", TutorController.deleteAvailabilityRule);

/* ===== Tutor ===== */
router.get("/", TutorController.getTutors);
router.post("/", TutorController.createTutor);
router.get("/:id", TutorController.getTutorById);
router.delete("/:id", TutorController.deleteTutor);

export default router;
