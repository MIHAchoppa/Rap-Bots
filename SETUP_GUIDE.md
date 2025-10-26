# Rap Bots Setup Guide

This guide will help you get Rap Bots up and running.

## Prerequisites

Rap Bots is designed to run on Replit. If you're running it locally, you'll need to set up the required services.

## Required Environment Variables

The following environment variables MUST be set for the app to function:

### 1. Database Configuration
```
DATABASE_URL=your_postgresql_connection_string
```
- **On Replit**: Use Replit's PostgreSQL database feature
- **Locally**: Set up a PostgreSQL database or use a hosted service like Neon

### 2. Authentication (Replit-specific)
```
REPL_ID=your_repl_id
REPLIT_DOMAINS=your_replit_domain
SESSION_SECRET=your_random_secret_key
```
- **On Replit**: These are automatically provided
- **Locally**: You'll need to use an alternative auth system or mock these values

### 3. AI Services
```
GROQ_API_KEY=your_groq_api_key
```
- Get your API key from [Groq Console](https://console.groq.com/keys)
- This is required for rap battle functionality (transcription and AI responses)

### Optional Environment Variables

```
OPENAI_API_KEY=your_openai_api_key
ELEVENLABS_API_KEY=your_elevenlabs_api_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
```

## Setup Instructions

### On Replit

1. Fork this repository on Replit
2. Add the following Secrets in Replit:
   - `DATABASE_URL`: Create a PostgreSQL database in Replit
   - `SESSION_SECRET`: Generate a random string
   - `GROQ_API_KEY`: Get from Groq Console
3. Run the app with `npm run dev`

### Local Development

1. Clone the repository
2. Install dependencies: `npm install`
3. Create a `.env` file with all required variables (see `.env.example`)
4. Set up a PostgreSQL database
5. Run database migrations: `npm run db:push`
6. Start the development server: `npm run dev`

## Troubleshooting

### "DATABASE_URL must be set" Error

- Make sure you've added `DATABASE_URL` to your Secrets (on Replit) or `.env` file (locally)
- Verify the database connection string is correct
- Check that the database is accessible

### "GROQ_API_KEY not provided" Warning

- Battles will not function without a Groq API key
- Add `GROQ_API_KEY` to your Secrets/environment variables
- Get a free API key from [Groq Console](https://console.groq.com/keys)

### Authentication Issues

- Ensure `REPL_ID` and `REPLIT_DOMAINS` are set correctly
- On Replit, these should be automatic
- For local development, you may need to implement alternative authentication

### Battles Not Working

1. Check that `GROQ_API_KEY` is set
2. Verify the database is accessible
3. Check browser console for errors
4. Ensure you're logged in (authentication required)

## Database Schema

After setting `DATABASE_URL`, run:
```bash
npm run db:push
```

This will create all necessary tables in your database.

## Support

For issues and questions:
- Check the [Issues](https://github.com/MIHAchoppa/Rap-Bots/issues) page
- Review the code documentation
- Ensure all environment variables are properly configured
