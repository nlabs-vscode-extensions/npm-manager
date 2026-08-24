import * as vscode from 'vscode';
import { NpmManagerPanel } from './panel';
import { isNodeAvailable } from './packageJsonParser';

export async function activate(context: vscode.ExtensionContext) {
    const hasNode = await isNodeAvailable();
    if (!hasNode) {
        vscode.window.showErrorMessage('nLabs NPM Manager: Node.js bulunamadı. Lütfen Node.js kurulu olduğundan emin olun.');
    }

    context.subscriptions.push(
        vscode.commands.registerCommand('nlabs-npm.openManager', async (uri?: vscode.Uri) => {
            let target = uri ?? vscode.window.activeTextEditor?.document.uri;
            if (!target && vscode.workspace.workspaceFolders?.length) {
                target = vscode.workspace.workspaceFolders[0].uri;
            }
            if (!target) {
                vscode.window.showWarningMessage('Bir package.json veya klasör seçin.');
                return;
            }
            const resolved = await resolveFromUri(target);
            if (!resolved) {
                vscode.window.showWarningMessage('Bu konumda package.json bulunamadı.');
                return;
            }
            NpmManagerPanel.createOrShow(context.extensionUri, resolved);
        })
    );
}

export function deactivate() {}

async function resolveFromUri(uri: vscode.Uri): Promise<vscode.Uri | undefined> {
    const stat = await vscode.workspace.fs.stat(uri);
    if (stat.type === vscode.FileType.File) {
        return uri.fsPath.endsWith('package.json') ? uri : undefined;
    }
    // Directory: find package.json
    const files = await vscode.workspace.findFiles(
        new vscode.RelativePattern(uri, 'package.json'), '**/node_modules/**', 1
    );
    if (files.length) { return files[0]; }
    // Workspace-wide search
    const all = await vscode.workspace.findFiles('**/package.json', '**/node_modules/**', 5);
    const skip = new Set(['node_modules', '.git', 'dist', 'build', '.next', '.nuxt']);
    const filtered = all.filter(f => !f.fsPath.split(/[\\/]/).some(p => skip.has(p.toLowerCase())));
    return filtered.sort((a, b) => a.fsPath.length - b.fsPath.length)[0];
}
