# Feature Specification: Tile Widget Dashboard Component

**Feature Branch**: `003-tile-widget`  
**Created**: 2025-10-31  
**Status**: Draft  
**Input**: User description: "implement a new type of widget in addition to grid and chart called tile widget. there can only be one per dataset and it must be the first item. configuration spec for it is as follows: user can configure one or more tiles. each tile has color, description and numeric value driven by a query against sqlite. each tile allows user to click on it. child grids can then be filtered based tile name via variable substitution."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Configure and Render Tile Widget (Priority: P1)

Users configure a tile widget as the first dashboard item in their template, defining multiple tiles where each tile displays a label, description, color, and numeric value calculated from a SQL query.

**Why this priority**: Foundation for tile functionality - without basic rendering, no other tile features work.

**Independent Test**: Create `index.json` with tile widget as first dashboard item containing 3 tiles with different colors and queries, load dashboard, verify all tiles render with correct values and styling.

**Acceptance Scenarios**:

1. **Given** dashboard template has tile widget as first item with `type: "tiles"`, **When** dataset loads, **Then** tile widget renders above all other dashboard items
2. **Given** tile widget configured with multiple tiles in `config.tiles` array, **When** rendering, **Then** each tile displays as a colored card showing tile name, description, and query result
3. **Given** tile query returns numeric result, **When** executing query, **Then** value displays formatted appropriately (commas for thousands, decimal places)
4. **Given** tile has `color` property, **When** rendering, **Then** tile background or border uses specified color (e.g., "blue", "#FF5733", "rgb(100,150,200)")
5. **Given** tile widget configured at position other than first, **When** ConfigValidator runs, **Then** error displays: "Tile widget must be the first dashboard item"

---

### User Story 2 - Clickable Tiles with Variable Substitution (Priority: P1)

Users click on rendered tiles to interact with child grids below, where child grids filter their data based on the clicked tile's name using template variable substitution (`${tile_name}`).

**Why this priority**: Core interaction model - enables drill-down from summary metrics to detailed data.

**Independent Test**: Configure tile widget with 3 tiles (e.g., "Active", "Pending", "Completed") and child grid with query using `${tile_name}`, click "Active" tile, verify child grid displays filtered results for active items.

**Acceptance Scenarios**:

1. **Given** tile rendered and user hovers, **When** mouse over tile, **Then** cursor changes to pointer indicating clickability
2. **Given** user clicks tile, **When** click event fires, **Then** tile_name variable becomes available for template substitution in child grids
3. **Given** child grid has query with `${tile_name}` placeholder, **When** tile clicked, **Then** replaceStringTemplateValues() substitutes clicked tile's name into query
4. **Given** child grid has `parent: "Tile Widget Title"`, **When** tile clicked, **Then** child grid renders below tile widget with filtered data
5. **Given** different tile clicked, **When** new tile selected, **Then** child grids refresh with new tile_name value

---

### User Story 3 - Single Tile Widget Enforcement (Priority: P1)

System validates that each dashboard template contains at most one tile widget, and if present, it appears as the first dashboard item in the configuration.

**Why this priority**: Maintains consistent layout and prevents configuration errors that could break rendering.

**Independent Test**: Create configuration with two tile widgets, load dashboard, verify validation error prevents rendering. Create configuration with tile widget as second item, verify error displays.

**Acceptance Scenarios**:

1. **Given** dashboard template has two items with `type: "tiles"`, **When** ConfigValidator runs, **Then** error displays: "Only one tile widget allowed per dashboard template"
2. **Given** tile widget configured as second or later item, **When** validating, **Then** error displays: "Tile widget must be the first dashboard item"
3. **Given** tile widget correctly positioned as first item, **When** validation completes, **Then** no errors related to tile widget positioning
4. **Given** dashboard template has no tile widget, **When** rendering, **Then** system behaves normally with existing grid/chart items

---

### User Story 4 - Tile Query Execution and Value Display (Priority: P1)

Users define SQL queries for each tile that return a single numeric value (e.g., `SELECT COUNT(*) FROM orders WHERE status = 'Active'`), which displays prominently on the tile.

**Why this priority**: Provides the data-driven functionality that makes tiles useful for dashboard summaries.

**Independent Test**: Configure tile with query `SELECT COUNT(*) FROM customers`, load dataset, verify tile displays correct count from database.

**Acceptance Scenarios**:

1. **Given** tile has `query` property with SQL, **When** dataset loads, **Then** query executes against current SQLite database
2. **Given** query returns single row with numeric column, **When** processing result, **Then** first numeric value extracted and displayed on tile
3. **Given** query returns multiple columns, **When** extracting value, **Then** first column value used for display
4. **Given** query returns no rows or NULL, **When** rendering tile, **Then** tile displays "0" or "N/A" as default value
5. **Given** query syntax error, **When** execution fails, **Then** error toast displays and tile shows error state

---

### User Story 5 - Visual Styling and Layout (Priority: P2)

Users see tiles displayed in a responsive grid layout with consistent spacing, clear typography for labels/descriptions, and visual affordance for interactivity (hover effects, active states).

**Why this priority**: Enhances usability and visual appeal, making tiles easy to scan and interact with.

**Independent Test**: Configure 6 tiles with varying label lengths and colors, resize browser window, verify tiles wrap responsively and maintain readability.

**Acceptance Scenarios**:

1. **Given** multiple tiles configured, **When** rendering, **Then** tiles display in horizontal row with wrapping on smaller screens (CSS flexbox or grid)
2. **Given** tile hovered by user, **When** mouse enters tile, **Then** visual feedback appears (e.g., slight scale transform, shadow enhancement)
3. **Given** tile clicked, **When** active state applied, **Then** visual indicator shows selected tile (e.g., highlighted border, different background opacity)
4. **Given** tile has long description, **When** rendering, **Then** text wraps appropriately without breaking layout
5. **Given** tiles have different colors, **When** displaying, **Then** each tile uses its configured color while maintaining text readability (contrast checking)

---

### User Story 6 - Integration with Existing Dashboard Architecture (Priority: P2)

Tile widget integrates seamlessly with existing grid and chart dashboard items, supporting the same template variable substitution, parent-child relationships, and rendering patterns.

**Why this priority**: Ensures consistency with existing features and leverages proven patterns.

**Independent Test**: Configure dashboard with tile widget, grids, and charts; click tile, verify child grids filter; verify chart items ignore tile clicks appropriately.

**Acceptance Scenarios**:

1. **Given** dashboard has tile widget and grid items with `parent: "Tile Widget"`, **When** tile clicked, **Then** child grids render in standard parent-child container pattern
2. **Given** child grid has templated query, **When** tile clicked, **Then** existing replaceStringTemplateValues() function handles `${tile_name}` substitution
3. **Given** tile widget rendered, **When** custom query modal opened, **Then** tile widget queries accessible for inspection in title attributes
4. **Given** dataset changed via dropdown, **When** new dataset loads, **Then** tile widget queries re-execute and values update
5. **Given** tile widget and grids both visible, **When** interacting, **Then** standard loading spinner, error handling, and toast notifications work consistently

---

### User Story 7 - Configuration Validation for Tiles (Priority: P2)

System validates tile widget configuration at load time, checking for required fields (name, query), valid colors, and proper structure within the tiles array.

**Why this priority**: Prevents runtime errors and provides clear feedback on configuration mistakes.

**Independent Test**: Create tile with missing `query` field, load dashboard, verify validation error displays before rendering attempts.

**Acceptance Scenarios**:

1. **Given** tile missing required `name` field, **When** ConfigValidator checks, **Then** error displays: "Tile missing required field 'name' at index {i}"
2. **Given** tile missing required `query` field, **When** validating, **Then** error displays: "Tile missing required field 'query' at index {i}"
3. **Given** tile has invalid color format, **When** validating colors, **Then** warning displays but rendering proceeds with fallback color
4. **Given** tiles array is empty, **When** validating tile widget, **Then** error displays: "Tile widget must contain at least one tile"
5. **Given** duplicate tile names exist, **When** checking uniqueness, **Then** warning displays: "Duplicate tile name '{name}' found"

---

### Edge Cases

- **What happens when tile query returns multiple rows?** → System uses first row's first column value; logs warning if multiple rows returned
- **How does system handle non-numeric query results?** → Attempts to parse as number; displays original string if parsing fails; shows "N/A" for null/undefined
- **What if multiple users click different tiles rapidly?** → Each click updates tile_name variable and triggers child grid refresh; last click wins
- **How are tiles displayed on mobile/narrow screens?** → Tiles wrap into multiple rows using responsive CSS grid/flexbox (e.g., 1-2 tiles per row on mobile)
- **What happens when no child grids reference tile widget as parent?** → Tiles render and are clickable but generate no child grids (no error, expected use case for standalone metrics)
- **How does system handle very large numeric values?** → Formatting includes thousands separators and optional abbreviations (e.g., "1.2M" for 1,200,000) based on configuration
- **What if tile color conflicts with text readability?** → System should apply automatic contrast adjustment or use white/black text based on background luminance
- **How are tile queries cached or optimized?** → Each tile query executes independently when dataset loads; results cached until dataset changes (no auto-refresh)
- **What happens when tile widget has no tiles configured?** → ConfigValidator prevents this; minimum 1 tile required
- **Can tiles display non-numeric data?** → Yes, description field can contain any text; numeric value is specifically for the main display metric but can fall back to string display

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST support new dashboard item type `"tiles"` in addition to existing `"grid"` and `"chart"` types
- **FR-002**: System MUST enforce single tile widget per dashboard template (ConfigValidator error if multiple tile widgets configured)
- **FR-003**: System MUST enforce tile widget as first dashboard item (ConfigValidator error if positioned elsewhere)
- **FR-004**: Tile widget MUST support `config.tiles` array containing one or more tile configurations
- **FR-005**: Each tile MUST have required fields: `name` (string), `query` (SQL string)
- **FR-006**: Each tile MAY have optional fields: `description` (string), `color` (CSS color value)
- **FR-007**: System MUST execute tile queries against current SQLite database when dataset loads
- **FR-008**: System MUST extract numeric value from query result (first row, first column) for display on tile
- **FR-009**: System MUST render tiles in responsive horizontal layout with wrapping (CSS grid/flexbox)
- **FR-010**: Each tile MUST display tile name prominently, numeric value large/bold, and description text smaller
- **FR-011**: Tiles MUST be clickable with cursor: pointer and hover effects
- **FR-012**: Clicking tile MUST set `tile_name` variable to clicked tile's name for template substitution
- **FR-013**: System MUST support child grids with `parent` field referencing tile widget title
- **FR-014**: Child grid queries MUST support `${tile_name}` template variable substitution
- **FR-015**: System MUST use existing replaceStringTemplateValues() function for tile_name substitution
- **FR-016**: System MUST apply tile `color` property to tile background or border styling
- **FR-017**: System MUST format numeric values with thousands separators (e.g., "1,234")
- **FR-018**: System MUST handle query errors gracefully, displaying error state on affected tile and toast notification
- **FR-019**: System MUST display "N/A" or "0" when tile query returns no rows or null value
- **FR-020**: System MUST validate tiles array is non-empty (minimum 1 tile required)
- **FR-021**: System MUST validate each tile has unique name within same tile widget (warning for duplicates)
- **FR-022**: System MUST re-execute all tile queries when dataset changes via dropdown
- **FR-023**: System MUST render tile widget above all grid and chart dashboard items
- **FR-024**: Tile widget container MUST have unique ID for targeting (e.g., `{tileWidgetTitle}_tile_container`)
- **FR-025**: Child grids for tile widget MUST render in standard parent-child container pattern below tiles
- **FR-026**: System MUST provide visual feedback for active/selected tile (CSS class or inline styling)
- **FR-027**: System MUST ensure text readability on colored tile backgrounds (contrast checking or forced text color)
- **FR-028**: ConfigValidator MUST check tile widget positioning and quantity during validation phase
- **FR-029**: Tile queries MUST execute with same error handling and loading indicators as grid/chart queries
- **FR-030**: System MUST store tile query SQL in tile element data attribute or title for debugging access

### Key Entities

- **Tile Widget**: New dashboard item type (`type: "tiles"`) containing array of tile configurations; must be first item in dashboard template; limited to one per template
- **Tile Configuration**: Object defining individual tile with fields: name (required), query (required), description (optional), color (optional)
- **Tile Name Variable**: Template variable `${tile_name}` available for substitution in child grid queries after tile click
- **Tile Container**: DOM element holding all rendered tiles in responsive layout, positioned before grid/chart containers
- **Tile Element**: Individual clickable DOM element representing single tile, displaying name, value, and description with color styling

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can configure tile widget with 10+ tiles without performance degradation (<500ms to render all tiles)
- **SC-002**: Tile queries execute and display results within 200ms for queries returning <1000 rows
- **SC-003**: Users can click any tile and see child grids filter correctly 100% of the time via ${tile_name} substitution
- **SC-004**: ConfigValidator detects and blocks invalid tile widget configurations (wrong position, multiple widgets) 100% of the time before rendering
- **SC-005**: Tiles display responsively on screens from 320px (mobile) to 2560px (desktop) width without layout breaking
- **SC-006**: Users can distinguish between tiles visually based on color coding (95%+ user recognition in testing)
- **SC-007**: Numeric values on tiles format correctly with thousands separators for values up to billions
- **SC-008**: System handles tile query errors without crashing dashboard (error state displayed, other tiles remain functional)
- **SC-009**: Tile widget integrates with existing parent-child grid architecture without requiring refactoring of core rendering logic
- **SC-010**: Users can create dashboard with tile widget + 20 child grids and interact smoothly (tile click triggers grid updates in <500ms)

## Assumptions *(optional)*

- Existing dashboard configuration schema can be extended with new `type: "tiles"` without breaking existing dashboards
- Existing template variable substitution (replaceStringTemplateValues) supports adding new variable types like ${tile_name}
- Tile queries return single numeric values in most use cases; multi-row/multi-column handling is fallback behavior
- CSS framework/styling system in place supports custom colored components without extensive new CSS
- Users understand SQL enough to write aggregation queries (COUNT, SUM, AVG) for tile values
- One tile widget per dashboard is sufficient for most use cases (limitation acceptable to users)
- Tiles positioned first in layout is intuitive for dashboard summary/KPI use case
- Browser localStorage or sessionStorage not needed for persisting selected tile state across page refreshes

## Dependencies *(optional)*

- Existing ConfigValidator.js must be enhanced to validate tile widget constraints (position, uniqueness)
- Existing rendering pipeline must support new dashboard item type "tiles" alongside "grid" and "chart"
- Existing template variable substitution system must be accessible for ${tile_name} injection
- SQLite WASM query execution already in place via sqlean.js - no new dependencies
- CSS framework (existing ws.css or inline styles) must support colored cards/tiles
- No new external libraries required per Zero-Build Static Architecture principle
- Tabulator library (for child grids) already handles parent-child relationships - no changes needed
