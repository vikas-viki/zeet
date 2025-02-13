# 🚀 Zeet

## 📌 Overview
A clone of gather.town where users can connect with others, chat, share audio/video in real-time in virtual spaces just like in real life. Users can manage their profile, spaces, and share spaces with others.

## 🛠 Tech Stack
- **Frontend:** React, TypeScript.
- **Backend:** Node.js, PostgreSQL
- **Other:** WebSockets | Socket.IO (chat, player movements), Mediasoup (audio/video), Phaser.js (game environment)

## 🌟 Features
- ✅ **Profile Management:** Users can sign up and manage their profile.
- ✅ **Create/Link Spaces:** Users can create their own virtual spaces or link spaces created by others.
- ✅ **Audio/Video:** Users can share audio/video in real-time.
- ✅ **Chat:** Users can chat with other users in real-time.
- ✅ **Auto-Signin:** Users can automatically sign in using cookies.

## 📛 Architecture

### 🛠 System Overview
This project is structured into three major components:
- **Frontend (React + TypeScript)** – Manages UI and user interactions.
- **Backend (Node.js + Express + WebSockets)** – Handles user authentication, real-time communication, and database interactions.
- **Mediasoup (WebRTC Streaming)** – Manages real-time audio/video transmission.

### 📊 WebSockets Flow

#### 🔹 Connection Setup
- A WebSocket connection is established when the page loads.

#### 🔹 Joining a Space
- The frontend emits a `joinSpace` event with user details and coordinates.
- The server assigns the user to a space and sends updates to other users.

#### 🔹 Leaving a Space
- When a user leaves, the server notifies others to remove that user from the game.

#### 🔹 Joining a Room
- The user is connected to a specific room (Socket.IO room).
- Users in the same room can chat and share audio/video.

#### 🔹 Player Movement
- When a player moves, an event is sent to the WebSocket server.
- Other users update their game view accordingly.

### 🌍 Mediasoup (WebRTC Streaming)

#### 🔹 Sharing Media
- When the user enables the mic:
  - The client emits a `createTransport` event.
  - The server sets up a transport and connects it.
  - The client starts producing media and sends it to other users.
- When the user disables the mic:
  - The client emits a `userPausing` event.
  - Other users are notified, and streaming is paused.


## ⚙️ Installation & Setup
```sh
# Clone the repository
git clone https://github.com/vikas-viki/zeet.git

# Install dependencies
cd zeet
npm install

# Start development server
npm run dev
```

### 🛠 Environment Variables
Create a `.env` file and add:
```
VITE_GOOGLE_CLIENT_ID=
VITE_SERVER_URL=
VITE_SALT=
```

## 🧪 Challenges & Solutions
- **Problem:** Creating a lightweight game environment with smooth user movement.
  - **Solution:** Used Phaser.js for efficient game rendering.
- **Problem:** Synchronizing user movement across all clients.
  - **Solution:** Implemented WebSocket state management.
- **Problem:** Streaming audio and video efficiently.
  - **Solution:** Used Mediasoup for scalable WebRTC streaming.

## 🚀 Deployment
| Platform | URL |
|----------|----|
| Frontend | [Live Link](https://zeet.0xbuilder.in/) |
| Backend API | `https://zeet-ws.onrender.com` |

## 🏆 Key Learnings
- Implementing **WebSockets and Mediasoup** for real-time communication.
- Using **Phaser.js** for game-like environments.
- Implementing **Google login and auto-signin**.
- Managing databases with **PostgreSQL**.

## 📝 Future Improvements
- 🔹 More accurate synchronization of player movements.
- 🔹 Additional maps, user characters, and in-space rooms.
- 🔹 Implementing **screen sharing** for better collaboration.

## 📩 Contact
For questions, reach out at [vikaskotary001@outlook.com](mailto:vikaskotary001@outlook.com).

---

