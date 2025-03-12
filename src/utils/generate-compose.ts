import Docker from "dockerode";
import crypto from "crypto";
import * as net from "net";

interface TemplateData {
  username: string;
  problemName: string;
  problemID: number;
  port?: string; // Keep port optional for compatibility
}

const docker = new Docker();

/**
 * Checks if a port is available (not in use)
 * @param port The port number to check
 * @returns Promise that resolves to true if port is available, false otherwise
 */
function isPortAvailable(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const server = net.createServer();

    server.once("error", (err: NodeJS.ErrnoException) => {
      if (err.code === "EADDRINUSE") {
        resolve(false);
      } else {
        resolve(false);
      }
    });

    server.once("listening", () => {
      server.close();
      resolve(true);
    });

    server.listen(port);
  });
}

/**
 * Gets a random number between min and max (inclusive)
 */
function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function findRandomAvailablePort(
  minPort: number = 1,
  maxPort: number = 65535,
  maxAttempts: number = 60000
): Promise<number | null> {
  const attemptedPorts = new Set<number>();

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    // Generate a random port that hasn't been tried yet
    let port: number;
    do {
      port = getRandomInt(minPort, maxPort);
    } while (attemptedPorts.has(port));

    attemptedPorts.add(port);

    if (await isPortAvailable(port)) {
      return port;
    }
  }

  // If we've tried many ports and none are available, try sequentially as a fallback
  for (let port = minPort; port <= maxPort; port++) {
    if (!attemptedPorts.has(port) && (await isPortAvailable(port))) {
      return port;
    }
  }

  return null; // No available ports found
}

export async function createContainer(data: TemplateData) {
  try {
    const imageName = `${data.problemName}-${data.problemID}:1.0.0`;
    const image = await docker.getImage(imageName).inspect();
    const imagePorts = Object.keys(image.Config.ExposedPorts);
    const containerPort = imagePorts[0];

    // Find random available port
    const availablePort = await findRandomAvailablePort();
    if (!availablePort) {
      throw new Error("No available ports found in the specified range");
    }
    const hostPort = availablePort.toString();
    console.log(`Using random available port: ${hostPort}`);

    const flag =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let randomCharacters = "";
    for (let i = 0; i < 10; i++) {
      randomCharacters += flag.charAt(Math.floor(Math.random() * flag.length));
    }
    const hash = crypto
      .createHash("md5")
      .update(randomCharacters)
      .digest("hex");

    console.log(`Attempting to use image: ${imageName}`);
    // Create container with options matching Docker Compose configuration
    const container = await docker.createContainer({
      Image: imageName,
      Cmd: image.Config.Cmd,
      ExposedPorts: {
        [containerPort]: {},
      },
      HostConfig: {
        PortBindings: {
          [containerPort]: [
            {
              HostPort: hostPort,
            },
          ],
        },
        RestartPolicy: {
          Name: "unless-stopped",
        },
      },
      name: `${data.problemName}-${data.problemID}-${data.username}`,
      Env: [
        `SSH_USER=user${data.username}`,
        `SSH_PASSWORD=pass${data.username}`,
        `FLAG=${randomCharacters}`,
      ],
    });

    return {
      container: container.id,
      flag: hash,
      sshuser: `user${data.username}`,
      sshpass: `pass${data.username}`,
      port: hostPort,
    };
  } catch (error) {
    console.error(error);
    throw new Error("Failed to create container");
  }
}
