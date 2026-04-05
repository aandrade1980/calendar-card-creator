# 🎂 Birthday Invite Scanner

A modern web application that uses AI to scan birthday invitation images, extract event details, and seamlessly add them to your calendar.

## 🚀 Features

- **AI-Powered Extraction**: Uses Gemini 3 Flash to automatically parse names, dates, times, and locations from invitation images.
- **Smart End-Time Parsing**: Intelligently identifies event duration and end times from invitation notes.
- **Calendar Integration**: 
  - One-click "Add to Google Calendar".
  - Downloadable `.ics` files for Apple Calendar, Outlook, and others.
- **Modern UI/UX**: Drag-and-drop image uploading with real-time previews and a polished, responsive design.

## 🛠️ Tech Stack

- **Frontend**: [React](https://reactjs.org/) + [Vite](https://vitejs.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)
- **Backend**: [Supabase Edge Functions](https://supabase.com/docs/guides/functions) (Deno)
- **AI Model**: [Gemini 3 Flash](https://deepmind.google/technologies/gemini/) (via Lovable AI Gateway)
- **Icons**: [Lucide React](https://lucide.dev/)
- **State Management**: [TanStack Query (React Query)](https://tanstack.com/query/latest)

## 📁 Project Structure

- `src/components/`: Reusable UI components including `ImageUploader` and `BirthdayResult`.
- `src/pages/`: Main application pages (`Index.tsx`, `NotFound.tsx`).
- `src/lib/`: Core logic for calendar generation and data parsing.
- `src/integrations/`: Supabase client configuration and types.
- `supabase/functions/extract-birthday/`: The Deno-based edge function that orchestrates the AI extraction process.

## 🔄 How It Works

1. **Upload**: User uploads or drops an image of a birthday invitation.
2. **Process**: The frontend sends the image as a Base64 string to a Supabase Edge Function.
3. **Extract**: The Edge Function calls the Gemini 3 Flash model with a specialized prompt and tool schema to extract structured JSON data.
4. **Result**: The app displays the extracted details and provides links/files to save the event to the user's preferred calendar.

## 🚦 Getting Started

### Prerequisites
- [Bun](https://bun.sh/) or Node.js installed.
- Supabase CLI for local edge function development.

### Installation
1. Install dependencies:
   ```bash
   bun install
   ```
2. Start the development server:
   ```bash
   bun run dev
   ```

## 📝 License

This project is open-source and available under the MIT License.
