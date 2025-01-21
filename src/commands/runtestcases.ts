import fs from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

function generateInputReadingCode(paramType: string): string {
    if (paramType.includes('vector<int>')) {
        return `
        int n;
        inFile >> n;
        vector<int> arr(n);
        for (int i = 0; i < n; i++) {
            inFile >> arr[i];
        }`;
    }
    if (paramType.includes('vector<string>')) {
        return `
        int n;
        inFile >> n;
        vector<string> arr(n);
        for (int i = 0; i < n; i++) {
            inFile >> arr[i];
        }`;
    }
    if (paramType.includes('vector<vector<int>>')) {
        return `
        int rows, cols;
        inFile >> rows >> cols;
        vector<vector<int>> matrix(rows, vector<int>(cols));
        for (int i = 0; i < rows; i++) {
            for (int j = 0; j < cols; j++) {
                inFile >> matrix[i][j];
            }
        }`;
    }
    if (paramType.includes('TreeNode*')) {
        return `
        string line;
        inFile >> line;
        TreeNode* root = deserialize(line);`;
    }
    if (paramType.includes('ListNode*')) {
        return `
        int n;
        inFile >> n;
        vector<int> arr(n);
        for (int i = 0; i < n; i++) {
            inFile >> arr[i];
        }
        ListNode* head = createLinkedList(arr);`;
    }
    if (paramType === 'int') {
        return `int num;\ninFile >> num;`;
    }
    if (paramType === 'string') {
        return `
        string str;
        getline(inFile, str);  // Use getline to handle spaces and special characters`;
    }
    if (paramType === 'char') {
        return `char c;\ninFile >> c;`;
    }
    if (paramType === 'double' || paramType === 'float') {
        return `double num;\ninFile >> num;`;
    }
    if (paramType === 'bool') {
        return `bool flag;\ninFile >> flag;`;
    }
    return `// Unsupported type: ${paramType}\n`;
}

// Helper function to generate parameter passing code
function generateParamPassingCode(paramType: string, varName: string): string {
    if (paramType.includes('vector<')) return varName;
    if (paramType.includes('TreeNode*')) return 'root';
    if (paramType.includes('ListNode*')) return 'head';
    return varName;
}

export async function generateMainFile(solutionPath: string, testCaseDir: string): Promise<void> {
    try {
        const userCode = await fs.readFile(solutionPath, 'utf-8');
        
        // Extract function signature and return type
        const functionMatch = userCode.match(/(?:int|void|string|double|float|long|bool|vector<\w+>)\s+(\w+)\s*\(([\s\S]*?)\)/);
        if (!functionMatch) {
            throw new Error('Could not find function signature in code');
        }
        
        const returnType = functionMatch[0].split(' ')[0];
        const functionName = functionMatch[1];
        const params = functionMatch[2].split(',').map(param => param.trim());
        
        // Parse parameter types and names
        const paramTypes = params.map(param => param.split(' ')[0]);
        const paramNames = params.map((param, index) => {
            const parts = param.split(' ');
            return parts.length > 1 ? parts[1].replace('&', '') : `param${index}`;
        });

        // Generate helper functions for special types
        const vectorToStringHelper = `
// Helper function to convert vector<T> to string
template <typename T>
string vectorToString(const vector<T>& vec) {
    stringstream ss;
    ss << "[";
    for (size_t i = 0; i < vec.size(); i++) {
        ss << vec[i];
        if (i != vec.size() - 1) ss << ", ";
    }
    ss << "]";
    return ss.str();
}`;
        const boolToStringHelper = `
// Helper function to convert bool to string
string boolToString(bool value) {
    return value ? "true" : "false";
}`;

        const helperFunctions = `
${returnType.includes('vector<string>') || paramTypes.some(type => type.includes('vector<string>')) ? vectorToStringHelper : ''}
${returnType.includes('vector<int>') || paramTypes.some(type => type.includes('vector<int>')) ? vectorToStringHelper : ''}
${returnType.includes('bool') ? boolToStringHelper : ''}
`;

        // Generate input reading code for each parameter
        const inputReadingCode = paramTypes.map((type, index) => 
            generateInputReadingCode(type)).join('\n        ');

        // Generate parameter passing code
        const paramPassingCode = paramTypes.map((type, index) => 
            generateParamPassingCode(type, paramNames[index])).join(', ');

        // Create main.cpp content
        const mainContent = `
#include <iostream>
#include <vector>
#include <fstream>
#include <filesystem>
#include <string>
#include <cctype>
#include <algorithm>
using namespace std;

${userCode}

${helperFunctions}

int main() {
    string testDir = "${testCaseDir}/";
    vector<string> inFiles, outFiles;
    
    for (const auto& entry : filesystem::directory_iterator(testDir)) {
        string filename = entry.path().filename().string();
        if (filename.find("input")) {
            inFiles.push_back(testDir + filename);
            outFiles.push_back(testDir + "output" + filename.substr(5));
        }
    }
    
    int totalTests = inFiles.size();
    int passedTests = 0;
    
    for (int test = 0; test < totalTests; test++) {
        ifstream inFile(inFiles[test]);
        ifstream expectedFile(outFiles[test]);
        
        try {
            // Read inputs
            ${inputReadingCode}
            
            // Get expected output
            string expected;
            getline(expectedFile, expected);
            
            // Call user's function
            auto result = ${functionName}(${paramPassingCode});
            
            // Convert result to string for comparison
            string resultStr;
            if constexpr (is_same_v<decltype(result), vector<string>>) {
                resultStr = vectorToString(result);
            } else if constexpr (is_same_v<decltype(result), vector<int>>) {
                resultStr = vectorToString(result);
            } else if constexpr (is_same_v<decltype(result), bool>) {
                resultStr = boolToString(result);
            } else {
                resultStr = to_string(result);
            }
            
            if (resultStr == expected) {
                cout << "Test case " << (test + 1) << ": Passed ✓" << endl;
                passedTests++;
            } else {
                cout << "Test case " << (test + 1) << ": Failed ✗" << endl;
                cout << "Expected: " << expected << endl;
                cout << "Got: " << resultStr << endl;
            }
        } catch (const exception& e) {
            cout << "Test case " << (test + 1) << ": Error!" << endl;
            cout << "Error message: " << e.what() << endl;
        }
        
        inFile.close();
        expectedFile.close();
    }
    
    cout << "\\nSummary: " << passedTests << "/" << totalTests << " test cases passed." << endl;
    return 0;
}`;
        const outputPath = path.resolve('/Users/veerchaurasia/leetcode-cph', 'main.cpp');

        await fs.writeFile(outputPath, mainContent);
        console.log('Generated main.cpp for testing');
        
    } catch (error) {
        console.error('Error generating main file:', error);
        throw error;
    }
}

export async function runTestCases(solutionPath: string): Promise<void> {
    try {
        if (!existsSync(solutionPath)) {
            throw new Error(`Solution file not found: ${solutionPath}`);
        }
        await generateMainFile(solutionPath, 'testCases');
    } catch (error) {
        console.error('Error running test cases:', error);
        throw error;
    }
}
