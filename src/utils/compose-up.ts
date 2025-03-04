import exec from "child_process";

interface ComposeUpOptions {
    composePath: string;
}

export function composeUp(composePath: ComposeUpOptions) {
  exec.exec(
    `docker-compose -f ${composePath} up -d`,
    (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        return;
      }
      console.log(`stdout: ${stdout}`);
      console.error(`stderr: ${stderr}`);
    }
  );
}
