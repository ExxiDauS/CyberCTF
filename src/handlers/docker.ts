import { Request, Response } from "express";
import { generateDockerComposeFile } from "../utils/generate-compose";
import { GenerateDockerComposeParams } from "../types/query-params";
import { composeUp } from "../utils/compose-up";

export function getGenerateDockerCompose(
  req: Request<{}, {}, {}, GenerateDockerComposeParams>,
  res: Response
) {
  generateDockerComposeFile(
    { username: req.query.username, port: req.query.port },
    {
      outputPath: `./docker-compose/${req.query.course}/docker-compose-${req.query.username}-${req.query.course}`,
    }
  );
  res.send("Hello World");
}

export function getComposeUp(
  req: Request<{}, {}, {}, { username: String; courseID: String }>,
  res: Response
) {
  composeUp({
    composePath: `./docker-compose/${req.query.courseID}/docker-compose-${req.query.username}-${req.query.courseID}.yml`,
  });
  res.send("Compose up");
}
