import arg from "arg";
import inquirer from "inquirer";
import { createProject } from "./main";

function parseArgumentsIntoOptions(rawArgs) {
    const args = arg(
        {
            "--git": Boolean,
            "--test": Boolean,
            "--lint": Boolean,
            "--yes": Boolean,
            "--install": Boolean,
            "-g": "--git",
            "-t": "--test",
            "-l": "--lint",
            "-y": "--yes",
            "-i": "--install",
        },
        {
            argv: rawArgs.slice(2),
        }
    );

    return {
        skipPrompts: args["--yes"] || false,
        git: args["--git"] || false,
        template: args._[0],
        runInstall: args["--install"] || false,
    };
}

async function promptForMissingOptions(options) {
    const defaultTemplate = "TypeScript";
    if (options.skipPrompts) {
        return {
            ...options,
            template: options.template || defaultTemplate,
        };
    }

    const questions = [];
    if (!options.template) {
        questions.push({
            type: "list",
            name: "template",
            message: "Please choose which project template to use",
            choices: ["JavaScript", "TypeScript"],
            default: defaultTemplate,
        });
    }

    if (!options.git) {
        questions.push({
            type: "confirm",
            name: "git",
            message: "Initialize a git repository?",
            default: false,
        });
    }

    const answars = await inquirer.prompt(questions);
    return {
        ...options,
        template: options.template || answars.template,
        git: options.git || answars.git,
    };
}

export async function cli(args) {
    let options = parseArgumentsIntoOptions(args);
    options = await promptForMissingOptions(options);
    await createProject(options);
}
