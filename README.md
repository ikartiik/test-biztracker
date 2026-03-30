# Concentric Tracker System

A comprehensive company tracking system built with Next.js, MongoDB, and NextAuth for managing purchases, imports, shipments, pending items, and expenses with automated workflows.

## 🚀 Features

### Core Trackers
- **Purchase Tracker** - Track all company purchases with detailed information
- **Import Tracker** - Manage import shipments and customs clearance
- **Shipping Tracker** - Monitor outbound shipments and delivery status
- **Pending Tracker** - Track items waiting for processing or shipment
- **Expense Tracker** - Financial tracking with automated balance calculations

### Automated Workflows
- **Purchase → Pending & Expense**: When a purchase is marked as "Purchased", it automatically creates entries in both Pending and Expense trackers
- **Import → Pending**: When import status changes to "Received", it automatically creates a Pending tracker entry
- **Shipping → Pending Updates**: Shipping status updates automatically modify Pending tracker quantities

### Authentication & Security
- Secure login system with NextAuth
- Default admin account creation
- User management with role-based access control
- Admin-only features for user management

### User Interface
- Responsive design for desktop and mobile
- Beautiful dashboard with navigation cards
- Modal-based forms for data entry
- Color-coded status indicators
- Toast notifications for user feedback

## 🛠 Tech Stack

- **Frontend**: Next.js 16, React 19, Tailwind CSS
- **Backend**: Next.js API Routes, MongoDB with Mongoose
- **Authentication**: NextAuth.js with credentials provider
- **UI Components**: Heroicons, React Hot Toast
- **Database**: MongoDB

## 📋 Prerequisites

- Node.js 18+ and npm
- MongoDB (local installation or MongoDB Atlas)
- Git

## 🔧 Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd concentric-tracker
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
Create a `.env.local` file in the root directory:
```bash
MONGODB_URI=mongodb://localhost:27017/concentric-tracker
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-change-this-in-production
NODE_ENV=development
```

4. **Start MongoDB**
Make sure MongoDB is running on your system.

5. **Run the development server**
```bash
npm run dev
```

6. **Access the application**
Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🚪 Getting Started

### First Time Setup

1. **Create Default Admin Account**
   - Visit the login page
   - Click "Create Default Admin Account"
   - Default credentials: `admin` / `admin123`

2. **Login and Explore**
   - Use the default admin credentials to login
   - Access the dashboard to see all available trackers
   - Navigate through different sections using the sidebar

3. **Create Additional Users** (Admin only)
   - Go to User Management
   - Create new users with appropriate roles
   - Assign admin or user roles as needed

## 📊 Database Structure

### Purchase Tracker
- Serial Number (unique)
- Item Description
- Online Link (optional)
- Date of Purchase
- Quantity & Price
- Vendor & Medium of Purchase
- Status & IMEI/Serial Number

### Import Tracker
- Serial Number (unique)
- Source & Item Description
- Quantity & Invoice Number
- Date of Receiving
- Amount/Duty Paid
- Status (Received/Enroute)

### Shipping Tracker
- Sr. No. & Item Description
- Quantity & Quantity Shipped
- Date of Shipping & Source
- Status (Shipped/Partially Shipped/Not Shipped)

### Pending Tracker
- Sr. No. & Item Description
- Qty Pending & Shipment Source
- Priority Level & Status

### Expense Tracker
- Sr. No. & Source/Expense
- Credit & Debit Amounts
- Running Balance & Comments

## 🔄 Automated Workflows

### Purchase Workflow
```
Purchase (Status: Purchased) 
    ↓
Automatically Creates:
    → Pending Entry (Status: Received, Source: Local Purchase)
    → Expense Entry (Debit: Purchase Total)
```

### Import Workflow
```
Import (Status: Received)
    ↓
Automatically Creates:
    → Pending Entry (Status: Received, Source: Import)
```

### Shipping Workflow
```
Shipping (Status: Shipped)
    ↓
Automatically Updates:
    → Removes item from Pending Tracker

Shipping (Status: Partially Shipped)
    ↓
Automatically Updates:
    → Reduces Pending quantity by shipped amount
```

## 👥 User Roles

### Admin
- Full access to all trackers
- User management capabilities
- Can create, edit, delete all records
- Access to all system features

### User
- Access to all trackers
- Can create, edit, delete records
- Cannot manage other users
- Limited to non-administrative functions

## 🎨 UI Features

### Dashboard
- Overview cards for each tracker
- Quick navigation to different sections
- System information and workflow explanations

### Data Tables
- Sortable and searchable data display
- Responsive design for mobile devices
- Color-coded status indicators
- Inline edit and delete actions

### Forms
- Modal-based form interface
- Validation and error handling
- Auto-save and real-time feedback
- Dropdown selections for consistency

### Navigation
- Responsive sidebar navigation
- Mobile-friendly hamburger menu
- User profile display
- Quick logout functionality

## 🔐 Security Features

- Secure password hashing with bcrypt
- Session-based authentication
- Role-based access control
- Protected API routes
- CSRF protection via NextAuth

## 📱 Responsive Design

The application is fully responsive and works seamlessly on:
- Desktop computers
- Tablets
- Mobile phones
- Various screen sizes and orientations

## 🔧 Development

### Project Structure
```
concentric-tracker/
├── components/          # Reusable UI components
├── lib/                # Database connection and utilities
├── models/             # MongoDB schemas
├── pages/              # Next.js pages and API routes
│   ├── api/            # API endpoints
│   └── dashboard/      # Dashboard pages
└── styles/             # CSS and styling
```

### Adding New Features
1. Create new MongoDB schema in `models/`
2. Add API routes in `pages/api/`
3. Create frontend pages in `pages/dashboard/`
4. Update navigation in `components/DashboardLayout.js`

### Customization
- Modify color schemes in Tailwind CSS classes
- Update company branding in layout components
- Add new tracker types following existing patterns
- Extend user roles and permissions

## 🚀 Production Deployment

1. **Environment Setup**
   - Set production MongoDB URI
   - Generate secure NEXTAUTH_SECRET
   - Configure production domain

2. **Build Application**
```bash
npm run build
```

3. **Deploy**
   - Deploy to Vercel, Netlify, or your preferred hosting
   - Ensure environment variables are set
   - Configure MongoDB Atlas for production

## 📞 Support

For issues, feature requests, or questions:
1. Check the existing documentation
2. Review the code comments for implementation details
3. Test the automated workflows to understand data flow
4. Refer to the database schemas for data structure

## 📄 License

This project is proprietary software developed for Concentric company's internal tracking needs.

---

**Built with ❤️ using Next.js and modern web technologies**
