import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import dbConnect from '@/lib/mongodb';
import { Vendor } from '@/models/Purchase';

// Helper function to check authentication
async function isAuthenticated(req) {
  const session = await getServerSession(authOptions);
  return session !== null ? session : false;
}

// Logger helper
const logger = {
  info: (message, meta = {}) => console.log(`INFO: ${message}`, meta),
  warn: (message, meta = {}) => console.warn(`WARN: ${message}`, meta),
  error: (message, meta = {}) => console.error(`ERROR: ${message}`, meta)
};

export async function GET(req) {
  try {
    const authenticated = await isAuthenticated(req);
    if (!authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const vendors = await Vendor.find({}).sort({ company: 1 });
    
    return NextResponse.json(vendors);
  } catch (error) {
    logger.error(`Failed to fetch vendors: ${error.message}`);
    return NextResponse.json({ error: 'Failed to fetch vendors' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const authenticated = await isAuthenticated(req);
    if (!authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const body = await req.json();
    
    const vendor = new Vendor(body);
    await vendor.save();
    
    return NextResponse.json(vendor, { status: 201 });
  } catch (error) {
    logger.error(`Failed to create vendor: ${error.message}`);
    return NextResponse.json({ error: 'Failed to create vendor' }, { status: 500 });
  }
}