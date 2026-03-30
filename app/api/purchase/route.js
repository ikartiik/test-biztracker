import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import dbConnect from '../../../lib/mongodb';
import Purchase from '../../../models/Purchase';
import Pending from '../../../models/Pending';

async function isAuthenticated() {
  const session = await getServerSession(authOptions);
  return !!session;
}

export async function GET(req) {
  try {
    if (!await isAuthenticated()) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    await dbConnect();
    const purchases = await Purchase.find({})
      .populate('vendor', 'company')
      .populate('orderBy', 'name')
      .sort({ createdAt: -1 });
    return NextResponse.json(purchases);
  } catch (error) {
    console.error('Purchase fetch failed', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    if (!await isAuthenticated()) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    await dbConnect();
    const data = await req.json();

    // Auto-generate serialNumber if not provided
    if (!data.serialNumber) {
      const last = await Purchase.findOne().sort({ createdAt: -1 }).select('serialNumber');
      const lastNum = last?.serialNumber ? parseInt(last.serialNumber.replace(/\D/g, '')) || 0 : 0;
      data.serialNumber = `PUR-${String(lastNum + 1).padStart(4, '0')}`;
    }

    const purchase = new Purchase(data);
    await purchase.save();

    // Auto-create pending entry
    const pending = new Pending({
      srNo: `PND-${data.serialNumber}`,
      itemDescription: data.itemDescription,
      qtyPending: data.quantity || 1,
      shipment: 'Local Purchase',
      status: 'Pending',
      priority: 'Not Urgent',
    });
    await pending.save();

    // Update purchase with linked pending ID
    purchase.linkedPendingId = pending._id;
    await purchase.save();

    return NextResponse.json({ purchase, pending }, { status: 201 });
  } catch (error) {
    console.error('Purchase create failed', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    if (!await isAuthenticated()) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    await dbConnect();
    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    const data = await req.json();
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });
    const purchase = await Purchase.findByIdAndUpdate(id, data, { new: true, runValidators: false })
      .populate('vendor', 'company')
      .populate('orderBy', 'name');
    return NextResponse.json(purchase);
  } catch (error) {
    console.error('Purchase update failed', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    if (!await isAuthenticated()) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    await dbConnect();
    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });
    await Pending.deleteOne({ srNo: { $regex: `PND-` } });
    const purchase = await Purchase.findById(id);
    if (purchase?.linkedPendingId) {
      await Pending.findByIdAndDelete(purchase.linkedPendingId);
    }
    await Purchase.findByIdAndDelete(id);
    return NextResponse.json({ message: 'Deleted' });
  } catch (error) {
    console.error('Purchase delete failed', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
