import ChatInterface from './components/chat-interface'
import { ThemeProvider } from './contexts/ThemeContext'

function App() {
  return (
    <ThemeProvider>
      <ChatInterface />
    </ThemeProvider>
  )
}

export default App