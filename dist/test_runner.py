import os
import json
import sys
import ast
import importlib.util
import traceback
import inspect

def read_input_file(input_file):
    """
    Read input test cases from the input file.
    """
    try:
        with open(input_file, 'r') as f:
            return [line.strip() for line in f if line.strip()]
    except Exception as e:
        print(f"Error reading input file: {e}", file=sys.stderr)
        sys.exit(1)

def parse_input(input_line):
    """
    Parse input line to extract value, handling different types.
    """
    # Remove '=' if present
    if '=' in input_line:
        input_line = input_line.split('=')[1].strip()
    
    # Use ast.literal_eval for safe evaluation of different types
    try:
        return ast.literal_eval(input_line)
    except (SyntaxError, ValueError):
        # If literal_eval fails, do some basic type parsing
        input_line = input_line.strip('"\'')
        if input_line.lower() == 'true':
            return True
        elif input_line.lower() == 'false':
            return False
        
        # Try converting to int or float if possible
        try:
            return int(input_line)
        except ValueError:
            try:
                return float(input_line)
            except ValueError:
                return input_line

def convert_to_str(result):
    """
    Convert result to a string representation for comparison.
    """
    if isinstance(result, list):
        return json.dumps(result)
    elif isinstance(result, bool):
        return str(result).lower()
    elif isinstance(result, str):
        return f'"{result}"'
    return str(result)

def run_test_cases(solution_path):
    """
    Run test cases for a given solution file.
    """
    # Dynamically import the solution module
    spec = importlib.util.spec_from_file_location("solution", solution_path)
    solution_module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(solution_module)

    # Find the solution class or function
    solution = None
    method_name = None
    for name, obj in solution_module.__dict__.items():
        if name.lower() == 'solution':
            solution = obj
            # Find the first method that's not a special method
            method_name = next((m for m in dir(obj) if not m.startswith('__') and callable(getattr(obj, m))), None)
            break
        elif callable(obj):
            solution = obj
            break

    if solution is None:
        print("Error: No Solution class or function found", file=sys.stderr)
        sys.exit(1)

    # Determine test case directory
    test_dir = os.path.join(os.path.dirname(solution_path), 'testCases')
    
    # Collect input and output files
    input_files = sorted([f for f in os.listdir(test_dir) if f.startswith('input') and f.endswith('.txt')])
    output_files = sorted([f for f in os.listdir(test_dir) if f.startswith('output') and f.endswith('.txt')])

    total_tests = len(input_files)
    passed_tests = 0

    # Run through each test case
    for i in range(total_tests):
        input_path = os.path.join(test_dir, input_files[i])
        output_path = os.path.join(test_dir, output_files[i])

        # Read input parameters
        inputs = read_input_file(input_path)
        parsed_inputs = [parse_input(inp) for inp in inputs]

        # Read expected output
        with open(output_path, 'r') as f:
            expected_output = f.read().strip()
        expected_output = parse_input(expected_output)

        try:
            # Call solution (works for both class and function)
            if inspect.isclass(solution):
                # If solution is a class and method_name is found
                if method_name:
                    solution_instance = solution()
                    result = getattr(solution_instance, method_name)(*parsed_inputs)
                else:
                    # If no method found, try calling the class with inputs
                    result = solution(*parsed_inputs)
            elif callable(solution):
                # If solution is a function
                result = solution(*parsed_inputs)
            else:
                raise TypeError("Cannot call solution")

            # Convert results to comparable string format
            result_str = convert_to_str(result)
            expected_str = convert_to_str(expected_output)

            if result_str == expected_str:
                print(f"Test case {i+1}: Passed ✓")
                passed_tests += 1
            else:
                print(f"Test case {i+1}: Failed ✗")
                print(f"Expected: {expected_str}")
                print(f"Got:      {result_str}")

        except Exception as e:
            print(f"Test case {i+1}: Error!")
            print(traceback.format_exc())

    # Final summary
    print(f"\nSummary: {passed_tests}/{total_tests} test cases passed.")
    sys.exit(total_tests - passed_tests)  # Return number of failed tests as exit code

def main():
    if len(sys.argv) < 2:
        print("Usage: python test_runner.py <solution_path>")
        sys.exit(1)
    
    solution_path = sys.argv[1]
    run_test_cases(solution_path)

if __name__ == "__main__":
    main()