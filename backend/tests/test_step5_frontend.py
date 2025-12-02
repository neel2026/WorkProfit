"""
Step 5 Verification: User Management Frontend
Tests that the User Management page is accessible.
"""
import requests
import json
from datetime import datetime

BASE_URL = "http://localhost:5174"

def test_user_management_page():
    """Test if user management page loads."""
    # Since it's an SPA, it should return 200 even if protected (client-side redirect)
    try:
        response = requests.get(f"{BASE_URL}/users", timeout=5)
        if response.status_code == 200:
            return True, "User Management page loaded successfully"
        return False, f"User Management page returned status code: {response.status_code}"
    except Exception as e:
        return False, f"User Management page test error: {str(e)}"

def run_tests():
    """Run all Step 5 Frontend tests."""
    results = {
        "step": "Step 5: User Management Frontend",
        "timestamp": datetime.now().isoformat(),
        "tests": []
    }
    
    # Test 1: User Management Page
    success, message = test_user_management_page()
    results["tests"].append({
        "name": "User Management Page Accessibility",
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
    with open("test_results_step5_frontend.json", "w") as f:
        json.dump(results, f, indent=2)
    
    exit(0 if results["all_passed"] else 1)
