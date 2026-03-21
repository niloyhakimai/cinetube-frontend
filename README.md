# 🎬 CineTube - Frontend (User & Admin Portal)

CineTube is a premium movie and TV series streaming platform. This repository contains the **Frontend** application built with **Next.js (App Router)**, delivering a seamless Netflix-style experience for browsing, streaming, subscriptions, and community interaction.

---

## 🚀 Live Demo

- 🌐 **Live Website:** [Insert Frontend Live URL here]  
- 🔗 **Backend API Repo:** [Insert Backend Repo Link here]  
- 🎥 **Project Overview Video:** [Insert Loom/YouTube Link here]  

---

## 🔐 Admin Credentials (Testing)

- **Email:** admin@cinetube.com  
- **Password:** Admin123!  

---

## ✨ Key Features

### 🎥 Dynamic Media Catalog
- Browse trending, top-rated, and newly added content  
- Real-time synchronization with TMDB API  

### 💳 Premium Streaming & Payments
- Rent movies (48 hours access)  
- Buy movies (lifetime access)  
- Subscribe (Monthly / Yearly plans)  
- Integrated with **Stripe** for secure payments  

### 🌐 Interactive Community
- Rate movies (1–10 scale)  
- Write reviews with spoiler tags  
- Nested comment system  

### 👤 User Dashboard
- Manage watchlist  
- View purchase history  
- Track active subscriptions  

### 🛠️ Admin Dashboard
- Moderate user reviews  
- Manage media overrides  
- View platform analytics  

---

## 🧰 Tech Stack

| Category              | Technology |
|----------------------|-----------|
| Framework            | Next.js (App Router), React |
| Styling              | Tailwind CSS |
| State & API Handling | Axios, React Hooks |
| Payments             | Stripe.js, React Stripe Elements |
| UI & Notifications   | React Hot Toast |

---

## ⚙️ Local Setup Instructions

### 1️⃣ Clone Repository

```bash
git clone [Your Frontend Repo URL]
cd cinetube-frontend
```

### 2️⃣ Install Dependencies

```bash
npm install
```

### 3️⃣ Environment Variables

Create a `.env.local` file in the root directory and add:

```env
NEXT_PUBLIC_API_URL="http://localhost:5000/api"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="your_stripe_publishable_key"
```

---

### 4️⃣ Run Development Server

```bash
npm run dev
```

Then open:

👉 http://localhost:3000

---

## 📦 Project Structure (Overview)

```
/app          → App Router pages & layouts  
/components   → Reusable UI components  
/lib          → API & utility functions  
/hooks        → Custom React hooks  
/styles       → Global styles  
```

---

## 🔒 Security Notes

- Never expose secret keys in frontend  
- Use only `NEXT_PUBLIC_` variables on client side  
- Stripe secret key must remain in backend  

---

## 📈 Future Improvements

- 🔍 Advanced search & filtering  
- 📱 Mobile app (React Native)  
- 🎯 AI-based recommendations  
- 🌍 Multi-language support  

---

## 🤝 Contribution

Contributions are welcome!

1. Fork the repository  
2. Create a new branch  
3. Commit your changes  
4. Open a Pull Request  

---

## 📄 License

This project is licensed under the MIT License.

---

## 💡 Developer Note

> This project demonstrates full-stack architecture with real-world features like payments, authentication, admin control, and scalable UI patterns.

---

## 👨‍💻 Author

**Niloy Hakim**  
Building scalable apps with Full Stack 🚀

---

⭐ If you like this project, don’t forget to star the repo!