"""
Step 5 Verification: User Management API
Tests listing, updating, and deleting users.
"""
import asyncio
import aiohttp
import json
from datetime import datetime

BASE_URL = "http://localhost:8000/api/v1"

async def get_admin_token():
    """Helper to get an admin token."""
    login_data = {
        "email": "admin@workprofit.com",
        "password": "admin123"
    }
    async with aiohttp.ClientSession() as session:
        async with session.post(f"{BASE_URL}/auth/login", json=login_data) as resp:
            if resp.status == 200:
                data = await resp.json()
                return data["access_token"]
            return None

async def test_list_users():
    """Test listing users (Admin only)."""
    token = await get_admin_token()
    if not token:
        return False, "Could not get admin token"
        
    headers = {"Authorization": f"Bearer {token}"}
    
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(f"{BASE_URL}/users/", headers=headers) as resp:
                if resp.status == 200:
                    users = await resp.json()
                    if isinstance(users, list) and len(users) > 0:
                        return True, f"Successfully listed {len(users)} users"
                    return False, "User list is empty or invalid format"
                return False, f"List users failed: {resp.status}"
    except Exception as e:
        return False, f"List users error: {str(e)}"

async def test_update_user():
    """Test updating a user's role."""
    token = await get_admin_token()
    if not token:
        return False, "Could not get admin token"
        
    headers = {"Authorization": f"Bearer {token}"}
    
    # First get a user to update (we'll use the one with ID 2 or 3 created in previous steps)
    # Let's try to update the user we created in Step 3 (ID 3 usually)
    user_id = 3 
    
    update_data = {
        "role": "PROJECT_MANAGER",
        "department": "SALES"
    }
    
    try:
        async with aiohttp.ClientSession() as session:
            async with session.patch(f"{BASE_URL}/users/{user_id}", json=update_data, headers=headers) as resp:
                if resp.status == 200:
                    user = await resp.json()
                    if user["role"] == "PROJECT_MANAGER" and user["department"] == "SALES":
                        return True, "User role and department updated successfully"
                    return False, "Update response did not match requested changes"
                elif resp.status == 404:
                    return False, f"User ID {user_id} not found (test data might be missing)"
                return False, f"Update user failed: {resp.status}"
    except Exception as e:
        return False, f"Update user error: {str(e)}"

async def run_tests():
    """Run all Step 5 tests."""
    results = {
        "step": "Step 5: User Management API",
        "timestamp": datetime.now().isoformat(),
        "tests": []
    }
    
    # Test 1: List Users
    success, message = await test_list_users()
    results["tests"].append({
        "name": "List Users (Admin)",
        "passed": success,
        "message": message
    })
    
    # Test 2: Update User
    success, message = await test_update_user()
    results["tests"].append({
        "name": "Update User Role/Dept",
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
    with open("test_results_step5.json", "w") as f:
        json.dump(results, f, indent=2)
    
    exit(0 if results["all_passed"] else 1)
