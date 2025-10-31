# sqlite-browser-dashboard Development Guidelines

Auto-generated from all feature plans. Last updated: 2025-10-31

## Active Technologies

- Vanilla JavaScript (ES6+) in browser environment + jQuery 3.7.1 (DOM manipulation), Tabulator (grids), SQLite WASM (sqlean.js), Toastify (notifications), Chart.js (visualizations) (003-tile-widget)

## Project Structure

```text
index.html              # Main application with tile widget rendering
js/
  configValidator.js    # Configuration validation (includes tile validation)
  jquery-3.7.1.min.js   # DOM manipulation
  tabulator.min.js      # Grid rendering
  sqlean.js             # SQLite WASM
  toastify.js           # Notifications
  chart.umd.js          # Chart visualizations
  ws.css                # Styles
docs/
  examples/
    tiles-example/      # Tile widget examples and validation tests
      index.json        # Example tile configuration
      sample.db         # Sample database
      validation-tests/ # Validation test configurations
specs/
  003-tile-widget/      # Tile widget specification and planning
readme.md               # User documentation
```

## Commands

No build commands - static HTML/CSS/JS deployment

## Code Style

Vanilla JavaScript (ES6+) in browser environment: Follow standard conventions
- Use jQuery for DOM manipulation
- Use Promise.all() for parallel async operations
- Store global state in window object
- Use data attributes for element metadata

## Recent Changes

- 003-tile-widget: Added tile widget feature with KPI displays, clickable filtering, and ${tile_name} template variable substitution. Implemented 7 validation rules (TILE-001 through TILE-007), responsive CSS, WCAG-compliant text contrast, and comprehensive documentation.

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
