# SecureVault Dashboard

A high-performance, accessible file explorer interface designed for SecureVault Inc. This dashboard is built to handle complex, deeply nested file structures for the legal and banking sectors, prioritising efficiency and clear navigation.

## Live Application
https://axelniyo.github.io/AmaliTech-DEG-Project-based-challenges/fullstack/secure-vault/

- **Design Specifications:** link to penpot https://design.penpot.app/#/view?file-id=785c5760-d195-8025-8007-ef6e0bc4109d&page-id=785c5760-d195-8025-8007-ef6e0bc4109e&section=interactions&index=0&share-id=785c5760-d195-8025-8007-ef7a5654f095

## Technical Overview
The application is built using **React** and **Tailwind CSS**, adhering to the constraint of building all UI components from scratch without third-party component libraries. It implements a robust recursive rendering strategy and a custom keyboard navigation engine.

### Recursive Strategy
The core of the application is a recursive `FileNode` component. Instead of flat-mapping the data, the UI mirrors the nested JSON structure.
- **Efficient Rendering:** Components only re-render when their specific branch is toggled.
- **Infinite Depth:** The recursive logic handles any depth level provided by the API without additional configuration.
- **State Management:** A centralized `expandedIds` set tracks open folders, allowing for instant toggle performance even in large trees.

### Keyboard Navigation Engine
To meet the needs of power users, the dashboard features a custom keyboard event handler:
- `Up/Down Arrows`: Intuitive focus movement between visible items.
- `Right Arrow`: Expands the selected folder.
- `Left Arrow`: Collapses the selected folder.
- `Enter`: Selects a file and opens the metadata properties panel.

### Search with Auto-Expansion
The search functionality includes a logic layer that identifies matching files hidden within collapsed folders and automatically expands the necessary parent nodes to reveal results to the user.

## The Wildcard Feature: Dynamic Breadcrumbs
For the "Innovation Feature," I implemented **Dynamic Multi-Stage Breadcrumbs** with smooth transitions.
- **The Problem:** In deeply nested structures, users often lose context of their folder path.
- **The Solution:** An animated breadcrumb bar that provides immediate "at-a-glance" location data and allows for "one-click" navigation back to any parent directory. 
- **Business Value:** Reduces "navigation fatigue" for professionals managing thousands of case files.

## Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation
1. Clone the repository and navigate to the project folder:
   ```bash
   cd fullstack/secure-vault
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

### Building for Production
To build the project and generate the `dist` folder:
```bash
npm run build
```

## Performance & Accessibility
- **Zero Restricted Libraries:** 100% custom-built UI components.
- **Audit-Ready History:** A systematic commit history demonstrating a professional development lifecycle.
- **Accessibility:** Semantic HTML and ARIA attributes for screen reader compatibility.
