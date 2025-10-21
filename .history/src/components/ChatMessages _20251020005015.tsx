import { useSocket } from "@/providers/web-socket";
import { useEffect } from "react";
export 
const ChatMessages = ({ /* your props */ }) => {
  const { socket, isConnected } = useSocket();

  useEffect(() => {
    if (!socket || !isConnected) return;

    // Subscribe to messages
    socket.on("newMessage", (message) => {
      console.log("Received message:", message);
      // Update your query or state here
    });

    return () => {
      socket.off("newMessage");
    };
  }, [socket, isConnected]);

  return <div>{isConnected ? "Connected to chat" : "Connecting..."}</div>;
};
