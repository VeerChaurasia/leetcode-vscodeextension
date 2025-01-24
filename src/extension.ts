import * as vscode from 'vscode';
import * as path from 'path';
import { exec } from 'child_process';
import { fetchTestCases } from './commands/fetchtestcases'; 
import { createCodeFile } from './utils/createCodeFile';
import { DirectoryExists } from './utils/createCodeFile';
import { generateMainFile } from './commands/runtestcases';

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

    // Assuming test cases are stored in a 'testcases' directory in the workspace
    const testDir = path.join(vscode.workspace.workspaceFolders?.[0]?.uri.fsPath ?? '', 'testcases');

    // Function to run test cases on the compiled solution file
    async function runTestCases(solutionFilePath: string) {
        const fileExtension = path.extname(solutionFilePath);
        
        // Step 1: Compile the solution if needed (for C++, Python doesn't need compilation)
        if (fileExtension === '.cpp') {
            const compiledFile = path.join(path.dirname(solutionFilePath), 'solution.out');
            
            // Compile the C++ code
            await new Promise<void>((resolve, reject) => {
                exec(`g++ ${solutionFilePath} -o ${compiledFile}`, (error, stdout, stderr) => {
                    if (error) {
                        vscode.window.showErrorMessage(`Compilation failed: ${stderr}`);
                        reject(error);
                    } else {
                        resolve();
                    }
                });
            });
            
            // Step 2: Run the compiled code
            await runTestCasesFromDirectory(compiledFile);
        } else if (fileExtension === '.py') {
            // For Python, no need to compile, just run the Python file
            await runTestCasesFromDirectory(solutionFilePath);
        } else {
            vscode.window.showErrorMessage('Unsupported file type. Only C++ and Python are supported.');
        }
    }

    // Function to run the test cases from the test directory
    function runTestCasesFromDirectory(filePath: string) {
        return new Promise<void>((resolve, reject) => {
            // Assuming that test cases are input files in the 'testcases' directory
            exec(`cd ${testDir} && node runTests.js ${filePath}`, (error, stdout, stderr) => {
                if (error) {
                    vscode.window.showErrorMessage(`Test case execution failed: ${stderr}`);
                    reject(error);
                } else {
                    vscode.window.showInformationMessage('Test cases executed successfully!');
                    resolve();
                }
            });
        });
    }

    // Registering the command to run test cases
    // Modify the existing runTestCases command to support both C++ and Python
const runTestCasesCommand = vscode.commands.registerCommand(
    'leetcode-cph.runTestCases',
    async () => {
        let solutionPath: string;
        let workspacePath: string;

        const editor = vscode.window.activeTextEditor;

        if (!editor) {
            const fileUris = await vscode.window.showOpenDialog({
                canSelectFiles: true,
                canSelectFolders: false,
                canSelectMany: false,
                filters: {
                    'C++ Files': ['cpp'],
                    'Python Files': ['py'],
                    'All Files': ['*']
                },
                title: 'Select your solution file'
            });

            if (!fileUris || fileUris.length === 0) {
                vscode.window.showErrorMessage('No file selected');
                return;
            }

            solutionPath = fileUris[0].fsPath;
            workspacePath = path.dirname(solutionPath);
        } else {
            solutionPath = editor.document.uri.fsPath;
            workspacePath = path.dirname(solutionPath);
        }

        const fileExtension = path.extname(solutionPath);
        const outputChannel = vscode.window.createOutputChannel('Test Results');
        outputChannel.clear();
        outputChannel.show();

        try {
            if (fileExtension === '.cpp') {
                // Existing C++ test case logic
                await generateMainFile(solutionPath, path.join(workspacePath, 'testcases'));
                
                const mainFilePath = path.join(workspacePath, 'main.cpp');
                const mainExePath = path.join(workspacePath, 'main');

                // Compile and run C++ test cases
                await new Promise<void>((resolve, reject) => {
                    exec(`g++ -std=c++17 "${mainFilePath}" -o "${mainExePath}"`, 
                        { cwd: workspacePath }, 
                        (error, stdout, stderr) => {
                            if (error) {
                                outputChannel.appendLine('Compilation Error:');
                                outputChannel.appendLine(stderr);
                                reject(error);
                            } else {
                                resolve();
                            }
                    }
                    );
                });

                return new Promise<void>((resolve, reject) => {
                    exec(`"${mainExePath}"`, 
                        { cwd: workspacePath }, 
                        (error, stdout, stderr) => {
                            outputChannel.appendLine('Full Test Output:');
                            outputChannel.appendLine(stdout);
                            
                            if (error) {
                                outputChannel.appendLine('Execution Error Details:');
                                outputChannel.appendLine(stderr);
                                vscode.window.showErrorMessage('Some test cases failed');
                            } else {
                                vscode.window.showInformationMessage('Test cases executed completely');
                            }
                            
                            // Always resolve, allowing output to be seen even if tests fail
                            resolve();
                        }
                    );
                });

            } else if (fileExtension === '.py') {
                // New Python test case logic
                return new Promise<void>((resolve, reject) => {
                    // Use the Python test runner script
                    exec(`python3 "${path.join(__dirname, 'test_runner.py')}" "${solutionPath}"`, 
                        { cwd: workspacePath }, 
                        (error, stdout, stderr) => {
                            if (error) {
                                outputChannel.appendLine('Python Test Runner Error:');
                                outputChannel.appendLine(stdout);
                                outputChannel.appendLine(stderr);
                                vscode.window.showErrorMessage('Python test cases execution failed');
                                reject(error);
                            } else {
                                outputChannel.appendLine(stdout);
                                vscode.window.showInformationMessage('Python test cases executed successfully!');
                                resolve();
                            }
                        }
                    );
                });
            } else {
                vscode.window.showErrorMessage('Unsupported file type. Only C++ and Python are supported.');
            }

        } catch (error) {
            outputChannel.appendLine('Error:');
            outputChannel.appendLine(error instanceof Error ? error.message : String(error));
            vscode.window.showErrorMessage('Failed to run test cases');
        }
    }
);
    

    context.subscriptions.push(fetchTestCasesCommand, helloWorldCommand, createCodeFileCommand, runTestCasesCommand);
}

export function deactivate() {
    console.log('Competitive Programming Helper is now deactivated.');
}