# MFA Data Charts

## Problem

Raw statistical datasets published by the Ministry of Foreign Affairs were difficult for ordinary users to understand. The information existed publicly, but it was buried inside large tables and documents that were hard to read, compare, or explore interactively.

The goal of the project was to transform inaccessible government data into a clear, visual, and interactive dashboard that makes trends and statistics understandable at a glance.

---

## Constraints

- Government datasets were not designed for frontend visualization and required preprocessing before they could be displayed cleanly.
- The application had to remain lightweight and fast despite rendering multiple charts and datasets.
- Built entirely with Vanilla JavaScript, without frontend frameworks or chart abstraction libraries handling application structure.
- Data needed to remain readable and understandable for non-technical users, not only developers or analysts.
- The UI had to support dynamic filtering and interaction without causing noticeable performance issues.

---

## Architecture

The project was structured as a client-side data visualization application built with Vanilla JavaScript.

Core architecture included:
- Modular separation between data processing, chart rendering, and UI interaction logic.
- Data transformation layer responsible for converting raw MFA datasets into normalized structures suitable for visualization.
- Reusable chart rendering utilities for displaying multiple dataset types consistently.
- Event-driven filtering system allowing users to dynamically explore data without page reloads.
- Responsive UI layer designed for readability across different screen sizes.

### Application Flow

1. Load raw statistical data.
2. Parse and normalize datasets.
3. Transform data into chart-ready structures.
4. Render interactive visualizations.
5. Update charts dynamically based on user interaction and filters.

---

## Challenges

### Working with inconsistent raw data

Government datasets were not optimized for frontend usage. Some values required normalization, restructuring, or cleanup before they could be visualized correctly.

### Keeping the interface understandable

A major challenge was avoiding “chart overload.” Displaying large amounts of statistical information without overwhelming the user required careful UI and UX decisions.

### Dynamic chart updates

Interactive filtering required efficient state synchronization between controls and rendered charts while avoiding unnecessary rerenders or duplicated logic.

### Building complex interactions without frameworks

Because the project used Vanilla JavaScript, state management, DOM updates, and component-like organization had to be implemented manually.

---

## Technical Decisions

### Vanilla JavaScript instead of a framework

The project was intentionally built without React or other frameworks to strengthen understanding of:
- DOM manipulation
- application structure
- event handling
- rendering logic
- state synchronization

This also reduced bundle size and kept the application lightweight.

### Data transformation layer

Instead of tightly coupling raw datasets to visual components, a preprocessing layer was introduced to normalize and reshape data before rendering. This improved maintainability and made chart logic simpler.

### Reusable visualization utilities

Chart generation logic was abstracted into reusable functions to avoid duplication and ensure consistent rendering behavior across datasets.

### Client-side rendering

The dashboard was designed as a frontend-focused application, allowing users to interact with datasets instantly without backend processing overhead.

---

## Result

The project transformed difficult-to-read government statistical data into an accessible interactive dashboard with clear visualizations and filtering tools.

It demonstrated:
- frontend architecture skills
- data visualization design
- state and interaction management
- data transformation techniques
- performance-conscious UI implementation in Vanilla JavaScript

The final application made public information significantly easier to explore and understand while remaining lightweight, responsive, and fully interactive.
