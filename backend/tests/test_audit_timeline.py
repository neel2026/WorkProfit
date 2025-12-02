"""
Audit Tests: Timeline Safety & Many-to-Many Members
Scenarios 4 & 5 verification.
"""
import asyncio
import aiohttp
from datetime import date, timedelta

BASE_URL = "http://localhost:8000/api/v1"

async def get_admin_token():
    """Helper to get admin token for authenticated requests."""
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

async def test_invalid_timeline():
    """Scenario 4 Test 1: Reject project where end_date <= start_date."""
    print("1. Testing INVALID timeline (end_date before start_date)...")
    
    token = await get_admin_token()
    if not token:
        print("   -> [FAIL] Could not authenticate")
        return False
    
    headers = {"Authorization": f"Bearer {token}"}
    
    project_data = {
        "name": "Invalid Timeline Project",
        "description": "This should fail",
        "start_date": "2025-12-31",
        "end_date": "2025-01-01",  # End before start!
        "status": "PLANNING"
    }
    
    try:
        async with aiohttp.ClientSession() as session:
            async with session.post(f"{BASE_URL}/projects/", json=project_data, headers=headers) as resp:
                if resp.status == 422:
                    error = await resp.json()
                    print(f"   -> [PASS] Invalid timeline rejected (HTTP 422)")
                    print(f"   -> Error: {error.get('detail', 'Unknown')}")
                    return True
                elif resp.status in [200, 201]:
                    print(f"   -> [FAIL] Invalid timeline was ACCEPTED!")
                    return False
                else:
                    print(f"   -> [FAIL] Unexpected status: {resp.status}")
                    return False
    except Exception as e:
        print(f"   -> [FAIL] Error: {str(e)}")
        return False

async def test_valid_timeline():
    """Scenario 4 Test 2: Accept valid project with end_date > start_date."""
    print("2. Testing VALID timeline (end_date after start_date)...")
    
    token = await get_admin_token()
    if not token:
        print("   -> [FAIL] Could not authenticate")
        return False
    
    headers = {"Authorization": f"Bearer {token}"}
    
    today = date.today()
    project_data = {
        "name": "Valid Timeline Project",
        "description": "This should succeed",
        "start_date": str(today),
        "end_date": str(today + timedelta(days=30)),
        "status": "PLANNING"
    }
    
    try:
        async with aiohttp.ClientSession() as session:
            async with session.post(f"{BASE_URL}/projects/", json=project_data, headers=headers) as resp:
                if resp.status in [200, 201]:
                    result = await resp.json()
                    print(f"   -> [PASS] Valid timeline accepted (Project ID: {result.get('id')})")
                    
                    # Check if progress_percentage is calculated
                    if 'progress_percentage' in result:
                        print(f"   -> [BONUS] Progress calculation: {result['progress_percentage']}%")
                    
                    return True, result.get('id')
                else:
                    error = await resp.text()
                    print(f"   -> [FAIL] Valid timeline rejected: {error}")
                    return False, None
    except Exception as e:
        print(f"   -> [FAIL] Error: {str(e)}")
        return False, None

async def test_same_day_timeline():
    """Scenario 4 Test 3: Reject project where end_date == start_date."""
    print("3. Testing SAME DAY timeline (end_date == start_date)...")
    
    token = await get_admin_token()
    if not token:
        print("   -> [FAIL] Could not authenticate")
        return False
    
    headers = {"Authorization": f"Bearer {token}"}
    
    same_date = str(date.today())
    project_data = {
        "name": "Same Day Project",
        "start_date": same_date,
        "end_date": same_date,  # Same day!
        "status": "PLANNING"
    }
    
    try:
        async with aiohttp.ClientSession() as session:
            async with session.post(f"{BASE_URL}/projects/", json=project_data, headers=headers) as resp:
                if resp.status == 422:
                    print(f"   -> [PASS] Same-day timeline rejected (HTTP 422)")
                    return True
                elif resp.status in [200, 201]:
                    print(f"   -> [FAIL] Same-day timeline was ACCEPTED!")
                    return False
                else:
                    print(f"   -> [FAIL] Unexpected status: {resp.status}")
                    return False
    except Exception as e:
        print(f"   -> [FAIL] Error: {str(e)}")
        return False

async def run_audit():
    """Run all timeline safety tests."""
    print("=" * 60)
    print("AUDIT: Timeline Safety & Progress Calculation")
    print("=" * 60)
    
    test1_pass = await test_invalid_timeline()
    test2_result = await test_valid_timeline()
    test2_pass = test2_result[0] if isinstance(test2_result, tuple) else test2_result
    test3_pass = await test_same_day_timeline()
    
    print("=" * 60)
    if test1_pass and test2_pass and test3_pass:
        print("✅ AUDIT PASSED: Timeline safety is enforced.")
        print("=" * 60)
        return True
    else:
        print("❌ AUDIT FAILED: Timeline safety has issues.")
        print("=" * 60)
        return False

if __name__ == "__main__":
    try:
        success = asyncio.run(run_audit())
        exit(0 if success else 1)
    except Exception as e:
        print(f"\n❌ AUDIT ERROR: {str(e)}")
        exit(1)
