import { create } from 'zustand';

interface PDFPageStore {
  currentPage: number;
  totalPages: number;
  setCurrentPage: (page: number) => void;
  setTotalPages: (total: number) => void;
}

export const usePDFPageStore = create<PDFPageStore>((set) => ({
  currentPage: 0,
  totalPages: 1,
  setCurrentPage: (page) => set({ currentPage: page }),
  setTotalPages: (total) => set({ totalPages: total }),
}));
