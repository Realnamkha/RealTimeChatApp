import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function JoinRoomForm({ onJoin }) {
  const [roomId, setRoomId] = useState("");

  const handleJoin = () => {
    if (!roomId) return;
    onJoin({ roomId });
  };

  return (
    <div>
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader>
          <CardTitle className="text-center text-2xl">Join a Room</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div>
            <Label htmlFor="roomId">Room ID</Label>
            <Input
              id="roomId"
              placeholder="Enter room ID"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
            />
          </div>
          <Button onClick={handleJoin} className="mt-2 w-full">
            Join Room
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
