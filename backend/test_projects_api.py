"""
Test Projects API endpoint directly
"""
import requests

BASE_URL = "http://localhost:8000/api/v1"

# First, login to get token
login_data = {
    "email": "admin@workprofit.com",
    "password": "admin123"
}

print("1. Testing Login...")
try:
    response = requests.post(f"{BASE_URL}/auth/login", json=login_data)
    print(f"   Status: {response.status_code}")
    if response.status_code == 200:
        token = response.json()["access_token"]
        print(f"   ✓ Login successful, token length: {len(token)}")
        
        # Now test projects endpoint
        print("\n2. Testing Projects Endpoint...")
        headers = {"Authorization": f"Bearer {token}"}
        
        projects_response = requests.get(f"{BASE_URL}/projects/", headers=headers)
        print(f"   Status: {projects_response.status_code}")
        
        if projects_response.status_code == 200:
            projects = projects_response.json()
            print(f"   ✓ Projects fetched successfully")
            print(f"   Count: {len(projects)} projects")
            if len(projects) > 0:
                print(f"   First project: {projects[0]['name']}")
        else:
            print(f"   ✗ Error: {projects_response.text}")
    else:
        print(f"   ✗ Login failed: {response.text}")
except Exception as e:
    print(f"   ✗ Exception: {str(e)}")
