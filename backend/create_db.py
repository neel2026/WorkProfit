import asyncio
import asyncpg
import os
from dotenv import load_dotenv

load_dotenv()

# Connect to default 'postgres' database to create the new one
DEFAULT_DB_URL = os.getenv("DATABASE_URL").replace("postgresql+asyncpg://", "postgresql://").replace("/workprofit", "/postgres")
TARGET_DB = "workprofit"

async def create_database():
    try:
        # Connect to postgres database
        conn = await asyncpg.connect(DEFAULT_DB_URL)
        
        # Check if database exists
        exists = await conn.fetchval(f"SELECT 1 FROM pg_database WHERE datname = '{TARGET_DB}'")
        
        if not exists:
            print(f"Creating database '{TARGET_DB}'...")
            await conn.execute(f'CREATE DATABASE "{TARGET_DB}"')
            print(f"Database '{TARGET_DB}' created successfully.")
        else:
            print(f"Database '{TARGET_DB}' already exists.")
            
        await conn.close()
    except Exception as e:
        print(f"Error creating database: {e}")

if __name__ == "__main__":
    asyncio.run(create_database())
