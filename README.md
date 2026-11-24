# IT HelpDesk (TicketFlow)

Simple ticket system for IT support.

- **Backend:** Node.js + Express + SQLite + JWT (`backend/server.js`)
- **Frontend:** Angular (`frontend/`)

## Users
- **User (Employee):** register, login, create ticket, view own tickets and support reply.
- **Admin (IT Support):** dashboard with 3 stat cards (Total, Open, Closed), search & filter by status/priority, update status and write a reply.

Default Admin account: `admin@test.com` / `123456`

## Run

Backend:
```powershell
cd backend
npm install
npm start
```
API runs on `http://localhost:5080`

Frontend:
```powershell
cd frontend
npm install
npm start
```
Open `http://localhost:4200`
