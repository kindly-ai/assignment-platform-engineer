import os
from enum import Enum

from sqlalchemy import create_engine, text

DB_URL = os.getenv("DB_URL", "sqlite:///silly_bot.sqlite")
engine = create_engine(DB_URL, echo=True, future=True)


class Sender(str, Enum):
    USER = "USER"
    BOT = "BOT"


def find_greeting() -> str:
    with engine.connect() as conn:
        query = "SELECT bot_replies FROM greetings ORDER BY RANDOM() LIMIT 1"
        result = conn.execute(text(query))
        return result.all()[0][0]


def find_fallback() -> str:
    with engine.connect() as conn:
        query = "SELECT bot_replies FROM fallbacks ORDER BY RANDOM() LIMIT 1"
        result = conn.execute(text(query))
        return result.all()[0][0]


def find_reply(prompt: str) -> str:
    with engine.connect() as conn:
        query = "SELECT bot_replies FROM dialogues WHERE user_says LIKE :prompt ORDER BY RANDOM() LIMIT 1"
        result = conn.execute(text(query), {"prompt": prompt.lower().strip()})
        try:
            return result.all()[0][0]
        except IndexError:
            return find_fallback()


def record_message(*, chat_id: str, sender: Sender, message: str) -> None:
    with engine.connect() as conn:
        conn.execute(
            text(
                "INSERT INTO messages (chat_id, time, sender, text) VALUES (:chat_id, STRFTIME ('%s', 'now'), :sender, :text)"
            ),
            [{"chat_id": chat_id, "sender": sender, "text": message}],
        )
        conn.commit()


def get_transcript(chat_id: str) -> list[dict]:
    with engine.connect() as conn:
        query = "SELECT DATETIME(time, 'unixepoch') AS time, sender, text FROM messages WHERE chat_id = :chat_id ORDER BY time"
        result = conn.execute(text(query), {"chat_id": chat_id})
        return result.all()
