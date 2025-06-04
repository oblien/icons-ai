import fs from 'fs';
import fsAsync from 'fs/promises';
import path from 'path';
import open from 'open';
import os from 'os';
import readline from 'readline';

// Path to store session
const CONFIG_DIR = path.join(os.homedir(), '.icons-ai');
const CONFIG_PATH = path.join(CONFIG_DIR, 'config.json');

function isLoggedIn() {
    try {
        const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
        return config && config.token;
    } catch {
        return false;
    }
}

function saveSession(token) {
    if (!fs.existsSync(CONFIG_DIR)) fs.mkdirSync(CONFIG_DIR);
    fs.writeFileSync(CONFIG_PATH, JSON.stringify({ token }, null, 2));
}

async function promptTokenInput(loginUrl) {
    console.log(`Please open the link to login:\n\n${loginUrl}\n`);
    await open(loginUrl);

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    return new Promise(resolve =>
        rl.question('Paste the token you got after login: ', token => {
            rl.close();
            resolve(token.trim());
        })
    );
}

function findPackageJson() {
    const cwd = process.cwd();
    const pkgPath = path.join(cwd, 'package.json');

    if (fs.existsSync(pkgPath)) {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
        return { dir: cwd, pkg, pkgPath };
    }

    return null;
}

async function confirmPrompt(question) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    return new Promise(resolve =>
        rl.question(question + ' (y/N): ', answer => {
            rl.close();
            resolve(answer.trim().toLowerCase() === 'y');
        })
    );
}

export async function initProject() {
    const token = isLoggedIn();
    if (!token) {
        console.log('You must log in to use this tool.');
        const loginUrl = 'https://api.oblien.com/icons/login';

        const token = await promptTokenInput(loginUrl);

        if (!token) {
            console.log('No token provided. Login aborted.');
            return;
        }

        saveSession(token);
        console.log('Login successful!');
    }

    const pkgInfo = findPackageJson();

    if (!pkgInfo) {
        console.error('Could not find package.json.');
        return;
    }

    const projectName = pkgInfo.pkg.name;
    const projectRoot = pkgInfo.dir;

    const confirmed = await confirmPrompt(`Proceed with: "${projectName}"?`);

    if (!confirmed) {
        process.exit(1);
    }

    const iconsMap = await findIconsMap(projectRoot);

    if (!iconsMap) {
        console.error('Icons map file not found in expected locations.');
        return;
    }

    console.log(iconsMap, 'Project initialized and ready.');
}


async function findIconsMap(projectRoot) {
    const fullPath = path.join(projectRoot, 'icons.config.js');
    try {
        await fsAsync.access(fullPath);
        const content = await fsAsync.readFile(fullPath, 'utf-8');
        return { path: fullPath, content };
    } catch { }

    return null;
}


// Example for other commands
export async function getIcon(description) {
    if (!isLoggedIn()) {
        console.log('❌ You must run `icons-ai init` and log in first.');
        process.exit(1);
    }

    const { token } = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));

    // Use token in API request
    const res = await fetch(`https://api.oblien.com/icons/get?desc=${encodeURIComponent(description)}`, {
        headers: { Authorization: `Bearer ${token}` }
    });

    const icon = await res.json();
    console.log('🖼️ Icon:', icon);
}

export function listApps() {
    console.log('📦 Listing all running apps...');
}

export function showLogs(appName) {
    console.log(`📜 Tailing logs for ${appName}...`);
}
