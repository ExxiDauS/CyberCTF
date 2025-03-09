import { Router } from "express";
import { postComposeUp, postCreateContainer } from "../handlers/docker";
import { postBuildImage } from "../handlers/docker";

const router = Router();

router.post("/create-compose", postCreateContainer);
router.post("/build-image", postBuildImage);
router.post("/compose-up", postComposeUp);

// router.get("/compose-up", getComposeUp);

export default router;