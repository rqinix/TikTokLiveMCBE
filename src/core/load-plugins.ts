import fs from "fs";
import path, { dirname } from "path";
import chalk from "chalk";
import inquirer from "inquirer";
import { fileURLToPath, pathToFileURL } from "url";
import { TikTokLiveMcbe } from "./tiktok-live-mcbe.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Loads all plugins from the plugins directory.
 * @param tiktokLiveMCBE The TikTokLiveMCBE instance.
 * @returns A promise that resolves when all plugins are loaded.
 */
export async function loadPlugins(
    tiktokLiveMCBE: TikTokLiveMcbe
): Promise<void> {
    const pluginsDir = path.join(__dirname, "..", "plugins");
    const pluginsFolder = fs
    .readdirSync(pluginsDir)
    .filter((file) => fs.statSync(path.join(pluginsDir, file)).isDirectory());

    const plugins = pluginsFolder
    .map((folder) => {
        const pluginFolder = path.join(pluginsDir, folder);
        const manifestPath = path.join(pluginsDir, folder, "manifest.json");
        const mainPath = path.join(pluginsDir, folder, "main.js");

        if (!fs.existsSync(manifestPath) || !fs.existsSync(mainPath)) return null;

        const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));

        if (!isManifestValid(manifest, folder)) {
            console.warn(
                chalk.yellow(`Plugin ${folder} has an invalid manifest file.`)
            );
            return null;
        }

        return {
            name: `${manifest.name} v${manifest.version} by ${manifest.author}: ${manifest.description}`,
            short: `${manifest.name} by ${manifest.author}`,
            value: pluginFolder,
        };
    })
    .filter((plugin) => plugin !== null);

    const { selectedPlugins } = await inquirer.prompt([
        {
            type: "checkbox",
            name: "selectedPlugins",
            message: "Select plugins to activate:",
            choices: plugins,
            validate: () => true,
        },
    ]);

    if (selectedPlugins.length === 0) {
        console.log(chalk.yellow("Proceeding without plugins."));
        return;
    }

    for (const plugin of selectedPlugins) {
        const manifest = JSON.parse(
            fs.readFileSync(path.join(plugin, "manifest.json"), "utf-8")
        );
        try {
            const mainPath = path.join(plugin, "main.js");
            const { plugin: loadPlugin } = await import(pathToFileURL(mainPath).href);
            loadPlugin(tiktokLiveMCBE);
        } catch (error) {
            console.error(
                chalk.red(`Failed to load plugin: ${manifest.name}`),
                error.message
            );
        }
    }
}

/**
 * Validates a plugin manifest.
 * @param manifest The plugin manifest.
 * @param folder The plugin folder.
 * @returns True if the manifest is valid, false otherwise.
 */
function isManifestValid(manifest, folder): boolean {
    const requiredFields = ["name", "description", "version", "author"];
    const semverRegex = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|[0-9]*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|[0-9]*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;

    for (const field of requiredFields) {
        if (!manifest[field]) {
            console.warn(
                chalk.yellow(`Plugin ${folder} is missing required field: ${field}`)
            );
            return false;
        }
    }

    if (!semverRegex.test(manifest.version)) {
        console.warn(
            chalk.yellow(`Plugin ${folder} has an invalid version: ${manifest.version}`)
        );
        return false;
    }

    return true;
}