import { Request, Response } from "express";
import { createContainer } from "../utils/generate-compose";
import { buildImage } from "../utils/build-image";
import { composeUp } from "../utils/compose-up";
import { GenerateDockerComposeParams } from "../types/query-params";

interface TemplateData {
  username: string;
  port: string;
  courseName: string;
  problemID: number;
}

export async function postCreateContainer(req: Request<{}, {}, {}, GenerateDockerComposeParams>, res: Response) {
  try {
    const data: TemplateData= {
      username: req.query.username,
      port: req.query.port,
      courseName: req.query.courseName,
      problemID: req.query.problemID,
    };
    const container = await createContainer(data);
    res.status(200).send(container);
  } catch (error) {
    res.status(500).send(error);
  }
}

export async function postBuildImage(req: Request, res: Response) {
  try {
    await buildImage("Test-Course.tar", "test-course", 1);
    res.status(200).send("Image built successfully");
  } catch (error) {
    res.status(500).send(error);
  }
}

export async function postComposeUp(req: Request<{}, {}, {}, GenerateDockerComposeParams>, res: Response) {
  try {
    await composeUp(req.query.courseName, req.query.problemID);
    res.status(200).send("Compose up successfully");
  } catch (error) {
    res.status(500).send(error);
  }
}