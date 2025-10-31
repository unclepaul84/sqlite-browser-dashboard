# Validation Rules Contract: Tile Widget

**Feature**: Tile Widget Dashboard Component  
**Date**: 2025-10-31  
**Version**: 1.0.0

## Overview

This document defines the validation rules contract for tile widget configuration. All rules must be implemented in `ConfigValidator.js` and executed before dashboard rendering.

## Validation Execution Context

**Trigger**: Configuration load from `index.json`  
**Location**: `ConfigValidator.validateConfig()` function  
**Timing**: Before any dashboard items render  
**Failure Mode**: Halt rendering, display all errors via Toastify notifications

---

## Rule Definitions

### TILE-001: Single Tile Widget Per Template

**Category**: Structural Constraint  
**Severity**: Error (blocks rendering)

**Description**: Each dashboard template must contain at most one dashboard item with `type: "tiles"`.

**Validation Logic**:
```javascript
const tileWidgets = template.dashboard_items.filter(item => item.type === 'tiles');
if (tileWidgets.length > 1) {
    errors.push({
        code: 'TILE-001',
        message: 'Only one tile widget allowed per dashboard template',
        templateName: template.name,
        count: tileWidgets.length
    });
}
```

**Test Cases**:

| Input | Expected Result |
|-------|-----------------|
| 0 tile widgets | ✅ Pass |
| 1 tile widget | ✅ Pass |
| 2 tile widgets | ❌ Error: "Only one tile widget allowed per dashboard template" |

**Error Message Format**:
```
Configuration error: Only one tile widget allowed per dashboard template
```

---

### TILE-002: Tile Widget Must Be First Item

**Category**: Positional Constraint  
**Severity**: Error (blocks rendering)

**Description**: If a tile widget exists, it must be the first item (index 0) in the `dashboard_items` array.

**Validation Logic**:
```javascript
const tileWidgetIndex = template.dashboard_items.findIndex(item => item.type === 'tiles');
if (tileWidgetIndex > 0) {
    errors.push({
        code: 'TILE-002',
        message: 'Tile widget must be the first dashboard item',
        templateName: template.name,
        actualIndex: tileWidgetIndex
    });
}
```

**Test Cases**:

| Tile Widget Position | Expected Result |
|---------------------|-----------------|
| Index 0 (first) | ✅ Pass |
| Index 1 (second) | ❌ Error: "Tile widget must be the first dashboard item" |
| Index 2+ (later) | ❌ Error: "Tile widget must be the first dashboard item" |
| Not present | ✅ Pass |

**Error Message Format**:
```
Configuration error: Tile widget must be the first dashboard item
```

---

### TILE-003: Tiles Array Not Empty

**Category**: Content Requirement  
**Severity**: Error (blocks rendering)

**Description**: The `config.tiles` array must contain at least one tile configuration.

**Validation Logic**:
```javascript
if (item.type === 'tiles') {
    if (!item.config || !item.config.tiles || !Array.isArray(item.config.tiles)) {
        errors.push({
            code: 'TILE-003',
            message: 'Tile widget missing required config.tiles array',
            itemTitle: item.title
        });
    } else if (item.config.tiles.length === 0) {
        errors.push({
            code: 'TILE-003',
            message: 'Tile widget must contain at least one tile',
            itemTitle: item.title
        });
    }
}
```

**Test Cases**:

| config.tiles Value | Expected Result |
|-------------------|-----------------|
| `[{...}]` (1+ tiles) | ✅ Pass |
| `[]` (empty array) | ❌ Error: "Tile widget must contain at least one tile" |
| `undefined` | ❌ Error: "Tile widget missing required config.tiles array" |
| `null` | ❌ Error: "Tile widget missing required config.tiles array" |
| Not an array | ❌ Error: "Tile widget missing required config.tiles array" |

**Error Message Format**:
```
Configuration error: Tile widget must contain at least one tile
```

---

### TILE-004: Tile Name Required

**Category**: Field Requirement  
**Severity**: Error (blocks rendering)

**Description**: Each tile must have a non-empty `name` field.

**Validation Logic**:
```javascript
item.config.tiles.forEach((tile, tileIdx) => {
    if (!tile.name || typeof tile.name !== 'string' || tile.name.trim() === '') {
        errors.push({
            code: 'TILE-004',
            message: `Tile missing required field 'name' at index ${tileIdx}`,
            itemTitle: item.title,
            tileIndex: tileIdx
        });
    }
});
```

**Test Cases**:

| tile.name Value | Expected Result |
|----------------|-----------------|
| `"Active"` | ✅ Pass |
| `""` (empty string) | ❌ Error: "Tile missing required field 'name' at index {i}" |
| `"   "` (whitespace) | ❌ Error: "Tile missing required field 'name' at index {i}" |
| `undefined` | ❌ Error: "Tile missing required field 'name' at index {i}" |
| `null` | ❌ Error: "Tile missing required field 'name' at index {i}" |
| `123` (number) | ❌ Error: "Tile missing required field 'name' at index {i}" |

**Error Message Format**:
```
Configuration error: Tile missing required field 'name' at index 0
```

---

### TILE-005: Tile Query Required

**Category**: Field Requirement  
**Severity**: Error (blocks rendering)

**Description**: Each tile must have a non-empty `query` field containing SQL.

**Validation Logic**:
```javascript
item.config.tiles.forEach((tile, tileIdx) => {
    if (!tile.query || typeof tile.query !== 'string' || tile.query.trim() === '') {
        errors.push({
            code: 'TILE-005',
            message: `Tile missing required field 'query' at index ${tileIdx}`,
            itemTitle: item.title,
            tileIndex: tileIdx,
            tileName: tile.name || '(unnamed)'
        });
    }
});
```

**Test Cases**:

| tile.query Value | Expected Result |
|-----------------|-----------------|
| `"SELECT COUNT(*) FROM orders"` | ✅ Pass |
| `""` (empty string) | ❌ Error: "Tile missing required field 'query' at index {i}" |
| `"   "` (whitespace) | ❌ Error: "Tile missing required field 'query' at index {i}" |
| `undefined` | ❌ Error: "Tile missing required field 'query' at index {i}" |
| `null` | ❌ Error: "Tile missing required field 'query' at index {i}" |

**Error Message Format**:
```
Configuration error: Tile missing required field 'query' at index 0
```

**Note**: SQL syntax validation is deferred to runtime (query execution phase).

---

### TILE-006: Duplicate Tile Names

**Category**: Data Quality  
**Severity**: Warning (allows rendering)

**Description**: Tile names should be unique within a tile widget for clarity, but duplicates are permitted (template substitution uses first occurrence).

**Validation Logic**:
```javascript
const tileNames = new Set();
const duplicates = [];
item.config.tiles.forEach(tile => {
    if (tile.name) {
        if (tileNames.has(tile.name)) {
            duplicates.push(tile.name);
        }
        tileNames.add(tile.name);
    }
});

if (duplicates.length > 0) {
    warnings.push({
        code: 'TILE-006',
        message: `Duplicate tile name(s) found in tile widget: ${duplicates.join(', ')}`,
        itemTitle: item.title,
        duplicates: duplicates,
        severity: 'warning'
    });
}
```

**Test Cases**:

| Tile Names | Expected Result |
|-----------|-----------------|
| `["A", "B", "C"]` | ✅ Pass (no warning) |
| `["A", "A", "B"]` | ⚠️ Warning: "Duplicate tile name(s) found: A" |
| `["X", "Y", "X", "Y"]` | ⚠️ Warning: "Duplicate tile name(s) found: X, Y" |

**Warning Message Format**:
```
Configuration warning: Duplicate tile name(s) found in tile widget: Active
```

**Behavior**: Display warning via Toastify but continue rendering. Clicking duplicately-named tiles will trigger same child grid filters.

---

### TILE-007: Invalid Color Format

**Category**: Data Quality  
**Severity**: Warning (allows rendering with fallback)

**Description**: Tile colors should be valid CSS color values. Invalid colors fall back to default `#4A90E2`.

**Validation Logic**:
```javascript
item.config.tiles.forEach((tile, tileIdx) => {
    if (tile.color) {
        // Test color validity by applying to temporary element
        const testDiv = document.createElement('div');
        testDiv.style.color = tile.color;
        if (!testDiv.style.color) {
            // Invalid color (browser rejected it)
            warnings.push({
                code: 'TILE-007',
                message: `Invalid color '${tile.color}' for tile '${tile.name}', using default`,
                itemTitle: item.title,
                tileName: tile.name,
                invalidColor: tile.color,
                severity: 'warning'
            });
        }
    }
});
```

**Test Cases**:

| tile.color Value | Expected Result |
|-----------------|-----------------|
| `"#FF5733"` | ✅ Pass |
| `"blue"` | ✅ Pass |
| `"rgb(100,150,200)"` | ✅ Pass |
| `"hsl(200,50%,50%)"` | ✅ Pass |
| `"not-a-color"` | ⚠️ Warning: "Invalid color 'not-a-color' for tile '{name}', using default" |
| `"#GGG"` | ⚠️ Warning: "Invalid color '#GGG' for tile '{name}', using default" |
| `undefined` | ✅ Pass (use default, no warning) |

**Warning Message Format**:
```
Configuration warning: Invalid color 'xyz123' for tile 'Active Orders', using default
```

**Fallback Behavior**: Use `#4A90E2` (default blue) when color invalid or not specified.

---

## Validation Flow Integration

### Execution Sequence

```javascript
// In ConfigValidator.validateConfig()
function validateConfig(config) {
    const errors = [];
    const warnings = [];
    
    config.dashboard_templates.forEach((template, templateIdx) => {
        // Existing validations...
        
        // TILE-001: Check for multiple tile widgets
        const tileWidgets = template.dashboard_items.filter(item => item.type === 'tiles');
        if (tileWidgets.length > 1) {
            errors.push('Only one tile widget allowed per dashboard template');
        }
        
        // TILE-002: Check tile widget position
        const tileWidgetIndex = template.dashboard_items.findIndex(item => item.type === 'tiles');
        if (tileWidgetIndex > 0) {
            errors.push('Tile widget must be the first dashboard item');
        }
        
        // Validate each dashboard item
        template.dashboard_items.forEach((item, itemIdx) => {
            if (item.type === 'tiles') {
                // TILE-003: Tiles array not empty
                if (!item.config?.tiles || item.config.tiles.length === 0) {
                    errors.push('Tile widget must contain at least one tile');
                }
                
                // TILE-004, TILE-005, TILE-006, TILE-007
                validateTiles(item, errors, warnings);
            }
        });
    });
    
    return { isValid: errors.length === 0, errors, warnings };
}
```

### Error Reporting

**Errors** (block rendering):
```javascript
validation.errors.forEach(error => {
    showErrorToast(`Configuration error: ${error}`);
});
if (!validation.isValid) {
    return; // Halt rendering
}
```

**Warnings** (display but continue):
```javascript
validation.warnings.forEach(warning => {
    showWarningToast(`Configuration warning: ${warning}`);
});
// Continue with rendering
```

---

## Testing Contract

### Unit Test Requirements

Each rule must have test cases for:
1. ✅ Pass condition (valid input)
2. ❌ Fail condition (invalid input)
3. 🔲 Edge cases (boundary conditions)

### Test Data Examples

**Valid Tile Widget**:
```json
{
  "type": "tiles",
  "title": "KPIs",
  "config": {
    "tiles": [
      {
        "name": "Active",
        "query": "SELECT COUNT(*) FROM orders WHERE status = 'Active'",
        "description": "Active orders",
        "color": "#4CAF50"
      }
    ]
  }
}
```

**Invalid Examples** (for each rule):
- Multiple tile widgets (TILE-001)
- Tile widget at index 1 (TILE-002)
- Empty tiles array (TILE-003)
- Missing tile name (TILE-004)
- Missing tile query (TILE-005)
- Duplicate names (TILE-006 warning)
- Invalid color (TILE-007 warning)

---

## Summary

7 validation rules defined:
- 5 errors (blocking)
- 2 warnings (non-blocking)

All rules implementable in ConfigValidator.js without new dependencies.
Ready for implementation in Phase 2.
