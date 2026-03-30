import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import dbConnect from '../../../lib/mongodb';
import Purchase from '../../../models/Purchase';
import Pending from '../../../models/Pending';

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
    const purchases = await Purchase.find({}).populate('vendor', 'company').sort({ createdAt: -1 });
    return NextResponse.json(purchases);
  } catch (error) {
    console.error('Purchase fetch failed', error);
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
    
    // Create purchase
    const purchase = new Purchase(data);
    await purchase.save();
    
    // Auto-create pending entry
    const pendingData = {
      srNo: `PND-${data.serialNumber}`,
      itemDescription: data.itemDescription,
      qtyPending: data.quantity,
      shipment: 'Purchase',
      status: 'Pending',
      priority: 'Normal',
      linkedPurchaseId: purchase._id
    };
    const pending = new Pending(pendingData);
    await pending.save();
    
    return NextResponse.json({ purchase, pending }, { status: 201 });
  } catch (error) {
    console.error('Purchase create failed', error);
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
    const purchase = await Purchase.findByIdAndUpdate(id, data, { new: true }).populate('vendor', 'company');
    return NextResponse.json(purchase);
  } catch (error) {
    console.error('Purchase update failed', error);
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
    
    // Cascade delete linked pending
    await Pending.deleteOne({ linkedPurchaseId: id });
    await Purchase.findByIdAndDelete(id);
    
    return NextResponse.json({ message: 'Deleted' });
  } catch (error) {
    console.error('Purchase delete failed', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
