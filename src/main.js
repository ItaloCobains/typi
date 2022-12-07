import chalk from "chalk";
import fs from "fs";
import ncp from "ncp";
import path from "path";
import { promisify } from "util";

const access = promisify(fs.access);
const copy = promisify(ncp);

async function copyTemplateFiles(options) {
    return copy(options.templateDirectory, options.targetDirectory, {
        clobber: false,
    });
}

async function resolveDir(dir, template) {
    let templateDir = path.resolve(
        new URL(dir).pathname,
        "../../templates",
        template
    );

    templateDir = templateDir.replace(`${templateDir[0]}:\\`, "");

    console.log(templateDir);

    return templateDir;
}

export async function createProject(options) {
    options = {
        ...options,
        targetDirectory: options.targetDirectory || process.cwd(),
    };

    const currentFileUrl = import.meta.url;
    const templateDir = await resolveDir(
        currentFileUrl,
        options.template.toLowerCase()
    );
    options.templateDirectory = templateDir;
    try {
        await access(templateDir, fs.constants.R_OK);
    } catch (err) {
        console.log("%s Invalid template name", chalk.red.bold("ERROR"));
        process.exit(1);
    }

    console.log("Copy project files");
    await copyTemplateFiles(options);
    console.log("%s Project ready", chalk.green.bold("DONE"));
    return true;
}
