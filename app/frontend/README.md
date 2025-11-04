<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1cytgTT8fvxprH5HTWhVf1Wh8l_qaWTn8

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Login-gated flow

When a user clicks the "Inizia a Confrontare" button on the landing page, a login dialog will now appear requiring the user to authenticate (Google OAuth).
The dialog opens a popup to the backend OAuth endpoint; after successful authentication the app receives a message and navigates to the dashboard.

If you want to bypass the dialog during development, you can set the local `API_BASE` to a backend that returns an authenticated user on `/auth/me` or edit `App.tsx` to call `setView('dashboard')` directly.
