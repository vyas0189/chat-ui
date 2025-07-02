import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useChatStore } from '@/stores/chatStore';
import { Plus, MessageSquare, Trash2, Edit3, Check, X } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface ChatHistorySidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export default function ChatHistorySidebar({ isOpen, onToggle }: ChatHistorySidebarProps) {
  const { 
    chats, 
    currentChatId, 
    createNewChat, 
    selectChat, 
    deleteChat, 
    updateChatTitle 
  } = useChatStore();
  
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const handleNewChat = () => {
    // Only create a new chat if current chat has messages or no current chat exists
    const currentChat = chats.find(chat => chat.id === currentChatId);
    if (!currentChat || currentChat.messages.length > 0) {
      createNewChat();
    } else {
      // If current chat exists but has no messages, just select it (no new chat needed)
      selectChat(currentChat.id);
    }
  };

  const handleEditStart = (chatId: string, currentTitle: string) => {
    setEditingChatId(chatId);
    setEditTitle(currentTitle);
  };

  const handleEditSave = () => {
    if (editingChatId && editTitle.trim()) {
      updateChatTitle(editingChatId, editTitle.trim());
    }
    setEditingChatId(null);
    setEditTitle('');
  };

  const handleEditCancel = () => {
    setEditingChatId(null);
    setEditTitle('');
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return 'Today';
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else if (diffInHours < 168) {
      return `${Math.floor(diffInHours / 24)} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onToggle}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        bg-background border-r border-border transition-all duration-300 ease-in-out
        ${isOpen 
          ? 'fixed left-0 top-0 h-full w-80 z-50 md:relative md:z-auto' 
          : 'fixed left-0 top-0 h-full w-80 -translate-x-full z-50 md:relative md:z-auto md:w-0 md:translate-x-0 md:border-r-0 md:overflow-hidden'
        }
      `}>
        <div className={`flex flex-col h-full w-80 ${!isOpen ? 'md:w-0' : ''}`}>
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h2 className="font-semibold text-foreground">Chat History</h2>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleNewChat}
                className="h-8 w-8 p-0"
              >
                <Plus className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggle}
                className="h-8 w-8 p-0 md:hidden"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Chat List */}
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-1">
              {chats.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No conversations yet</p>
                </div>
              ) : (
                chats.map((chat) => (
                  <div
                    key={chat.id}
                    className={`
                      group relative rounded-lg p-3 cursor-pointer transition-colors
                      ${currentChatId === chat.id 
                        ? 'bg-muted text-foreground' 
                        : 'hover:bg-muted/50 text-muted-foreground hover:text-foreground'
                      }
                    `}
                    onClick={() => selectChat(chat.id)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        {editingChatId === chat.id ? (
                          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                            <Input
                              value={editTitle}
                              onChange={(e) => setEditTitle(e.target.value)}
                              className="h-6 text-sm"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleEditSave();
                                if (e.key === 'Escape') handleEditCancel();
                              }}
                              autoFocus
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={handleEditSave}
                              className="h-6 w-6 p-0"
                            >
                              <Check className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={handleEditCancel}
                              className="h-6 w-6 p-0"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ) : (
                          <>
                            <div className="font-medium text-sm truncate mb-1">
                              {chat.title}
                            </div>
                            <div className="text-xs opacity-70">
                              {formatDate(chat.updatedAt)}
                            </div>
                          </>
                        )}
                      </div>
                      
                      {editingChatId !== chat.id && (
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditStart(chat.id, chat.title);
                            }}
                            className="h-6 w-6 p-0"
                          >
                            <Edit3 className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteChat(chat.id);
                            }}
                            className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
    </>
  );
}