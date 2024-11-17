import React, { ReactNode } from "react";

interface ModalProps {
    children: ReactNode;
    title: string;
    actionText: string;
    onClose: () => void;
    onAction: () => void;
}

const Modal: React.FC<ModalProps> = ({ children, title, actionText, onClose, onAction }) => {
    return (
        <div className="modal">
            <div className="modal_container">
                <div className="modal_content">
                    <span className="modal_title">{title}</span>
                    {children}
                    <div className="modal_controller">
                        <button className="modal_cancel" onClick={onClose}>Cancel</button>
                        <button className="modal_action" onClick={onAction}>{actionText}</button>
                    </div>
                </div>
            </div>
        </div>
    )
}
export default Modal;