"""
Audit Test: Ghost Staff Prevention
Verifies that STAFF/TEAM_LEAD/PROJECT_MANAGER roles require a department.
"""
import asyncio
import aiohttp

BASE_URL = "http://localhost:8000/api/v1"

async def test_staff_without_department():
    """Negative Test: Create STAFF user without department (should fail)."""
    print("1. Testing STAFF without department (SHOULD FAIL)...")
    
    import time
    unique_email = f"ghost_staff_{int(time.time())}@example.com"
    
    user_data = {
        "email": unique_email,
        "password": "testpass123",
        "first_name": "Ghost",
        "last_name": "Staff",
        "role": "STAFF"
        # Intentionally omitting department
    }
    
    try:
        async with aiohttp.ClientSession() as session:
            async with session.post(f"{BASE_URL}/auth/register", json=user_data) as resp:
                if resp.status == 422:
                    error = await resp.json()
                    print(f"   -> [PASS] Ghost staff correctly rejected (HTTP 422)")
                    print(f"   -> Error: {error.get('detail', 'Unknown')}")
                    return True
                elif resp.status in [200, 201]:
                    print(f"   -> [FAIL] Ghost staff was ACCEPTED (should have been rejected!)")
                    return False
                else:
                    print(f"   -> [FAIL] Unexpected status: {resp.status}")
                    return False
    except Exception as e:
        print(f"   -> [FAIL] Error: {str(e)}")
        return False

async def test_staff_with_department():
    """Positive Test: Create STAFF user with department (should succeed)."""
    print("2. Testing STAFF with department (SHOULD SUCCEED)...")
    
    import time
    unique_email = f"valid_staff_{int(time.time())}@example.com"
    
    user_data = {
        "email": unique_email,
        "password": "testpass123",
        "first_name": "Valid",
        "last_name": "Staff",
        "role": "STAFF",
        "department": "DEVELOPER"
    }
    
    try:
        async with aiohttp.ClientSession() as session:
            async with session.post(f"{BASE_URL}/auth/register", json=user_data) as resp:
                if resp.status in [200, 201]:
                    result = await resp.json()
                    print(f"   -> [PASS] Staff with department created successfully (ID: {result.get('id')})")
                    return True
                else:
                    error = await resp.text()
                    print(f"   -> [FAIL] Valid staff rejected: {error}")
                    return False
    except Exception as e:
        print(f"   -> [FAIL] Error: {str(e)}")
        return False

async def test_admin_without_department():
    """Positive Test: Create ADMIN user without department (should succeed)."""
    print("3. Testing ADMIN without department (SHOULD SUCCEED)...")
    
    import time
    unique_email = f"admin_nodept_{int(time.time())}@example.com"
    
    user_data = {
        "email": unique_email,
        "password": "testpass123",
        "first_name": "Admin",
        "last_name": "User",
        "role": "ADMIN"
        # No department - this is allowed for ADMIN
    }
    
    try:
        async with aiohttp.ClientSession() as session:
            async with session.post(f"{BASE_URL}/auth/register", json=user_data) as resp:
                if resp.status in [200, 201]:
                    result = await resp.json()
                    print(f"   -> [PASS] Admin without department created successfully (ID: {result.get('id')})")
                    return True
                else:
                    error = await resp.text()
                    print(f"   -> [FAIL] Admin incorrectly rejected: {error}")
                    return False
    except Exception as e:
        print(f"   -> [FAIL] Error: {str(e)}")
        return False

async def run_audit():
    """Run all ghost staff prevention tests."""
    print("=" * 60)
    print("AUDIT: Ghost Staff Prevention")
    print("=" * 60)
    
    test1_pass = await test_staff_without_department()
    test2_pass = await test_staff_with_department()
    test3_pass = await test_admin_without_department()
    
    print("=" * 60)
    if test1_pass and test2_pass and test3_pass:
        print("✅ AUDIT PASSED: Ghost staff prevention is working.")
        print("=" * 60)
        return True
    else:
        print("❌ AUDIT FAILED: Ghost staff prevention has issues.")
        print("=" * 60)
        return False

if __name__ == "__main__":
    try:
        success = asyncio.run(run_audit())
        exit(0 if success else 1)
    except Exception as e:
        print(f"\n❌ AUDIT ERROR: {str(e)}")
        exit(1)
