import requests

# Test backend API endpoints with authentication
BASE_URL = "http://localhost:8000/api/v1"

print("="*60)
print("COMPREHENSIVE BACKEND API TEST")
print("="*60)

# Step 1: Login and get token
print("\n[STEP 1] Testing Login...")
try:
    response = requests.post(
        f"{BASE_URL}/auth/login",
        json={"email": "admin@workprofit.com", "password": "admin123"}
    )
    if response.status_code == 200:
        data = response.json()
        token = data.get('access_token')
        print(f"✅ Login successful!")
        print(f"   Token: {token[:50]}...")
        headers = {"Authorization": f"Bearer {token}"}
    else:
        print(f"❌ Login failed: {response.json()}")
        exit(1)
except Exception as e:
    print(f"❌ Error: {e}")
    exit(1)

# Step 2: Get current user
print("\n[STEP 2] Getting current user...")
try:
    response = requests.get(f"{BASE_URL}/auth/me", headers=headers)
    if response.status_code == 200:
        user = response.json()
        print(f"✅ Current user: {user.get('first_name')} {user.get('last_name')} ({user.get('email')})")
        print(f"   Role: {user.get('role')}")
    else:
        print(f"❌ Failed: {response.json()}")
except Exception as e:
    print(f"❌ Error: {e}")

# Step 3: Get all users
print("\n[STEP 3] Getting all users...")
try:
    response = requests.get(f"{BASE_URL}/users/", headers=headers)
    if response.status_code == 200:
        users = response.json()
        print(f"✅ Found {len(users)} users:")
        for user in users[:5]:  # Show first 5
            print(f"   - {user.get('first_name')} {user.get('last_name')} ({user.get('role')})")
    else:
        print(f"❌ Failed: {response.json()}")
except Exception as e:
    print(f"❌ Error: {e}")

# Step 4: Get all projects
print("\n[STEP 4] Getting all projects...")
try:
    response = requests.get(f"{BASE_URL}/projects/", headers=headers)
    if response.status_code == 200:
        projects = response.json()
        print(f"✅ Found {len(projects)} projects:")
        for project in projects[:5]:  # Show first 5
            print(f"   - {project.get('name')} (Status: {project.get('status')})")
    else:
        print(f"❌ Failed: {response.json()}")
except Exception as e:
    print(f"❌ Error: {e}")

# Step 5: Create a test project
print("\n[STEP 5] Creating a test project...")
try:
    new_project = {
        "name": "Test Project API",
        "description": "Created via API test",
        "start_date": "2025-12-01",
        "end_date": "2025-12-31",
        "status": "PLANNING"
    }
    response = requests.post(f"{BASE_URL}/projects/", json=new_project, headers=headers)
    if response.status_code == 200 or response.status_code == 201:
        project = response.json()
        print(f"✅ Project created successfully!")
        print(f"   ID: {project.get('id')}, Name: {project.get('name')}")
        test_project_id = project.get('id')
    else:
        print(f"❌ Failed: {response.status_code} - {response.text}")
        test_project_id = None
except Exception as e:
    print(f"❌ Error: {e}")
    test_project_id = None

# Step 6: Update the test project (if created)
if test_project_id:
    print(f"\n[STEP 6] Updating project ID {test_project_id}...")
    try:
        update_data = {
            "status": "IN_PROGRESS",
            "description": "Updated via API test"
        }
        response = requests.patch(f"{BASE_URL}/projects/{test_project_id}", json=update_data, headers=headers)
        if response.status_code == 200:
            project = response.json()
            print(f"✅ Project updated successfully!")
            print(f"   Status: {project.get('status')}")
        else:
            print(f"❌ Failed: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"❌ Error: {e}")

    # Step 7: Delete the test project
    print(f"\n[STEP 7] Deleting test project ID {test_project_id}...")
    try:
        response = requests.delete(f"{BASE_URL}/projects/{test_project_id}", headers=headers)
        if response.status_code == 200 or response.status_code == 204:
            print(f"✅ Project deleted successfully!")
        else:
            print(f"❌ Failed: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"❌ Error: {e}")

# Step 8: Test creating a user
print("\n[STEP 8] Creating a test user...")
try:
    new_user = {
        "email": "test.user@workprofit.com",
        "password": "TestPass123!",
        "first_name": "Test",
        "last_name": "User",
        "role": "STAFF",
        "department": "DEVELOPER"
    }
    response = requests.post(f"{BASE_URL}/users/", json=new_user, headers=headers)
    if response.status_code == 200 or response.status_code == 201:
        user = response.json()
        print(f"✅ User created successfully!")
        print(f"   ID: {user.get('id')}, Email: {user.get('email')}")
        test_user_id = user.get('id')
    else:
        print(f"⚠️  User creation response: {response.status_code} - {response.text}")
        test_user_id = None
except Exception as e:
    print(f"⚠️  Error: {e}")
    test_user_id = None

# Step 9: Delete test user if created
if test_user_id:
    print(f"\n[STEP 9] Deleting test user ID {test_user_id}...")
    try:
        response = requests.delete(f"{BASE_URL}/users/{test_user_id}", headers=headers)
        if response.status_code == 200 or response.status_code == 204:
            print(f"✅ User deleted successfully!")
        else:
            print(f"❌ Failed: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"❌ Error: {e}")

print("\n" + "="*60)
print("✅ API TESTING COMPLETED!")
print("="*60)
