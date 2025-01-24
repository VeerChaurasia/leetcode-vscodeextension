import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import {extractTitleSlug} from '../commands/fetchtestcases'
// import { url } from 'inspector';
export function DirectoryExists(directory: string): void {
    if (!fs.existsSync(directory)) {
        fs.mkdirSync(directory, { recursive: true });
    }
}
export async function createCodeFile(language: string, folderPath: string,) {
    // Logic to create a code file with the given language, problem URL, and folder
    const fileName = `solution.${language === 'python' ? 'py' : 'cpp'}`;
    const fileUri = vscode.Uri.file(path.join(folderPath, fileName));
    const codeContent = `# Code for LeetCode problem:`;

    try {
        await vscode.workspace.fs.writeFile(fileUri, Buffer.from(codeContent, 'utf-8'));
        vscode.window.showInformationMessage(`Code file created: ${fileUri.fsPath}`);
    } catch (error) {
        vscode.window.showErrorMessage(`Failed to create file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}