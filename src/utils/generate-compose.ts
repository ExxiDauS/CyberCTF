import Docker from "dockerode";

interface TemplateData {
  username: string;
  port: string;
  courseName: string;
  problemID: number;
}

const docker = new Docker();

export async function createContainer(data: TemplateData) {
  try {
    const imageName = `${data.courseName}-${data.problemID}:1.0.0`;

    console.log(`Attempting to use image: ${imageName}`);
    // Create container with options matching Docker Compose configuration
    const container = await docker.createContainer({
      Image: imageName,
      Cmd: ["/usr/sbin/sshd", "-D"],
      ExposedPorts: {
        '22/tcp': {}              // Expose SSH port as defined in Dockerfile
      },
      HostConfig: {
        PortBindings: {
          '22/tcp': [
            {
              HostPort: '2222'    // Map container port 22 to host port 2222
            }
          ]
        },
        RestartPolicy: {
          Name: 'unless-stopped'  // Optional: restart policy
        }
      },
      // Container name (optional)
      name: `${data.courseName}-${data.problemID}-${data.username}`,
      // Environment variables
      Env: [`USERNAME=${data.username}`],
    });

    return container;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to create container");
  }
}
