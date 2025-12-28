const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load .env.local
const envLocalPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envLocalPath)) {
  const envConfig = dotenv.parse(fs.readFileSync(envLocalPath));
  for (const k in envConfig) {
    process.env[k] = envConfig[k];
  }
}

async function checkConfig() {
  console.log('--- Environment Variable Check ---');
  const requiredVars = [
    'AUTH_SECRET',
    'AUTH_MICROSOFT_ENTRA_ID_ID',
    'AUTH_MICROSOFT_ENTRA_ID_SECRET',
    'AUTH_MICROSOFT_ENTRA_ID_TENANT_ID',
    'DATABASE_URL'
  ];

  let missing = false;
  let hasPlaceholders = false;

  requiredVars.forEach(varName => {
    const value = process.env[varName];
    if (!value) {
      console.error(`❌ Missing: ${varName}`);
      missing = true;
    } else if (value.includes('your-azure-ad') || value.includes('change-this-in-production')) {
      console.error(`❌ Placeholder value detected: ${varName} = "${value}"`);
      hasPlaceholders = true;
    } else {
      const displayValue = varName.includes('SECRET') || varName.includes('KEY') 
        ? '********' 
        : value;
      console.log(`✅ ${varName}: ${displayValue}`);
    }
  });

  if (missing || hasPlaceholders) {
    console.warn('\n⚠️ CONFIGURATION WARNING: You must update .env.local with real credentials for production.');
    console.warn('⚠️ Proceeding with build, but runtime errors may occur.');
    // process.exit(1); // Allow build to proceed for testing/development
  } else {
    console.log('\n✅ All checked environment variables are present and look valid.');
  }

  console.log('\n--- Database Connection Check ---');
  try {
    const prisma = new PrismaClient();
    try {
      await prisma.$connect();
      console.log('✅ Successfully connected to the database.');
      
      const userCount = await prisma.user.count();
      console.log(`✅ Database query successful. User count: ${userCount}`);
      
    } catch (error) {
      console.warn('⚠️ Database connection failed (Non-fatal for build):', error.message);
    } finally {
      await prisma.$disconnect();
    }
  } catch (err) {
    console.warn('⚠️ Could not initialize Prisma Client (Non-fatal for build):', err.message);
  }
}

checkConfig();
