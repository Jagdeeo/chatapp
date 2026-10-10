Chat app

Backend Structure
___________________________________________________
server/
│
├── src/
│   ├── config/
│   │   ├── db.js
│   │   └── env.js
│   │
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── user.controller.js
│   │   ├── message.controller.js
│   │   └── chat.controller.js
│   │
│   ├── models/
│   │   ├── user.model.js
│   │   ├── message.model.js
│   │   └── chat.model.js
│   │
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── user.routes.js
│   │   ├── message.routes.js
│   │   └── chat.routes.js
│   │
│   ├── middleware/
│   │   ├── auth.middleware.js
│   │   ├── error.middleware.js
│   │   └── upload.middleware.js
│   │
│   ├── utils/
│   │   ├── generateToken.js
│   │   └── response.js
│   │
│   ├── sockets/
│   │   └── socket.js
│   │
│   ├── app.js
│   └── server.js
│
├── uploads/
│   └── .gitkeep
│
├── .env
├── .env.example
├── .gitignore
└── package.json


Frontend Structure 
_______________________________________________________________________________
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


