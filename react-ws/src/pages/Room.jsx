import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Trash2Icon, UsersIcon } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "@/lib/axiosInstance";
import { useWebSocket } from "@/hooks/useWebsocket";
import { useAuth } from "@/components/auth/AuthContext";

export default function Room() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [roomName, setRoomName] = useState("");
  const [chats, setChats] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [usersDialogOpen, setUsersDialogOpen] = useState(false);

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
        toast.error("Failed to load room info");
      } finally {
        setLoading(false);
      }
    };

    fetchRoom();
  }, [roomId]);

  useEffect(() => {
    if (!usersDialogOpen) return;

    const fetchUsers = async () => {
      try {
        const res = await axiosInstance.get(`/rooms/${roomId}/users`);
        const safeUsers = Array.isArray(res?.data?.data) ? res.data.data : [];
        setUsers(safeUsers);
      } catch (err) {
        console.error("Failed to fetch users:", err);
        toast.error("Failed to load users");
        setUsers([]);
      }
    };

    fetchUsers();
  }, [roomId, usersDialogOpen]);

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

  const handleDeleteRoom = async () => {
    if (!window.confirm("Are you sure you want to delete this room?")) return;

    try {
      await axiosInstance.delete(`/rooms/${roomId}`);
      toast.success("Room deleted successfully");
      navigate("/");
    } catch (err) {
      console.error("Failed to delete room:", err);
      toast.error("Failed to delete room");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <p className="text-gray-400 text-lg">Loading room...</p>
      </div>
    );
  }

  // ... Keep your imports and other parts the same

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-950 to-black flex flex-col items-center justify-center p-6 text-white">
      <Card className="w-full max-w-3xl shadow-2xl bg-[#111214] border border-gray-800 rounded-xl">
        <CardHeader className="pb-3 border-b border-gray-800 flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-wide text-white drop-shadow-md">
            {roomName || "Chat Room"}
          </h1>

          <div className="flex gap-3">
            <Dialog open={usersDialogOpen} onOpenChange={setUsersDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1 hover:bg-gray-700 transition"
                >
                  <UsersIcon className="w-5 h-5" />
                  Users
                </Button>
              </DialogTrigger>

              <DialogContent className="w-[320px] bg-[#121212] rounded-lg border border-gray-700">
                <DialogHeader>
                  <DialogTitle className="text-lg font-semibold text-white">
                    Users in Room
                  </DialogTitle>
                  <DialogDescription className="text-gray-400">
                    List of users currently in this room.
                  </DialogDescription>
                </DialogHeader>

                <ScrollArea className="h-64 mt-2 rounded-md border border-gray-700">
                  {Array.isArray(users) && users.length === 0 ? (
                    <p className="text-gray-500 text-center mt-6 select-none">
                      No users found.
                    </p>
                  ) : (
                    <ul className="divide-y divide-gray-700">
                      {users.map((u) => {
                        const displayName =
                          u.username || u.name || u.email || "Unknown";
                        const initials = displayName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase();

                        return (
                          <li
                            key={u.id}
                            className="flex items-center gap-3 py-3 px-2 hover:bg-gray-800 rounded-md transition"
                          >
                            <Avatar className="h-10 w-10 bg-gray-700 text-white shadow-inner ring-1 ring-gray-600">
                              {/* <AvatarImage src={u.avatarUrl} alt={displayName} /> */}
                              <AvatarFallback>{initials}</AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                              <p className="text-sm font-semibold text-white leading-tight">
                                {displayName}
                              </p>
                              <p className="text-xs text-gray-400 select-text truncate max-w-[180px]">
                                {u.email}
                              </p>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </ScrollArea>
              </DialogContent>
            </Dialog>

            <Button
              variant="destructive"
              size="sm"
              className="flex items-center gap-1 hover:bg-red-700 transition"
              onClick={handleDeleteRoom}
            >
              <Trash2Icon className="w-5 h-5" />
              Delete Room
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-4 h-[480px]">
          <ScrollArea
            ref={scrollAreaRef}
            className="h-full rounded-lg border border-gray-700 bg-gradient-to-b from-gray-900 to-gray-800 shadow-inner"
          >
            {chats.length === 0 ? (
              <p className="text-center text-gray-500 mt-24 select-none font-light italic tracking-wide">
                No messages yet
              </p>
            ) : (
              <div className="flex flex-col space-y-4 px-4 mt-6">
                {chats.map((msg, idx) => {
                  const isCurrentUser = msg.sender === currentUserName;
                  return (
                    <div
                      key={msg.chatId ?? idx}
                      className={`w-fit max-w-[80%] p-4 rounded-2xl shadow-md
                      transition duration-150 ease-in-out
                      ${
                        isCurrentUser
                          ? "bg-gradient-to-r from-indigo-600 to-indigo-500 text-white ml-auto rounded-br-none hover:brightness-110"
                          : "bg-gray-700 text-gray-100 mr-auto rounded-bl-none hover:bg-gray-600"
                      }
                    `}
                      style={{ wordBreak: "break-word" }}
                      title={`Sent by ${msg.sender}`}
                    >
                      <p className="text-xs font-semibold underline mb-1 select-none text-gray-300">
                        {msg.sender}
                      </p>
                      <p className="text-base leading-relaxed whitespace-pre-wrap">
                        {msg.message}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </CardContent>

        <div className="flex gap-3 p-4 border-t border-gray-800 bg-[#121212] rounded-b-lg">
          <Input
            type="text"
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addChat()}
            className="flex-1 bg-gray-900 text-white placeholder-gray-500 border border-gray-700 focus:ring-indigo-500 focus:ring-2 focus:outline-none rounded-lg"
            autoFocus
          />
          <Button
            onClick={addChat}
            disabled={!connected}
            className="whitespace-nowrap bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold rounded-lg shadow-md"
          >
            Send
          </Button>
        </div>
      </Card>
    </div>
  );
}
