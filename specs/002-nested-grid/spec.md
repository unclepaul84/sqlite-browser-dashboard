# Feature Specification: Unlimited Nested Grid Levels

**Feature Branch**: `002-nested-grid`  
**Created**: 2025-10-31  
**Status**: Draft  
**Input**: User description: "support any number of levels of parent/child relationship in data grids"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Configure Multi-Level Parent-Child Relationships (Priority: P1)

Users configure dashboard items with `parent` field references that chain together, creating hierarchies of arbitrary depth (e.g., Customers → Orders → Line Items → Product Details → Supplier Info).

**Why this priority**: Foundation for nested drill-down - without proper configuration support, users cannot define multi-level hierarchies.

**Independent Test**: Create `index.json` with 5 dashboard items where each references the previous as parent (A → B → C → D → E), load dashboard, verify configuration validates without errors.

**Acceptance Scenarios**:

1. **Given** dashboard item B has `parent: "A"`, item C has `parent: "B"`, item D has `parent: "C"`, **When** configuration validates, **Then** ConfigValidator accepts chained parent references without errors
2. **Given** item E has `parent: "D"` creating 5-level hierarchy, **When** validation runs, **Then** no depth limit errors occur
3. **Given** circular reference exists (A → B → C → A), **When** ConfigValidator runs, **Then** error displays "Circular parent reference detected in chain: A → B → C → A"
4. **Given** parent reference to non-existent item, **When** validating, **Then** error displays "Parent item '{name}' not found"

---

### User Story 2 - Render Nested Grids Dynamically (Priority: P1)

Users click rows in parent grids to dynamically generate child grids at any level, with each child grid appearing indented below its parent row, creating a visual hierarchy.

**Why this priority**: Core functionality - enables users to explore hierarchical data through progressive disclosure.

**Independent Test**: Configure 3-level hierarchy (Customers → Orders → Line Items), click customer row, verify orders grid appears; click order row, verify line items grid appears indented further.

**Acceptance Scenarios**:

1. **Given** 3-level hierarchy configured, **When** clicking level 1 row, **Then** level 2 child grid renders in container `{parentGridId}_visualization_container_children`
2. **Given** level 2 grid rendered, **When** clicking level 2 row, **Then** level 3 child grid renders in nested container with additional indentation
3. **Given** multiple child grids at same level, **When** clicking different parent rows, **Then** each child grid has unique container ID including parent row index
4. **Given** user clicks parent row again, **When** row already expanded, **Then** child grids collapse and container clears
5. **Given** multiple child containers exist, **When** user clicks a new parent row, **Then** newly created child container moves to the top of the children list for better visibility

---

### User Story 3 - Template Variable Substitution Through Hierarchy (Priority: P1)

Users define child queries with template variables (`${column_name}`) that substitute values from clicked parent rows, with variables resolved from the immediate parent row data at each level.

**Why this priority**: Essential for drill-down queries - each level needs to filter data based on parent selection.

**Independent Test**: Configure hierarchy where level 2 query uses `${customer_id}` and level 3 uses `${order_id}`, click through levels, verify SQL queries execute with correct substituted values.

**Acceptance Scenarios**:

1. **Given** child query contains `${customer_id}`, **When** parent row clicked, **Then** replaceStringTemplateValues() substitutes value from clicked row data
2. **Given** grandchild query contains `${order_id}`, **When** child row clicked, **Then** template substitution uses child row data (not original grandparent row)
3. **Given** child title contains `${variable}`, **When** rendering child grid, **Then** title also receives template substitution from parent row
4. **Given** missing variable in parent row, **When** substitution attempts, **Then** variable remains as literal text or empty string (no crash)

---

### User Story 4 - Visual Hierarchy with Indentation (Priority: P2)

Users see clear visual distinction between hierarchy levels through progressive indentation, with each nested level indented more than its parent.

**Why this priority**: Improves usability by making parent-child relationships visually obvious.

**Independent Test**: Expand 4-level hierarchy, verify each level has increasing left margin/padding (e.g., 0px, 20px, 40px, 60px).

**Acceptance Scenarios**:

1. **Given** child grid at level N, **When** rendering container, **Then** CSS applies `margin-left: N * 20px` or equivalent indentation
2. **Given** nested containers created, **When** multiple levels expanded, **Then** visual hierarchy clearly shows parent-child relationships
3. **Given** long hierarchy chain, **When** deeply nested grids render, **Then** page layout remains usable (horizontal scroll if needed)

---

### User Story 5 - Collapse/Expand Nested Grids (Priority: P2)

Users can close nested grids using a close button (×) displayed at the top-right of each nested container, collapsing entire subtrees when clicked.

**Why this priority**: Essential for managing screen space when exploring deep hierarchies.

**Independent Test**: Click row to expand 3-level hierarchy, click close button (×) on any level, verify that level and all descendant grids collapse.

**Acceptance Scenarios**:

1. **Given** parent row expanded with children visible, **When** user clicks close button (×), **Then** all child containers clear and grids destroyed
2. **Given** 3-level hierarchy expanded, **When** clicking × on level 1, **Then** both level 2 and level 3 grids collapse
3. **Given** multiple parent rows expanded, **When** closing one, **Then** other parent's children remain visible
4. **Given** collapsed parent row, **When** clicking row again, **Then** child grids re-render with fresh queries
5. **Given** nested container rendered, **When** user sees UI, **Then** close button (×) is visible in top-right corner with red background

---

### User Story 6 - Performance with Deep Hierarchies (Priority: P2)

Users expand hierarchies with 5+ levels without browser lag or memory issues, with grid rendering optimized for nested structures.

**Why this priority**: Ensures feature remains usable for complex data models with many relationship levels.

**Independent Test**: Configure 7-level hierarchy, expand all levels with 100 rows per grid, verify page remains responsive and memory usage stays reasonable.

**Acceptance Scenarios**:

1. **Given** 5+ level hierarchy, **When** expanding each level progressively, **Then** grid rendering completes in <500ms per level
2. **Given** deeply nested grids with large datasets, **When** scrolling and filtering, **Then** Tabulator virtual DOM handles rendering efficiently
3. **Given** memory constraints, **When** collapsing parent grids, **Then** Tabulator instances destroyed and memory released
4. **Given** 1000+ total rows across all nested levels, **When** interacting, **Then** browser remains responsive

---

### User Story 7 - Export Nested Grid Data (Priority: P3)

Users export individual child grids at any level to CSV, with export scoped to the specific child grid (not entire hierarchy).

**Why this priority**: Allows data extraction from specific levels of the hierarchy for analysis.

**Independent Test**: Expand 3-level hierarchy, click export on level 2 grid, verify CSV contains only level 2 data.

**Acceptance Scenarios**:

1. **Given** child grid at any level, **When** user clicks Export link, **Then** Tabulator downloads CSV for that specific grid only
2. **Given** nested grid with filters applied, **When** exporting, **Then** CSV reflects filtered data
3. **Given** multiple child grids visible, **When** exporting one, **Then** other grids unaffected

---

### User Story 8 - Configuration Validation for Nested Hierarchies (Priority: P1)

System validates parent-child chains at configuration load time, detecting circular references, missing parents, and invalid hierarchy structures before rendering any grids.

**Why this priority**: Prevents runtime errors and provides clear feedback on configuration issues.

**Independent Test**: Create configuration with circular reference, load dashboard, verify validation error displays before any grids render.

**Acceptance Scenarios**:

1. **Given** circular parent chain (A → B → C → A), **When** ConfigValidator checks hierarchy, **Then** error: "Circular parent reference detected in chain: [chain display]"
2. **Given** orphaned parent reference, **When** validating, **Then** error: "Parent item '{name}' not found for item '{childName}'"
3. **Given** valid multi-level hierarchy, **When** validation runs, **Then** no errors and dashboard items marked as templated correctly
4. **Given** max depth exceeded (e.g., 10+ levels), **When** validating, **Then** warning displayed but rendering proceeds

---

### Edge Cases

- **What happens when circular references exist?** → ConfigValidator detects cycles during validation, displays error toast with chain details, halts rendering
- **How does system handle 10+ level hierarchies?** → No hard limit enforced; performance may degrade with excessive depth; consider warning at 10+ levels
- **What if parent row data missing required template variable?** → Substitution leaves variable as-is or empty; query may fail if SQL expects value
- **How are duplicate child containers prevented?** → Container IDs include parent grid ID + row index, ensuring uniqueness
- **What happens when clicking parent row while child query is executing?** → Row click expands children; loading indicator shows during query execution
- **How does system handle deeply nested grids with horizontal overflow?** → Container uses CSS to allow horizontal scroll while maintaining hierarchy visibility
- **What if user rapidly clicks multiple parent rows?** → Each click generates separate child containers; previous children remain until explicitly closed via × button
- **How are child grids tracked for cleanup?** → Each nested container has unique ID; close button removes entire container and all descendant grids
- **What happens when parent grid filters and row indices change?** → Child containers tied to specific row data (not index); re-clicking row regenerates children
- **How do users close nested grids?** → Click red × button at top-right of any nested container to remove that container and all descendants

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST support unlimited depth of parent-child relationships in dashboard item configuration (no arbitrary limits like "2 levels max")
- **FR-002**: ConfigValidator MUST detect circular parent references during validation and display error with full chain visualization
- **FR-003**: System MUST validate all parent references point to existing dashboard items, displaying errors for orphaned references
- **FR-004**: System MUST render child grids dynamically when parent rows clicked, at any hierarchy level
- **FR-005**: Child grid containers MUST be uniquely identified using parent grid ID, row index, and child item title to prevent conflicts
- **FR-006**: System MUST apply progressive indentation to nested grids (e.g., level N has N * 20px left margin)
- **FR-007**: Template variable substitution MUST work at every level, using immediate parent row data for variable resolution
- **FR-008**: System MUST provide close button (×) on each nested container to manually collapse/remove child grids
- **FR-009**: Close button MUST remove entire nested container and all descendant Tabulator instances to free memory
- **FR-010**: System MUST handle rapid parent row clicks, allowing multiple child containers to coexist until explicitly closed
- **FR-011**: System MUST show loading indicator while child queries execute
- **FR-012**: Export functionality MUST work independently for each nested grid at any level
- **FR-013**: System MUST maintain visual hierarchy clarity with CSS styling (borders, backgrounds, indentation)
- **FR-014**: Child queries MUST execute with template variables substituted from parent row data at runtime
- **FR-015**: System MUST mark all items with `parent` field as `templated: true` during initialization
- **FR-016**: Grid row context menus MUST work at all hierarchy levels with correct template variable substitution
- **FR-017**: Close button (×) MUST be visually distinct (red background, positioned top-right) and functional at every nesting level
- **FR-018**: System MUST move newly created child containers to the top of their parent's children list for improved visibility and user focus

### Key Entities

- **Dashboard Item (Enhanced)**: Configuration object defining grid/chart with optional `parent` field for nesting; existing entity extended to support arbitrary depth
- **Parent-Child Chain**: Sequence of dashboard items linked via `parent` references, validated for cycles and completeness
- **Nested Container**: DOM element holding child grids, identified by `{parentGridId}_visualization_container_children_{rowIndex}` or similar pattern
- **Tabulator Instance Hierarchy**: Tree of Tabulator grid instances mirroring parent-child configuration, with lifecycle management for memory cleanup

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can configure hierarchies with 10+ levels without configuration validation errors
- **SC-002**: System detects and reports circular references within 500ms of configuration load
- **SC-003**: Users can expand 5-level hierarchies with 100 rows per level without browser lag (grid renders in <500ms per level)
- **SC-004**: Clicking parent rows to expand children completes within 300ms including query execution and grid rendering
- **SC-005**: Clicking close button (×) removes nested container and frees memory (Tabulator instances destroyed), measurable via browser dev tools
- **SC-006**: Users can export CSV from any nested grid level successfully
- **SC-007**: System handles 1000+ total rows across all visible nested levels while maintaining page responsiveness
- **SC-008**: Template variable substitution works correctly 100% of the time across all hierarchy levels
- **SC-009**: Visual indentation clearly distinguishes hierarchy levels (user testing shows 95%+ can identify parent-child relationships visually)
- **SC-010**: Configuration with circular references fails validation 100% of the time before rendering

## Assumptions *(optional)*

- Existing dashboard configuration schema supports `parent` field (already implemented for 1-level nesting)
- Tabulator library supports destroying instances and creating new ones dynamically
- SQLite WASM queries can execute quickly enough for responsive nested grid rendering (<300ms per query)
- Browser DOM can handle 50+ simultaneous Tabulator instances without performance degradation
- Users will manually manage hierarchy depth (no UI limit enforced beyond configuration validation warnings)
- CSS-based indentation (margin-left) is sufficient for visual hierarchy (no complex tree UI components needed)

## Dependencies *(optional)*

- Existing ConfigValidator.js must be enhanced to detect circular references
- Existing grid rendering logic must be refactored to support recursive child container creation
- Existing template variable substitution must be accessible at all hierarchy levels
- Tabulator library (already vendored) - no version upgrade needed
- No new external dependencies required per Zero-Build Static Architecture principle
