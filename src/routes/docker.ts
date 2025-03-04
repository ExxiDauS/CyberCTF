import { Router } from "express";
import { getGenerateDockerCompose, getComposeUp } from "../handlers/docker";

const router = Router();

router.get("/generate-compose", getGenerateDockerCompose);

router.get("/compose-up", getComposeUp);

export default router;