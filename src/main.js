import chalk from "chalk";
import { exec } from "child_process";
import fs from "fs";
import Listr from "listr";
import ncp from "ncp";
import path from "path";
import { projectInstall } from "pkg-install";
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

async function initGit(options) {
    exec("git init", (err, stdout, stderr) => {
        if (err) {
            return Promise.reject(new Error("Failed to initialize git"));
        }
    });
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

    const tasks = new Listr([
        {
            title: "Copy project files",
            task: () => copyTemplateFiles(options),
        },
        {
            title: "Initialize git",
            task: () => initGit(options),
            enabled: () => options.git,
        },
        {
            title: "Install dependencies",
            task: () =>
                projectInstall({
                    cwd: options.targetDirectory,
                }),
            skip: () =>
                !options.runInstall
                    ? "Pass --install to automatically install dependencies"
                    : undefined,
        },
    ]);

    await tasks.run();

    console.log("%s Project ready", chalk.green.bold("DONE"));
    return true;
}
