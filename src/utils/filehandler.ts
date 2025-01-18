import * as vscode from 'vscode';
import * as path from 'path';

interface TestCase {
    input: string;
    output: string;
}

async function getBaseUri(): Promise<vscode.Uri> {
    // Try to get workspace folder first
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (workspaceFolder) {
        return workspaceFolder.uri;
    }

    // Try to get the directory of the active file
    const activeEditor = vscode.window.activeTextEditor;
    if (activeEditor) {
        return vscode.Uri.file(path.dirname(activeEditor.document.uri.fsPath));
    }

    // If no workspace or active file, ask user to select a folder
    const folderUri = await vscode.window.showOpenDialog({
        canSelectFiles: false,
        canSelectFolders: true,
        canSelectMany: false,
        title: 'Select folder to save test cases'
    });

    if (!folderUri || folderUri.length === 0) {
        throw new Error('No folder selected to save test cases');
    }

    return folderUri[0];
}

async function ensureDirectoryExists(baseUri: vscode.Uri, directory: string): Promise<vscode.Uri> {
    try {
        const dirUri = vscode.Uri.joinPath(baseUri, directory);
        
        try {
            await vscode.workspace.fs.stat(dirUri);
        } catch {
            // Directory doesn't exist, create it
            await vscode.workspace.fs.createDirectory(dirUri);
        }
        
        console.log(`Directory ensured at: ${dirUri.fsPath}`);
        return dirUri;
    } catch (error) {
        console.error(`Error creating directory: ${error instanceof Error ? error.message : 'Unknown error'}`);
        throw error;
    }
}

export async function saveTestCases(testCases: TestCase[], directory: string): Promise<void> {
    if (!Array.isArray(testCases) || testCases.length === 0) {
        throw new Error('No valid test cases provided');
    }

    try {
        // Get base URI (workspace, active file directory, or user-selected folder)
        const baseUri = await getBaseUri();
        
        // Clean up directory path
        const cleanDirectory = directory.replace(/^\/+|\/+$/g, '');
        
        // Create directory structure
        const dirUri = await ensureDirectoryExists(baseUri, cleanDirectory);
        console.log(`📁 Creating test case files in: ${dirUri.fsPath}`);

        await Promise.all(
            testCases.map(async (testCase, index) => {
                const inputUri = vscode.Uri.joinPath(dirUri, `input_${index + 1}.txt`);
                const outputUri = vscode.Uri.joinPath(dirUri, `output_${index + 1}.txt`);

                await Promise.all([
                    vscode.workspace.fs.writeFile(
                        inputUri,
                        Buffer.from(testCase.input, 'utf-8')
                    ),
                    vscode.workspace.fs.writeFile(
                        outputUri,
                        Buffer.from(testCase.output, 'utf-8')
                    )
                ]);
            })
        );

        // Show success message to user
        vscode.window.showInformationMessage(
            `Successfully saved ${testCases.length} test cases in ${dirUri.fsPath}`
        );
        
        console.log(`✅ Successfully saved ${testCases.length} test cases in: ${dirUri.fsPath}`);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        vscode.window.showErrorMessage(`Failed to save test cases: ${errorMessage}`);
        throw new Error(`Failed to save test cases: ${errorMessage}`);
    }
}