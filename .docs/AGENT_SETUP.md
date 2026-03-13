# HR Agent Integration Setup

## ✅ What's Been Set Up

### 1. **Agent Configuration** (`www/src/agent.ts`)
Created a Claude Sonnet 4.6-powered HR assistant with the following tools:
- **getEmployeeInfo**: Retrieve employee basic info (name, department, role, etc.)
- **getHRPolicies**: Access HR policy information (remote-work, time-off, benefits, code-of-conduct, expenses)
- **submitTimeOff**: Submit time-off requests (vacation, sick, personal)

### 2. **Backend Integration**
- **Token Route**: `www/src/app/api/an-token/route.ts` - Exchanges API key for short-lived tokens
- **Dependencies**: Installed `@an-sdk/agent`, `@an-sdk/nextjs`, `@an-sdk/react`, `@an-sdk/node`, and related packages

### 3. **Frontend Components**
- **Theme Config**: `www/src/app/theme.json` - Customized light/dark theme for the chat UI
- **Chat Page**: `www/src/app/[locale]/hr-tools/ai-assistant/page.tsx` - Full-featured chat interface
- **Navigation**: Updated HR Tools main page to include AI Assistant link

## 🚀 Next Steps

### 1. Get Your API Key
1. Visit [https://21st.dev](https://21st.dev)
2. Create an account and generate your API key
3. Add it to `.env`:
   ```bash
   AN_API_KEY=your_api_key_here
   ```

### 2. Deploy Your Agent
```bash
# Login to 21st
npx @an-sdk/cli login

# Deploy the agent
cd www
npx @an-sdk/cli deploy
```

The agent name will be output after deployment (e.g., `hr-assistant`). Update `www/src/app/[locale]/hr-tools/ai-assistant/page.tsx` if the agent name differs:

```typescript
const chat = createAnChat({
  agent: 'your-agent-name', // Update this
  tokenUrl: '/api/an-token',
})
```

### 3. Test the Integration
```bash
# Start the development server
pnpm run dev

# Navigate to:
# http://localhost:3010/en/hr-tools (or your default locale)
# Click the "HR Assistant" card
```

## 📁 File Structure

```
www/
├── src/
│   ├── agent.ts                           # Agent definition
│   ├── app/
│   │   ├── api/an-token/route.ts          # Token handler
│   │   ├── theme.json                     # Chat UI theme
│   │   └── [locale]/hr-tools/
│   │       ├── page.tsx                   # Updated with AI Assistant link
│   │       └── ai-assistant/
│   │           └── page.tsx               # Chat interface
│   └── ...
└── ...
```

## 🔧 Customization

### Add More Tools
Edit `www/src/agent.ts` to add new tools:

```typescript
tools: {
  yourNewTool: tool({
    description: "Description of what this tool does",
    inputSchema: z.object({
      // Define input parameters with Zod
    }),
    execute: async (params) => {
      // Implementation
      return {
        content: [{ type: "text", text: "Response text" }],
      }
    },
  }),
}
```

### Customize the System Prompt
Update the `systemPrompt` in `www/src/agent.ts` to change the agent's behavior and personality.

### Adjust Theme
Edit `www/src/app/theme.json` to customize colors, fonts, layout, and other UI properties.

## 🔐 Security Notes

- The token route (`/api/an-token`) securely exchanges your API key for short-lived tokens
- Never expose `AN_API_KEY` to the client - it's only used server-side
- Tokens are generated per-request with limited lifetime

## 📚 Resources

- [21st Agents Documentation](https://21st.dev/agents/llms.txt)
- [AN SDK Docs](https://21st.dev/an/docs)
- [React Chat Hook](https://21st.dev/agents/docs/client-sdks/react)

## 🐛 Troubleshooting

### "Invalid API Key" Error
- Verify `AN_API_KEY` is set in `.env`
- Ensure the key is valid (not expired or revoked)
- Restart the development server after updating `.env`

### Chat Not Appearing
- Ensure the agent is deployed and the name matches in `page.tsx`
- Check browser console for errors
- Verify the token route is accessible at `/api/an-token`

### Type Errors
- Run `pnpm run typecheck` to verify TypeScript compilation
- Ensure all dependencies are installed: `pnpm install`
