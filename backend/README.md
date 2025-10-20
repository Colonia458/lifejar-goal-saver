# LifeJar Backend API

A complete backend API for the LifeJar goal-saving application built with Express, TypeScript, Supabase, and PayHero payment integration.

## 🚀 Features

- **Jar Management**: Create, read, update, and delete goal jars
- **Payment Integration**: PayHero payment processing for contributions
- **Authentication**: Supabase JWT-based authentication
- **Webhook Support**: PayHero webhook handling for payment confirmations
- **TypeScript**: Full type safety and IntelliSense support
- **RESTful API**: Clean, well-documented endpoints

## 🛠 Tech Stack

- **Node.js** + **Express** - Web framework
- **TypeScript** - Type safety and development experience
- **Supabase** - Database and authentication
- **PayHero** - Payment processing
- **Axios** - HTTP client for external APIs
- **Helmet** - Security middleware
- **CORS** - Cross-origin resource sharing

## 📁 Project Structure

```
backend/
├── src/
│   ├── index.ts                 # Application entry point
│   ├── config/
│   │   ├── supabase.ts         # Supabase client configuration
│   │   └── payhero.ts          # PayHero API configuration
│   ├── routes/
│   │   ├── jars.routes.ts      # Jar-related endpoints
│   │   └── payments.routes.ts  # Payment-related endpoints
│   ├── controllers/
│   │   ├── jars.controller.ts  # Jar business logic
│   │   └── payments.controller.ts # Payment business logic
│   ├── services/
│   │   ├── jar.service.ts     # Jar data operations
│   │   └── payment.service.ts  # Payment processing
│   ├── middleware/
│   │   └── auth.ts            # Authentication middleware
│   ├── utils/
│   │   └── response.ts        # API response helpers
│   └── types/
│       ├── jar.ts             # Jar type definitions
│       └── contribution.ts    # Contribution type definitions
├── package.json
├── tsconfig.json
├── .eslintrc.js
└── env.example
```

## 🗄️ Database Schema

### Tables

#### `jars`
- `id` (uuid, primary key)
- `user_id` (uuid, foreign key to auth.users)
- `title` (text)
- `target_amount` (integer)
- `current_amount` (integer, default 0)
- `deadline` (timestamp, nullable)
- `image_url` (text, nullable)
- `created_at` (timestamp, default now())

#### `contributions`
- `id` (uuid, primary key)
- `jar_id` (uuid, foreign key to jars.id)
- `contributor_name` (text)
- `amount` (integer)
- `created_at` (timestamp, default now())

#### `payments` (optional tracking table)
- `id` (uuid, primary key)
- `jar_id` (uuid, foreign key to jars.id)
- `transaction_id` (text)
- `amount` (integer)
- `contributor_name` (text)
- `status` (text)
- `created_at` (timestamp, default now())

## 🔧 Setup Instructions

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Supabase account
- PayHero account

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Environment Configuration

Copy the example environment file and fill in your credentials:

```bash
cp env.example .env
```

Update `.env` with your actual values:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# API Configuration
API_BASE_URL=http://localhost:3000
FRONTEND_URL=http://localhost:5173

# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_role_key

# PayHero Configuration
PAYHERO_BASE_URL=https://api.payhero.co.ke
PAYHERO_PUBLIC_KEY=your_payhero_public_key
PAYHERO_SECRET_KEY=your_payhero_secret_key
PAYHERO_WEBHOOK_SECRET=your_payhero_webhook_secret
```

### 3. Database Setup

1. Create a new Supabase project
2. Run the following SQL to create the required tables:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create jars table
CREATE TABLE jars (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  target_amount INTEGER NOT NULL CHECK (target_amount > 0),
  current_amount INTEGER DEFAULT 0 CHECK (current_amount >= 0),
  deadline TIMESTAMP WITH TIME ZONE,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create contributions table
CREATE TABLE contributions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  jar_id UUID REFERENCES jars(id) ON DELETE CASCADE,
  contributor_name TEXT NOT NULL,
  amount INTEGER NOT NULL CHECK (amount > 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create payments table (optional for tracking)
CREATE TABLE payments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  jar_id UUID REFERENCES jars(id) ON DELETE CASCADE,
  transaction_id TEXT UNIQUE NOT NULL,
  amount INTEGER NOT NULL CHECK (amount > 0),
  contributor_name TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create function to increment jar amount
CREATE OR REPLACE FUNCTION increment_jar_amount(jar_id UUID, amount INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE jars 
  SET current_amount = current_amount + amount 
  WHERE id = jar_id;
END;
$$ LANGUAGE plpgsql;

-- Create indexes for better performance
CREATE INDEX idx_jars_user_id ON jars(user_id);
CREATE INDEX idx_contributions_jar_id ON contributions(jar_id);
CREATE INDEX idx_payments_jar_id ON payments(jar_id);
CREATE INDEX idx_payments_transaction_id ON payments(transaction_id);
```

### 4. Run the Application

#### Development Mode
```bash
npm run dev
```

#### Production Mode
```bash
npm run build
npm start
```

The API will be available at `http://localhost:3000`

## 📚 API Endpoints

### Authentication
All jar endpoints require authentication via `Authorization: Bearer <token>` **header**.

### Jar Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/jars` | ✅ | Create a new jar |
| GET | `/api/jars` | ✅ | Get user's jars |
| GET | `/api/jars/:id` | ✅ | Get specific jar |
| PUT | `/api/jars/:id` | ✅ | Update jar |
| DELETE | `/api/jars/:id` | ✅ | Delete jar |
| GET | `/api/jars/public/:id` | ❌ | Get public jar (for contributions) |

### Payment Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/payments/deposit` | ❌ | Initiate payment |
| POST | `/api/payments/webhook` | ❌ | PayHero webhook |
| GET | `/api/payments/status/:transactionId` | ❌ | Get payment status |
| GET | `/api/payments/health` | ❌ | Payment service health |

### Example Requests

#### Create Jar
```bash
curl -X POST http://localhost:3000/api/jars \
  -H "Authorization: Bearer <your-jwt-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Vacation Fund",
    "target_amount": 50000,
    "deadline": "2024-12-31T23:59:59Z"
  }'
```

#### Initiate Payment
```bash
curl -X POST http://localhost:3000/api/payments/deposit \
  -H "Content-Type: application/json" \
  -d '{
    "jar_id": "jar-uuid-here",
    "amount": 1000,
    "contributor_name": "John Doe"
  }'
```

## 🔒 Security Features

- **JWT Authentication**: Secure user authentication via Supabase
- **CORS Protection**: Configurable cross-origin resource sharing
- **Helmet Security**: Security headers and protection
- **Input Validation**: Request validation and sanitization
- **Webhook Verification**: PayHero webhook signature verification

## 🧪 Testing

```bash
# Run linting
npm run lint

# Fix linting issues
npm run lint:fix
```

## 🚀 Deployment

1. Build the application: `npm run build`
2. Set production environment variables
3. Deploy to your preferred platform (Vercel, Railway, Heroku, etc.)
4. Configure PayHero webhook URL to point to your deployed API

## 📝 Notes

- The PayHero integration is configured for Kenyan Shillings (KES)
- Webhook signature verification should be properly implemented in production
- Consider implementing rate limiting for production use
- Add proper logging and monitoring for production deployment

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

