import React, { createContext, useContext, useState } from 'react';

const ModalContext = createContext();

export const useModal = () => {
    const context = useContext(ModalContext);
    if (!context) {
        throw new Error('useModal must be used within a ModalProvider');
    }
    return context;
};

export const ModalProvider = ({ children }) => {
    const [isEditProjectModalOpen, setIsEditProjectModalOpen] = useState(false);
    const [isDeleteProjectModalOpen, setIsDeleteProjectModalOpen] = useState(false);

    const openEditProjectModal = () => setIsEditProjectModalOpen(true);
    const closeEditProjectModal = () => setIsEditProjectModalOpen(false);
    
    const openDeleteProjectModal = () => {
        setIsDeleteProjectModalOpen(true);
        setIsEditProjectModalOpen(false);
    };
    const closeDeleteProjectModal = () => setIsDeleteProjectModalOpen(false);

    return (
        <ModalContext.Provider
            value={{
                isEditProjectModalOpen,
                openEditProjectModal,
                closeEditProjectModal,
                isDeleteProjectModalOpen,
                openDeleteProjectModal,
                closeDeleteProjectModal,
            }}
        >
            {children}
        </ModalContext.Provider>
    );
};

