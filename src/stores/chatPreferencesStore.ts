"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface LeftRoomInfo {
  timestamp: number;
  cafeId?: string;
  roomId?: string;
}

interface ChatPreferencesState {
  cafeMute: Record<string, boolean>;
  dmMute: Record<string, boolean>;
  leftRooms: Record<string, LeftRoomInfo>;
  getCafeMute: (cafeId: string) => boolean;
  setCafeMute: (cafeId: string, value: boolean) => void;
  getDmMute: (roomId: string) => boolean;
  setDmMute: (roomId: string, value: boolean) => void;
  markRoomLeft: (roomId: string, info: LeftRoomInfo) => void;
  getRoomLeft: (roomId: string) => LeftRoomInfo | undefined;
  clearRoomLeft: (roomId: string) => void;
}

const noopStorage: Storage = {
  getItem: (_key: string) => null,
  setItem: (_key: string, _value: string) => undefined,
  removeItem: (_key: string) => undefined,
  clear: () => undefined,
  key: (_index: number) => null,
  get length() {
    return 0;
  },
};

export const useChatPreferencesStore = create<ChatPreferencesState>()(
  persist(
    (set, get) => ({
      cafeMute: {},
      dmMute: {},
      leftRooms: {},
      getCafeMute: (cafeId) => get().cafeMute[cafeId] ?? false,
      setCafeMute: (cafeId, value) =>
        set((state) => ({
          cafeMute: { ...state.cafeMute, [cafeId]: value },
        })),
      getDmMute: (roomId) => get().dmMute[roomId] ?? false,
      setDmMute: (roomId, value) =>
        set((state) => ({
          dmMute: { ...state.dmMute, [roomId]: value },
        })),
      markRoomLeft: (roomId, info) =>
        set((state) => ({
          leftRooms: { ...state.leftRooms, [roomId]: info },
        })),
      getRoomLeft: (roomId) => get().leftRooms[roomId],
      clearRoomLeft: (roomId) =>
        set((state) => {
          if (!state.leftRooms[roomId]) return state;
          const { [roomId]: _, ...rest } = state.leftRooms;
          return { leftRooms: rest };
        }),
    }),
    {
      name: "cafeon-chat-preferences",
      storage: createJSONStorage(() =>
        typeof window !== "undefined" ? window.localStorage : noopStorage
      ),
    }
  )
);
