"""
Audit Test: Role Consistency
Verifies that only approved roles are accepted and invalid roles are rejected.
"""
import asyncio
import aiohttp
import json

BASE_URL = "http://localhost:8000/api/v1"

async def test_valid_role():
    """Positive Test: Create user with valid role 'STAFF'."""
    print("1. Testing VALID role (STAFF)...")
    
    # Use unique email to avoid conflicts
    import time
    unique_email = f"staff_test_{int(time.time())}@example.com"
    
    user_data = {
        "email": unique_email,
        "password": "testpass123",
        "first_name": "Test",
        "last_name": "Staff",
        "role": "STAFF",
        "department": "DEVELOPER"
    }
    
    try:
        async with aiohttp.ClientSession() as session:
            async with session.post(f"{BASE_URL}/auth/register", json=user_data) as resp:
                if resp.status in [200, 201]:  # Accept both 200 and 201
                    result = await resp.json()
                    print(f"   -> [PASS] User created successfully with role=STAFF (ID: {result.get('id')})")
                    return True
                else:
                    error = await resp.text()
                    print(f"   -> [FAIL] Registration failed with status {resp.status}: {error}")
                    return False
    except Exception as e:
        print(f"   -> [FAIL] Error: {str(e)}")
        return False

async def test_invalid_role():
    """Negative Test: Attempt to create user with invalid role 'MEMBER'."""
    print("2. Testing INVALID role (MEMBER)...")
    
    # Use unique email
    import time
    unique_email = f"member_test_{int(time.time())}@example.com"
    
    user_data = {
        "email": unique_email,
        "password": "testpass123",
        "first_name": "Test",
        "last_name": "Member",
        "role": "MEMBER",  # This should be rejected
        "department": "DEVELOPER"
    }
    
    try:
        async with aiohttp.ClientSession() as session:
            async with session.post(f"{BASE_URL}/auth/register", json=user_data) as resp:
                if resp.status == 422:  # Validation error expected
                    error = await resp.json()
                    print(f"   -> [PASS] Invalid role 'MEMBER' correctly rejected (HTTP 422)")
                    print(f"   -> Validation error: {error.get('detail', 'Unknown')}")
                    return True
                elif resp.status == 200:
                    print(f"   -> [FAIL] Invalid role 'MEMBER' was ACCEPTED (should have been rejected!)")
                    return False
                else:
                    print(f"   -> [FAIL] Unexpected status code: {resp.status}")
                    return False
    except Exception as e:
        print(f"   -> [FAIL] Error: {str(e)}")
        return False

async def run_audit():
    """Run both role consistency tests."""
    print("=" * 60)
    print("AUDIT: Role Consistency")
    print("=" * 60)
    
    test1_pass = await test_valid_role()
    test2_pass = await test_invalid_role()
    
    print("=" * 60)
    if test1_pass and test2_pass:
        print("✅ AUDIT PASSED: Role validation is working correctly.")
        print("=" * 60)
        return True
    else:
        print("❌ AUDIT FAILED: Role validation has issues.")
        print("=" * 60)
        return False

if __name__ == "__main__":
    try:
        success = asyncio.run(run_audit())
        exit(0 if success else 1)
    except Exception as e:
        print(f"\n❌ AUDIT ERROR: {str(e)}")
        exit(1)
