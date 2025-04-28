# Internal Control Panel

A React-based frontend application for managing internal data through CRUD operations with an API.

## Features

- Dashboard with overview metrics
- Item management (Create, Read, Update, Delete)
- Settings configuration
- Responsive design for desktop and mobile
- Material UI components
- React Query for data fetching and caching
- TypeScript for type safety

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Configure the API URL in the `.env` file:

```
VITE_API_URL=http://your-api-url
```

4. Start the development server:

```bash
npm run dev
```

## Project Structure

```
src/
├── components/     # Reusable UI components
├── hooks/          # Custom React hooks
├── pages/          # Page components
├── services/       # API services
├── types/          # TypeScript type definitions
├── App.tsx         # Main application component
└── main.tsx        # Entry point
```

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the application for production
- `npm run preview` - Preview the production build locally
- `npm run lint` - Run ESLint to check for code issues

## Technologies Used

- React
- TypeScript
- Vite
- Material UI
- React Router
- React Query
- Axios
