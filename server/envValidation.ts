/**
 * Environment validation utility
 * Checks for required environment variables and provides helpful error messages
 */

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateEnvironment(): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const isProduction = process.env.NODE_ENV === 'production';
  const isDevelopment = process.env.NODE_ENV === 'development';

  console.log(`\n${'='.repeat(70)}`);
  console.log('🔍 Environment Validation');
  console.log(`${'='.repeat(70)}\n`);

  // Critical: Database
  if (!process.env.DATABASE_URL) {
    const error = '❌ DATABASE_URL is not set';
    errors.push(error);
    console.error(error);
    console.error('   → Required for: User data, sessions, battles');
    console.error('   → Fix: Add DATABASE_URL to your Secrets or .env file');
    console.error('   → See SETUP_GUIDE.md for instructions\n');
  } else {
    console.log('✅ DATABASE_URL is set');
  }

  // Critical for production: Session secret
  if (!process.env.SESSION_SECRET) {
    const message = isDevelopment 
      ? '⚠️  SESSION_SECRET not set - using fallback (NOT FOR PRODUCTION)'
      : '❌ SESSION_SECRET is not set';
    
    if (isProduction) {
      errors.push(message);
      console.error(message);
      console.error('   → Required for: Secure session management');
      console.error('   → Fix: Add SESSION_SECRET to your environment\n');
    } else {
      warnings.push(message);
      console.warn(message);
      console.warn('   → Add SESSION_SECRET for production deployment\n');
    }
  } else {
    console.log('✅ SESSION_SECRET is set');
  }

  // Critical for production: Replit authentication
  if (!process.env.REPL_ID) {
    const message = isDevelopment
      ? '⚠️  REPL_ID not set - authentication may not work'
      : '❌ REPL_ID is not set';
    
    if (isProduction) {
      errors.push(message);
      console.error(message);
      console.error('   → Required for: Replit OAuth authentication');
      console.error('   → Fix: This should be automatic on Replit\n');
    } else {
      warnings.push(message);
      console.warn(message);
      console.warn('   → This is normal for local development\n');
    }
  } else {
    console.log('✅ REPL_ID is set');
  }

  // Important: AI Services
  const hasGroq = !!process.env.GROQ_API_KEY;
  const hasOpenAI = !!process.env.OPENAI_API_KEY;
  
  if (!hasGroq && !hasOpenAI) {
    const message = '⚠️  No AI API keys found (GROQ_API_KEY or OPENAI_API_KEY)';
    warnings.push(message);
    console.warn(message);
    console.warn('   → Required for: Rap battles, transcription, AI responses');
    console.warn('   → Fix: Add at least GROQ_API_KEY to your environment');
    console.warn('   → Get free API key: https://console.groq.com/keys\n');
  } else {
    if (hasGroq) console.log('✅ GROQ_API_KEY is set');
    if (hasOpenAI) console.log('✅ OPENAI_API_KEY is set');
  }

  // Optional: Payment processing
  if (!process.env.STRIPE_SECRET_KEY) {
    console.log('ℹ️  STRIPE_SECRET_KEY not set - payment features will be disabled');
  } else {
    console.log('✅ STRIPE_SECRET_KEY is set');
  }

  // Summary
  console.log(`\n${'='.repeat(70)}`);
  if (errors.length === 0 && warnings.length === 0) {
    console.log('✅ All environment variables are properly configured!');
  } else {
    if (errors.length > 0) {
      console.error(`❌ ${errors.length} CRITICAL ERROR(S) - App may not start`);
    }
    if (warnings.length > 0) {
      console.warn(`⚠️  ${warnings.length} WARNING(S) - Some features may be limited`);
    }
    console.log('\n📖 See SETUP_GUIDE.md for detailed setup instructions');
  }
  console.log(`${'='.repeat(70)}\n`);

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Check if specific features are available based on environment
 */
export function checkFeatureAvailability() {
  return {
    battles: !!(process.env.GROQ_API_KEY || process.env.OPENAI_API_KEY),
    payments: !!process.env.STRIPE_SECRET_KEY,
    database: !!process.env.DATABASE_URL,
    authentication: !!(process.env.REPL_ID || process.env.NODE_ENV === 'development'),
  };
}
