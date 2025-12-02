"""
Master Test Pipeline
Runs all step tests sequentially and generates a comprehensive report.
"""
import subprocess
import json
from datetime import datetime
import sys

def run_test_script(script_path, step_name):
    """Run a test script and capture results."""
    print(f"\n{'=' * 70}")
    print(f"Running: {step_name}")
    print('=' * 70)
    
    try:
        result = subprocess.run(
            [sys.executable, script_path],
            capture_output=True,
            text=True,
            timeout=30
        )
        
        print(result.stdout)
        if result.stderr:
            print("STDERR:", result.stderr)
        
        return {
            "step": step_name,
            "passed": result.returncode == 0,
            "exit_code": result.returncode,
            "stdout": result.stdout,
            "stderr": result.stderr
        }
    except subprocess.TimeoutExpired:
        return {
            "step": step_name,
            "passed": False,
            "exit_code": -1,
            "error": "Test timed out after 30 seconds"
        }
    except Exception as e:
        return {
            "step": step_name,
            "passed": False,
            "exit_code": -1,
            "error": str(e)
        }

def load_step_results(filename):
    """Load detailed results from step test JSON output."""
    try:
        with open(filename, 'r') as f:
            return json.load(f)
    except:
        return None

def main():
    """Run the complete test pipeline."""
    pipeline_start = datetime.now()
    
    print("\n" + "=" * 70)
    print("WORKPROFIT TEST PIPELINE")
    print("=" * 70)
    print(f"Started at: {pipeline_start.isoformat()}")
    
    # Define test sequence
    tests = [
        ("tests/test_step1_initialization.py", "Step 1: Project Initialization"),
        ("tests/test_step2_database.py", "Step 2: Database & User Model"),
        ("tests/test_step3_authentication.py", "Step 3: Authentication Logic"),
        ("tests/test_step4_frontend.py", "Step 4: Frontend Authentication UI"),
        ("tests/test_step5_users.py", "Step 5: User Management API"),
        ("tests/test_step5_frontend.py", "Step 5: User Management Frontend"),
        ("tests/test_step6_frontend.py", "Step 6: Projects Frontend")
    ]
    
    pipeline_results = {
        "start_time": pipeline_start.isoformat(),
        "steps": [],
        "summary": {}
    }
    
    # Run each test
    for script_path, step_name in tests:
        result = run_test_script(script_path, step_name)
        pipeline_results["steps"].append(result)
        
        # If this step failed, stop the pipeline
        if not result["passed"]:
            print(f"\n⚠️  PIPELINE STOPPED: {step_name} failed")
            print("Fix the failing tests before proceeding to the next step.")
            break
    
    pipeline_end = datetime.now()
    pipeline_results["end_time"] = pipeline_end.isoformat()
    pipeline_results["duration_seconds"] = (pipeline_end - pipeline_start).total_seconds()
    
    # Generate summary
    total_steps = len(tests)
    completed_steps = len(pipeline_results["steps"])
    passed_steps = sum(1 for step in pipeline_results["steps"] if step["passed"])
    
    pipeline_results["summary"] = {
        "total_steps": total_steps,
        "completed_steps": completed_steps,
        "passed_steps": passed_steps,
        "failed_steps": completed_steps - passed_steps,
        "skipped_steps": total_steps - completed_steps,
        "all_passed": passed_steps == total_steps
    }
    
    # Print summary
    print("\n" + "=" * 70)
    print("PIPELINE SUMMARY")
    print("=" * 70)
    print(f"Total Steps: {total_steps}")
    print(f"Completed: {completed_steps}")
    print(f"✓ Passed: {passed_steps}")
    print(f"✗ Failed: {pipeline_results['summary']['failed_steps']}")
    print(f"⊘ Skipped: {pipeline_results['summary']['skipped_steps']}")
    print(f"Duration: {pipeline_results['duration_seconds']:.2f}s")
    print("=" * 70)
    
    if pipeline_results["summary"]["all_passed"]:
        print("\n🎉 ALL TESTS PASSED! Ready to proceed to Step 4.")
    else:
        print("\n❌ SOME TESTS FAILED. Review the output above.")
    
    # Save comprehensive report
    with open("test_pipeline_report.json", "w") as f:
        json.dump(pipeline_results, f, indent=2)
    
    print(f"\nDetailed report saved to: test_pipeline_report.json")
    
    # Load and summarize individual step results
    print("\n" + "=" * 70)
    print("DETAILED TEST RESULTS")
    print("=" * 70)
    
    for i, (_, step_name) in enumerate(tests[:completed_steps], 1):
        result_file = f"test_results_step{i}.json"
        step_data = load_step_results(result_file)
        if step_data:
            print(f"\n{step_name}:")
            for test in step_data["tests"]:
                status = "✓" if test["passed"] else "✗"
                print(f"  {status} {test['name']}: {test['message']}")
    
    print("\n" + "=" * 70)
    
    # Exit with appropriate code
    exit(0 if pipeline_results["summary"]["all_passed"] else 1)

if __name__ == "__main__":
    main()
