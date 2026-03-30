import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import dbConnect from '@/lib/mongodb';
import Shipping from '@/models/Shipping';
import Purchase from '@/models/Purchase';
import Import from '@/models/Import';

async function isAuthenticated() {
  const session = await getServerSession(authOptions);
  return !!session;
}

export async function POST(req) {
  try {
    if (!await isAuthenticated()) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    await dbConnect();

    // Get all existing shipping sourceIds to avoid duplicates
    const existing = await Shipping.find({}, 'sourceId');
    const existingIds = new Set(existing.map(s => s.sourceId.toString()));

    let created = 0;

    // Sync purchased Purchase items
    const purchases = await Purchase.find({ status: 'Purchased' });
    for (const p of purchases) {
      if (existingIds.has(p._id.toString())) continue;
      const s = new Shipping({
        sourceId: p._id,
        sourceModel: 'Purchase',
        itemDescription: p.itemDescription,
        totalQuantity: p.quantity || 1,
        quantityShipped: 0,
        shipmentEntries: [],
        source: 'Purchase',
        status: 'Pending',
        priority: 'Medium',
      });
      await s.save();
      created++;
    }

    // Sync Import items (each item inside the import)
    const imports = await Import.find({});
    for (const imp of imports) {
      if (existingIds.has(imp._id.toString())) continue;
      const totalQty = (imp.items || []).reduce((sum, item) => sum + (item.quantity || 0), 0);
      const desc = (imp.items || []).map(i => i.itemDescription).join(', ') || imp.vendorName || 'Import';
      const s = new Shipping({
        sourceId: imp._id,
        sourceModel: 'Import',
        itemDescription: desc,
        totalQuantity: totalQty || 1,
        quantityShipped: 0,
        shipmentEntries: [],
        source: 'Import',
        status: 'Pending',
        priority: 'Medium',
      });
      await s.save();
      created++;
    }

    return NextResponse.json({ message: `Synced ${created} new entries`, created });
  } catch (error) {
    console.error('Shipping sync failed', error);
    return NextResponse.json({ error: 'Sync failed' }, { status: 500 });
  }
}
