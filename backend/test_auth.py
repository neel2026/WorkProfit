import asyncio
import aiohttp
import json

BASE_URL = "http://localhost:8000/api/v1/auth"

async def test_auth():
    """Test the authentication endpoints."""
    
    async with aiohttp.ClientSession() as session:
        print("=" * 50)
        print("Testing Authentication Endpoints")
        print("=" * 50)
        
        # Test 1: Register a new user
        print("\n1. Testing User Registration...")
        register_data = {
            "email": "admin@workprofit.com",
            "password": "admin123",
            "first_name": "Admin",
            "last_name": "User",
            "phone_number": "1234567890",
            "role": "ADMIN",
            "department": "HR"
        }
        
        try:
            async with session.post(f"{BASE_URL}/register", json=register_data) as resp:
                if resp.status == 201:
                    user = await resp.json()
                    print(f"✓ Registration successful!")
                    print(f"  User ID: {user['id']}")
                    print(f"  Email: {user['email']}")
                    print(f"  Role: {user['role']}")
                else:
                    error = await resp.text()
                    print(f"✗ Registration failed: {resp.status}")
                    print(f"  Error: {error}")
        except Exception as e:
            print(f"✗ Registration error: {e}")
        
        # Test 2: Login with the registered user
        print("\n2. Testing User Login...")
        login_data = {
            "email": "admin@workprofit.com",
            "password": "admin123"
        }
        
        try:
            async with session.post(f"{BASE_URL}/login", json=login_data) as resp:
                if resp.status == 200:
                    token_data = await resp.json()
                    print(f"✓ Login successful!")
                    print(f"  Token: {token_data['access_token'][:50]}...")
                    print(f"  Type: {token_data['token_type']}")
                else:
                    error = await resp.text()
                    print(f"✗ Login failed: {resp.status}")
                    print(f"  Error: {error}")
        except Exception as e:
            print(f"✗ Login error: {e}")
        
        # Test 3: Test invalid login
        print("\n3. Testing Invalid Login...")
        invalid_login = {
            "email": "admin@workprofit.com",
            "password": "wrongpassword"
        }
        
        try:
            async with session.post(f"{BASE_URL}/login", json=invalid_login) as resp:
                if resp.status == 401:
                    print(f"✓ Invalid login correctly rejected (401)")
                else:
                    print(f"✗ Unexpected response: {resp.status}")
        except Exception as e:
            print(f"✗ Test error: {e}")
        
        print("\n" + "=" * 50)
        print("Tests Complete!")
        print("=" * 50)

if __name__ == "__main__":
    asyncio.run(test_auth())
