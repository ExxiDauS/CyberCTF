import { Request, Response } from "express";
import { createContainer } from "../utils/generate-compose";
import { buildImage } from "../utils/build-image";
import { composeUp } from "../utils/compose-up";
import { GenerateDockerComposeParams } from "../types/query-params";
import { uploadImage } from "../utils/upload-image";
import { composeDown } from "../utils/compose-down";

interface TemplateData {
  username: string;
  problemName: string;
  problemID: number;
}

export async function postCreateContainer(
  req: Request<{}, {}, GenerateDockerComposeParams>,
  res: Response
) {
  try {
    const data: TemplateData = {
      username: req.body.username,
      problemName: req.body.problemName,
      problemID: req.body.problemID,
    };
    const container = await createContainer(data);
    res.status(200).send(container);
  } catch (error) {
    res.status(500).send(error);
  }
}

export async function postBuildImage(
  req: Request<{}, {}, GenerateDockerComposeParams>,
  res: Response
) {
  try {
    await buildImage(
      `${req.body.problemName}-${req.body.problemID}.tar`,
      req.body.problemName,
      req.body.problemID
    );
    res.status(200).send("Image built successfully");
  } catch (error) {
    res.status(500).send(error);
  }
}

export async function postComposeUp(
  req: Request<{}, {}, GenerateDockerComposeParams>,
  res: Response
) {
  try {
    await composeUp(
      req.body.username,
      req.body.problemName,
      req.body.problemID
    );
    res.status(200).send("Compose up successfully");
  } catch (error) {
    res.status(500).send(error);
  }
}

export async function postComposeDown(
  req: Request<{}, {}, GenerateDockerComposeParams>,
  res: Response
) {
  try {
    await composeDown(
      req.body.username,
      req.body.problemName,
      req.body.problemID
    );
    res.status(200).send("Compose down successfully");
  } catch (error) {
    res.status(500).send(error);
  }
}

export const postUploadImage = async (
  req: Request,
  res: Response
): Promise<void> => {
  if (!req.file) {
    res.status(400).send("No file uploaded");
    return;
  }

  try {
    const problemID = parseInt(req.body.problemID as string);
    const result = await uploadImage(
      req.file,
      req.body.problemName as string,
      problemID
    );

    if (result.success) {
      res.json({
        message: "File uploaded successfully",
        location: result.location,
        key: result.key,
      });
    } else {
      res.status(500).json({ error: result.error || "Upload failed" });
    }
  } catch (error) {
    console.error("Error in upload handler:", error);
    res.status(500).json({
      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
};