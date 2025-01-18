import { exec } from 'child_process';  // Node.js module for executing commands

export async function executeCode(language: string, code: string, input: string): Promise<string> {
    return new Promise((resolve, reject) => {
        let command: string;

        // Determine the appropriate command for executing code based on language
        if (language === 'python') {
            command = `python3 -c "${code}"`;  // Command for Python
        } else if (language === 'cpp') {
            command = `g++ -o temp ${code} && ./temp`;  // Command for C++
        } else {
            reject('Unsupported language');
            return;
        }

        // Execute the command
        exec(command, (error, stdout, stderr) => {
            if (error) {
                reject(`Error executing code: ${error.message}`);
            } else if (stderr) {
                reject(`stderr: ${stderr}`);
            } else {
                resolve(stdout);  // Return the output
            }
        });
    });
}
