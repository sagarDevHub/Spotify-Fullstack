import { Router } from "express";
import { authCallback } from "../controllers/auth.controllers.js";

const router = Router();

router.post("/callback", authCallback);

export default router;
