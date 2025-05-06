# KnowledgeShareOnline

A web app for children (ages 10-16) to swap books, write reviews, and track borrowing in a safe, colourful, and friendly environment.

## Features
- Authentication (child-friendly)
- Add, search, and review books
- Swap/borrow tracking
- Easy, colourful UI

## Tech Stack
- Frontend: React + Chakra UI
- Backend: Supabase Edge Functions (serverless)
- Auth & Database: Supabase

## Prerequisites
- Node.js >= 14
- npm or yarn
- Supabase CLI (`npm install -g supabase`)

## Supabase Setup
1. Sign up at [Supabase](https://app.supabase.com) and create a new project.
2. Copy your **Project URL** and **anon/public** API key from the dashboard.
3. In your terminal, login to the Supabase CLI:
   ```bash
   supabase login
   ```
4. Link your local repo to the project:
   ```bash
   supabase link --project-ref <your-project-ref>
   ```
5. Initialize functions directory (if not present):
   ```bash
   supabase functions init
   ```

## Frontend Setup
1. Navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env.local` file in `frontend` with:
   ```ini
   REACT_APP_SUPABASE_URL=<YOUR_SUPABASE_URL>
   REACT_APP_SUPABASE_ANON_KEY=<YOUR_ANON_KEY>
   ```
4. Start development server:
   ```bash
   npm start
   ```
5. Open <http://localhost:3000> in your browser.

## Edge Functions
Borrow request emails are sent via a Supabase Edge Function.

1. In `supabase/functions/send_borrow_request_email`, create a `.env` file:
   ```ini
   SUPABASE_SERVICE_ROLE_KEY=<YOUR_SERVICE_ROLE_KEY>
   ```
2. Deploy the function:
   ```bash
   supabase functions deploy send_borrow_request_email
   ```
3. The endpoint will be available at:
   ```txt
   https://<project-ref>.supabase.co/functions/v1/send_borrow_request_email
   ```

## Contributing
Contributions are welcome! Feel free to open issues or submit pull requests for new features and improvements.

### Roadmap
- Integrate a Large Language Model (LLM) API for intelligent book recommendations and summaries.
- Improve UI/UX with more interactive components.
- Add multi-language support.

## License
MIT
