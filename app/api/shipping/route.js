import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import dbConnect from '../../../lib/mongodb';
import Shipping from '../../../models/Shipping';
import Import from '../../../models/Import';
import Purchase from '../../../models/Purchase';

async function isAuthenticated(req) {
  const session = await getServerSession(authOptions);
  return !!session;
}

export async function GET(req) {
  try {
    if (!await isAuthenticated(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    await dbConnect();
    const shipping = await Shipping.find({}).sort({ createdAt: -1 });
    return NextResponse.json(shipping);
  } catch (error) {
    console.error('Shipping fetch failed', error);
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
    const shipping = new Shipping(data);
    await shipping.save();
    return NextResponse.json(shipping, { status: 201 });
  } catch (error) {
    console.error('Shipping create failed', error);
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
    const shipping = await Shipping.findByIdAndUpdate(id, data, { new: true });
    return NextResponse.json(shipping);
  } catch (error) {
    console.error('Shipping update failed', error);
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
    await Shipping.findByIdAndDelete(id);
    return NextResponse.json({ message: 'Deleted' });
  } catch (error) {
    console.error('Shipping delete failed', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
