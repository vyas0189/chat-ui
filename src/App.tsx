import ChatInterface from './components/chat-interface'
import { ThemeProvider } from './contexts/ThemeContext'
import { ChatHistoryProvider } from './contexts/ChatHistoryContext'

function App() {
  return (
    <ThemeProvider>
      <ChatHistoryProvider>
        <ChatInterface />
      </ChatHistoryProvider>
    </ThemeProvider>
  )
}

export default App