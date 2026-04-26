# SupportFlow Visual Builder

A visual decision-tree editor for building customer support chatbot flows. Built entirely with Vanilla JavaScript and Vite.

## Overview

SupportFlow Visual Builder is designed to help non-technical users structure and test conversation logic visually. It replaces static spreadsheet planning with an interactive, drag-and-drop workflow canvas. 

This project was built from the ground up without relying on heavy third-party canvas or flowcharting libraries (like React Flow), focusing heavily on direct DOM manipulation, state management, and coordinate math.

### Live Demo
- **Live Deployment**: [SupportFlow Live](https://axelniyo.github.io/AmaliTech-DEG-Project-based-challenges/)
- **Design System**: [Penpot Workflow Design](https://design.penpot.app/#/view?file-id=614162e1-9f0e-816a-8007-ef11f9098d90&page-id=614162e1-9f0e-816a-8007-ef11f9098d91&section=interactions&index=0&share-id=c13b245b-18ea-8002-8007-ef1df38f323a)

## Core Features

- **Infinite Canvas**: Interactive workspace with pan and zoom capabilities across a dotted coordinate grid.
- **Dynamic Node Engine**: Custom absolute positioning engine rendering elements directly to the DOM for performance.
- **Bézier Connectors**: Fluid, animated SVG paths connecting parent and child nodes seamlessly. Uses bounding-box intersection math to draw precise stroke lines.
- **N-ary Branching**: Nodes dynamically support arbitrary multi-choice branching paths, seamlessly aligning connection UI pins using CSS flexbox distribution.
- **Live Editing**: Clicking any node opens a property panel. Updates to text, node types, or routing options reflect instantaneously on the canvas.
- **Chat Preview Mode**: A built-in chat simulator traverses the node graph in real-time, matching exactly what end-users will experience. Includes a dynamic "Go Back" history stack to cleanly navigate backwards up the decision tree.
- **Undo / Redo Architecture**: A robust history snapshot stack allowing infinite undo (`Ctrl+Z`) and redo (`Ctrl+Y`) operations, giving users the psychological safety to edit workflows without permanently breaking their graphs.

## Architecture

This project uses a modular vanilla JS architecture to maintain a lightweight footprint.

- **Vanilla JavaScript (ES Modules)**: Clear separation of concerns across core subsystems (`state.js`, `drag.js`, `svgMath.js`, `previewMode.js`).
- **Pub/Sub State Management**: A custom reactive store centrally controls the UI, allowing modular updates without the overhead of framework reconciliation.
- **Dual-Layer Canvas**:
  1. **DOM Layer**: HTML/CSS Node Cards handle user interactions, text rendering, and drag events.
  2. **SVG Layer**: A pointer-events-none `<svg>` overlay maps paths between nodes based on physical coordinate calculations.
- **Vite**: Lightweight dev environment and build tool.

## Installation

```bash
# Clone the repository
git clone https://github.com/axelniyo/AmaliTech-DEG-Project-based-challenges.git

# Navigate into the project directory
cd AmaliTech-DEG-Project-based-challenges/fullstack/SupportFlow-Visual-Builder

# Install dependencies (Vite)
npm install

# Run the development server
npm run dev
```

## Quick Start Guide
- Scroll the mouse wheel to **Zoom**.
- Click and drag the background to **Pan**.
- Grab the 6-dot drag handle on any node to **Move** it.
- Click a node body to open the **Property Panel**.
- Click the "+" branch pins on the node cards to automatically generate linked child options.
- Use `Ctrl+Z` to **Undo**.
 
