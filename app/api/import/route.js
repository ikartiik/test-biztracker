import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import dbConnect from '../../../lib/mongodb';
import Import from '../../../models/Import';

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
    const imports = await Import.find({}).populate('vendor', 'company salespersonName contact').sort({ srNo: 1 });
    return NextResponse.json(imports);
  } catch (error) {
    console.error('Import fetch failed', error);
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
    const _import = new Import(data);
    await _import.save();
    return NextResponse.json(_import, { status: 201 });
  } catch (error) {
    console.error('Import create failed', error);
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
    const _import = await Import.findByIdAndUpdate(id, data, { new: true }).populate('vendor', 'company salespersonName contact');
    return NextResponse.json(_import);
  } catch (error) {
    console.error('Import update failed', error);
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
    await Import.findByIdAndDelete(id);
    return NextResponse.json({ message: 'Deleted' });
  } catch (error) {
    console.error('Import delete failed', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
