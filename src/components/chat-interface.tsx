import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Send, Bot, User, Sun, Moon, Menu } from "lucide-react";
import { useThemeStore } from "@/stores/themeStore";
import { useChatStore, type Message } from "@/stores/chatStore";
import ChatHistorySidebar from "./chat-history-sidebar";
import { useStreamingChat } from "@/lib/api";

export default function ChatInterface() {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState("");
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { theme, setTheme } = useThemeStore();
  const { 
    currentChat, 
    currentChatId, 
    createNewChat, 
    updateChatMessages 
  } = useChatStore();
  const { streamChat } = useStreamingChat();

  const messages = currentChat?.messages || [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const inputValue = input;
    let chatId = currentChatId;
    
    // Create new chat if no current chat exists
    if (!chatId) {
      chatId = createNewChat();
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      role: "user",
      timestamp: new Date(),
    };

    const newMessages = [...messages, userMessage];
    updateChatMessages(chatId, newMessages);
    setInput("");
    setIsLoading(true);
    setStreamingMessage("");

    try {
      let accumulatedContent = "";
      
      await streamChat(
        { message: inputValue, chatId },
        (chunk) => {
          accumulatedContent += chunk.content;
          setStreamingMessage(accumulatedContent);
        }
      );

      // Create final assistant message
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: accumulatedContent,
        role: "assistant",
        timestamp: new Date(),
      };

      const finalMessages = [...newMessages, assistantMessage];
      updateChatMessages(chatId, finalMessages);
      setStreamingMessage("");
    } catch (error) {
      console.error("Streaming error:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "Sorry, I encountered an error. Please try again.",
        role: "assistant",
        timestamp: new Date(),
      };
      const finalMessages = [...newMessages, errorMessage];
      updateChatMessages(chatId, finalMessages);
      setStreamingMessage("");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <ChatHistorySidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      
      <div className="flex flex-col flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-semibold text-foreground">ChatGPT</h1>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          >
            {theme === "light" ? (
              <Moon className="h-5 w-5" />
            ) : (
              <Sun className="h-5 w-5" />
            )}
          </Button>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1" ref={scrollAreaRef}>
          <div className="max-w-3xl mx-auto">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full py-20 text-center">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mb-4">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-semibold text-foreground mb-2">
                  How can I help you today?
                </h2>
              </div>
            )}
            
            {messages.map((message) => (
              <div
                key={message.id}
                className={`group w-full border-b border-border ${
                  message.role === "assistant" ? "bg-muted/30" : ""
                }`}
              >
                <div className="flex gap-4 p-6 max-w-3xl mx-auto">
                  <div className="flex-shrink-0">
                    {message.role === "assistant" ? (
                      <div className="w-8 h-8 bg-green-500 rounded-sm flex items-center justify-center">
                        <Bot className="w-5 h-5 text-white" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 bg-purple-500 rounded-sm flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    {message.role === "user" ? (
                      <div className="text-foreground whitespace-pre-wrap">
                        {message.content}
                      </div>
                    ) : (
                      <div className="prose prose-gray dark:prose-invert max-w-none">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            p: ({ children }) => <p className="mb-3 last:mb-0 text-foreground">{children}</p>,
                            code: ({ children, className }) => {
                              const isInline = !className;
                              return isInline ? (
                                <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono text-foreground">
                                  {children}
                                </code>
                              ) : (
                                <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                                  <code className="text-sm font-mono text-foreground">{children}</code>
                                </pre>
                              );
                            },
                          }}
                        >
                          {message.content}
                        </ReactMarkdown>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {(isLoading || streamingMessage) && (
              <div className="group w-full border-b border-border bg-muted/30">
                <div className="flex gap-4 p-6 max-w-3xl mx-auto">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-500 rounded-sm flex items-center justify-center">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    {streamingMessage ? (
                      <div className="prose prose-gray dark:prose-invert max-w-none">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            p: ({ children }) => <p className="mb-3 last:mb-0 text-foreground">{children}</p>,
                            code: ({ children, className }) => {
                              const isInline = !className;
                              return isInline ? (
                                <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono text-foreground">
                                  {children}
                                </code>
                              ) : (
                                <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                                  <code className="text-sm font-mono text-foreground">{children}</code>
                                </pre>
                              );
                            },
                          }}
                        >
                          {streamingMessage}
                        </ReactMarkdown>
                        <div className="inline-block w-2 h-4 bg-foreground animate-pulse ml-1"></div>
                      </div>
                    ) : (
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
          <div ref={messagesEndRef} />
        </ScrollArea>

        {/* Input */}
        <div className="border-t border-border p-4">
          <div className="max-w-3xl mx-auto">
            <form onSubmit={handleSubmit} className="relative">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Message ChatGPT..."
                disabled={isLoading}
                className="w-full pr-12 py-3 rounded-xl resize-none"
              />
              <Button
                type="submit"
                disabled={isLoading || !input.trim()}
                size="sm"
                variant="ghost"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 rounded-lg p-2"
              >
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}