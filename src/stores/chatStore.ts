import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

export interface Chat {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

interface ChatStore {
  chats: Chat[];
  currentChatId: string | null;
  currentChat: Chat | null;
  createNewChat: () => string;
  selectChat: (chatId: string) => void;
  updateChatMessages: (chatId: string, messages: Message[]) => void;
  deleteChat: (chatId: string) => void;
  updateChatTitle: (chatId: string, title: string) => void;
}

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      chats: [],
      currentChatId: null,
      currentChat: null,

      createNewChat: () => {
        const newChat: Chat = {
          id: Date.now().toString(),
          title: 'New Chat',
          messages: [],
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        set((state) => ({
          chats: [newChat, ...state.chats],
          currentChatId: newChat.id,
          currentChat: newChat
        }));
        
        return newChat.id;
      },

      selectChat: (chatId: string) => {
        const chat = get().chats.find(c => c.id === chatId) || null;
        set({ currentChatId: chatId, currentChat: chat });
      },

      updateChatMessages: (chatId: string, messages: Message[]) => {
        set((state) => {
          const updatedChats = state.chats.map(chat => {
            if (chat.id === chatId) {
              const title = messages.length > 0 && chat.title === 'New Chat' 
                ? messages[0].content.split(' ').slice(0, 4).join(' ') + (messages[0].content.split(' ').length > 4 ? '...' : '')
                : chat.title;
              
              const updatedChat = {
                ...chat,
                messages,
                title,
                updatedAt: new Date()
              };

              return updatedChat;
            }
            return chat;
          });

          const currentChat = state.currentChatId === chatId 
            ? updatedChats.find(c => c.id === chatId) || null
            : state.currentChat;

          return {
            chats: updatedChats,
            currentChat
          };
        });
      },

      deleteChat: (chatId: string) => {
        set((state) => {
          const filtered = state.chats.filter(chat => chat.id !== chatId);
          const newCurrentChatId = state.currentChatId === chatId 
            ? (filtered.length > 0 ? filtered[0].id : null)
            : state.currentChatId;
          const newCurrentChat = newCurrentChatId 
            ? filtered.find(c => c.id === newCurrentChatId) || null
            : null;

          return {
            chats: filtered,
            currentChatId: newCurrentChatId,
            currentChat: newCurrentChat
          };
        });
      },

      updateChatTitle: (chatId: string, title: string) => {
        set((state) => {
          const updatedChats = state.chats.map(chat => 
            chat.id === chatId 
              ? { ...chat, title, updatedAt: new Date() }
              : chat
          );

          const currentChat = state.currentChatId === chatId
            ? updatedChats.find(c => c.id === chatId) || null
            : state.currentChat;

          return {
            chats: updatedChats,
            currentChat
          };
        });
      }
    }),
    {
      name: 'chat-history',
      partialize: (state) => ({
        chats: state.chats,
        currentChatId: state.currentChatId
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Convert date strings back to Date objects
          state.chats = state.chats.map(chat => ({
            ...chat,
            createdAt: new Date(chat.createdAt),
            updatedAt: new Date(chat.updatedAt),
            messages: chat.messages.map(message => ({
              ...message,
              timestamp: new Date(message.timestamp)
            }))
          }));
          
          const currentChat = state.currentChatId 
            ? state.chats.find(c => c.id === state.currentChatId) || null
            : null;
          state.currentChat = currentChat;
        }
      }
    }
  )
);