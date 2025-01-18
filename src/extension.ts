import * as vscode from 'vscode';
import { fetchTestCases } from './commands/fetchtestcases'; // Import fetchTestCases
// import { runTestCases } from './commands/runtestcases'; // Import runTestCases
import {createCodeFile} from './utils/createCodeFile'
import {DirectoryExists} from './utils/createCodeFile'

export function activate(context: vscode.ExtensionContext) {
    console.log('Competitive Programming Helper is now active.');
    const helloWorldCommand = vscode.commands.registerCommand(
        'cph.helloWorld',
        () => {
            vscode.window.showInformationMessage('Hello World from LeetCode Helper!');
        }
    );
    
    // Register command for fetching test cases
    const fetchTestCasesCommand = vscode.commands.registerCommand(
        'leetcode-cph.fetchTestCases',
        async () => {
            // Prompt user for LeetCode problem URL
            const problemUrl = await vscode.window.showInputBox({
                prompt: 'Enter the LeetCode problem URL',
                placeHolder: 'https://leetcode.com/problems/two-sum/',
            });

            if (problemUrl) {
                try {
                    await fetchTestCases(problemUrl); // Call fetchTestCases with the URL provided
                    vscode.window.showInformationMessage('Test cases fetched and saved successfully!');
                } catch (error) {
                    if (error instanceof Error) {
                        vscode.window.showErrorMessage(`Error: ${error.message}`);
                    } else {
                        vscode.window.showErrorMessage('An unknown error occurred.');
                    }
                }
            } else {
                vscode.window.showWarningMessage('No URL provided. Command aborted.');
            }
        }
    );
    const createCodeFileCommand = vscode.commands.registerCommand('leetcode-cph.createCodeFile', async () => {
        // Try to get the workspace folder first
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        let folderUri: vscode.Uri;

        // If no workspace is open, ask the user to select a folder
        if (!workspaceFolder) {
            const folderUriArray = await vscode.window.showOpenDialog({
                canSelectFiles: false,
                canSelectFolders: true,
                canSelectMany: false,
                title: 'Select a folder to create the code file',
            });

            if (!folderUriArray || folderUriArray.length === 0) {
                vscode.window.showErrorMessage('No folder selected. Command aborted.');
                return;
            }
            folderUri = folderUriArray[0]; // Take the first selected folder
        } else {
            folderUri = workspaceFolder.uri;
        }

        // Ask the user to choose a language
        const languageChoice = await vscode.window.showQuickPick(
            ['C++', 'Python'],
            { placeHolder: 'Choose a language for the code file' }
        );

        if (languageChoice) {
            // Prompt for problem URL
            const problemUrl = await vscode.window.showInputBox({
                prompt: 'Enter the LeetCode problem URL',
                placeHolder: 'https://leetcode.com/problems/two-sum/',
            });

            if (problemUrl) {
                // Now create the code file in the selected folder
                createCodeFile(languageChoice.toLowerCase(), folderUri.fsPath, problemUrl);
            } else {
                vscode.window.showWarningMessage('No URL provided. Command aborted.');
            }
        }
    });

    // const runTestCasesCommand = vscode.commands.registerCommand(
    //     'leetcode-cph.runTestCases',
    //     async () => {
    //         // Prompt user for file containing the solution code
    //         const fileUri = await vscode.window.showOpenDialog({
    //             canSelectFiles: true,
    //             canSelectFolders: false,
    //             filters: {
    //                 'JavaScript': ['js'],
    //                 'Python': ['py'],
    //                 'C++': ['cpp'],
    //             },
    //         });

    //         if (fileUri && fileUri[0]) {
    //             try {
    //                 const filePath = fileUri[0].fsPath;
    //                 const language = filePath.split('.').pop()?.toLowerCase() || '';
    //                 // Here you can add logic for identifying the language based on file extension

    //                 const problemUrl = await vscode.window.showInputBox({
    //                     prompt: 'Enter the LeetCode problem URL',
    //                     placeHolder: 'https://leetcode.com/problems/two-sum/',
    //                 });

    //                 if (!problemUrl) {
    //                     vscode.window.showWarningMessage('No URL provided. Command aborted.');
    //                     return;
    //                 }

    //                 const testCases = await fetchTestCases(problemUrl); // Assuming you've fetched the test cases already
    //                 await runTestCases(filePath, language, testCases); // Run test cases for the provided solution
    //                 vscode.window.showInformationMessage('Test cases executed successfully!');
    //             } catch (error) {
    //                 if (error instanceof Error) {
    //                     vscode.window.showErrorMessage(`Error: ${error.message}`);
    //                 } else {
    //                     vscode.window.showErrorMessage('An unknown error occurred.');
    //                 }
    //             }
    //         } else {
    //             vscode.window.showWarningMessage('No file selected. Command aborted.');
    //         }
    //     }
    // );

   
    context.subscriptions.push(fetchTestCasesCommand,helloWorldCommand,createCodeFileCommand);
}

export function deactivate() {
    console.log('Competitive Programming Helper is now deactivated.');
}
