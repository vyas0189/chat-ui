# Modern Chat UI

A modern, responsive chat application built with Next.js, TypeScript, and shadcn/ui components.

## Features

- 🎨 **Modern UI Design** - Clean, responsive interface with shadcn/ui components
- 💬 **Real-time Streaming** - Messages stream in real-time from the `/chat` API endpoint
- 📝 **Markdown Support** - Full markdown rendering with syntax highlighting
- 🌙 **Dark Mode** - Automatic dark/light mode support
- 📱 **Mobile Responsive** - Works perfectly on all device sizes
- ⚡ **Fast Performance** - Built with Next.js 15 and optimized for speed

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Markdown**: react-markdown with remark-gfm
- **Icons**: Lucide React

## Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Run the development server**:
   ```bash
   npm run dev
   ```

3. **Open your browser** and navigate to [http://localhost:3000](http://localhost:3000)

## API Integration

The chat interface connects to the `/chat` API endpoint. The current implementation includes a demo response that shows streaming functionality. To integrate with a real AI service:

1. Replace the demo logic in `src/app/chat/route.ts`
2. Add your AI service API calls
3. Ensure the response is streamed for real-time updates

### Example API Integration

```typescript
// src/app/chat/route.ts
export async function POST(request: NextRequest) {
  const { message } = await request.json();
  
  // Replace with your AI service
  const response = await fetch('YOUR_AI_API_ENDPOINT', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${process.env.AI_API_KEY}` },
    body: JSON.stringify({ message })
  });
  
  return new Response(response.body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' }
  });
}
```

## Project Structure

```
src/
├── app/
│   ├── chat/
│   │   └── route.ts          # Chat API endpoint
│   ├── globals.css           # Global styles
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Home page
├── components/
│   ├── ui/                   # shadcn/ui components
│   └── chat-interface.tsx    # Main chat component
└── lib/
    └── utils.ts              # Utility functions
```

## Customization

### Styling
- Modify `src/app/globals.css` for global styles
- Update component styles in `src/components/chat-interface.tsx`
- Customize shadcn/ui theme in `tailwind.config.ts`

### Features
- Add user authentication
- Implement message persistence
- Add file upload support
- Integrate with different AI providers

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
