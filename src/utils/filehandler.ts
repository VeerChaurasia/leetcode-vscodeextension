import { dir } from 'console';
import * as fs from 'fs';
import * as path from 'path';
interface TestCase{
    input: string;
    output: string;
}
function DirectoryExists(directory:string): void{
    if(!fs.existsSync(directory)){
        fs.mkdirSync(directory, { recursive: true });
    }
}
export async function saveTestCases(testCase: TestCase[],directory: string):Promise<void>{
    DirectoryExists(directory);
    testCase.forEach((testCase,index)=>{
        const inputFilePath = path.join(directory, `input_${index + 1}.txt`);
        const outputFilePath = path.join(directory, `output_${index + 1}.txt`);
        
        // Write the files
        fs.writeFileSync(inputFilePath, testCase.input, 'utf-8');
        fs.writeFileSync(outputFilePath, testCase.output, 'utf-8');

    });
    console.log(`Test cases saved in directory: ${directory}`);

}