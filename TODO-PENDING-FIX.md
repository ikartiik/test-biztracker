# Fix: Pending Tracker Still Shows Shipped Items

**Problem:** Dashboard pending counts include Shipped/Partially Shipped items.

**Plan:** Update `/api/dashboard/stats/route.js` to filter Pending model by `status: ['Pending', 'Received']`

**TODO Steps:**
- [x] Create TODO (done)
- [x] Edit app/api/dashboard/stats/route.js with status filter
- [x] Test: refresh dashboard → pending count = 0 after shipping (dashboard stats API now filters status: ['Pending','Received'])
- [ ] Commit "fix(pending): exclude shipped items from dashboard counts"
- [ ] Push
- [ ] Complete

