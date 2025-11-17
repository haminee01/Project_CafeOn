"use client";

import { create } from "zustand";
import { ChatMessage, Participant } from "@/types/chat";
import { ChatHistoryMessage } from "@/api/chat";

export interface CafeChatSessionState {
  roomId: string | null;
  isJoined: boolean;
  isLoading: boolean;
  error: string | null;
  participants: Participant[];
  messages: ChatMessage[];
  chatHistory: ChatHistoryMessage[];
  hasMoreHistory: boolean;
  isLoadingHistory: boolean;
  isJoining: boolean;
  isRetrying: boolean;
  isMuted: boolean;
  stompConnected: boolean;
}

export interface DmChatSessionState {
  roomId: string | null;
  isJoined: boolean;
  isLoading: boolean;
  error: string | null;
  participants: Participant[];
  participantCount: number;
  messages: ChatMessage[];
  chatHistory: ChatHistoryMessage[];
  hasMoreHistory: boolean;
  isLoadingHistory: boolean;
  isMuted: boolean;
  stompConnected: boolean;
}

export type CafeSessionUpdater =
  | Partial<CafeChatSessionState>
  | ((prev: CafeChatSessionState) => CafeChatSessionState);

export type DmSessionUpdater =
  | Partial<DmChatSessionState>
  | ((prev: DmChatSessionState) => DmChatSessionState);

export const createCafeChatSessionState = (): CafeChatSessionState => ({
  roomId: null,
  isJoined: false,
  isLoading: false,
  error: null,
  participants: [],
  messages: [],
  chatHistory: [],
  hasMoreHistory: true,
  isLoadingHistory: false,
  isJoining: false,
  isRetrying: false,
  isMuted: false,
  stompConnected: false,
});

export const createDmChatSessionState = (): DmChatSessionState => ({
  roomId: null,
  isJoined: false,
  isLoading: false,
  error: null,
  participants: [],
  participantCount: 0,
  messages: [],
  chatHistory: [],
  hasMoreHistory: true,
  isLoadingHistory: false,
  isMuted: false,
  stompConnected: false,
});

interface ChatStore {
  cafeSessions: Record<string, CafeChatSessionState>;
  dmSessions: Record<string, DmChatSessionState>;
  initCafeSession: (cafeId: string) => void;
  patchCafeSession: (cafeId: string, updater: CafeSessionUpdater) => void;
  resetCafeSession: (cafeId: string) => void;
  initDmSession: (sessionKey: string) => void;
  patchDmSession: (sessionKey: string, updater: DmSessionUpdater) => void;
  resetDmSession: (sessionKey: string) => void;
}

export const useChatStore = create<ChatStore>()((set, get) => ({
  cafeSessions: {},
  dmSessions: {},
  initCafeSession: (cafeId) =>
    set((state) => {
      if (state.cafeSessions[cafeId]) {
        return state;
      }
      return {
        cafeSessions: {
          ...state.cafeSessions,
          [cafeId]: createCafeChatSessionState(),
        },
      };
    }),
  patchCafeSession: (cafeId, updater) =>
    set((state) => {
      const prev = state.cafeSessions[cafeId] ?? createCafeChatSessionState();
      const next =
        typeof updater === "function"
          ? (updater as (prev: CafeChatSessionState) => CafeChatSessionState)(
              prev
            )
          : { ...prev, ...updater };
      return {
        cafeSessions: {
          ...state.cafeSessions,
          [cafeId]: next,
        },
      };
    }),
  resetCafeSession: (cafeId) =>
    set((state) => {
      if (!state.cafeSessions[cafeId]) {
        return state;
      }
      const { [cafeId]: _, ...rest } = state.cafeSessions;
      return { cafeSessions: rest };
    }),
  initDmSession: (sessionKey) =>
    set((state) => {
      if (state.dmSessions[sessionKey]) {
        return state;
      }
      return {
        dmSessions: {
          ...state.dmSessions,
          [sessionKey]: createDmChatSessionState(),
        },
      };
    }),
  patchDmSession: (sessionKey, updater) =>
    set((state) => {
      const prev = state.dmSessions[sessionKey] ?? createDmChatSessionState();
      const next =
        typeof updater === "function"
          ? (updater as (prev: DmChatSessionState) => DmChatSessionState)(prev)
          : { ...prev, ...updater };
      return {
        dmSessions: {
          ...state.dmSessions,
          [sessionKey]: next,
        },
      };
    }),
  resetDmSession: (sessionKey) =>
    set((state) => {
      if (!state.dmSessions[sessionKey]) {
        return state;
      }
      const { [sessionKey]: _, ...rest } = state.dmSessions;
      return { dmSessions: rest };
    }),
}));
