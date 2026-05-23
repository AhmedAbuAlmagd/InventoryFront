# Smart Inventory - Frontend

The web-based management console for the Smart Inventory Management System, built with Angular 18+.

## Overview

The frontend provides a modern, responsive interface for managing inventory, products, and users. It features a professional industrial aesthetic with a warm color palette (Cream, Beige, Sage Green) and high-contrast accessibility.

## Tech Stack

- **Framework**: Angular 18+
- **Styling**: SCSS (Variables, Mixins, Themes)
- **UI Components**: Angular Material
- **State Management**: Service-based with RxJS
- **Typography**: DM Sans (General), DM Mono (SKUs/Numbers)

## Key Features

- **Industrial Dashboard**: Visual overview of stock levels and recent transactions.
- **Advanced Filtering**: Smart filtering for products and inventory history.
- **Role-Based UI**: Dynamic visibility of actions based on user roles (Admin, Manager, Employee).
- **Persistent Auth**: JWT-based authentication with `localStorage` persistence.
- **Theming**: Custom warm palette with support for soft slate-olive dark mode.

## Setup & Development

1. **Prerequisites**:
   - Node.js (v18 or higher)
   - npm (v9 or higher)

2. **Installation**:
   ```bash
   npm install
   ```

3. **Development Server**:
   ```bash
   npm start
   ```
   Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

4. **Build**:
   ```bash
   npm run build
   ```
   The build artifacts will be stored in the `dist/` directory.

## Project Structure

```text
smart-inventory-frontend/
├── src/
│   ├── app/
│   │   ├── core/           # Services, Interceptors, Guards, Models
│   │   ├── features/       # Feature modules (Auth, Dashboard, Inventory, Products)
│   │   ├── layout/         # Shell, Sidebar, Topbar
│   │   └── shared/         # Common components, pipes, validators
│   ├── assets/             # Static assets
│   ├── environments/       # Environment configurations
│   └── styles/             # Global SCSS, variables, themes
└── ...
```

## Design Principles

- **Professional Aesthetic**: High contrast, 12px border radii, clean white space.
- **Accessibility**: 100% text visibility, touch-friendly inputs (50px height).
- **Performance**: Immediate/automatic data loading with optimized change detection.
- **Consistency**: Centralized centering for all table data and flexbox-based icon alignment.
