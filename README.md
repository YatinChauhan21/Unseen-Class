# Unseen Class — MERN Study Material Website

A flexible Maharashtra SSC study-material website with:
- Public student side — NO LOGIN required
- Secure admin login
- Admin dashboard for subjects, chapters, notes/resources, and YouTube links
- PDF upload/download
- JWT authentication
- MongoDB for content metadata
- Express + Node.js API
- React + Vite frontend

## 1. Requirements
- Node.js 18+
- MongoDB Atlas or local MongoDB

## 2. Backend setup

```bash
cd server
npm install
copy .env.example .env
```

Edit `.env`:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=make_a_long_random_secret
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=change-this-password
CLIENT_URL=http://localhost:5173
```

Then:

```bash
npm run dev
```

The API runs on http://localhost:5000

## 3. Frontend setup

Open another terminal:

```bash
cd client
npm install
copy .env.example .env
npm run dev
```

Open http://localhost:5173

## 4. Admin

Go to:

http://localhost:5173/admin/login

Use the ADMIN_EMAIL and ADMIN_PASSWORD from the server `.env`.

## 5. Notes upload

Admin dashboard lets you:
- create subjects
- create chapters
- upload PDF resources
- add/edit/delete resources
- add YouTube links
- publish/unpublish resources

Uploaded files are stored in `server/uploads`.

For production, replace local file storage with S3/Cloudinary/Supabase Storage or another object-storage provider.

## 6. Production notes

- Use HTTPS.
- Use a strong random JWT_SECRET.
- Do not commit `.env`.
- Change the default admin credentials.
- For production, use cloud/object storage instead of local `uploads`.
- Put frontend and backend behind your production domain/reverse proxy.
