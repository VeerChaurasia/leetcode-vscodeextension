import * as vscode from 'vscode';
import {fetchTestCases} from '../commands/fetchtestcases';
import {runTestCases} from '../commands/runtestcases';

export function activate(context: vscode.ExtensionContext){
    console.log("leetcode-cph is now active")
    const fetchCommand =vscode.commands.registerCommand(
        'leetcode-cph.fetchTestCases',
        async () => {
            await fetchTestCases();
        }
    );
    const runCommand=vscode.commands.registerCommand(
        'leetcode-cph.runTestCases',
        async () => {
            await runTestCases();
        }
    );
    context.subscriptions.push(fetchCommand, runCommand);
}
export function deactivate() {
    console.log('Extension "competitive-programming-helper" is now deactivated.');
}