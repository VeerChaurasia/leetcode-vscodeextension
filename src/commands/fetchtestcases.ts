import { getTestCases } from '../utils/leetcodeAPI';
import { saveTestCases } from '../utils/filehandler';

/**
 * Extracts the titleSlug from a given LeetCode URL.
 * @param url - LeetCode problem URL provided by the user.
 * @returns Extracted titleSlug.
 */
function extractTitleSlug(url: string): string {
    try {
        const match = url.match(/problems\/([^\/]+)\//);
        if (match && match[1]) {
            return match[1];
        }
        throw new Error('Invalid URL format. Please provide a valid LeetCode problem URL.');
    } catch (error) {
        if (error instanceof Error) {
            console.error(error.message);
        } else {
            console.error('An unknown error occurred.');
        }
        throw error;
    }
}

/**
 * Main function to fetch and save test cases for a given problem URL.
 * @param url - LeetCode problem URL.
 */
export async function fetchTestCases(url: string): Promise<void> {
    try {
        // Extract titleSlug from the URL
        const titleSlug = extractTitleSlug(url);
        console.log(`Extracted titleSlug: ${titleSlug}`);

        // Fetch test cases from LeetCode API
        const testCases = await getTestCases(titleSlug);

        // Save test cases to a directory named after the problem
        const directory = `testCases/${titleSlug}`;
        await saveTestCases(testCases, directory);

        console.log(`Test cases for "${titleSlug}" have been saved successfully.`);
    } catch (error) {
        if (error instanceof Error) {
            console.error('Error while fetching and saving test cases:', error.message);
        } else {
            console.error('Error while fetching and saving test cases:', error);
        }
    }
}
