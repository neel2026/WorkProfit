"""
Step 2 Verification: Database & User Model
Tests database connection and schema integrity.
"""
import asyncio
import asyncpg
import json
from datetime import datetime
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+asyncpg://postgres:0000@localhost/workprofit").replace("postgresql+asyncpg://", "postgresql://")

async def test_database_connection():
    """Test if database is accessible."""
    try:
        conn = await asyncpg.connect(DATABASE_URL)
        await conn.close()
        return True, "Database connection successful"
    except Exception as e:
        return False, f"Database connection failed: {str(e)}"

async def test_users_table_exists():
    """Test if users table exists."""
    try:
        conn = await asyncpg.connect(DATABASE_URL)
        exists = await conn.fetchval(
            "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users')"
        )
        await conn.close()
        if exists:
            return True, "Users table exists"
        return False, "Users table does not exist"
    except Exception as e:
        return False, f"Table check failed: {str(e)}"

async def test_users_table_schema():
    """Test if users table has all required columns."""
    expected_columns = [
        "id", "email", "hashed_password", "first_name", "last_name",
        "phone_number", "role", "department", "avatar_url",
        "is_active", "last_login", "created_at"
    ]
    
    try:
        conn = await asyncpg.connect(DATABASE_URL)
        columns = await conn.fetch(
            "SELECT column_name FROM information_schema.columns WHERE table_name = 'users'"
        )
        column_names = [col['column_name'] for col in columns]
        await conn.close()
        
        missing = [col for col in expected_columns if col not in column_names]
        if missing:
            return False, f"Missing columns: {', '.join(missing)}"
        return True, f"All {len(expected_columns)} required columns present"
    except Exception as e:
        return False, f"Schema check failed: {str(e)}"

async def test_alembic_version():
    """Test if Alembic migration tracking is set up."""
    try:
        conn = await asyncpg.connect(DATABASE_URL)
        exists = await conn.fetchval(
            "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'alembic_version')"
        )
        await conn.close()
        if exists:
            return True, "Alembic migration tracking is active"
        return False, "Alembic version table missing"
    except Exception as e:
        return False, f"Alembic check failed: {str(e)}"

async def run_tests():
    """Run all Step 2 tests."""
    results = {
        "step": "Step 2: Database & User Model",
        "timestamp": datetime.now().isoformat(),
        "tests": []
    }
    
    # Test 1: Database Connection
    success, message = await test_database_connection()
    results["tests"].append({
        "name": "Database Connection",
        "passed": success,
        "message": message
    })
    
    # Test 2: Users Table Exists
    success, message = await test_users_table_exists()
    results["tests"].append({
        "name": "Users Table Exists",
        "passed": success,
        "message": message
    })
    
    # Test 3: Users Table Schema
    success, message = await test_users_table_schema()
    results["tests"].append({
        "name": "Users Table Schema",
        "passed": success,
        "message": message
    })
    
    # Test 4: Alembic Setup
    success, message = await test_alembic_version()
    results["tests"].append({
        "name": "Alembic Migration Tracking",
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
    with open("test_results_step2.json", "w") as f:
        json.dump(results, f, indent=2)
    
    exit(0 if results["all_passed"] else 1)
