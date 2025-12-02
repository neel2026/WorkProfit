"""
Step 1 Verification: Project Initialization
Tests that both backend and frontend servers are running correctly.
"""
import requests
import json
from datetime import datetime

def test_backend_server():
    """Test if backend server is reachable."""
    try:
        response = requests.get("http://localhost:8000/", timeout=5)
        if response.status_code == 200:
            data = response.json()
            if "message" in data:
                return True, f"Backend responded: {data['message']}"
            return False, "Backend response missing 'message' field"
        return False, f"Backend returned status code: {response.status_code}"
    except requests.exceptions.ConnectionError:
        return False, "Backend server is not running on port 8000"
    except Exception as e:
        return False, f"Backend test error: {str(e)}"

def test_frontend_server():
    """Test if frontend server is reachable."""
    try:
        response = requests.get("http://localhost:5174/", timeout=5)
        if response.status_code == 200:
            return True, "Frontend server is running"
        return False, f"Frontend returned status code: {response.status_code}"
    except requests.exceptions.ConnectionError:
        # Try alternate port
        try:
            response = requests.get("http://localhost:5173/", timeout=5)
            if response.status_code == 200:
                return True, "Frontend server is running (port 5173)"
            return False, f"Frontend returned status code: {response.status_code}"
        except:
            return False, "Frontend server is not running on port 5173 or 5174"
    except Exception as e:
        return False, f"Frontend test error: {str(e)}"

def run_tests():
    """Run all Step 1 tests."""
    results = {
        "step": "Step 1: Project Initialization",
        "timestamp": datetime.now().isoformat(),
        "tests": []
    }
    
    # Test 1: Backend Server
    success, message = test_backend_server()
    results["tests"].append({
        "name": "Backend Server",
        "passed": success,
        "message": message
    })
    
    # Test 2: Frontend Server
    success, message = test_frontend_server()
    results["tests"].append({
        "name": "Frontend Server",
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
    with open("test_results_step1.json", "w") as f:
        json.dump(results, f, indent=2)
    
    exit(0 if results["all_passed"] else 1)
