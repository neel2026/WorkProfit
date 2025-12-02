"""
Step 6 Verification: Projects Frontend
Tests that the Projects Management page is accessible.
"""
import requests
import json
from datetime import datetime

BASE_URL = "http://localhost:5174"

def test_projects_page():
    """Test if projects page loads."""
    try:
        response = requests.get(f"{BASE_URL}/projects", timeout=5)
        if response.status_code == 200:
            return True, "Projects page loaded successfully"
        return False, f"Projects page returned status code: {response.status_code}"
    except Exception as e:
        return False, f"Projects page test error: {str(e)}"

def run_tests():
    """Run all Step 6 Frontend tests."""
    results = {
        "step": "Step 6: Projects Frontend",
        "timestamp": datetime.now().isoformat(),
        "tests": []
    }
    
    # Test 1: Projects Page
    success, message = test_projects_page()
    results["tests"].append({
        "name": "Projects Page Accessibility",
        "passed": success,
        "message": message
    })
    
    results["all_passed"] = all(test["passed"] for test in results["tests"])
    return results

if __name__ == "__main__":
    results = run_tests()
    
    # Print results
    print("=" * 60)
    print(f"Test Results: {results['step']}")
    print("=" * 60)
    for test in results["tests"]:
        status = "[PASS]" if test["passed"] else "[FAIL]"
        print(f"{status}: {test['name']}")
        print(f"  -> {test['message']}")
    print("=" * 60)
    print(f"Overall: {'ALL TESTS PASSED' if results['all_passed'] else 'SOME TESTS FAILED'}")
    print("=" * 60)
    
    # Save results to file
    with open("test_results_step6_frontend.json", "w") as f:
        json.dump(results, f, indent=2)
    
    exit(0 if results["all_passed"] else 1)
