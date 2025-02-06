import React, { memo, useState, useCallback, ChangeEvent, useEffect, useRef } from "react";
import { SendHorizonal } from "lucide-react";
import { eventBus } from "../helpers/EventBus";
import { constants } from "../helpers/constants";

interface MessageInputProps {
    sendMessage: (message: string) => void;
}

const MessageInput: React.FC<MessageInputProps> = ({ sendMessage }) => {
    const [messageInput, setMessageInput] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

    const handleInputChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        setMessageInput(e.target.value);
    }, []);

    const handleSendMessage = useCallback(() => {
        if (messageInput.trim() === "") return;
        sendMessage(messageInput);
        setMessageInput("");
    }, [messageInput, sendMessage]);

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (e.key === " ") {
            e.preventDefault();
            setMessageInput(prev => prev + " ");
        }
    }, []);

    useEffect(() => {
        const inputElement = inputRef.current;
        if (!inputElement) return;

        const handleFocus = () => {
            window.addEventListener("keydown", handleKeyDown);
            eventBus.emit(constants.events.messageInputFocused);
        };

        const handleBlur = () => {
            window.removeEventListener("keydown", handleKeyDown);
            eventBus.emit(constants.events.messageInputBlurred);
        };

        inputElement.addEventListener("focus", handleFocus);
        inputElement.addEventListener("blur", handleBlur);

        // Cleanup listeners on unmount
        return () => {
            inputElement.removeEventListener("focus", handleFocus);
            inputElement.removeEventListener("blur", handleBlur);
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [handleKeyDown]);

    return (
        <div className="space_room_message_input">
            <input
                ref={inputRef}
                id="space_room_message_input"
                type="text"
                placeholder="Send messages here.."
                value={messageInput}
                onChange={handleInputChange}
                onKeyDown={(e) => {
                    if (e.key === "Enter") {
                        handleSendMessage();
                    }
                }}
            />
            <button className="space_room_send_btn" onClick={handleSendMessage}>
                <SendHorizonal size={17} />
            </button>
        </div>
    );
};

export default memo(MessageInput);