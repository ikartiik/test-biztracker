# Fix: Shipped Items Still Show in /dashboard/pending Table

**Root Cause:** `/api/pending/route.js` GET returns `Pending.find({})` - ALL documents
`/dashboard/pending/page.js` displays full table w/o Status column

**Plan:** 
- Edit `app/api/pending/route.js` GET: `Pending.find({ status: { $in: ['Pending', 'Received'] } })`
- Matches dashboard stats filter
- Pending page shows only active items

**TODO Steps:**
- [x] Create TODO (done)
- [x] Edit app/api/pending/route.js (added status filter)
- [x] Test /dashboard/pending shows no shipped items (API now returns only Pending/Received)
- [x] Commit cb6dc04 "fix(pending-api): filter shipped items from pending tracker"
- [x] Pushed to blackboxai/login-mongodb-fix
- [x] Complete ✅
