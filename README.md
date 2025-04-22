# Smart Lab Resource Management System (S-Lab)

A modern web-based platform for managing university laboratory resources efficiently.

## Project Overview

S-Lab is designed to address inefficiencies in university laboratory resource allocation, including equipment shortages, scheduling conflicts, and underutilized resources. The system provides real-time booking, analytics, and automated notifications to optimize lab operations.

## Tech Stack

- **Backend**: Django + Django REST Framework
- **Frontend**: React.js
- **Database**: PostgreSQL
- **Authentication**: JWT
- **Real-time Features**: Django Channels

## Project Structure

```
smart-lab-resource/
├── backend/              # Django backend
│   ├── apps/            # Django applications
│   ├── config/          # Project settings
│   └── utils/           # Shared utilities
├── frontend/            # React frontend
│   ├── src/             # Source files
│   └── public/          # Static files
└── docs/               # Documentation
```

## Features

- Real-time equipment booking
- Usage analytics and reporting
- Automated notifications
- Role-based access control
- Equipment management
- Lab session scheduling
- Maintenance tracking

## Getting Started

### Prerequisites

- Python 3.8+
- Node.js 14+
- PostgreSQL

### Backend Setup

1. Create virtual environment:

   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. Install dependencies:

   ```bash
   cd backend
   pip install -r requirements.txt
   ```

3. Run migrations:
   ```bash
   python manage.py migrate
   ```

### Frontend Setup

1. Install dependencies:

   ```bash
   cd frontend
   npm install
   ```

2. Start development server:
   ```bash
   npm start
   ```

## Contributing

1. Create a feature branch
2. Commit your changes
3. Push to the branch
4. Create a Pull Request

## License

This project is licensed under the MIT License.
