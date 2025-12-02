"""
Step 4 Verification: Frontend Authentication UI
Tests that frontend pages are accessible and return correct content.
"""
import requests
import json
from datetime import datetime

BASE_URL = "http://localhost:5174"

def test_login_page():
    """Test if login page loads and contains key elements."""
    try:
        response = requests.get(f"{BASE_URL}/login", timeout=5)
        if response.status_code == 200:
            content = response.text
            # Check for title or key content
            if "<title>frontend</title>" in content or "vite" in content:
                return True, "Login page loaded successfully"
            return False, "Login page content missing expected elements"
        return False, f"Login page returned status code: {response.status_code}"
    except Exception as e:
        return False, f"Login page test error: {str(e)}"

def test_register_page():
    """Test if register page loads."""
    try:
        response = requests.get(f"{BASE_URL}/register", timeout=5)
        if response.status_code == 200:
            return True, "Register page loaded successfully"
        return False, f"Register page returned status code: {response.status_code}"
    except Exception as e:
        return False, f"Register page test error: {str(e)}"

def test_dashboard_redirect():
    """Test that dashboard redirects to login (since we're not authenticated)."""
    # Note: This is a client-side redirect, so the server will still return 200 for the SPA
    # We just check if the route is accessible
    try:
        response = requests.get(f"{BASE_URL}/dashboard", timeout=5)
        if response.status_code == 200:
            return True, "Dashboard route is accessible"
        return False, f"Dashboard route returned status code: {response.status_code}"
    except Exception as e:
        return False, f"Dashboard test error: {str(e)}"

def run_tests():
    """Run all Step 4 tests."""
    results = {
        "step": "Step 4: Frontend Authentication UI",
        "timestamp": datetime.now().isoformat(),
        "tests": []
    }
    
    # Test 1: Login Page
    success, message = test_login_page()
    results["tests"].append({
        "name": "Login Page Accessibility",
        "passed": success,
        "message": message
    })
    
    # Test 2: Register Page
    success, message = test_register_page()
    results["tests"].append({
        "name": "Register Page Accessibility",
        "passed": success,
        "message": message
    })
    
    # Test 3: Dashboard Route
    success, message = test_dashboard_redirect()
    results["tests"].append({
        "name": "Dashboard Route Accessibility",
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
    with open("test_results_step4.json", "w") as f:
        json.dump(results, f, indent=2)
    
    exit(0 if results["all_passed"] else 1)
