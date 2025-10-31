# Research: Tile Widget Implementation

**Feature**: Tile Widget Dashboard Component  
**Date**: 2025-10-31  
**Phase**: 0 - Research & Design Decisions

## Overview

This document captures research findings and design decisions for implementing the tile widget feature within the existing SQLite Browser Dashboard architecture.

## Research Questions & Findings

### 1. Tile Rendering Pattern

**Question**: How should tiles be rendered in the existing dashboard architecture?

**Decision**: Extend existing `queryAndBuildVisualization()` function pattern

**Rationale**: 
- Current architecture already handles two visualization types: `type: 'grid'` and `type: 'chart'`
- Adding `type: 'tiles'` follows established pattern in codebase
- Maintains consistency with existing rendering pipeline
- Function signature: `queryAndBuildTileWidget(db, di, containerId)` parallel to `createChart()` and `queryAndBuildGrid()`

**Alternatives Considered**:
- Separate rendering pipeline for tiles: Rejected because it creates code duplication and divergent patterns
- Tiles as special grid variant: Rejected because tiles have fundamentally different interaction model (clickable KPIs vs. data table)

### 2. Tile Query Execution Strategy

**Question**: Should all tile queries execute in parallel or sequentially?

**Decision**: Execute all tile queries in parallel using `Promise.all()`

**Rationale**:
- Tiles are independent of each other - no data dependencies between queries
- Parallel execution minimizes total load time (10 tiles × 50ms = 500ms parallel vs. 5000ms sequential)
- SQLite WASM supports concurrent read operations
- Aligns with performance goal: <500ms to render all tiles

**Implementation Pattern**:
```javascript
const tilePromises = config.tiles.map(tile => {
    return new Promise((resolve, reject) => {
        try {
            const rows = [];
            db.exec({ sql: tile.query, rowMode: "object", resultRows: rows });
            const value = extractNumericValue(rows);
            resolve({ tile, value });
        } catch (error) {
            reject({ tile, error });
        }
    });
});

Promise.all(tilePromises).then(results => renderAllTiles(results));
```

**Alternatives Considered**:
- Sequential execution: Rejected due to poor performance (linear time growth)
- Web Workers for queries: Rejected as overkill for client-side WASM with <200ms per query

### 3. Tile Click Interaction Model

**Question**: How should clicked tile state be communicated to child grids?

**Decision**: Use global variable `window.current_tile_name` similar to existing parent-child pattern

**Rationale**:
- Existing code uses `rowData` object passed to `replaceStringTemplateValues()` for parent-child grids
- Tile clicks need to populate `${tile_name}` variable for child grid queries
- Global state matches existing architecture simplicity (no state management framework)
- Template substitution already handles variable replacement in queries

**Implementation Pattern**:
```javascript
function onTileClick(tileName) {
    window.current_tile_name = tileName;
    // Find child grids with parent matching tile widget title
    const childItems = template.dashboard_items.filter(i => i.parent === tileWidgetTitle);
    childItems.forEach(childItem => {
        const query = replaceStringTemplateValues(childItem.query, { tile_name: tileName });
        // Render child grid with substituted query
    });
}
```

**Alternatives Considered**:
- Event system with subscribers: Rejected as over-engineering for single-use case
- URL hash state: Rejected to avoid complex routing changes
- Local storage: Rejected as unnecessary persistence (session-only state acceptable)

### 4. Tile Color Specification

**Question**: What color format should be supported for tile backgrounds?

**Decision**: Accept any valid CSS color value (named colors, hex, rgb, rgba, hsl)

**Rationale**:
- Maximum flexibility for users (simple names like "blue" or precise hex like "#3A5FCD")
- CSS will naturally handle invalid values by falling back to default
- No validation needed - browser does the work
- Validation can warn but not block on invalid colors

**Supported Formats**:
- Named: `"blue"`, `"red"`, `"green"`
- Hex: `"#FF5733"`, `"#3A5FCD"`
- RGB: `"rgb(100, 150, 200)"`, `"rgba(100, 150, 200, 0.8)"`
- HSL: `"hsl(200, 50%, 50%)"`

**Alternatives Considered**:
- Strict hex-only validation: Rejected as too limiting for users
- Predefined color palette: Rejected as unnecessarily restrictive

### 5. Numeric Value Formatting

**Question**: How should large numbers be formatted on tiles?

**Decision**: Use `Number.toLocaleString('en-US')` for thousands separators, with optional abbreviation for millions/billions

**Rationale**:
- Browser-native formatting is reliable and locale-aware
- Thousands separators improve readability (1,234,567 vs 1234567)
- Optional abbreviation (1.2M, 3.4B) can be configuration-based for very large values
- Matches existing chart.js number formatting patterns

**Implementation**:
```javascript
function formatTileValue(value) {
    if (isNaN(value)) return 'N/A';
    const num = Number(value);
    // For values > 1M, optionally abbreviate
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    }
    return num.toLocaleString('en-US');
}
```

**Alternatives Considered**:
- Always abbreviate: Rejected because losing precision for smaller numbers
- Custom formatting library: Rejected to avoid new dependency (violates constitution)
- No formatting: Rejected as poor UX for large numbers

### 6. Tile Widget Positioning Enforcement

**Question**: How to enforce "must be first dashboard item" constraint?

**Decision**: Add validation rule to ConfigValidator.validateDashboardItems()

**Rationale**:
- Validation happens before any rendering (fail-fast principle)
- Clear error message guides users to fix configuration
- Consistent with existing validation pattern for parent references, circular dependencies
- Prevents runtime layout issues

**Validation Logic**:
```javascript
// In ConfigValidator
const tileWidgets = items.filter(item => item.type === 'tiles');
if (tileWidgets.length > 1) {
    errors.push("Only one tile widget allowed per dashboard template");
}
if (tileWidgets.length === 1 && items[0].type !== 'tiles') {
    errors.push("Tile widget must be the first dashboard item");
}
```

**Alternatives Considered**:
- Auto-reorder items: Rejected because implicit behavior is confusing
- Runtime warning only: Rejected because layout will break without proper ordering

### 7. Text Contrast on Colored Backgrounds

**Question**: How to ensure text readability on user-specified tile colors?

**Decision**: Calculate relative luminance and use white text for dark backgrounds, black for light backgrounds

**Rationale**:
- WCAG 2.1 guidelines require minimum 4.5:1 contrast ratio for text
- Algorithmic approach works for any color without manual configuration
- Lightweight calculation (no new dependencies)

**Implementation** (based on WCAG relative luminance):
```javascript
function getContrastTextColor(bgColor) {
    // Convert color to RGB, calculate relative luminance
    // L = 0.2126 * R + 0.7152 * G + 0.0722 * B
    // If L > 0.5, use black text; else white text
    const rgb = hexToRgb(bgColor); // Helper function
    const luminance = (0.2126 * rgb.r + 0.7152 * rgb.g + 0.0722 * rgb.b) / 255;
    return luminance > 0.5 ? '#000000' : '#FFFFFF';
}
```

**Alternatives Considered**:
- Fixed white text always: Rejected due to poor readability on light backgrounds
- User-specified text color: Rejected as too complex for configuration
- CSS filter: Rejected as unreliable across browsers

## Technology Decisions

### No New Dependencies Required

**Decision**: Implement tile widget using only existing vendored libraries

**Technologies Used**:
- jQuery 3.7.1: DOM manipulation, event handling
- SQLite WASM (sqlean.js): Query execution
- Toastify: Error notifications
- W3.CSS + inline styles: Tile layout and styling

**Rationale**: Constitutional requirement for vendored dependencies; existing libraries sufficient for all tile widget requirements

## Integration Patterns

### 1. Configuration Schema Extension

**Current Schema**:
```javascript
{
    "dashboard_items": [
        { "type": "grid", "title": "...", "query": "..." },
        { "type": "chart", "title": "...", "query": "...", "chartType": "bar" }
    ]
}
```

**Extended Schema**:
```javascript
{
    "dashboard_items": [
        {
            "type": "tiles",
            "title": "KPI Dashboard",
            "config": {
                "tiles": [
                    {
                        "name": "Active Orders",
                        "query": "SELECT COUNT(*) FROM orders WHERE status = 'Active'",
                        "description": "Currently processing orders",
                        "color": "#4CAF50"
                    }
                ]
            }
        },
        { "type": "grid", "title": "Order Details", "parent": "KPI Dashboard", "query": "..." }
    ]
}
```

### 2. Template Variable Extension

**Existing Variables**: Columns from parent grid row (e.g., `${customer_id}`, `${order_date}`)

**New Variable**: `${tile_name}` - name of clicked tile

**Usage in Child Queries**:
```sql
SELECT * FROM orders WHERE status = '${tile_name}'
```

When "Active Orders" tile clicked, substitutes to:
```sql
SELECT * FROM orders WHERE status = 'Active Orders'
```

## Performance Considerations

### Rendering Performance

**Target**: Render 10 tiles in <500ms

**Optimizations**:
- Parallel query execution (Promise.all)
- Minimal DOM manipulation (single container append)
- CSS flexbox for layout (no JavaScript calculations)
- No animations on initial render (optional hover effects only)

### Memory Management

**Concern**: Tile widgets create persistent click handlers

**Mitigation**: Use event delegation on tile container rather than individual handlers per tile

```javascript
$(`#${containerId}`).on('click', '.tile', function() {
    const tileName = $(this).data('tile-name');
    onTileClick(tileName);
});
```

## Open Questions / Future Enhancements

1. **Tile Value Refresh**: Currently queries execute once on dataset load. Future: Auto-refresh tiles on timer?
2. **Tile Icons**: Allow optional icon specification (Font Awesome, emoji) alongside numeric value?
3. **Tile Sorting**: Allow user to reorder tiles via drag-and-drop?
4. **Tile Sparklines**: Show mini trend chart within tile using lightweight library?

*Note: These are out of scope for initial implementation but documented for future consideration*

## Validation

All research decisions verified against constitutional requirements:
- ✅ Zero-build: Pure vanilla JS, no transpilation
- ✅ Vendored deps: No new dependencies added
- ✅ Configuration-driven: All behavior controlled via index.json
- ✅ HTTP-only: Uses existing fetch pattern
- ✅ Client-side SQLite: Queries via existing db.exec()

## Summary

Research complete. All technical unknowns resolved. Ready to proceed to Phase 1 (data model and contracts).
