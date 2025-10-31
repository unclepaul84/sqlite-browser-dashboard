# Feature Specification: SQLite Browser Dashboard

**Feature Branch**: `001-sqlite-dashboard-spec`  
**Created**: 2025-10-31  
**Status**: Documentation (Existing Implementation)  
**Input**: "Extract current SQLite browser dashboard functionality into specification"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Configure and Load Dashboard from JSON (Priority: P1)

Users configure dashboards by creating a JSON file that defines datasets (SQLite database URLs) and dashboard templates (queries and visualizations), then load the dashboard by providing a `?url=` parameter pointing to the configuration directory.

**Why this priority**: Foundation for all other functionality - without configuration loading, no dashboards can be displayed.

**Independent Test**: Create `index.json` with one dataset and template, host on HTTP server, navigate to `index.html?url=http://localhost:8000`, verify dataset dropdown populates and dashboard loads without errors.

**Acceptance Scenarios**:

1. **Given** valid `index.json` at URL, **When** user navigates to `index.html?url=<config-url>`, **Then** configuration loads, validates, and dataset dropdown populates
2. **Given** invalid JSON schema, **When** configuration loads, **Then** validation errors display via toast notifications listing all failures
3. **Given** missing `?url=` parameter, **When** page loads, **Then** error toast displays "must provide [?url=<your_url>] query parameter!"
4. **Given** configuration with duplicate dashboard item titles, **When** validation runs, **Then** error toast shows "Duplicate dashboard item title found: {title}"

---

### User Story 2 - Load SQLite Database and Execute Queries (Priority: P1)

Users select a dataset from the dropdown to load its SQLite database into browser memory via WASM, then execute SQL queries defined in the dashboard template to populate grids and charts.

**Why this priority**: Core data access functionality - enables all visualizations and interactions.

**Independent Test**: Select dataset from dropdown, verify database loads into WASM, verify configured queries execute automatically and populate visualization containers.

**Acceptance Scenarios**:

1. **Given** dataset selected, **When** loading initiated, **Then** SQLite database fetches via HTTP with cache-busting (`?date=${new Date()}`), deserializes into WASM memory
2. **Given** database loaded, **When** dashboard template queries execute, **Then** SQL runs client-side via `db.exec({sql, rowMode: "object", resultRows})` without server calls
3. **Given** database URL returns 404, **When** fetch fails, **Then** error toast displays "error loading sql database from {url}: {error}"
4. **Given** relative db_url in config, **When** loading database, **Then** path resolves relative to config_source_path

---

### User Story 3 - Interactive Data Grids with Filtering and Sorting (Priority: P1)

Users view query results in interactive Tabulator grids that support column sorting (click headers), live filtering (header input boxes), auto-detection of numeric vs. string columns, and display row counts.

**Why this priority**: Primary data exploration interface - users spend most time interacting with grids.

**Independent Test**: Load dashboard with grid, click column header to sort, type in header filter box, verify rows filter in real-time, verify row count updates.

**Acceptance Scenarios**:

1. **Given** query results displayed in grid, **When** user clicks column header, **Then** data sorts ascending/descending with visual indicator
2. **Given** grid rendered, **When** user types in header filter input, **Then** rows filter in real-time (local filtering, no server calls)
3. **Given** query returns results, **When** grid builds, **Then** system auto-detects numeric columns (first 10 rows sampled) and applies number sorter
4. **Given** grid populated, **When** rendering complete, **Then** row count displays in tag (e.g., "42 rows")

---

### User Story 4 - Export Grid Data (Priority: P2)

Users export filtered grid data to CSV format by clicking the "Export" link, with the filename automatically generated from the grid ID.

**Why this priority**: Common workflow for sharing or further analyzing data outside the dashboard.

**Independent Test**: Filter grid to subset of rows, click Export link, verify CSV downloads containing only filtered rows with correct columns.

**Acceptance Scenarios**:

1. **Given** grid with data displayed, **When** user clicks Export link, **Then** Tabulator downloads CSV file named `{gridId}_data.csv`
2. **Given** grid has active filters, **When** user exports, **Then** only filtered rows included in CSV
3. **Given** grid has sorted data, **When** user exports, **Then** export reflects current sort order

---

### User Story 5 - Data Visualization with Charts (Priority: P2)

Users visualize query results as charts (bar, line, pie, doughnut) configured in the dashboard template with xField (labels) and yField (values), rendered using Chart.js with auto-generated color palettes.

**Why this priority**: Provides visual analysis beyond raw tabular data, essential for trend/distribution insights.

**Independent Test**: Configure chart dashboard item with type "chart", chartType "bar", query returning two columns, verify chart renders with correct data mapping.

**Acceptance Scenarios**:

1. **Given** dashboard item type is "chart", **When** query executes, **Then** createChart() extracts config.options.xField for labels and config.options.yField for values
2. **Given** chart data prepared, **When** rendering, **Then** Chart.js creates canvas element, applies chartType (bar/line/pie/doughnut), and generates color palette via HSL hash algorithm
3. **Given** chart rendered, **When** user hovers data point, **Then** tooltip shows label and value
4. **Given** chart configured with options.title, **When** chart renders, **Then** dataset label displays title

---

### User Story 6 - Parent-Child Drill-Down Grids (Priority: P2)

Users click a row in a parent grid to dynamically generate child grids below it, with child queries using template variable substitution (`${column_name}`) from the clicked row's data.

**Why this priority**: Enables hierarchical data exploration (e.g., click customer → see orders, click order → see line items).

**Independent Test**: Configure parent grid and child grid with `parent: "Parent Grid Title"` and templated query using `${id}`, click parent row, verify child grid appears with substituted query.

**Acceptance Scenarios**:

1. **Given** dashboard item has `parent` field matching another item's title, **When** parent grid renders, **Then** child item marked as templated and not initially displayed
2. **Given** parent grid row clicked, **When** rowClick event fires, **Then** child grids for that parent generated in `{parentGridId}_visualization_container_children` div
3. **Given** child query contains `${variable}`, **When** child grid builds, **Then** replaceStringTemplateValues() substitutes values from clicked row data
4. **Given** child grid title contains `${variable}`, **When** rendering, **Then** title also uses template substitution (e.g., "Orders for ${customer_name}")

---

### User Story 7 - Markdown and Mermaid Rendering in Cells (Priority: P3)

Users include markdown-formatted text or Mermaid diagram syntax in query result columns, which automatically render as formatted HTML or interactive diagrams when column names end with `_md` or `_mermaid`.

**Why this priority**: Enhances documentation capabilities and visual explanation within data grids.

**Independent Test**: Query table with column `description_md` containing markdown, verify Marked.js renders bold/italic/links; query with column `diagram_mermaid` containing Mermaid syntax, verify diagram renders.

**Acceptance Scenarios**:

1. **Given** column name ends with "_md", **When** grid renders, **Then** markdown_formatter applies marked.parse() to cell values
2. **Given** column name ends with "_mermaid", **When** grid renders, **Then** mermaid_formatter wraps value in `<span class="mermaidCell">` and calls mermaid.run() after render
3. **Given** column doesn't match special suffix, **When** grid renders, **Then** value displays as plain text

---

### User Story 8 - Context Menu Actions on Grid Rows (Priority: P3)

Users right-click grid rows to access custom menu actions that open URLs with template variable substitution, enabling integration with external systems (e.g., "View in Admin" → `https://admin.example.com/user/${user_id}`).

**Why this priority**: Provides workflow integration and navigation to related systems.

**Independent Test**: Configure grid_row_menus with label and URL template, right-click row, verify menu appears, click action, verify new tab opens with substituted URL.

**Acceptance Scenarios**:

1. **Given** dashboard item has grid_row_menus array, **When** grid renders, **Then** Tabulator rowContextMenu configured with menu items
2. **Given** user right-clicks row, **When** menu displays, **Then** each menu item shows configured label
3. **Given** user clicks menu item, **When** action executes, **Then** replaceStringTemplateValues() substitutes row data into URL template and window.open() navigates to it in new tab

---

### User Story 9 - Custom SQL Query Interface (Priority: P3)

Users click "Custom Query" button to open a modal where they can write and execute arbitrary SQL queries against the loaded database, with results displayed in a filterable grid.

**Why this priority**: Power user feature for ad-hoc data exploration beyond pre-configured dashboards.

**Independent Test**: Click "Custom Query" button, enter `SELECT * FROM sqlite_master`, click Run, verify tables list in grid.

**Acceptance Scenarios**:

1. **Given** dataset loaded, **When** user clicks "Custom Query" button, **Then** modal displays with textarea and Run button
2. **Given** user enters SQL query, **When** clicking Run, **Then** queryAndBuildGrid() executes query against window.current_db and displays results
3. **Given** invalid SQL syntax, **When** query executes, **Then** SQLite error caught and displayed via toast notification
4. **Given** double-click on dashboard grid title, **When** event fires, **Then** custom query modal opens with pre-filled query from title attribute

---

### User Story 10 - Database Schema Viewer with ER Diagram (Priority: P3)

Users click "Database Schema" button to view an automatically generated entity-relationship diagram using Mermaid, showing tables, columns, data types, primary keys, and foreign key relationships.

**Why this priority**: Helps users understand database structure for writing queries and understanding relationships.

**Independent Test**: Click "Database Schema" button, verify modal opens with Mermaid ER diagram showing tables and relationships.

**Acceptance Scenarios**:

1. **Given** database loaded, **When** user clicks "Database Schema" button, **Then** generateERDiagram() queries sqlite_master and pragma_table_info/pragma_foreign_key_list
2. **Given** schema data collected, **When** generating Mermaid markup, **Then** each table becomes entity with columns listed (datatype, name, PK marker)
3. **Given** foreign keys found, **When** generating relationships, **Then** Mermaid relationship syntax added (`}o--||`) connecting tables
4. **Given** Mermaid markup complete, **When** modal displays, **Then** mermaid.init() renders interactive diagram

---

### User Story 11 - Documentation Sidebar from Markdown (Priority: P3)

Users configure a `documentation_url` in the dashboard template to display rendered markdown documentation in a collapsible sidebar above the grids, fetched from the same base URL as the configuration.

**Why this priority**: Provides context and instructions for dashboard users without leaving the interface.

**Independent Test**: Add `documentation_url: "readme.md"` to template, create markdown file at config URL, load dashboard, verify markdown renders in documentation div.

**Acceptance Scenarios**:

1. **Given** template has documentation_url, **When** dataset loads, **Then** loadDocumentation() fetches markdown file (relative to config_source_path if no "/" in URL)
2. **Given** markdown fetched successfully, **When** parsing, **Then** marked.parse() converts to HTML and displays in #documentation div
3. **Given** fetch fails (404), **When** error occurs, **Then** toast displays "Error loading documentation file from {url}: {statusText}"
4. **Given** no documentation_url in template, **When** checking, **Then** #documentation div remains hidden

---

### User Story 12 - Hash-Based Dataset Routing (Priority: P2)

Users navigate directly to a specific dataset using URL hash (e.g., `#dataset/DatasetName`), enabling bookmarking and sharing of specific dashboard views.

**Why this priority**: Improves user experience by supporting direct linking and browser back/forward navigation.

**Independent Test**: Navigate to `index.html?url=...#dataset/MyDataset`, verify MyDataset loads automatically without dropdown interaction.

**Acceptance Scenarios**:

1. **Given** URL contains hash `#dataset/{name}`, **When** page loads, **Then** routie router triggers dataset load
2. **Given** dataset name in hash, **When** routing function executes, **Then** finds dataset in json.datasets array and calls loadDataSet()
3. **Given** invalid dataset name in hash, **When** lookup fails, **Then** toast displays "Dataset '{name}' not found"
4. **Given** user selects dataset from dropdown, **When** change event fires, **Then** window.location.hash updates to `#dataset/{selectedValue}`

---

### Edge Cases

- **What happens when index.json returns 404?** → Error toast displays "Error loading config file from {url}: {statusText}"
- **How does system handle CORS errors?** → Fetch fails, error toast shows network error; documentation should guide CORS configuration
- **What if SQLite database is malformed?** → sqlite3_deserialize fails, error caught in loadSqliteFile catch block, toast displays error
- **How are large result sets handled?** → Tabulator virtual scrolling renders only visible rows, maxHeight: "600px" limits grid size
- **What happens when query returns no rows?** → Empty grid displays with column headers, row count shows 0
- **What if query syntax is invalid?** → db.exec() throws error, caught by try-catch in custom query, toast displays SQLite error message
- **How are duplicate template names handled?** → ConfigValidator detects duplicates and adds error "Duplicate template name '{name}'"
- **What if parent dashboard item doesn't exist?** → ConfigValidator checks parent references, adds error if parent not found in itemTitles set
- **How does cache-busting work?** → All fetches append `?date=${new Date()}` or `?{new Date()}` to URLs to prevent stale cached responses
- **What if chart configuration missing xField/yField?** → ConfigValidator requires these fields for chart type, validation fails with specific error

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST load configuration from `index.json` via HTTP(S) using `?url=` query parameter
- **FR-002**: System MUST validate configuration schema using ConfigValidator class before rendering
- **FR-003**: System MUST display all validation errors via Toastify toast notifications
- **FR-004**: System MUST support datasets array with fields: title, db_url, dashboard_items_tempate
- **FR-005**: System MUST support dashboard_templates array with fields: name, documentation_url (optional), dashboard_items
- **FR-006**: System MUST support dashboard_items with fields: title, type (grid/chart), query, parent (optional), templated (boolean), grid_row_menus (optional), chartType (for charts), options (for charts)
- **FR-007**: System MUST load SQLite databases via HTTP(S) fetch using sqlean.js WASM library
- **FR-008**: System MUST deserialize SQLite database into WASM memory using sqlite3_deserialize
- **FR-009**: System MUST execute SQL queries client-side using db.exec() with rowMode: "object"
- **FR-010**: System MUST render query results in Tabulator grids with auto-detected column types
- **FR-011**: System MUST support column sorting via click on headers
- **FR-012**: System MUST support live filtering via header input boxes (local filtering)
- **FR-013**: System MUST export grid data to CSV via Tabulator download() method
- **FR-014**: System MUST render charts using Chart.js for types: bar, line, pie, doughnut
- **FR-015**: System MUST map chart data from query results using config.options.xField and config.options.yField
- **FR-016**: System MUST generate color palettes for charts using HSL hash algorithm (generateRandomColors)
- **FR-017**: System MUST support parent-child grid relationships via parent field and templated boolean
- **FR-018**: System MUST substitute template variables using `${column_name}` syntax via replaceStringTemplateValues()
- **FR-019**: System MUST render markdown in cells when column names end with "_md" using Marked.js
- **FR-020**: System MUST render Mermaid diagrams in cells when column names end with "_mermaid"
- **FR-021**: System MUST support right-click context menus on grid rows via grid_row_menus configuration
- **FR-022**: System MUST open menu action URLs in new tabs with template variable substitution
- **FR-023**: System MUST provide custom query modal with textarea, Run button, and "Show Tables"/"Show All Fields" helpers
- **FR-024**: System MUST execute custom queries against window.current_db and display in grid
- **FR-025**: System MUST generate ER diagrams from database schema using Mermaid via generateERDiagram()
- **FR-026**: System MUST fetch and render markdown documentation from template.documentation_url
- **FR-027**: System MUST use hash-based routing via Routie for dataset navigation
- **FR-028**: System MUST update URL hash when dataset selected from dropdown
- **FR-029**: System MUST append cache-busting timestamps to all HTTP fetches
- **FR-030**: System MUST resolve relative URLs (db_url, documentation_url) against config_source_path
- **FR-031**: System MUST show/hide loading spinner during async operations
- **FR-032**: System MUST update document.title to dataset.title when dataset loads
- **FR-033**: System MUST display row counts for all grids and charts
- **FR-034**: System MUST store SQL query in grid title attribute for accessibility
- **FR-035**: System MUST support double-click on grid title to open custom query with pre-filled SQL

### Key Entities *(include if feature involves data)*

- **Configuration**: JSON structure defining datasets and dashboard templates; validated by ConfigValidator; fetched from `?url=` parameter location
- **Dataset**: Entry in configuration datasets array; links SQLite database URL to dashboard template name
- **Dashboard Template**: Named collection of dashboard items and optional documentation; referenced by dataset
- **Dashboard Item**: Individual visualization (grid or chart) with query, type, and rendering options; may have parent-child relationships
- **SQLite Database**: Binary database file loaded via HTTP; deserialized into WASM memory; queried via sqlean.js API
- **Query Result**: Array of row objects returned from db.exec(); rendered in grids or charts
- **Grid**: Tabulator instance displaying query results with sorting, filtering, and export capabilities
- **Chart**: Chart.js instance displaying query results as bar/line/pie/doughnut visualization
- **Grid Row Menu**: Context menu configuration for grid rows enabling external URL navigation
- **Template Variable**: Placeholder in format `${column_name}` substituted with row data values

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can configure new dashboards by editing `index.json` without writing JavaScript code
- **SC-002**: Users can load SQLite databases up to 100MB within 10 seconds on typical broadband connections
- **SC-003**: Users can execute queries returning 10,000+ rows and interact with grids without browser lag
- **SC-004**: Users can sort, filter, and export data in under 1 second for datasets with <5,000 rows
- **SC-005**: System validates configuration and displays all errors within 500ms of file load
- **SC-006**: Users can navigate between datasets using browser back/forward buttons via hash routing
- **SC-007**: System renders charts with correct data mapping for all supported chart types
- **SC-008**: Users can create parent-child drill-down interfaces with up to 3 levels of nesting
- **SC-009**: Users can render markdown and Mermaid diagrams in grid cells without custom code
- **SC-010**: System works offline after initial load (all dependencies vendored, no CDN calls)
- **SC-011**: Users can deploy dashboards to any static file host (GitHub Pages, S3, Netlify, etc.) without server-side components
- **SC-012**: System displays actionable error messages for all failure modes (404, CORS, malformed DB, invalid SQL, schema validation)
