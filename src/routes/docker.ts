import { Router } from "express";
import exec from "child_process";
import { generateDockerComposeFile } from "../utils/generate-compose";

const router = Router();

router.get("/generate-compose", (req, res) => {
  generateDockerComposeFile(
    { username: "66070001", port: "2222" },
    { outputPath: `./src/docker-compose-66070001-course01` }
  );
  res.send("Hello World");
});

router.get("/compose-up", (req, res) => {
    const composePath = `./src/docker-compose-66070001-course01/docker-compose-66070001.yml`;
    exec.exec(`docker-compose -f ${composePath} up -d`, (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        return;
      }
      console.log(`stdout: ${stdout}`);
      console.error(`stderr: ${stderr}`);
    });
    res.send("Compose up");
})


export default router;