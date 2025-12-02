import asyncio
import asyncpg
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL").replace("postgresql+asyncpg://", "postgresql://")

async def verify_tables():
    try:
        conn = await asyncpg.connect(DATABASE_URL)
        
        # Check if users table exists
        table_name = 'users'
        exists = await conn.fetchval(
            "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = $1)",
            table_name
        )
        
        if exists:
            print(f"Table '{table_name}' exists.")
            # Get columns
            columns = await conn.fetch(
                "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = $1",
                table_name
            )
            print("Columns:")
            for col in columns:
                print(f"- {col['column_name']}: {col['data_type']}")
        else:
            print(f"Table '{table_name}' does NOT exist.")
            
        await conn.close()
    except Exception as e:
        print(f"Error verifying database: {e}")

if __name__ == "__main__":
    asyncio.run(verify_tables())
