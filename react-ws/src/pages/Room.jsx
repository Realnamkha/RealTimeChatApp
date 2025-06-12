import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import axiosInstance from "@/lib/axiosInstance";
import { useWebSocket } from "@/hooks/useWebsocket";
import { useAuth } from "@/components/auth/AuthContext";

export default function Room() {
  const { roomId } = useParams();
  const { user, loading: authLoading } = useAuth();

  const [roomName, setRoomName] = useState("");
  const [chats, setChats] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const scrollAreaRef = useRef(null);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <p className="text-gray-400 text-lg">Loading user info...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-white">
        <p>Please log in to join this room.</p>
      </div>
    );
  }

  const currentUserName = user.username || "You";

  const { send, connected } = useWebSocket({
    roomId,
    userId: user.id,
    name: currentUserName,
    onMessage: (type, payload) => {
      if (type === "ADD_CHAT") {
        const newMessage = {
          chatId: payload.chatId,
          message: payload.message,
          votes: typeof payload.upvotes === "number" ? payload.upvotes : 0,
          sender: payload.name,
        };
        setChats((prevChats) => [...prevChats, newMessage]);
      }
    },
  });

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const res = await axiosInstance.get(`/rooms/${roomId}`);
        setRoomName(res.data.data.name);
      } catch (err) {
        console.error("Failed to fetch room:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRoom();
  }, [roomId]);

  // Auto scroll to bottom on new message
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollArea = scrollAreaRef.current;
      scrollArea.scrollTo({ top: scrollArea.scrollHeight, behavior: "smooth" });
    }
  }, [chats]);

  const addChat = () => {
    if (!message.trim()) return;

    const localMessage = {
      chatId: null,
      message,
      votes: 0,
      sender: currentUserName,
    };

    setChats((prevChats) => [...prevChats, localMessage]);
    send("SEND_MESSAGE", { message, userId: user.id, roomId });
    setMessage("");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <p className="text-gray-400 text-lg">Loading room...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-white">
      <Card className="w-full max-w-3xl shadow-lg bg-[#121212] border border-gray-700">
        <CardHeader className="pb-2 border-b border-gray-700">
          <h1 className="text-3xl font-semibold text-white">
            {roomName || "Chat Room"}
          </h1>
          <Separator className="mt-1 border-gray-700" />
        </CardHeader>

        <CardContent className="p-4 h-[480px]">
          <ScrollArea
            ref={scrollAreaRef}
            className="h-full rounded-md border border-gray-700 bg-[#1e1e1e]"
          >
            {chats.length === 0 ? (
              <p className="text-center text-gray-500 mt-24 select-none">
                No messages yet
              </p>
            ) : (
              <div className="flex flex-col space-y-3 px-2 mt-4">
                {chats.map((msg, idx) => {
                  const isCurrentUser = msg.sender === currentUserName;
                  return (
                    <div
                      key={msg.chatId ?? idx}
                      className={`max-w-[50%] p-4 rounded-lg break-words shadow-sm
                        ${
                          isCurrentUser
                            ? "bg-gray-800 text-white ml-auto rounded-tr-none"
                            : "bg-gray-700 text-gray-200 rounded-tl-none"
                        }
                      `}
                      style={{ wordBreak: "break-word" }}
                    >
                      <p className="text-xs font-semibold underline mb-1 select-none text-gray-400">
                        {msg.sender}
                      </p>
                      <p className="text-base">{msg.message}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </CardContent>

        <div className="flex gap-3 p-4 border-t border-gray-700 bg-[#121212] rounded-b-lg">
          <Input
            type="text"
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addChat()}
            className="flex-1 bg-gray-900 text-white placeholder-gray-500 border border-gray-700 focus:ring-white focus:ring-1"
            autoFocus
          />
          <Button
            onClick={addChat}
            disabled={!connected}
            className="whitespace-nowrap bg-white text-black hover:bg-gray-300 disabled:opacity-50"
          >
            Send
          </Button>
        </div>
      </Card>
    </div>
  );
}
