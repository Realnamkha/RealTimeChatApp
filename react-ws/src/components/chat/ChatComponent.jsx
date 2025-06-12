import { useEffect } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useRef, useState } from "react";
const userId = Math.floor(Math.random() * 1000).toString();

export default function MyComponent({
  initialChats,
  upVotes1 = 3,
  upVotes2 = 10,
}) {
  const [socket, setSocket] = useState(null);
  const [chats, setChats] = useState(initialChats || []);
  const chatRef = useRef(null);

  const addChat = () => {
    if (chatRef.current) {
      const chat = chatRef.current.value;
      if (!chat) return;
      setChats((chats) => [
        ...chats,
        { message: chat, votes: 0, chatId: chat.chatId },
      ]);
      console.log(chat);
      sendChat(chat);
      chatRef.current.value = "";
    }
  };
  const upvoteChat = (chatId) => {
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      console.warn("⚠️ [UPVOTE BLOCKED] WebSocket is not open.");
      return;
    }

    if (!chatId) {
      console.warn("⚠️ [UPVOTE BLOCKED] chatId is required.");
      return;
    }

    const upvotePayload = {
      type: "UPVOTE_MESSAGE",
      payload: {
        userId: userId, // Replace with actual userId if dynamic
        roomId: "2", // Replace with actual roomId if dynamic
        chatId,
      },
    };

    console.log("📤 [SENDING] UPVOTE_MESSAGE", upvotePayload);
    socket.send(JSON.stringify(upvotePayload));
  };

  const sendChat = (message) => {
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      console.warn("⚠️ [SEND BLOCKED] WebSocket is not open.");
      return;
    }

    if (message.trim() === "") return;

    const sendPayload = {
      type: "SEND_MESSAGE",
      payload: {
        message,
        userId: userId,
        roomId: "2",
      },
    };

    console.log("📤 [SENDING] SEND_MESSAGE", sendPayload);
    socket.send(JSON.stringify(sendPayload));
  };

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8080");

    ws.onopen = () => {
      console.log("✅ [WS OPEN] Connected to WebSocket server");
      alert("Connected to chat!");
      setSocket(ws);

      const joinPayload = {
        type: "JOIN_ROOM",
        payload: {
          name: "Namkha",
          userId: userId,
          roomId: "2",
        },
      };

      console.log("📤 [SENDING] JOIN_ROOM", joinPayload);
      ws.send(JSON.stringify(joinPayload));
    };

    ws.onmessage = (event) => {
      try {
        const { type, payload } = JSON.parse(event.data);
        console.log("📥 [RECEIVED] Raw message:", event.data);

        switch (type) {
          case "ADD_CHAT": {
            // Ensure upvotes is a number, default to 0
            const newMessage = {
              chatId: payload.chatId,
              message: payload.message,
              upvotes:
                typeof payload.upvotes === "number" ? payload.upvotes : 0,
              name: payload.name,
            };
            console.log("💬 [ADDING] Chat to UI:", newMessage);
            setChats((chats) => [
              ...chats,
              {
                message: newMessage.message,
                votes: newMessage.upvotes,
                chatId: payload.chatId,
              },
            ]);
            break;
          }

          case "UPDATE_CHAT": {
            // Update only the upvotes count for the specified chat
            alert("Update-chat");
            setChats((chats) =>
              chats.map((c) => {
                if (c.chatId == payload.chatId) {
                  return {
                    ...c,
                    votes: payload.upvotes.length,
                  };
                }
                return c;
              })
            );
            console.log(
              `👍 [UPDATED] Upvotes for chatId ${payload.chatId}:`,
              payload.upvotes
            );
            break;
          }

          default:
            console.warn("⚠️ [UNHANDLED] Message type:", type);
        }
      } catch (error) {
        console.error("❌ [ERROR] Parsing message:", error);
      }
    };

    return () => {
      ws.close();
    };
  }, []);

  return (
    <div className="bg-white border border-gray-200 min-h-screen rounded-lg shadow dark:bg-gray-800 dark:border-gray-700 p-2 space-y-4">
      <div className="text-center">Chat</div>
      <div className="flex border min-w-[900px] rounded-md">
        {/* All Chat */}
        <div className="text-center border-r w-full">
          <h1 className="p-2">All Chats</h1>
          <div className="border">
            <div className="flex flex-col max-h-96 overflow-auto min-h-96">
              {chats.map((chat, i) => (
                <div className="flex flex-col gap-1 px-2 py-1" key={i}>
                  <div className="text-sm w-full text-left">{chat.message}</div>
                  <div className="flex gap-1 justify-between">
                    <div className="text-xs text-gray-400">
                      Upvotes: {chat.votes}
                    </div>
                    <div className="flex gap-2">
                      <button
                        className="text-xs text-gray-400"
                        onClick={() => {
                          const newChats = [...chats];
                          newChats[i].votes++;
                          setChats(newChats);
                          upvoteChat(chat.chatId);
                        }}
                      >
                        <ChevronUp />
                      </button>
                      <button
                        className="text-xs text-gray-400"
                        onClick={() => {
                          const newChats = [...chats];
                          newChats[i].votes--;
                          setChats(newChats);
                        }}
                      >
                        <ChevronDown />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2 p-2 border-t">
              <input
                type="text"
                className="bg-transparent text-white w-full"
                placeholder="Chat"
                ref={chatRef}
              />
              <button
                className="w-full flex items-center justify-center px-5 py-2 text-sm text-gray-700 transition-colors duration-200 bg-white border rounded-lg gap-x-2 sm:w-auto dark:hover:bg-gray-800 dark:bg-gray-900 hover:bg-gray-100 dark:text-gray-200 dark:border-gray-700"
                onClick={addChat}
              >
                Send
              </button>
            </div>
          </div>
        </div>
        {/* Medium Upvotes */}
        <div className="text-center border-r w-full">
          <h1 className="p-2">Medium Priority Chats</h1>
          <div className="border-t">
            <div className="flex flex-col max-h-96 overflow-auto">
              {chats
                .filter(
                  (chat) => chat.votes >= upVotes1 && chat.votes < upVotes2
                )
                .map((chat, i) => (
                  <div className="flex flex-col gap-1 p-2" key={i}>
                    <div className="text-sm w-full text-left">
                      {chat.message}
                    </div>
                    <div className="flex gap-1 justify-between">
                      <div className="text-xs text-gray-400">
                        Upvotes: {chat.votes}
                      </div>
                      <div className="flex gap-2">
                        <button
                          className="text-xs text-gray-400"
                          onClick={() => {
                            const newChats = [...chats];
                            newChats[i].votes++;
                            setChats(newChats);
                          }}
                        >
                          <ChevronUp />
                        </button>
                        <button
                          className="text-xs text-gray-400"
                          onClick={() => {
                            const newChats = [...chats];
                            newChats[i].votes--;
                            setChats(newChats);
                          }}
                        >
                          <ChevronDown />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
        {/* High Upvotes */}
        <div className="text-center border-r w-full">
          <h1 className="p-2">High Priority Chats</h1>
          <div className="border-t">
            <div className="flex flex-col max-h-96 overflow-auto">
              {chats
                .filter((chat) => chat.votes >= upVotes2)
                .map((chat, i) => (
                  <div className="flex flex-col gap-1 p-2" key={i}>
                    <div className="text-sm w-full text-left">
                      {chat.message}
                    </div>
                    <div className="flex gap-1 justify-between">
                      <div className="text-xs text-gray-400">
                        Upvotes: {chat.votes}
                      </div>
                      <div className="flex gap-2">
                        <button
                          className="text-xs text-gray-400"
                          onClick={() => {
                            const newChats = [...chats];
                            newChats[i].votes++;
                            setChats(newChats);
                          }}
                        >
                          <ChevronUp />
                        </button>
                        <button
                          className="text-xs text-gray-400"
                          onClick={() => {
                            const newChats = [...chats];
                            newChats[i].votes--;
                            setChats(newChats);
                          }}
                        >
                          <ChevronDown />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
