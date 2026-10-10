# D Chat — Frontend

## 🎨 Color Palette

| Color     | Hex Code  | Usage                                            |
| --------- | --------- | ------------------------------------------------ |
| Primary   | `#628395` | Navbar, primary buttons, active states           |
| Secondary | `#DFD5A5` | Highlights, badges, subtle backgrounds           |
| Accent    | `#CF995F` | Send button accents, notifications, hover states |

## ✨ Planned Features

* User registration and login
* Email OTP verification
* Responsive chat dashboard
* User search and contact list
* One-to-one conversations
* Group chats and group member management
* Message history and chat previews
* Profile settings and profile pictures
* Online status and last-seen indicators
* Image and file attachments
* Responsive mobile navigation
* Loading states, empty states, and error handling

## 📁 Folder Structure

client/
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── common/
│   │   ├── layout/
│   │   ├── chat/
│   │   └── forms/
│   ├── context/
│   ├── hooks/
│   ├── layouts/
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── VerifyOTP.jsx
│   │   ├── Chats.jsx
│   │   ├── Profile.jsx
│   │   └── NotFound.jsx
│   ├── routes/
│   ├── services/
│   │   └── api.js
│   ├── utils/
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── .env
├── .gitignore
├── package.json
└── README.md
