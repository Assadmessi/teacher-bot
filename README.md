# teacherBot AI Backend Version

This version keeps the Gemini API key on the backend using a Netlify Function.

## Deploy steps

1. Upload or push this project to Netlify.
2. In Netlify project settings, add:
   - `GEMINI_API_KEY=your_key_here`
   - optional: `GEMINI_MODEL=gemini-2.5-flash`
3. Deploy the site.
4. Open the app and click **Check Backend**.

## Local note

If you want to test locally with Netlify Functions, use the Netlify CLI so the `/.netlify/functions/chat` route works.
