import Docker from 'dockerode';

const docker = new Docker();

export async function composeUp(courseName: string, problemID: number) {
  try {
    const allContainer = await docker.listContainers({all: true})
    for (let i = 0; i < allContainer.length; i++) {
      if (allContainer[i].Names[0].includes(`${courseName}-${problemID}`)) {
        const container = docker.getContainer(allContainer[i].Id);
        container.start();
      }
    }
  } catch (error) {
    console.log(error)
    throw error
  }
};