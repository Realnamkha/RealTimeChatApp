import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import axiosInstance from "@/lib/axiosInstance";
import JoinRoomForm from "@/components/chat/JoinRoomForm";
import { useAuth } from "@/components/auth/AuthContext";

export default function Home() {
  const navigate = useNavigate();
  const [roomName, setRoomName] = useState("");
  const [joinMessage, setJoinMessage] = useState("");
  const [showInput, setShowInput] = useState(false);
  const [showJoinForm, setShowJoinForm] = useState(false);
  const { user } = useAuth(); // Use the auth hook
  const username = user?.name || "Anonymous"; // Get username from auth

  const handleToggleJoinForm = () => {
    setShowJoinForm((prev) => !prev);
    setShowInput(false);
    setJoinMessage("");
  };

  const handleCreateRoom = async () => {
    if (!roomName.trim()) return;

    try {
      const response = await axiosInstance.post("/rooms", { name: roomName });
      navigate(`/room/${response.data.data.id}`);
    } catch (error) {
      console.error(error.response?.data?.message || "Failed to create room");
    }
  };

  const handleJoin = ({ roomId }) => {
    setJoinMessage(`User ${username} has joined the room ${roomId}.`);
    setShowJoinForm(false); // hide the form after join
    navigate(`/room/${roomId}`);
  };

  const handleInitialClick = () => {
    console.log("User from useAuth:", user);
    if (!user) {
      // Not logged in, redirect to login
      navigate("/login");
      return;
    }
    setShowInput(true);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-10 text-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <h1 className="text-4xl font-bold md:text-5xl mb-4">
        Instant Rooms. Real-Time Chats.
      </h1>
      <p className="text-lg text-muted-foreground max-w-xl mb-8">
        Create or join a chat room and talk in real time with friends,
        teammates, or anyone.
      </p>

      {!showInput && !showJoinForm && !joinMessage && (
        <Button
          className="px-6 py-2 text-lg bg-black text-white"
          onClick={handleInitialClick}
        >
          Create Room
        </Button>
      )}

      {showInput && !showJoinForm && !joinMessage && (
        <div className="space-y-4 w-full max-w-md mb-6">
          <div className="space-y-2">
            <Label htmlFor="roomName">Room Name</Label>
            <Input
              id="roomName"
              type="text"
              placeholder="Enter room name"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
            />
          </div>
          <Button
            className="w-full bg-black text-white"
            onClick={handleCreateRoom}
            disabled={!roomName.trim()}
          >
            Confirm & Create
          </Button>
        </div>
      )}

      {!showInput && !joinMessage && (
        <Button
          variant="outline"
          className="px-6 py-2 text-lg mt-4"
          onClick={handleToggleJoinForm}
        >
          {showJoinForm ? "Cancel" : "Join Room"}
        </Button>
      )}

      {showJoinForm && (
        <div className="mt-6 w-full max-w-md">
          <JoinRoomForm onJoin={handleJoin} />
        </div>
      )}

      {joinMessage && (
        <div className="mt-6 p-4 bg-green-100 text-green-800 rounded max-w-md">
          {joinMessage}
        </div>
      )}
    </div>
  );
}
