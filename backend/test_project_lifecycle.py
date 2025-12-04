import asyncio
import httpx
from datetime import datetime, timedelta

BASE_URL = "http://localhost:8000/api/v1"
ADMIN_EMAIL = "admin@workprofit.com"
ADMIN_PASSWORD = "admin123"

async def test_project_lifecycle():
    async with httpx.AsyncClient() as client:
        # 1. Login
        login_res = await client.post(f"{BASE_URL}/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert login_res.status_code == 200, f"Login failed: {login_res.text}"
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        print("✅ Login successful")

        # 2. Create Project
        start_date = datetime.now().date().isoformat()
        end_date = (datetime.now() + timedelta(days=30)).date().isoformat()
        
        create_res = await client.post(f"{BASE_URL}/projects/", json={
            "name": "Test Lifecycle Project",
            "description": "Testing update and delete",
            "start_date": start_date,
            "end_date": end_date,
            "status": "PLANNING"
        }, headers=headers)
        assert create_res.status_code == 201, f"Create failed: {create_res.text}"
        project_id = create_res.json()["id"]
        print(f"✅ Project created (ID: {project_id})")

        # 3. Update Project (Valid)
        update_res = await client.patch(f"{BASE_URL}/projects/{project_id}", json={
            "name": "Updated Project Name",
            "status": "IN_PROGRESS"
        }, headers=headers)
        assert update_res.status_code == 200, f"Update failed: {update_res.text}"
        assert update_res.json()["name"] == "Updated Project Name"
        print("✅ Project updated successfully")

        # 4. Update Project (Invalid Date)
        invalid_end_date = (datetime.now() - timedelta(days=1)).date().isoformat()
        invalid_update_res = await client.patch(f"{BASE_URL}/projects/{project_id}", json={
            "end_date": invalid_end_date
        }, headers=headers)
        assert invalid_update_res.status_code == 400, f"Invalid update should fail but got {invalid_update_res.status_code}"
        print("✅ Invalid date update correctly rejected by backend")

        # 5. Delete Project
        delete_res = await client.delete(f"{BASE_URL}/projects/{project_id}", headers=headers)
        assert delete_res.status_code == 204, f"Delete failed: {delete_res.text}"
        
        # Verify deletion
        get_res = await client.get(f"{BASE_URL}/projects/{project_id}", headers=headers)
        assert get_res.status_code == 404
        print("✅ Project deleted successfully")

if __name__ == "__main__":
    asyncio.run(test_project_lifecycle())
