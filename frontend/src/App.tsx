import React, { FormEvent, useEffect, useState, useLayoutEffect } from "react";
import "./App.css";
import {
  fetchTranscript,
  Message,
  Sender,
  sendMessage,
  startChat,
} from "./api";

function MessageComponent({
  message: { time, sender, text },
}: {
  message: Message;
}) {
  return (
    <div className="Message">
      <p className="info">
        [{time}]<span>{sender === Sender.USER ? "💁" : "🤖"}</span>
      </p>
      <p className="text">{text}</p>
    </div>
  );
}

function Transcript({
  chatId,
  refreshTranscript,
}: {
  chatId: string;
  refreshTranscript: boolean;
}) {
  const [transcript, setTranscript] = useState<Message[]>([]);

  useLayoutEffect(() => {
    const getTranscript = async () => {
      const transcriptArray = await fetchTranscript(chatId);
      setTranscript(transcriptArray);
    };

    getTranscript();
  }, [refreshTranscript]);

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

function Composer({ setRefreshApp }: { setRefreshApp: CallableFunction }) {
  const [message, setMessage] = useState("");

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    await sendMessage(message);
    setMessage("");
    setRefreshApp((prevValue: boolean) => !prevValue);
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
  const [refreshApp, setRefreshApp] = useState(false);

  useEffect(() => {
    if (!chatId) {
      setChatId(localStorage.getItem("chatId") ?? undefined);
    }
  }, [chatId]);

  return (
    <div className="App">
      <header className="App-header">
        <h1>Silly chat</h1>
      </header>
      <main className="App-main">
        {chatId ? (
          <>
            <Transcript chatId={chatId} refreshTranscript={refreshApp} />
            <Composer setRefreshApp={setRefreshApp} />
          </>
        ) : (
          <StartChat onStart={setChatId} />
        )}
      </main>
      <footer className="App-footer" />
    </div>
  );
}

export default App;
