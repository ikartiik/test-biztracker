import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
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

// GET single vendor
export async function GET(req, { params }) {
  try {
    const authenticated = await isAuthenticated(req);
    if (!authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const vendor = await Vendor.findById(params.id);
    
    if (!vendor) {
      return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });
    }
    
    return NextResponse.json(vendor);
  } catch (error) {
    logger.error(`Failed to fetch vendor: ${error.message}`);
    return NextResponse.json({ error: 'Failed to fetch vendor' }, { status: 500 });
  }
}

// UPDATE vendor
export async function PUT(req, { params }) {
  try {
    const authenticated = await isAuthenticated(req);
    if (!authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const body = await req.json();
    
    // Await params to fix Next.js 15 async params issue
    const { id } = await params;
    
    const vendor = await Vendor.findByIdAndUpdate(
      id,
      body,
      { new: true, runValidators: true }
    );
    
    if (!vendor) {
      return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });
    }
    
    logger.info('Vendor updated', { vendorId: id });
    return NextResponse.json(vendor);
  } catch (error) {
    logger.error(`Failed to update vendor: ${error.message}`);
    return NextResponse.json({ error: 'Failed to update vendor' }, { status: 500 });
  }
}

// DELETE vendor
export async function DELETE(req, { params }) {
  try {
    const authenticated = await isAuthenticated(req);
    if (!authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    
    // Await params to fix Next.js 15 async params issue
    const { id } = await params;
    
    const vendor = await Vendor.findByIdAndDelete(id);
    
    if (!vendor) {
      return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });
    }
    
    logger.info('Vendor deleted', { vendorId: id });
    return NextResponse.json({ message: 'Vendor deleted successfully' });
  } catch (error) {
    logger.error(`Failed to delete vendor: ${error.message}`);
    return NextResponse.json({ error: 'Failed to delete vendor' }, { status: 500 });
  }
}
