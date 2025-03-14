import Docker from "dockerode";

const docker = new Docker();

export async function composeDown(
  userName: string,
  problemName: string,
  problemID: number
) {
  try {
    const allContainer = await docker.listContainers({ all: true });
    for (let i = 0; i < allContainer.length; i++) {
      if (
        allContainer[i].Names[0].includes(
          `${problemName}-${problemID}-${userName}`
        )
      ) {
        const container = docker.getContainer(allContainer[i].Id);
        const res = await container.stop();
        const res2 = await container.remove();
        console.log(res, res2);
      }
    }
  } catch (error) {
    console.log(error);
    throw error;
  }
}
