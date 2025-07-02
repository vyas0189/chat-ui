import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

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

interface ChatHistoryContextType {
  chats: Chat[];
  currentChatId: string | null;
  currentChat: Chat | null;
  createNewChat: () => string;
  selectChat: (chatId: string) => void;
  updateChatMessages: (chatId: string, messages: Message[]) => void;
  deleteChat: (chatId: string) => void;
  updateChatTitle: (chatId: string, title: string) => void;
}

const ChatHistoryContext = createContext<ChatHistoryContextType | undefined>(undefined);

export function ChatHistoryProvider({ children }: { children: ReactNode }) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);

  useEffect(() => {
    const savedChats = localStorage.getItem('chat-history');
    const savedCurrentChatId = localStorage.getItem('current-chat-id');
    
    if (savedChats) {
      try {
        const parsedChats = JSON.parse(savedChats).map((chat: any) => ({
          ...chat,
          createdAt: new Date(chat.createdAt),
          updatedAt: new Date(chat.updatedAt),
          messages: chat.messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }))
        }));
        setChats(parsedChats);
        
        // Only set current chat ID if the chat still exists
        if (savedCurrentChatId && parsedChats.some((chat: Chat) => chat.id === savedCurrentChatId)) {
          setCurrentChatId(savedCurrentChatId);
        }
      } catch (error) {
        console.error('Error loading chat history:', error);
        localStorage.removeItem('chat-history');
        localStorage.removeItem('current-chat-id');
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('chat-history', JSON.stringify(chats));
  }, [chats]);

  useEffect(() => {
    if (currentChatId) {
      localStorage.setItem('current-chat-id', currentChatId);
    } else {
      localStorage.removeItem('current-chat-id');
    }
  }, [currentChatId]);

  const createNewChat = (): string => {
    const newChat: Chat = {
      id: Date.now().toString(),
      title: 'New Chat',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    setChats(prev => [newChat, ...prev]);
    setCurrentChatId(newChat.id);
    return newChat.id;
  };

  const selectChat = (chatId: string) => {
    setCurrentChatId(chatId);
  };

  const updateChatMessages = (chatId: string, messages: Message[]) => {
    setChats(prev => prev.map(chat => {
      if (chat.id === chatId) {
        const title = messages.length > 0 && chat.title === 'New Chat' 
          ? messages[0].content.split(' ').slice(0, 4).join(' ') + (messages[0].content.split(' ').length > 4 ? '...' : '')
          : chat.title;
        
        return {
          ...chat,
          messages,
          title,
          updatedAt: new Date()
        };
      }
      return chat;
    }));
  };

  const deleteChat = (chatId: string) => {
    setChats(prev => {
      const filtered = prev.filter(chat => chat.id !== chatId);
      if (currentChatId === chatId) {
        setCurrentChatId(filtered.length > 0 ? filtered[0].id : null);
      }
      return filtered;
    });
  };

  const updateChatTitle = (chatId: string, title: string) => {
    setChats(prev => prev.map(chat => 
      chat.id === chatId 
        ? { ...chat, title, updatedAt: new Date() }
        : chat
    ));
  };

  const currentChat = chats.find(chat => chat.id === currentChatId) || null;

  return (
    <ChatHistoryContext.Provider value={{
      chats,
      currentChatId,
      currentChat,
      createNewChat,
      selectChat,
      updateChatMessages,
      deleteChat,
      updateChatTitle
    }}>
      {children}
    </ChatHistoryContext.Provider>
  );
}

export function useChatHistory() {
  const context = useContext(ChatHistoryContext);
  if (context === undefined) {
    throw new Error('useChatHistory must be used within a ChatHistoryProvider');
  }
  return context;
}