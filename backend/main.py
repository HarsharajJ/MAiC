from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import uuid
from datetime import datetime

# Import your existing chatbot code
from langchain_core.messages import HumanMessage
from langchain_core.runnables import RunnableConfig
import groqs as main  # This imports your Python file

app = FastAPI()

# Configure CORS to allow requests from your Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str
    history: Optional[List[Dict[str, Any]]] = None

class ChatResponse(BaseModel):
    response: str

# Store active threads
active_threads = {}

@app.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    try:
        # Get or create a thread ID for this conversation
        thread_id = str(uuid.uuid4())
        
        # Convert the message to the format expected by LangGraph
        user_message = ("user", request.message)
        
        # Create config for the graph
        config = {
            "configurable": {
                "passenger_id": "web_user",
                "thread_id": thread_id,
            }
        }
        
        # Process the message through the graph
        response_text = ""
        events = main.part_1_graph.stream(
            {"messages": user_message}, 
            config, 
            stream_mode="values"
        )
        
        # Collect the response
        _printed = set()
        for event in events:
            message = event.get("messages")
            if message:
                if isinstance(message, list):
                    message = message[-1]
                if message.id not in _printed:
                    if hasattr(message, "content") and message.content:
                        response_text = message.content
                    _printed.add(message.id)
        
        # Return the response
        return ChatResponse(response=response_text)
    
    except Exception as e:
        print(f"Error processing chat request: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=9000)

