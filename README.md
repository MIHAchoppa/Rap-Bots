# Rap Bots

Welcome to the Rap Bots project! This repository is optimized for hackathon use and contains everything you need to get started quickly.

## Demo Link
[Demo Link Placeholder](#)

## Quick Start

⚠️ **IMPORTANT**: Before starting, you need to configure environment variables. See [SETUP_GUIDE.md](./SETUP_GUIDE.md) for detailed instructions.

### Required Setup
1. Clone the repository:
   ```bash
   git clone https://github.com/MIHAchoppa/Rap-Bots.git
   ```
2. Navigate to the project directory:
   ```bash
   cd Rap-Bots
   ```
3. **Configure environment variables** (see [SETUP_GUIDE.md](./SETUP_GUIDE.md))
4. Install the necessary dependencies:
   ```bash
   npm install
   ```
5. Initialize the database:
   ```bash
   npm run db:push
   ```
6. Start the application:
   ```bash
   npm run dev
   ```

## Architecture Overview
The architecture of Rap Bots is designed to be modular and scalable. It consists of the following components:
- **Frontend**: A user-friendly interface for interaction built with React and Vite.
- **Backend**: Express.js server handling API requests and business logic.
- **Database**: PostgreSQL database for storing user data and battle history.
- **AI Services**: Integration with Groq for transcription and AI rap generation.

## Feature Highlights
- **Real-time Rap Battles**: Engage with AI opponents in live rap battles.
- **Voice Recording**: Record your raps and get instant transcription.
- **AI-Powered Opponents**: Battle against multiple AI characters with different styles.
- **Score Tracking**: Advanced scoring system for evaluating rap performance.
- **User Profiles**: Create and customize your rapper profile.
- **Character Cards**: Generate unique character cards for your profile.

## Documentation
- **[Setup Guide](./SETUP_GUIDE.md)**: Detailed setup and configuration instructions
- **[Tokenomics](./TOKENOMICS.md)**: Learn about the $SHELL token that powers the MyShell ecosystem

## Troubleshooting

If you encounter issues:
1. Check [SETUP_GUIDE.md](./SETUP_GUIDE.md) for environment variable configuration
2. Ensure all required services (database, API keys) are properly set up
3. Check the browser console and server logs for error messages
4. Verify you're using Node.js 18 or higher

Common issues:
- **"DATABASE_URL must be set"**: See the setup guide for database configuration
- **"Rap battles not functioning"**: Ensure `GROQ_API_KEY` is configured
- **Authentication errors**: Verify `REPL_ID` and `SESSION_SECRET` are set

## Support

For issues and questions:
- Check the [Issues](https://github.com/MIHAchoppa/Rap-Bots/issues) page
- Review the documentation in this repository
- Ensure all environment variables are properly configured per [SETUP_GUIDE.md](./SETUP_GUIDE.md)

We hope you enjoy using Rap Bots!