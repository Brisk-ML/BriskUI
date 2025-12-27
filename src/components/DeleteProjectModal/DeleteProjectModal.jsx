import React, { useState } from "react";
import DeleteButton from "../DeleteButton";
import { useModal } from "../../contexts/ModalContext";
import "./DeleteProjectModal.css";

export const DeleteProjectModal = ({ isOpen, onClose, projectName = "My Project" }) => {
    const [confirmationText, setConfirmationText] = useState("");
    const requiredText = `delete ${projectName}`;
    const isDeleteEnabled = confirmationText === requiredText;
    
    if (!isOpen) return null;

    const handleDelete = () => {
        if (isDeleteEnabled) {
            console.log("Deleting project:", projectName);
            onClose();
        }
    };

    return (
        <>
            <div className="delete-modal-blur" onClick={onClose} />
            <div className="delete-modal-container">
                <div className="delete-modal">
                    <DeleteButton 
                        className="delete-button-3" 
                        disabled={!isDeleteEnabled}
                        onClick={handleDelete}
                    />
                    <div className="cancel" onClick={onClose}>
                        <div className="text-wrapper-10">Cancel</div>
                    </div>
                    <div className="confirmation">
                        <p className="to-confirm-type">
                            To confirm type "delete {projectName}"
                        </p>
                        <div className="div-wrapper">
                            <input
                                type="text"
                                className="confirmation-input"
                                value={confirmationText}
                                onChange={(e) => setConfirmationText(e.target.value)}
                                placeholder="delete..."
                            />
                        </div>
                    </div>
                    <div className="header-2">
                        <p className="text-wrapper-12">
                            Once you delete a project it's gone forever...
                        </p>
                        <p className="text-wrapper-13">
                            Make sure you are certain before you continue.
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
};

export default DeleteProjectModal;

