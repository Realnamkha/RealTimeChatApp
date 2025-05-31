import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [socket, setSocket] = useState(null);
  const [latestmessage, setlatestmessage] = useState("");
  const [message, setmessage] = useState("");

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:8080");

    socket.onopen = () => {
      console.log("Connected");
      setSocket(socket);
    };

    socket.onmessage = (message) => {
      console.log("Received message:", message.data);
      setlatestmessage(message.data);
    };

    return () => {
      socket.close();
    };
  }, []);

  if (!socket) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <input value={message} onChange={(e) => setmessage(e.target.value)} />
      <button onClick={() => socket.send(message)}>Send</button>
      <div>{latestmessage}</div>
    </div>
  );
}

export default App;
