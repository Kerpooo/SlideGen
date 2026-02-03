import os
import uvicorn

def main():
    uvicorn.run(
        "main:app",
        host=os.getenv("HOST", "127.0.0.1"),
        port=int(os.getenv("PORT", "3001")),
        reload=False,
    )
