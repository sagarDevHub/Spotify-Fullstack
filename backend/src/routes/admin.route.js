import { Router } from "express";
import {
  checkAdmin,
  createAlbum,
  createSong,
  deleteAlbum,
  deleteSong,
} from "../controllers/admin.controller.js";
import { protectRoute, requireAdmin } from "../middleware/auth.middleware.js";

const router = Router();

router.use(protectRoute, requireAdmin);

router.get("/check", checkAdmin);

// Routes for songs -->
router.post("/songs", createSong);
router.delete("/songs/:id", deleteSong);

// Routes for albums -->
router.post("/albums", createAlbum);
router.delete("/albums/:id", deleteAlbum);

export default router;
