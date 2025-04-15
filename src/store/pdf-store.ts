import { create } from 'zustand'

interface PDFPage {
  index: number;
  imageUrl: string;
}

interface PDFState {
  pages: PDFPage[];
  currentPageIndex: number;
  setPages: (pages: PDFPage[]) => void;
  setCurrentPage: (index: number) => void;
}

export const usePDFStore = create<PDFState>((set) => ({
  pages: [],
  currentPageIndex: 0,
  setPages: (pages) => set({ pages }),
  setCurrentPage: (index) => set({ currentPageIndex: index }),
}))
