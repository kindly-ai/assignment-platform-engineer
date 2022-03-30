import React, { FormEvent, useEffect, useState } from "react";
import "./App.css";
import { fetchTranscript, Message, sendMessage, startChat } from "./api";

function MessageComponent({
  message: { time, sender, text },
}: {
  message: Message;
}) {
  return (
    <p>
      <span>
        [{time}] {sender}:
      </span>
      {text}
    </p>
  );
}

function Transcript() {
  const [transcript, setTranscript] = useState<Message[]>();

  const getTranscript = async () => {
    const chatId = localStorage.getItem("chatId");
    if (chatId) {
      setTranscript(await fetchTranscript(chatId));
    } else {
      setTranscript([]);
    }
  };

  useEffect(() => {
    if (!transcript) {
      getTranscript();
    }
  }, []);

  if (!transcript || transcript.length === 0) {
    return null;
  }

  return (
    <>
      {transcript.map((m) => (
        <MessageComponent message={m} key={`message${m.time}`} />
      ))}
    </>
  );
}

function StartChat({ onStart }: { onStart: CallableFunction }) {
  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const { chat_id: chatId } = await startChat();
    localStorage.setItem("chatId", chatId);
    onStart(chatId);
  }

  return (
    <form onSubmit={handleSubmit}>
      <input type="submit" value="Begin chat" />
    </form>
  );
}

function Composer() {
  const [message, setMessage] = useState("");

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    await sendMessage(message);
    setMessage("");
  };

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="message">
        <input
          type="text"
          name="message"
          placeholder="Type your message"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
        />
      </label>
      <input type="submit" value="Submit" />
    </form>
  );
}

function App() {
  const [chatId, setChatId] = useState<string>();

  useEffect(() => {
    if (!chatId) {
      setChatId(localStorage.getItem("chatId") ?? undefined);
    }
  }, [chatId]);

  return (
    <div className="App">
      <header className="App-header">
        <h1>Simple chat app</h1>
      </header>
      <hr />
      <main>
        <Transcript />
        <hr />
        {chatId ? <Composer /> : <StartChat onStart={setChatId} />}
      </main>
      <hr />
      <footer className="App-footer" />
    </div>
  );
}

export default App;
