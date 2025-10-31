# Tasks: Tile Widget Dashboard Component

**Input**: Design documents from `/specs/003-tile-widget/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/validation-rules.md

**Tests**: Manual testing approach - no automated test framework in this zero-build static architecture project

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

Repository root structure:
- `index.html` - Main application file
- `js/configValidator.js` - Configuration validation
- `js/ws.css` - Styling
- `docs/examples/` - Example configurations
- `readme.md` - User documentation

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Verify project structure and prepare for implementation

- [x] T001 Verify current branch is `003-tile-widget` and all planning documents exist
- [x] T002 [P] Create example directory structure at `docs/examples/tiles-example/`
- [x] T003 [P] Review existing index.html structure to understand rendering pipeline (lines 340-390)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core validation infrastructure that MUST be complete before ANY user story implementation

**⚠️ CRITICAL**: No user story work can begin until validation rules are in place

- [x] T004 Add TILE-001 validation rule to `js/configValidator.js` - Single tile widget per template
- [x] T005 Add TILE-002 validation rule to `js/configValidator.js` - Tile widget must be first item
- [x] T006 Add TILE-003 validation rule to `js/configValidator.js` - Tiles array not empty
- [x] T007 Add TILE-004 validation rule to `js/configValidator.js` - Tile name required
- [x] T008 Add TILE-005 validation rule to `js/configValidator.js` - Tile query required
- [x] T009 [P] Add TILE-006 validation rule to `js/configValidator.js` - Duplicate tile names (warning)
- [x] T010 [P] Add TILE-007 validation rule to `js/configValidator.js` - Invalid color format (warning)

**Checkpoint**: Validation foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Configure and Render Tile Widget (Priority: P1) 🎯 MVP

**Goal**: Users can configure tile widget as first dashboard item with multiple tiles displaying SQL query results

**Independent Test**: Create `index.json` with tile widget containing 3 tiles with different colors/queries, load dashboard, verify tiles render with correct values and styling

### Implementation for User Story 1

- [x] T011 [US1] Add tile widget type detection in index.html - extend queryAndBuildVisualization() to handle `type: 'tiles'` (around line 346)
- [x] T012 [US1] Create queryAndBuildTileWidget() function in index.html - main tile rendering function
- [x] T013 [US1] Implement extractTileValue() helper in index.html - extract numeric value from query results (first row, first column)
- [x] T014 [US1] Implement formatTileValue() helper in index.html - format numbers with thousands separators using Number.toLocaleString()
- [x] T015 [US1] Implement parallel tile query execution in queryAndBuildTileWidget() - use Promise.all() for all tile queries
- [x] T016 [US1] Implement renderTileContainer() helper in index.html - create main tile widget container with unique ID
- [x] T017 [US1] Implement renderSingleTile() helper in index.html - create individual tile DOM element with name, value, description, color
- [x] T018 [US1] Add tile widget CSS styles in index.html <style> section - flexbox layout, tile card styles, responsive wrapping
- [x] T019 [US1] Add error handling for tile query failures - display "N/A" or error state on affected tile, show toast notification
- [x] T020 [US1] Create sample database at `docs/examples/tiles-example/sample.db` with test tables (orders, customers, products)
- [x] T021 [US1] Create example configuration at `docs/examples/tiles-example/index.json` with 4 tiles showing different query patterns

**Checkpoint**: Tile widget renders with multiple tiles showing query results - User Story 1 complete

---

## Phase 4: User Story 2 - Clickable Tiles with Variable Substitution (Priority: P1) 🎯 MVP

**Goal**: Users can click tiles to filter child grids using ${tile_name} template variable substitution

**Independent Test**: Configure tile widget with 3 tiles and child grid with ${tile_name} query, click tile, verify child grid filters correctly

### Implementation for User Story 2

- [x] T022 [US2] Initialize global tile state variable `window.tile_widget_state` in index.html - store current_tile_name and tile_widget_title
- [x] T023 [US2] Add tile click event handlers in renderSingleTile() - use event delegation on tile container
- [x] T024 [US2] Implement onTileClick() function in index.html - set current_tile_name, find child grids, trigger re-render
- [x] T025 [US2] Extend replaceStringTemplateValues() or create wrapper to support ${tile_name} variable substitution
- [x] T026 [US2] Implement child grid rendering logic for tile parent - find dashboard items with parent matching tile widget title
- [x] T027 [US2] Add active tile visual state in renderSingleTile() - highlight selected tile with border/background change
- [x] T028 [US2] Update example configuration with child grid using ${tile_name} in query at `docs/examples/tiles-example/index.json`

**Checkpoint**: Clicking tiles filters child grids correctly - User Story 2 complete

---

## Phase 5: User Story 3 - Single Tile Widget Enforcement (Priority: P1) 🎯 MVP

**Goal**: System validates tile widget positioning and uniqueness, displaying clear errors

**Independent Test**: Create configs with (a) two tile widgets, (b) tile widget at index 1 - verify validation errors prevent rendering

### Implementation for User Story 3

- [x] T029 [US3] Test TILE-001 validation - create test config with 2 tile widgets, verify error message displays
- [x] T030 [US3] Test TILE-002 validation - create test config with tile widget at index 1, verify error message displays
- [x] T031 [US3] Test TILE-003 validation - create test config with empty tiles array, verify error message displays
- [x] T032 [US3] Verify validation errors halt rendering - ensure no tiles or grids render when validation fails
- [x] T033 [US3] Create test configs for all validation scenarios at `docs/examples/tiles-example/validation-test-configs/`

**Checkpoint**: All validation rules enforced correctly - User Story 3 complete

---

## Phase 6: User Story 4 - Tile Query Execution and Value Display (Priority: P1) 🎯 MVP

**Goal**: Tile queries execute against SQLite database and display numeric results prominently

**Independent Test**: Configure tile with COUNT query, load dataset, verify correct count displays

### Implementation for User Story 4

- [x] T034 [US4] Enhance extractTileValue() to handle multiple columns - use first column value
- [x] T035 [US4] Enhance extractTileValue() to handle multiple rows - use first row, log warning
- [x] T036 [US4] Enhance extractTileValue() to handle NULL/empty results - display "N/A"
- [x] T037 [US4] Enhance extractTileValue() to handle non-numeric values - parse or display as string
- [x] T038 [US4] Enhance formatTileValue() with abbreviation for large numbers (1.2M, 3.4B) - optional based on value size
- [x] T039 [US4] Add query storage in tile element data attribute - store SQL for debugging (similar to grid title attribute)
- [x] T040 [US4] Update example configs with varied query types - COUNT, SUM, AVG, MAX, complex aggregations

**Checkpoint**: All query result patterns handled correctly - User Story 4 complete

---

## Phase 7: User Story 5 - Visual Styling and Layout (Priority: P2)

**Goal**: Tiles display in responsive grid with consistent spacing, clear typography, and interactive hover/active states

**Independent Test**: Configure 6 tiles with varying labels/colors, resize browser, verify responsive wrapping and readability

### Implementation for User Story 5

- [x] T041 [P] [US5] Implement responsive tile layout CSS - flexbox with wrapping, appropriate gaps
- [x] T042 [P] [US5] Add hover effects to tiles in CSS - transform scale, shadow enhancement, cursor pointer
- [x] T043 [P] [US5] Add active/selected tile styling in CSS - highlighted border or background opacity change
- [x] T044 [US5] Implement getContrastTextColor() helper in index.html - WCAG luminance calculation for readable text
- [x] T045 [US5] Apply contrast text color to tiles in renderSingleTile() - use getContrastTextColor() based on background
- [x] T046 [US5] Add typography styling for tile elements - large/bold numeric value, smaller description text
- [x] T047 [US5] Test responsive behavior at mobile widths (320px-768px) - verify 1-2 tiles per row on small screens

**Checkpoint**: Tiles are visually polished and responsive - User Story 5 complete

---

## Phase 8: User Story 6 - Integration with Existing Dashboard Architecture (Priority: P2)

**Goal**: Tile widget integrates seamlessly with grids/charts using existing parent-child patterns

**Independent Test**: Configure dashboard with tile widget, grids, and charts; verify all interactions work correctly

### Implementation for User Story 6

- [x] T048 [US6] Test tile widget with nested child grids (2+ levels deep) - verify template substitution propagates
- [x] T049 [US6] Test tile widget with multiple child grids - verify all children update on tile click
- [x] T050 [US6] Test dataset switching with tile widget - verify queries re-execute and values update
- [x] T051 [US6] Verify loading spinner displays during tile query execution - use existing #loading element
- [x] T052 [US6] Verify error toast notifications work for tile query failures - use existing showErrorToast() function
- [x] T053 [US6] Test custom query modal access to tile queries - verify queries accessible via title attribute
- [x] T054 [US6] Create comprehensive integration example at `docs/examples/tiles-example/full-dashboard.json`

**Checkpoint**: Tile widget fully integrated with existing features - User Story 6 complete

---

## Phase 9: User Story 7 - Configuration Validation for Tiles (Priority: P2)

**Goal**: All tile configuration errors caught at load time with clear error messages

**Independent Test**: Create configs with missing name/query, invalid colors, empty arrays - verify all errors display

### Implementation for User Story 7

- [x] T055 [US7] Test TILE-004 validation - config with missing tile name, verify error displays
- [x] T056 [US7] Test TILE-005 validation - config with missing tile query, verify error displays
- [x] T057 [US7] Test TILE-006 validation - config with duplicate tile names, verify warning displays
- [x] T058 [US7] Test TILE-007 validation - config with invalid color values, verify warning displays with fallback
- [x] T059 [US7] Verify validation messages are user-friendly - include field name, index, specific issue
- [x] T060 [US7] Create validation test suite configs at `docs/examples/tiles-example/validation-tests/` - one file per rule

**Checkpoint**: All validation rules tested and working - User Story 7 complete

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Documentation, examples, and final refinements

- [x] T061 [P] Update `readme.md` with tile widget section - configuration schema, examples, screenshots
- [x] T062 [P] Add tile widget to README features list - include version info (MINOR version bump)
- [x] T063 [P] Document tile widget configuration fields in README - type, title, config.tiles structure
- [x] T064 [P] Add troubleshooting section to README for common tile widget errors
- [ ] T065 Add configuration schema version note in README - recommend schema_version field for forward compatibility
- [x] T066 Review all tile widget code for consistency - naming conventions, error messages, comments
- [x] T067 Add inline code comments to tile widget functions in index.html - explain key logic
- [x] T068 Verify all edge cases from spec are handled - multi-row results, NULL values, non-numeric data, etc.
- [ ] T069 Performance test with 20 tiles - verify <500ms render time goal
- [ ] T070 Test on multiple browsers - Chrome, Firefox, Safari, Edge (if available)
- [ ] T071 Create GIF or screenshots of tile widget in action for documentation
- [ ] T072 Final validation using quickstart.md scenarios - verify all examples work

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup - BLOCKS all user stories
- **User Stories 1-4 (Phases 3-6)**: All depend on Foundational - can proceed in parallel but recommended sequential for MVP
- **User Stories 5-7 (Phases 7-9)**: Depend on Stories 1-4 - build on core functionality
- **Polish (Phase 10)**: Depends on all user stories being complete

### User Story Dependencies

- **US1 (Configure and Render)**: Foundation - NO dependencies on other stories
- **US2 (Clickable Tiles)**: Depends on US1 (tiles must render before they can be clicked)
- **US3 (Validation Enforcement)**: Independent of US1/US2 - tests validation layer
- **US4 (Query Execution)**: Extends US1 - enhances value extraction and formatting
- **US5 (Visual Styling)**: Independent of US1-US4 - purely presentational
- **US6 (Integration)**: Depends on US1 and US2 - tests interaction with existing features
- **US7 (Configuration Validation)**: Independent - tests all validation rules from Phase 2

### Within Each User Story

For User Story 1:
1. T011: Detect tile widget type (entry point)
2. T012-T014: Helper functions (can be parallel)
3. T015-T017: Core rendering logic (depends on helpers)
4. T018: CSS styles (can be parallel with rendering)
5. T019: Error handling (final safety net)
6. T020-T021: Example creation (documentation)

For User Story 2:
1. T022: Initialize global state (required first)
2. T023-T026: Click handling and substitution (sequential logic flow)
3. T027-T028: Visual feedback and examples (final touches)

### Parallel Opportunities

Within Setup (Phase 1):
- T002 and T003 can run in parallel

Within Foundational (Phase 2):
- T009 and T010 (warnings) can run in parallel after errors (T004-T008)

Within User Story 1:
- T012, T013, T014 (helper functions) can run in parallel
- T020 and T021 (examples) can run in parallel

Within User Story 5:
- T041, T042, T043 (CSS rules) can run in parallel

Within User Story 6:
- T048, T049, T050 (different test scenarios) can run in parallel

Within Polish:
- T061, T062, T063, T064 (documentation tasks) can run in parallel

---

## Parallel Example: User Story 1 Core Implementation

```javascript
// These tasks can be implemented in parallel (different functions):
// T012: function queryAndBuildTileWidget(db, di, containerId) { ... }
// T013: function extractTileValue(rows) { ... }
// T014: function formatTileValue(value) { ... }

// Then T015 uses all three:
// T015: Implement parallel query execution using Promise.all()
```

---

## Implementation Strategy

### MVP First (User Stories 1-4 + Foundational)

1. **Phase 1**: Setup (verify structure) - 15 min
2. **Phase 2**: Foundational (all 7 validation rules) - 1-2 hours
3. **Phase 3**: US1 (basic tile rendering) - 2 hours
4. **Phase 4**: US2 (clickable interaction) - 1 hour
5. **Phase 5**: US3 (validation testing) - 30 min
6. **Phase 6**: US4 (query robustness) - 1 hour
7. **STOP and VALIDATE**: Test MVP with real configs
8. **Total MVP Time**: ~5-6 hours

### Incremental Delivery

1. Complete Setup + Foundational → Validation ready
2. Add US1 → Tiles render (MVP Alpha!)
3. Add US2 → Tiles clickable (MVP Beta!)
4. Add US3 → Validation verified (MVP RC1)
5. Add US4 → Query handling robust (MVP Release!)
6. Add US5 → Visual polish (v1.1)
7. Add US6 → Integration tested (v1.2)
8. Add US7 → Validation complete (v1.3)
9. Polish → Documentation (v1.0 Final)

### Parallel Team Strategy

With 2 developers:
1. Both complete Setup + Foundational together (required)
2. Once Foundational done:
   - Developer A: US1 → US2 → US4 (core functionality path)
   - Developer B: US3 → US7 (validation testing path)
3. Both: US5 (visual) → US6 (integration) → Polish

---

## Notes

- All tasks follow zero-build architecture - pure vanilla JS/HTML/CSS
- No automated testing framework - use manual testing with example configs
- Commit after each user story phase completion
- Use browser dev tools for debugging (console, network, elements tabs)
- Test across browsers if possible (Chrome primary, Firefox/Safari secondary)
- Each checkpoint should result in a working, demonstrable increment
- Tile widget is purely additive - existing dashboards continue to work
- Configuration schema is backward compatible (MINOR version bump)

---

## Task Count Summary

- **Setup**: 3 tasks
- **Foundational**: 7 tasks (validation rules)
- **User Story 1**: 11 tasks (rendering)
- **User Story 2**: 7 tasks (interaction)
- **User Story 3**: 5 tasks (validation testing)
- **User Story 4**: 7 tasks (query handling)
- **User Story 5**: 7 tasks (styling)
- **User Story 6**: 7 tasks (integration)
- **User Story 7**: 6 tasks (validation testing)
- **Polish**: 12 tasks (documentation)

**Total**: 72 tasks organized into 10 phases

**MVP Scope** (Phases 1-6): 40 tasks (~5-6 hours)
**Full Feature** (All phases): 72 tasks (~8-10 hours)
