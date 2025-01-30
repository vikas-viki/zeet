import React, { memo, useState, useCallback } from "react";
import { SendHorizonal } from "lucide-react";

interface MessageInputProps {
    sendMessage: (message: string) => void;
}

const MessageInput: React.FC<MessageInputProps> = ({ sendMessage }) => {
    const [messageInput, setMessageInput] = useState("");

    const handleInputChange = useCallback((e: any) => {
        setMessageInput(e.target.value);
    }, []);

    const handleSendMessage = useCallback(() => {
        if (messageInput.trim() === "") return;
        sendMessage(messageInput);
        setMessageInput("");
    }, [messageInput, sendMessage]);

    return (
        <div className="space_room_message_input">
            <input
                id="space_room_message_input"
                type="text"
                placeholder="Send messages here.."
                value={messageInput}
                onChange={handleInputChange}
            />
            <button className="space_room_send_btn" onClick={handleSendMessage}>
                <SendHorizonal size={17} />
            </button>
        </div>
    );
};

export default memo(MessageInput); // Memoize to prevent unnecessary renders
