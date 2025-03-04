import * as fs from "fs";
import * as path from "path";
import * as ejs from "ejs";

interface TemplateData {
  username: string;
  port: string;
  courseName: string;
}

interface GeneratorOptions {
  outputPath?: string;
}

export function generateDockerComposeFile(
  data: TemplateData,
  options: GeneratorOptions = {}
): string {
  // Get template
  const templatePath: string = path.join(
    __dirname,
    "templates",
    "docker-compose-template.yml"
  );
  const templateStr: string = fs.readFileSync(templatePath, "utf8");

  const dockerTemplatePath: string = path.join(
    __dirname,
    "templates",
    "Dockerfile"
  );
  const dockerTemplateStr: string = fs.readFileSync(dockerTemplatePath, "utf8");

  // Render template with data
  const renderedCompose: string = ejs.render(templateStr, data);

  const renderedDocker: string = ejs.render(dockerTemplateStr, data);

  // Determine output path
  const outputPath = options.outputPath || __dirname;

  const composeFilename: string = path.join(
    outputPath,
    `docker-compose-${data.username}-${data.courseName}.yml`
  );

  const dockerFilename: string = path.join(
    outputPath,
    `Dockerfile-${data.username}`
  );

  // Ensure output directory exists
  const outputDir = path.dirname(composeFilename);
  const dockerOutputDir = path.dirname(dockerFilename);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
    fs.mkdirSync(dockerOutputDir, { recursive: true });
  }

  // Write file
  fs.writeFileSync(composeFilename, renderedCompose);
  fs.writeFileSync(dockerFilename, renderedDocker);
  console.log(`Generated compose file: ${composeFilename}`);
  console.log(`Generated Dockerfile: ${dockerFilename}`);

  return composeFilename;
}
