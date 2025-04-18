import { Router } from "express";
import { postComposeDown, postComposeUp, postCreateContainer, postUploadImage } from "../controllers/docker";
import { postBuildImage } from "../controllers/docker";
import multer from "multer";

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 20 * 1024 * 1024, // 10MB limit
  },
});

const router = Router();

router.post("/create-compose", postCreateContainer);
router.post("/build-image", postBuildImage);
router.post("/compose-up", postComposeUp);
router.post("/compose-down", postComposeDown);
router.post("/upload-image", upload.single("file"), postUploadImage);
// router.get("/compose-up", getComposeUp);

export default router;