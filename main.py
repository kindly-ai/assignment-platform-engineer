from datetime import datetime
from enum import Enum
from uuid import uuid4

from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()


class Sender(str, Enum):
    user = "USER"
    bot = "BOT"


class Message(BaseModel):
    chat_id: str
    text: str


@app.post("/start_chat")
async def start_chat():
    return {"chat_id": uuid4(), "reply": "Greetings human!"}


@app.post("/message")
async def message(message: Message):
    if message.text.lower().strip() == "tell me a joke":
        return {"reply": "The cat with a tie."}
    else:
        return {"reply": "Sorry, I didn't understand that."}


@app.get("/transcript/{chat_id}")
async def transcript(chat_id: str):
    return {"messages": []}
