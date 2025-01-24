# LeetCode Helper - VS Code Extension

LeetCode Helper is a Visual Studio Code extension designed to simplify competitive programming workflows. It provides tools for downloading LeetCode test cases, generating code files, and running solutions in C++ or Python.

## Features

- **Hello World Command**: Verify the extension is working by running a simple command.
- **Fetch Test Cases**: Download sample test cases for LeetCode problems by providing the problem URL.
- **Generate Code File**: Quickly create boilerplate code files in C++ or Python.
- **Run Test Cases**: Compile and run your solution against sample test cases.  
  - C++ solutions are compiled and executed.
  - Python solutions are executed directly.

## Installation

1. Install [Visual Studio Code](https://code.visualstudio.com/).
2. Download the extension from the VS Code Marketplace or load it manually as a `.vsix` file.
3. Ensure the following dependencies are installed:
   - **C++ Compiler**: e.g., `g++` for C++ solutions.
   - **Python 3**: Required for Python solutions.
   - **Node.js**: Required for test case execution.

## Commands

Access all commands via the Command Palette (`Ctrl+Shift+P` or `Cmd+Shift+P`):

### 1. Hello World Command
- **Command**: `LeetCode Helper: Hello World`  
  Displays a welcome message to confirm the extension is active.

### 2. Fetch Test Cases
- **Command**: `LeetCode Helper: Fetch Test Cases`  
  - Prompts for a LeetCode problem URL (e.g., `https://leetcode.com/problems/two-sum/`).
  - Downloads the sample test cases and saves them in a `testcases` directory.

### 3. Generate Code File
- **Command**: `LeetCode Helper: Create Code File`  
  - Prompts you to select a folder and programming language (C++ or Python).
  - Creates a new code file in the selected folder.

### 4. Run Test Cases
- **Command**: `LeetCode Helper: Run Test Cases`  
  - Executes the solution against test cases in the `testcases` directory.  
  - Supported languages:
    - **C++**: Compiles and executes the solution.
    - **Python**: Runs the script using a Python test runner.

## Usage Instructions

1. Open a folder or workspace in VS Code.
2. Use the Command Palette (`Ctrl+Shift+P` or `Cmd+Shift+P`) to run any command provided by the extension.
3. Follow the prompts to:
   - Fetch test cases.
   - Generate a code file.
   - Select a solution file and run test cases.
4. View test results in the **Output** panel.
## Troubleshooting

- **Unsupported file type**: Ensure the solution file is either `.cpp` or `.py`.
- **Test cases not executing**: Ensure test cases are stored in a `testcases` directory within the workspace.
- **Compilation errors (C++)**: Verify `g++` is installed and available in your system's `PATH`.

## Development

### Running Locally

1. Clone this repository.
2. Open the folder in VS Code.
3. Press `F5` to launch an Extension Development Host.

### Contributing

Contributions are welcome! To contribute:
1. Fork the repository.
2. Create a new branch for your changes.
3. Submit a pull request with a detailed description of your changes.

## Future Enhancements

- Support additional programming languages (e.g., Java, JavaScript).
- Add live debugging for test case execution.
- Support competitive programming platforms like Codeforces and HackerRank.


