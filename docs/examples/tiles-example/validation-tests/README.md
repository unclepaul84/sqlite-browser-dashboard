# Tile Widget Validation Tests

This directory contains test configurations for validating tile widget validation rules.

## How to Test

Load each configuration file using the URL pattern:
```
index.html?url=docs/examples/tiles-example/validation-tests/TILE-XXX-description.json
```

## Test Files

### Error Cases (Should Block Rendering)

1. **TILE-001-multiple-widgets.json**
   - Expected: Error - "Only one tile widget allowed per template (found 2)"
   - Test: Two tile widgets in same template

2. **TILE-002-not-first.json**
   - Expected: Error - "Tile widget must be the first item in dashboard_items (currently at index 1)"
   - Test: Tile widget at index 1 (second position)

3. **TILE-003-empty-array.json**
   - Expected: Error - "Tile widget must contain at least one tile"
   - Test: Empty tiles array

4. **TILE-004-missing-name.json**
   - Expected: Error - "Tile missing required field 'name' at index 0"
   - Test: Tile without name field

5. **TILE-005-missing-query.json**
   - Expected: Error - "Tile missing required field 'query' at index 0"
   - Test: Tile without query field

### Warning Cases (Should Display Warning but Continue)

6. **TILE-006-duplicate-names.json**
   - Expected: Warning - "Duplicate tile name 'Active' found"
   - Test: Two tiles with same name

## Validation Summary

- **5 Error Rules**: TILE-001 through TILE-005 (block rendering)
- **2 Warning Rules**: TILE-006, TILE-007 (display warning, continue)

## Expected Behavior

### Errors
- Red toast notification appears
- Dashboard does not render
- Error message clearly identifies the problem

### Warnings
- Yellow/orange toast notification appears
- Dashboard renders successfully
- Warning message provides helpful context
