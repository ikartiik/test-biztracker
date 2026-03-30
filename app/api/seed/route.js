import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

// Logger helper
const logger = {
  info: (message, meta = {}) => console.log(`INFO: ${message}`, meta),
  warn: (message, meta = {}) => console.warn(`WARN: ${message}`, meta),
  error: (message, meta = {}) => console.error(`ERROR: ${message}`, meta)
};

export async function POST(req) {
  try {
    logger.info('POST request received for seed admin', {
      method: 'POST',
      path: '/api/seed'
    });

    await dbConnect();

    // Check if admin already exists
    const existingAdmin = await User.findOne({ username: 'admin' });
    
    if (existingAdmin) {
      logger.warn('Admin user already exists', {
        method: 'POST',
        path: '/api/seed',
        statusCode: 400
      });
      
      return NextResponse.json(
        { error: 'Admin user already exists' },
        { status: 400 }
      );
    }

    // Create default admin user
    const adminUser = new User({
      username: 'admin',
      email: 'admin@company.com',
      password: 'admin123', // This will be hashed automatically
      role: 'admin',
    });

    await adminUser.save();

    logger.info('Default admin user created successfully', {
      method: 'POST',
      path: '/api/seed',
      userId: adminUser._id,
      username: adminUser.username,
      statusCode: 201
    });

    return NextResponse.json({ 
      message: 'Default admin user created successfully',
      user: {
        username: adminUser.username,
        email: adminUser.email,
        role: adminUser.role,
      }
    }, { status: 201 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    logger.error(`Failed to seed admin user: ${errorMessage}`, {
      method: 'POST',
      path: '/api/seed',
      statusCode: 500,
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined
    });
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Only allow POST method for seeding
export async function GET(req) {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function PUT(req) {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function DELETE(req) {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}