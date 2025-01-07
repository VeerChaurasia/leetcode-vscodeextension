const fetch = (await import('node-fetch')).default;
import { JSDOM } from 'jsdom';

interface TestCase {
    input: string;
    output: string;
}

export async function getTestCases(): Promise<void>{
    const url: string =`https://alfa-leetcode-api.onrender.com/select?titleSlug=${problem_name}`;
}
try{
    const response = await fetch(url);
    const data =await response.json();
    const dom = new JSDOM(data.question);
    const preTags = dom.window.document.querySelectorAll('pre');
    const testCases: TestCase[] = [];
    preTags.forEach((preTag)=>{
        const lines: string[] = preTag.textContent?.split('\n') || [];
        const inputLine=lines.find((line)=>line.startsWith('Input:'));
        const outputLine=lines.find((line)=>line.startsWith('Output:'));
        if (inputLine && outputLine) {
            const input = inputLine.replace('Input:', '').trim();
            const output = outputLine.replace('Output:', '').trim();
            testCases.push({ input, output });
        }
    });

}