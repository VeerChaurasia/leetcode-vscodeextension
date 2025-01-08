const fetch = require('node-fetch');
import { JSDOM } from 'jsdom';

interface TestCase {
    input: string;
    output: string;
}

export async function getTestCases(titleSlug?: string): Promise<TestCase[]>{
    const url: string =`https://alfa-leetcode-api.onrender.com/select?titleSlug=${titleSlug}`;
try{
    const response = await fetch(url);
    if(!response.ok){
        throw new Error(`Failed to fetch data: ${response.statusText}`);
    }
    const data: { question?: string } = await response.json() as { question?: string };
    if (!data.question) {
        throw new Error(`No question data found for problem "${titleSlug}"`);
    }
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
    return testCases;
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error(`Error fetching and parsing test cases: ${error.message}`);
        } else {
            console.error('Error fetching and parsing test cases');
        }
        return [] as TestCase[];
    }
}

