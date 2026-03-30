import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import dbConnect from '../../../lib/mongodb';
import Pending from '../../../models/Pending';

async function isAuthenticated(req) {
  const session = await getServerSession(authOptions);
  return !!session;
}

const logger = {
  info: (message, meta) => console.log(`[pending] INFO: ${message}`, meta),
  error: (message, meta) => console.error(`[pending] ERROR: ${message}`, meta)
};

export async function GET(req) {
  try {
    if (!await isAuthenticated(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    await dbConnect();
    const pending = await Pending.find({ status: { $in: ['Pending', 'Received'] }, qtyPending: { $gt: 0 } }).sort({ createdAt: -1 });
    return NextResponse.json(pending);
  } catch (error) {
    logger.error('Fetch failed', { error: error.message });
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    if (!await isAuthenticated(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    await dbConnect();
    const data = await req.json();
    const pending = new Pending(data);
    await pending.save();
    return NextResponse.json(pending, { status: 201 });
  } catch (error) {
    logger.error('Create failed', { error: error.message });
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    if (!await isAuthenticated(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    await dbConnect();
    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    const data = await req.json();
    
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });
    
    // Handle shipped status transition
    if (data.status === 'Shipped') {
      // Create shipping entry logic here if needed
      await Pending.findByIdAndUpdate(id, data, { new: true });
    } else {
      await Pending.findByIdAndUpdate(id, data, { new: true });
    }
    
    const updated = await Pending.findById(id);
    return NextResponse.json(updated);
  } catch (error) {
    logger.error('Update failed', { error: error.message });
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    if (!await isAuthenticated(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    await dbConnect();
    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });
    
    await Pending.findByIdAndDelete(id);
    return NextResponse.json({ message: 'Deleted' });
  } catch (error) {
    logger.error('Delete failed', { error: error.message });
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
