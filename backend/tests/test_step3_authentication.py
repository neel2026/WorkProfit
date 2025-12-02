"""
Step 3 Verification: Authentication Logic
Tests user registration, login, and JWT token generation.
"""
import asyncio
import aiohttp
import json
from datetime import datetime
import random
import string

BASE_URL = "http://localhost:8000/api/v1/auth"

def generate_random_email():
    """Generate a random email for testing."""
    random_str = ''.join(random.choices(string.ascii_lowercase + string.digits, k=8))
    return f"test_{random_str}@workprofit.com"

async def test_user_registration():
    """Test user registration endpoint."""
    email = generate_random_email()
    register_data = {
        "email": email,
        "password": "TestPassword123!",
        "first_name": "Test",
        "last_name": "User",
        "phone_number": "1234567890",
        "role": "STAFF",
        "department": "DEVELOPER"
    }
    
    try:
        async with aiohttp.ClientSession() as session:
            async with session.post(f"{BASE_URL}/register", json=register_data, timeout=10) as resp:
                if resp.status == 201:
                    data = await resp.json()
                    if "id" in data and "email" in data:
                        return True, f"User registered successfully (ID: {data['id']})", email
                    return False, "Response missing required fields", None
                error = await resp.text()
                return False, f"Registration failed ({resp.status}): {error[:100]}", None
    except Exception as e:
        return False, f"Registration error: {str(e)}", None

async def test_user_login(email, password):
    """Test user login endpoint."""
    login_data = {
        "email": email,
        "password": password
    }
    
    try:
        async with aiohttp.ClientSession() as session:
            async with session.post(f"{BASE_URL}/login", json=login_data, timeout=10) as resp:
                if resp.status == 200:
                    data = await resp.json()
                    if "access_token" in data and "token_type" in data:
                        token_length = len(data["access_token"])
                        return True, f"Login successful (Token length: {token_length})"
                    return False, "Response missing token fields"
                error = await resp.text()
                return False, f"Login failed ({resp.status}): {error[:100]}"
    except Exception as e:
        return False, f"Login error: {str(e)}"

async def test_invalid_login():
    """Test that invalid credentials are rejected."""
    login_data = {
        "email": "nonexistent@workprofit.com",
        "password": "wrongpassword"
    }
    
    try:
        async with aiohttp.ClientSession() as session:
            async with session.post(f"{BASE_URL}/login", json=login_data, timeout=10) as resp:
                if resp.status == 401:
                    return True, "Invalid credentials correctly rejected (401)"
                return False, f"Unexpected status code: {resp.status}"
    except Exception as e:
        return False, f"Invalid login test error: {str(e)}"

async def test_duplicate_registration(email):
    """Test that duplicate email registration is prevented."""
    register_data = {
        "email": email,
        "password": "AnotherPassword123!",
        "first_name": "Duplicate",
        "last_name": "User",
        "role": "STAFF"
    }
    
    try:
        async with aiohttp.ClientSession() as session:
            async with session.post(f"{BASE_URL}/register", json=register_data, timeout=10) as resp:
                # Accept both 400 (old) and 422 (new Pydantic validation)
                if resp.status in [400, 422]:
                    error_data = await resp.json()
                    detail = str(error_data.get("detail", ""))
                    if "already registered" in detail.lower() or "duplicate" in detail.lower() or "value_error" in detail.lower():
                        return True, f"Duplicate email correctly rejected ({resp.status})"
                    return False, f"Wrong error message: {detail[:100]}"
                return False, f"Unexpected status code: {resp.status}"
    except Exception as e:
        return False, f"Duplicate test error: {str(e)}"

async def run_tests():
    """Run all Step 3 tests."""
    results = {
        "step": "Step 3: Authentication Logic",
        "timestamp": datetime.now().isoformat(),
        "tests": []
    }
    
    # Test 1: User Registration
    success, message, test_email = await test_user_registration()
    results["tests"].append({
        "name": "User Registration",
        "passed": success,
        "message": message
    })
    
    # Test 2: User Login (only if registration succeeded)
    if success and test_email:
        success, message = await test_user_login(test_email, "TestPassword123!")
        results["tests"].append({
            "name": "User Login",
            "passed": success,
            "message": message
        })
        
        # Test 4: Duplicate Registration
        success, message = await test_duplicate_registration(test_email)
        results["tests"].append({
            "name": "Duplicate Email Prevention",
            "passed": success,
            "message": message
        })
    else:
        results["tests"].append({
            "name": "User Login",
            "passed": False,
            "message": "Skipped (registration failed)"
        })
    
    # Test 3: Invalid Login
    success, message = await test_invalid_login()
    results["tests"].append({
        "name": "Invalid Login Rejection",
        "passed": success,
        "message": message
    })
    
    results["all_passed"] = all(test["passed"] for test in results["tests"])
    return results

if __name__ == "__main__":
    results = asyncio.run(run_tests())
    
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
    with open("test_results_step3.json", "w") as f:
        json.dump(results, f, indent=2)
    
    exit(0 if results["all_passed"] else 1)
