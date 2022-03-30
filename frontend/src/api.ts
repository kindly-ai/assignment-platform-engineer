const API_HOST = "http://localhost:8000";

export interface Message {
  time: string;
  sender: string;
  text: string;
}

export async function fetchTranscript(
  chatId: string | null
): Promise<Message[]> {
  const res = await fetch(`${API_HOST}/transcript/${chatId}`);
  if (res.status === 404) {
    return [];
  }
  return (await res.json()).messages;
}

export async function startChat(): Promise<{ chat_id: string; reply: string }> {
  const chatId = localStorage.getItem("chatId");

  if (chatId) {
    throw new Error("This shouldn't happen");
  }

  const res = await fetch(`${API_HOST}/start_chat`, {
    method: "POST",
  });

  return res.json();
}

export async function sendMessage(text: string) {
  const chatId = localStorage.getItem("chatId");

  if (!chatId) {
    throw new Error("This shouldn't happen");
  }

  return fetch(`${API_HOST}/message`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ chat_id: chatId, text }),
  });
}
