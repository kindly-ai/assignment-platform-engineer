from enum import Enum
from uuid import uuid4

from fastapi import FastAPI
from pydantic import BaseModel
from sqlalchemy import create_engine, text

app = FastAPI()
engine = create_engine("sqlite:///silly_bot.sqlite", echo=True, future=True)


def find_greeting() -> str:
    with engine.connect() as conn:
        query = "select bot_replies from greetings order by random() limit 1"
        result = conn.execute(text(query))
        return result.all()[0][0]


def find_fallback() -> str:
    with engine.connect() as conn:
        query = "select bot_replies from fallbacks order by random() limit 1"
        result = conn.execute(text(query))
        return result.all()[0][0]


def find_reply(prompt: str) -> str:
    with engine.connect() as conn:
        query = "select bot_replies from dialogues where user_says LIKE :prompt order by random() limit 1"
        result = conn.execute(text(query), {"prompt": prompt.lower().strip()})
        try:
            return result.all()[0][0]
        except IndexError:
            return find_fallback()


class Sender(str, Enum):
    user = "USER"
    bot = "BOT"


class Message(BaseModel):
    chat_id: str
    text: str


@app.post("/start_chat")
async def start_chat():
    chat_id = uuid4()
    reply = find_greeting()
    return {"chat_id": chat_id, "reply": reply}


@app.post("/message")
async def message(body: Message):
    reply = find_reply(body.text)
    return {"reply": reply}


@app.get("/transcript/{chat_id}")
async def transcript(chat_id: str):
    return {"messages": []}
