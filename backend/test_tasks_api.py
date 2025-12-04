import asyncio
import httpx
from datetime import datetime, timedelta

BASE_URL = "http://localhost:8000/api/v1"
ADMIN_EMAIL = "admin@workprofit.com"
ADMIN_PASSWORD = "admin123"

async def test_tasks_api():
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
        create_project_res = await client.post(f"{BASE_URL}/projects/", json={
            "name": "Task Test Project",
            "start_date": start_date,
            "end_date": end_date
        }, headers=headers)
        assert create_project_res.status_code == 201
        project_id = create_project_res.json()["id"]
        print(f"✅ Project created (ID: {project_id})")

        # 3. Create Task
        create_task_res = await client.post(f"{BASE_URL}/tasks/", json={
            "title": "Test Task",
            "description": "This is a test task",
            "project_id": project_id,
            "status": "TODO",
            "priority": "HIGH"
        }, headers=headers)
        assert create_task_res.status_code == 201, f"Create task failed: {create_task_res.text}"
        task_id = create_task_res.json()["id"]
        print(f"✅ Task created (ID: {task_id})")

        # 4. List Tasks
        list_res = await client.get(f"{BASE_URL}/tasks/?project_id={project_id}", headers=headers)
        assert list_res.status_code == 200
        tasks = list_res.json()
        assert len(tasks) == 1
        assert tasks[0]["id"] == task_id
        print("✅ Tasks listed successfully")

        # 5. Update Task
        update_res = await client.patch(f"{BASE_URL}/tasks/{task_id}", json={
            "status": "IN_PROGRESS"
        }, headers=headers)
        assert update_res.status_code == 200
        assert update_res.json()["status"] == "IN_PROGRESS"
        print("✅ Task updated successfully")

        # 6. Delete Task
        delete_res = await client.delete(f"{BASE_URL}/tasks/{task_id}", headers=headers)
        assert delete_res.status_code == 204
        print("✅ Task deleted successfully")

        # 7. Cleanup Project
        await client.delete(f"{BASE_URL}/projects/{project_id}", headers=headers)
        print("✅ Project cleaned up")

if __name__ == "__main__":
    asyncio.run(test_tasks_api())
