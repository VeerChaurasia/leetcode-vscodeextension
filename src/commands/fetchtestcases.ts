import { getTestCases } from '../utils/leetcodeAPI';
import { saveTestCases } from '../utils/filehandler';

/**
 * Extracts the titleSlug from a given LeetCode URL.
 * @param url - LeetCode problem URL provided by the user.
 * @returns Extracted titleSlug.
 */
export function extractTitleSlug(url: string): string {
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
      const titleSlug = extractTitleSlug(url);
      console.log(`Extracted titleSlug: ${titleSlug}`);
      const testCases = await getTestCases(titleSlug);
      // Ensure relative path without leading slash
      const directory = `testCases/`;  // removed leading ./
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
