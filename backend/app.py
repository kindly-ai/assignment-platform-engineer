import os

from uuid import uuid4

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from starlette.middleware.cors import CORSMiddleware

from backend.db import Sender, find_greeting, find_reply, get_transcript, record_message

FRONTEND_HOST = os.getenv("FRONTEND_HOST", "http://localhost:3000")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_HOST],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class Message(BaseModel):
    chat_id: str
    text: str


@app.post("/start_chat")
async def start_chat() -> dict:
    chat_id = str(uuid4())
    reply = find_greeting()

    record_message(chat_id=chat_id, sender=Sender.BOT, message=reply)

    return {"chat_id": chat_id, "reply": reply}


@app.post("/message")
async def message(body: Message) -> dict:
    record_message(chat_id=body.chat_id, sender=Sender.USER, message=body.text)

    reply = find_reply(body.text)

    record_message(chat_id=body.chat_id, sender=Sender.BOT, message=reply)

    return {"reply": reply}


@app.get("/transcript/{chat_id}")
async def transcript(chat_id: str) -> dict:
    messages = get_transcript(chat_id)

    if len(messages) == 0:
        raise HTTPException(status_code=404, detail="Chat not found.")

    return {"messages": messages}
