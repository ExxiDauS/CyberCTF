import Docker from 'dockerode';

const docker = new Docker();

export async function composeUp(userName: string, problemName: string, problemID: number) {
  try {
    const allContainer = await docker.listContainers({all: true})
    for (let i = 0; i < allContainer.length; i++) {
      if (allContainer[i].Names[0].includes(`${problemName}-${problemID}-${userName}`)) {
        const container = docker.getContainer(allContainer[i].Id);
        const res = await container.start();
        return {mssage: "Container started successfully", res};
      }
    }
  } catch (error) {
    console.log(error)
    throw error
  }
};