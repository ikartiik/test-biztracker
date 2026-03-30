import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import dbConnect from '../../../lib/mongodb';
import Expense from '../../../models/Expense';

async function isAuthenticated(req) {
  const session = await getServerSession(authOptions);
  return !!session;
}

const logger = {
  info: (message, meta) => console.log(`[expense] INFO: ${message}`, meta),
  error: (message, meta) => console.error(`[expense] ERROR: ${message}`, meta)
};

export async function GET(req) {
  try {
    if (!await isAuthenticated(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    await dbConnect();
    const expenses = await Expense.find({}).sort({ createdAt: -1 });
    return NextResponse.json(expenses);
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
    
    // Running balance
    const latest = await Expense.findOne().sort({ createdAt: -1 });
    data.balance = (latest?.balance || 0) + (data.creditAmount || 0) - (data.debitAmount || 0);
    
    const expense = new Expense(data);
    await expense.save();
    return NextResponse.json(expense, { status: 201 });
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
    
    const expense = await Expense.findByIdAndUpdate(id, data, { new: true });
    if (!expense) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    
    return NextResponse.json(expense);
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
    
    await Expense.findByIdAndDelete(id);
    return NextResponse.json({ message: 'Deleted' });
  } catch (error) {
    logger.error('Delete failed', { error: error.message });
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
