import { create } from "zustand";

interface ProjectModalState {
  editModal: boolean;
  deleteModal: boolean;
  openEditModal: () => void;
  closeEditModal: () => void;
  openDeleteModal: () => void;
  closeDeleteModal: () => void;
  closeAllModals: () => void;
}

export const useProjectModalStore = create<ProjectModalState>((set) => ({
  editModal: false,
  deleteModal: false,
  openEditModal: () => set({ editModal: true }),
  closeEditModal: () => set({ editModal: false }),
  openDeleteModal: () => set({ deleteModal: true }),
  closeDeleteModal: () => set({ deleteModal: false }),
  closeAllModals: () => set({ editModal: false, deleteModal: false }),
}));
