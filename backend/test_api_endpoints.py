import requests

# Test backend API endpoints
BASE_URL = "http://localhost:8000/api/v1"

print("Testing Backend API...")
print("="*50)

# Test 1: Login endpoint
print("\n1. Testing Login Endpoint...")
try:
    response = requests.post(
        f"{BASE_URL}/auth/login",
        json={"email": "admin@workprofit.com", "password": "admin123"}
    )
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.json()}")
except Exception as e:
    print(f"Error: {e}")

# Test 2: Get users (without token)
print("\n2. Testing Get Users (without auth)...")
try:
    response = requests.get(f"{BASE_URL}/users/")
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.json() if response.status_code == 200 else response.text}")
except Exception as e:
    print(f"Error: {e}")

# Test 3: Get projects (without token)
print("\n3. Testing Get Projects (without auth)...")
try:
    response = requests.get(f"{BASE_URL}/projects/")
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.json() if response.status_code == 200 else response.text}")
except Exception as e:
    print(f"Error: {e}")

print("\n" + "="*50)
print("Testing complete!")
