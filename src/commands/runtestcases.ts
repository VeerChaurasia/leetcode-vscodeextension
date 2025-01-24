import fs from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

function generateInputReadingCode(paramType: string, paramName: string): string {
    if (paramType === 'int') {
        return `
        string line;
        while (getline(inFile, line) && line.empty());  // Skip empty lines
        size_t equalPos = line.find("=");
        string numStr = equalPos != string::npos ? line.substr(equalPos + 1) : line;
        // Remove whitespace
        numStr.erase(0, numStr.find_first_not_of(" \\n\\r\\t"));
        numStr.erase(numStr.find_last_not_of(" \\n\\r\\t") + 1);
        int ${paramName} = stoi(numStr);`;
    }
    
    if (paramType === 'string') {
        return `
        string line;
        while (getline(inFile, line) && line.empty());  // Skip empty lines
        size_t equalPos = line.find("=");
        string ${paramName} = equalPos != string::npos ? line.substr(equalPos + 1) : line;
        // Remove whitespace and quotes if present
        ${paramName}.erase(0, ${paramName}.find_first_not_of(" \\n\\r\\t\\""));
        ${paramName}.erase(${paramName}.find_last_not_of(" \\n\\r\\t\\"") + 1);`;
    }
    
    if (paramType.includes('vector<int>')) {
        return `
        string line;
        while (getline(inFile, line) && line.empty());  // Skip empty lines
        size_t equalPos = line.find("=");
        string arrStr = equalPos != string::npos ? line.substr(equalPos + 1) : line;
        // Remove whitespace and brackets
        arrStr.erase(0, arrStr.find_first_not_of(" \\n\\r\\t["));
        arrStr.erase(arrStr.find_last_not_of(" \\n\\r\\t]") + 1);
        
        vector<int> ${paramName};
        stringstream ss(arrStr);
        string item;
        while (getline(ss, item, ',')) {
            // Remove whitespace
            item.erase(0, item.find_first_not_of(" \\n\\r\\t"));
            item.erase(item.find_last_not_of(" \\n\\r\\t") + 1);
            if (!item.empty()) {
                ${paramName}.push_back(stoi(item));
            }
        }`;
    }
    
  
    
    if (paramType.includes('vector<vector<int>>')) {
        return `
        string line;
        getline(inFile, line);
        size_t equalPos = line.find("=");
        if (equalPos == string::npos) {
            throw runtime_error("Invalid input format: missing '='");
        }
        string matrixStr = line.substr(equalPos + 1);
        // Remove outer whitespace and brackets
        matrixStr.erase(0, matrixStr.find_first_not_of(" \\n\\r\\t["));
        matrixStr.erase(matrixStr.find_last_not_of(" \\n\\r\\t]") + 1);
        
        vector<vector<int>> matrix;
        stringstream ss(matrixStr);
        string rowStr;
        while (getline(ss, rowStr, ']')) {
            if (rowStr.empty()) continue;
            // Remove leading comma if present
            if (rowStr[0] == ',') rowStr = rowStr.substr(1);
            // Find start of array
            size_t start = rowStr.find('[');
            if (start == string::npos) continue;
            rowStr = rowStr.substr(start + 1);
            
            vector<int> row;
            stringstream rowSs(rowStr);
            string item;
            while (getline(rowSs, item, ',')) {
                // Remove whitespace
                item.erase(0, item.find_first_not_of(" \\n\\r\\t"));
                item.erase(item.find_last_not_of(" \\n\\r\\t") + 1);
                if (!item.empty()) {
                    row.push_back(stoi(item));
                }
            }
            if (!row.empty()) {
                matrix.push_back(row);
            }
        }`;
    }
    
    if (paramType.includes('TreeNode*')) {
        return `
        string line;
        getline(inFile, line);
        size_t equalPos = line.find("=");
        string treeStr = equalPos != string::npos ? line.substr(equalPos + 1) : line;
        // Remove whitespace and brackets
        treeStr.erase(0, treeStr.find_first_not_of(" \\n\\r\\t["));
        treeStr.erase(treeStr.find_last_not_of(" \\n\\r\\t]") + 1);
        TreeNode* root = deserialize(treeStr);`;
    }

    if (paramType.includes('ListNode*')) {
        return `
        string line;
        getline(inFile, line);
        size_t equalPos = line.find("=");
        if (equalPos == string::npos) {
            throw runtime_error("Invalid input format: missing '='");
        }
        string arrStr = line.substr(equalPos + 1);
        // Remove whitespace and brackets
        arrStr.erase(0, arrStr.find_first_not_of(" \\n\\r\\t["));
        arrStr.erase(arrStr.find_last_not_of(" \\n\\r\\t]") + 1);
        
        vector<int> arr;
        stringstream ss(arrStr);
        string item;
        while (getline(ss, item, ',')) {
            // Remove whitespace
            item.erase(0, item.find_first_not_of(" \\n\\r\\t"));
            item.erase(item.find_last_not_of(" \\n\\r\\t") + 1);
            if (!item.empty()) {
                arr.push_back(stoi(item));
            }
        }
        ListNode* head = createLinkedList(arr);`;
    }
    
    if (paramType === 'char') {
        return `
        string line;
        getline(inFile, line);
        size_t equalPos = line.find("=");
        if (equalPos == string::npos) {
            throw runtime_error("Invalid input format: missing '='");
        }
        string charStr = line.substr(equalPos + 1);
        // Remove whitespace and quotes
        charStr.erase(0, charStr.find_first_not_of(" \\n\\r\\t\\""));
        charStr.erase(charStr.find_last_not_of(" \\n\\r\\t\\"") + 1);
        char c = charStr[0];`;
    }
    
    if (paramType === 'double' || paramType === 'float') {
        return `
        string line;
        getline(inFile, line);
        size_t equalPos = line.find("=");
        if (equalPos == string::npos) {
            throw runtime_error("Invalid input format: missing '='");
        }
        string numStr = line.substr(equalPos + 1);
        // Remove whitespace
        numStr.erase(0, numStr.find_first_not_of(" \\n\\r\\t"));
        numStr.erase(numStr.find_last_not_of(" \\n\\r\\t") + 1);
        double num = stod(numStr);`;
    }
    
    if (paramType === 'bool') {
        return `
        string line;
        getline(inFile, line);
        size_t equalPos = line.find("=");
        if (equalPos == string::npos) {
            throw runtime_error("Invalid input format: missing '='");
        }
        string boolStr = line.substr(equalPos + 1);
        // Remove whitespace
        boolStr.erase(0, boolStr.find_first_not_of(" \\n\\r\\t"));
        boolStr.erase(boolStr.find_last_not_of(" \\n\\r\\t") + 1);
        bool flag = (boolStr == "true" || boolStr == "1");`;
    }
    
    return `// Unsupported type: ${paramType}\n`;
}

export async function generateMainFile(solutionPath: string, testCaseDir: string): Promise<void> {
    try {
        const userCode = await fs.readFile(solutionPath, 'utf-8');
        
        // Extract function signature and return type with improved regex
        const functionMatch = userCode.match(/(?:int|void|string|double|float|long|bool|vector<[\w<>]+>)\s+(\w+)\s*\(([\s\S]*?)\)/);
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

        // Check if this is a class member function
        const isClassMethod = userCode.includes('class Solution');
        
        const mainContent = `
#include <iostream>
#include <vector>
#include <fstream>
#include <filesystem>
#include <string>
#include <sstream>
#include <cctype>
#include <algorithm>
#include <type_traits>
using namespace std;

${userCode}

// Helper function to trim whitespace and quotes
string trim(string str) {
    str.erase(0, str.find_first_not_of(" \\n\\r\\t\\""));
    str.erase(str.find_last_not_of(" \\n\\r\\t\\"") + 1);
    return str;
}

// Helper function to convert vector to string
template <typename T>
string vectorToString(const vector<T>& vec) {
    stringstream ss;
    ss << "[";
    for (size_t i = 0; i < vec.size(); i++) {
        if constexpr (is_same_v<T, string>) {
            ss << "\\"" << vec[i] << "\\"";
        } else {
            ss << vec[i];
        }
        if (i != vec.size() - 1) ss << ",";
    }
    ss << "]";
    return ss.str();
}

template<typename T>
string convertToString(const T& result) {
    if constexpr (is_same_v<T, vector<string>>) {
        return vectorToString(result);
    } else if constexpr (is_same_v<T, vector<int>>) {
        return vectorToString(result);
    } else if constexpr (is_same_v<T, bool>) {
        return result ? "true" : "false";
    } else if constexpr (is_same_v<T, string>) {
        return "\\"" + result + "\\"";
    } else {
        return to_string(result);
    }
}

int main() {
    ${isClassMethod ? 'Solution solution;' : ''}  // Create solution object if needed
    
    string testDir = "${testCaseDir}/";
    vector<string> inFiles, outFiles;
    
    for (const auto& entry : filesystem::directory_iterator(testDir)) {
        string filename = entry.path().filename().string();
        if (filename.find("input") != string::npos) {
            inFiles.push_back(testDir + filename);
            string outFile = testDir + "output" + filename.substr(5);
            if (filesystem::exists(outFile)) {
                outFiles.push_back(outFile);
            } else {
                cerr << "Warning: Missing output file for " << filename << endl;
                continue;
            }
        }
    }
    
    int totalTests = inFiles.size();
    int passedTests = 0;
    
    for (int test = 0; test < totalTests; test++) {
        ifstream inFile(inFiles[test]);
        ifstream expectedFile(outFiles[test]);
        
        if (!inFile.is_open()) {
            cerr << "Error: Cannot open input file " << inFiles[test] << endl;
            continue;
        }
        if (!expectedFile.is_open()) {
            cerr << "Error: Cannot open output file " << outFiles[test] << endl;
            continue;
        }
        
        try {
            // Read inputs
            ${paramTypes.map((type, index) => generateInputReadingCode(type, paramNames[index])).join('\n            ')}
            
            // Get expected output
            string expected;
            while (getline(expectedFile, expected) && expected.empty());  // Skip empty lines
            expected = trim(expected);
            
            // Call user's function with correct name
            auto result = ${isClassMethod ? 'solution.' : ''}${functionName}(${paramNames.join(', ')});
            
            // Convert result to string using template function
            string resultStr = convertToString(result);
            
            if (resultStr == expected) {
                cout << "Expected: " << expected << endl;
                cout << "Got: " << resultStr << endl;
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
    return totalTests - passedTests;  // Return number of failed tests
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
