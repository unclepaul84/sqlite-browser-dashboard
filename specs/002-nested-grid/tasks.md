# Tasks: Unlimited Nested Grid Levels

**Input**: Design documents from `/specs/002-nested-grid/`  
**Prerequisites**: plan.md, spec.md, data-model.md, contracts/validation-rules.md, quickstart.md

**Tests**: No automated tests requested (manual browser-based testing per Zero-Build constraint)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, etc.)
- Include exact file paths in descriptions

## Path Conventions

This is a static web application - all paths relative to `/workspaces/sqlite-browser-dashboard/`:
- `index.html` - Main application file
- `js/configValidator.js` - Configuration validation
- `docs/` - Example configurations
- `readme.md` - Project documentation

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare documentation and example configurations for feature development

- [ ] T001 Create example 3-level hierarchy configuration in docs/examples/nested-grid-3-level.json
- [ ] T002 [P] Create example 5-level hierarchy configuration in docs/examples/nested-grid-5-level.json
- [ ] T003 [P] Create test SQLite database with related tables in docs/examples/nested-test.db

**Checkpoint**: Example configurations and test data ready for manual testing

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core validation infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until circular reference detection is complete

- [ ] T004 Read existing ConfigValidator.js to understand current validation structure in js/configValidator.js
- [ ] T005 Add buildParentChain() helper function in js/configValidator.js to traverse parent references and build ancestry chain
- [ ] T006 Add detectCircularReferences() function in js/configValidator.js implementing algorithm from contracts/validation-rules.md

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Configure Multi-Level Parent-Child Relationships (Priority: P1) 🎯 MVP

**Goal**: Enable users to configure hierarchies of arbitrary depth through index.json without validation errors

**Independent Test**: Create index.json with 5 dashboard items chained (A → B → C → D → E), load dashboard, verify no validation errors

### Implementation for User Story 1

- [ ] T007 [US1] Enhance ConfigValidator to accept chained parent references without depth limit in js/configValidator.js
- [ ] T008 [US1] Add validation error for circular references with full chain display in js/configValidator.js
- [ ] T009 [US1] Add validation error for orphaned parent references in js/configValidator.js
- [ ] T010 [US1] Add depth warning (non-blocking) for hierarchies exceeding 10 levels in js/configValidator.js
- [ ] T011 [US1] Update error toast display to show parent chain visualization in index.html

**Manual Test Checklist for US1**:
- [ ] Load docs/examples/nested-grid-5-level.json → No errors
- [ ] Create config with A→B→C→A circular reference → Error displays "Circular parent reference detected in chain: A → B → C → A"
- [ ] Create config with parent: "NonExistent" → Error displays "Parent item 'NonExistent' not found"
- [ ] Create 12-level hierarchy → Warning displays but rendering proceeds

**Checkpoint**: At this point, configuration validation for unlimited hierarchies is fully functional

---

## Phase 4: User Story 8 - Configuration Validation for Nested Hierarchies (Priority: P1)

**Goal**: Validate parent-child chains at load time, preventing runtime errors

**Independent Test**: Create configuration with circular reference, load dashboard, verify validation error before any grids render

**Note**: This story builds on US1 validation foundation

### Implementation for User Story 8

- [ ] T012 [US8] Integrate circular reference detection into main validation flow in js/configValidator.js
- [ ] T013 [US8] Ensure validation runs before any grid rendering in index.html
- [ ] T014 [US8] Mark all items with parent field as templated:true during initialization in index.html
- [ ] T015 [US8] Add comprehensive validation error messages per contracts/validation-rules.md error codes in js/configValidator.js

**Manual Test Checklist for US8**:
- [ ] Load config with circular reference → No grids render, error toast shows immediately
- [ ] Load valid multi-level config → All items marked templated correctly
- [ ] Load config with orphaned parent → Validation halts, clear error message

**Checkpoint**: Configuration validation is complete and prevents all invalid hierarchies

---

## Phase 5: User Story 2 - Render Nested Grids Dynamically (Priority: P1)

**Goal**: Enable users to click rows and dynamically generate child grids at any level with visual hierarchy

**Independent Test**: Configure 3-level hierarchy (Customers → Orders → Line Items), click customer row, verify orders grid appears; click order row, verify line items appear indented

### Implementation for User Story 2

- [ ] T016 [US2] Locate existing grid row click handler in index.html
- [ ] T017 [US2] Add depth parameter to grid rendering function in index.html
- [ ] T018 [US2] Modify child container ID generation to include parent grid ID + row index in index.html
- [ ] T019 [US2] Implement recursive child grid rendering logic in index.html
- [ ] T020 [US2] Add container creation for nested children at any depth in index.html
- [ ] T021 [US2] Ensure each child grid renders in unique container (prevent duplicates) in index.html

**Manual Test Checklist for US2**:
- [ ] Click level 1 row → Level 2 grid appears
- [ ] Click level 2 row → Level 3 grid appears indented
- [ ] Click different level 1 rows → Multiple level 2 grids render with unique IDs
- [ ] Verify container IDs follow pattern: {parentGridId}_visualization_container_children_{rowIndex}

**Checkpoint**: Dynamic nested grid rendering works at unlimited depth

---

## Phase 6: User Story 3 - Template Variable Substitution Through Hierarchy (Priority: P1)

**Goal**: Enable child queries to use template variables from parent row data at every level

**Independent Test**: Configure hierarchy where level 2 uses ${customer_id} and level 3 uses ${order_id}, click through levels, verify correct SQL execution

### Implementation for User Story 3

- [ ] T022 [US3] Locate existing replaceStringTemplateValues() function in index.html
- [ ] T023 [US3] Ensure template substitution receives immediate parent row data at each level in index.html
- [ ] T024 [US3] Apply template substitution to child query SQL in index.html
- [ ] T025 [US3] Apply template substitution to child grid titles in index.html
- [ ] T026 [US3] Handle missing variables gracefully (leave as literal, no crash) in index.html

**Manual Test Checklist for US3**:
- [ ] Click row with customer_id=123 → Child query executes SELECT ... WHERE customer_id = 123
- [ ] Click child row with order_id=456 → Grandchild query uses order_id=456 (not customer_id from grandparent)
- [ ] Grid title "Orders for ${name}" → Displays actual customer name
- [ ] Missing variable ${nonexistent} → Query executes with literal string or empty (no crash)

**Checkpoint**: Template variable substitution works correctly through all hierarchy levels

---

## Phase 7: User Story 5 - Collapse/Expand Nested Grids (Priority: P2)

**Goal**: Enable users to toggle child grid visibility and free memory by collapsing subtrees

**Independent Test**: Click row to expand 3-level hierarchy, click parent row again, verify all descendant grids collapse

### Implementation for User Story 5

- [ ] T027 [US5] Add expansion state tracking to parent row data in index.html
- [ ] T028 [US5] Detect re-click on expanded parent row in index.html
- [ ] T029 [US5] Implement recursive child container clearing logic in index.html
- [ ] T030 [US5] Destroy all descendant Tabulator instances to free memory in index.html
- [ ] T031 [US5] Maintain global registry of Tabulator instances by container ID in index.html
- [ ] T032 [US5] Ensure collapsing level 1 also collapses levels 2 and 3 (recursive) in index.html
- [ ] T033 [US5] Preserve other parent rows' expanded children when collapsing one in index.html

**Manual Test Checklist for US5**:
- [ ] Expand parent row → Children visible
- [ ] Click same parent row → All children collapse, containers cleared
- [ ] Expand 3 levels, collapse level 1 → Levels 2 and 3 also collapse
- [ ] Expand multiple parents → Collapsing one doesn't affect others
- [ ] Open browser dev tools → Verify memory freed after collapse (Tabulator instances destroyed)

**Checkpoint**: Collapse/expand works correctly with proper memory management

---

## Phase 8: User Story 4 - Visual Hierarchy with Indentation (Priority: P2)

**Goal**: Provide clear visual distinction between hierarchy levels through progressive CSS indentation

**Independent Test**: Expand 4-level hierarchy, verify each level has increasing margin (0px, 20px, 40px, 60px)

### Implementation for User Story 4

- [ ] T034 [US4] Add CSS class for nested grid containers in index.html <style> section
- [ ] T035 [US4] Calculate indentation based on depth level (N * 20px) in index.html
- [ ] T036 [US4] Apply progressive margin-left to child containers in index.html
- [ ] T037 [US4] Add visual styling (borders, backgrounds) to distinguish levels in index.html <style> section
- [ ] T038 [US4] Ensure horizontal scroll works for deeply nested grids in index.html <style> section

**Manual Test Checklist for US4**:
- [ ] Level 1 grid → margin-left: 0px
- [ ] Level 2 grid → margin-left: 20px
- [ ] Level 3 grid → margin-left: 40px
- [ ] Level 4 grid → margin-left: 60px
- [ ] Deep hierarchy → Horizontal scroll bar appears if needed
- [ ] Visual hierarchy clearly shows parent-child relationships

**Checkpoint**: Visual hierarchy with indentation complete

---

## Phase 9: User Story 6 - Performance with Deep Hierarchies (Priority: P2)

**Goal**: Ensure feature remains responsive with 5+ level hierarchies and large datasets

**Independent Test**: Configure 7-level hierarchy, expand all levels with 100 rows per grid, verify page remains responsive

### Implementation for User Story 6

- [ ] T039 [US6] Add query execution state flag to prevent clicks during query in index.html
- [ ] T040 [US6] Ignore row clicks while child query is executing (per FR-011) in index.html
- [ ] T041 [US6] Verify Tabulator virtual DOM handles large nested datasets in index.html
- [ ] T042 [US6] Optimize container creation to avoid DOM thrashing in index.html
- [ ] T043 [US6] Add performance logging for grid render times (optional, dev tools) in index.html

**Manual Test Checklist for US6**:
- [ ] Expand 5-level hierarchy with 100 rows each → Each level renders in <500ms
- [ ] Click row rapidly during query → Second click ignored until first completes
- [ ] Scroll through 1000+ total rows → Page remains responsive
- [ ] Open browser performance tab → Verify no memory leaks, <300ms render times
- [ ] Test with 7-level hierarchy → Warning displays but functionality works

**Checkpoint**: Performance requirements met for deep hierarchies

---

## Phase 10: User Story 7 - Export Nested Grid Data (Priority: P3)

**Goal**: Enable CSV export from individual child grids at any level

**Independent Test**: Expand 3-level hierarchy, click export on level 2 grid, verify CSV contains only level 2 data

### Implementation for User Story 7

- [ ] T044 [US7] Verify existing Tabulator export functionality works for nested grids in index.html
- [ ] T045 [US7] Ensure export link/button available for child grids in index.html
- [ ] T046 [US7] Confirm CSV filename includes grid ID for nested grids in index.html
- [ ] T047 [US7] Test export with filtered nested grid data in index.html

**Manual Test Checklist for US7**:
- [ ] Click export on child grid → CSV downloads with correct data
- [ ] Apply filter to nested grid → Export reflects filtered rows only
- [ ] Export from multiple nested grids → Each CSV is independent
- [ ] CSV filename → Includes grid identifier (e.g., orders_customer123_data.csv)

**Checkpoint**: Export functionality works at all hierarchy levels

---

## Phase 11: Polish & Cross-Cutting Concerns

**Purpose**: Documentation, examples, and final refinements

- [ ] T048 [P] Update readme.md with unlimited nesting feature documentation
- [ ] T049 [P] Add usage examples from quickstart.md to docs/
- [ ] T050 [P] Create troubleshooting section in readme.md for common errors
- [ ] T051 [P] Add performance tips for deep hierarchies to readme.md
- [ ] T052 [P] Document backward compatibility guarantee in readme.md
- [ ] T053 [P] Create visual diagram showing hierarchy example in docs/
- [ ] T054 Run full manual test suite from quickstart.md validation scenarios
- [ ] T055 Performance audit: Test with 10-level hierarchy and verify warnings

**Final Checkpoint**: Feature complete, documented, and tested

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-10)**: All depend on Foundational phase completion
  - US1 (Configuration) → Must complete first (validates configs)
  - US8 (Validation) → Builds on US1 validation foundation
  - US2 (Rendering) → Can start after US1/US8 (needs valid configs)
  - US3 (Template Substitution) → Can start after US2 (needs rendering)
  - US5 (Collapse/Expand) → Depends on US2 (needs rendering infrastructure)
  - US4 (Visual Hierarchy) → Can start after US2 (styling for rendered grids)
  - US6 (Performance) → Can start after US2/US3/US5 (optimizes existing features)
  - US7 (Export) → Can start after US2 (works on rendered grids)
- **Polish (Phase 11)**: Depends on all user stories being complete

### Critical Path (Minimum for MVP)

1. **Phase 1**: Setup (T001-T003)
2. **Phase 2**: Foundational (T004-T006) - Circular reference detection
3. **Phase 3**: US1 Configuration (T007-T011) - Multi-level config support
4. **Phase 4**: US8 Validation (T012-T015) - Complete validation
5. **Phase 5**: US2 Rendering (T016-T021) - Dynamic nested grids
6. **Phase 6**: US3 Template Substitution (T022-T026) - Variable substitution

**Stop here for MVP**: These 6 phases deliver core unlimited nesting functionality

### User Story Dependencies

```
Setup (Phase 1) → Foundational (Phase 2) → US1 + US8 (Config & Validation)
                                             ↓
                                            US2 (Rendering)
                                             ↓
                                    ┌────────┼────────┐
                                    ↓        ↓        ↓
                                  US3      US5      US4
                              (Template) (Collapse) (Visual)
                                    ↓        ↓
                                  US6 (Performance)
                                    ↓
                                  US7 (Export)
```

### Parallel Opportunities Within Phases

**Phase 1 (Setup)**: All tasks can run in parallel (different files)
- T001, T002, T003 can execute simultaneously

**Phase 11 (Polish)**: All documentation tasks marked [P] can run in parallel
- T048, T049, T050, T051, T052, T053 can execute simultaneously

**Within User Stories**: Tasks within each story are sequential (same file modifications)

### Sequential Constraints

- ConfigValidator changes must complete before index.html rendering changes
- Validation (US1/US8) must complete before rendering (US2)
- Rendering must complete before collapse/expand (US5)
- Template substitution (US3) needs rendering infrastructure (US2)

---

## Parallel Example: Documentation Phase

```bash
# Launch all documentation tasks together in Phase 11:
Task: "Update readme.md with unlimited nesting feature documentation"
Task: "Add usage examples from quickstart.md to docs/"
Task: "Create troubleshooting section in readme.md"
Task: "Add performance tips to readme.md"
Task: "Document backward compatibility in readme.md"
Task: "Create visual diagram in docs/"
```

---

## Implementation Strategy

### MVP First (Phases 1-6 Only)

1. **Phase 1**: Setup example configs and test database
2. **Phase 2**: Foundational - Circular reference detection (CRITICAL)
3. **Phase 3**: US1 - Configuration validation for multi-level hierarchies
4. **Phase 4**: US8 - Complete validation integration
5. **Phase 5**: US2 - Dynamic nested grid rendering
6. **Phase 6**: US3 - Template variable substitution
7. **STOP and VALIDATE**: Test all 3-level and 5-level hierarchies manually
8. Deploy/demo if ready

**MVP Delivers**:
- ✅ Configure unlimited depth hierarchies
- ✅ Validation prevents circular references
- ✅ Dynamic rendering at any level
- ✅ Template variables work through hierarchy
- ⚠️ No collapse/expand (use browser refresh to reset)
- ⚠️ No visual indentation (basic layout)
- ⚠️ No performance optimizations

### Full Feature (All Phases)

Continue with:
7. **Phase 7**: US5 - Collapse/expand with memory management
8. **Phase 8**: US4 - Visual hierarchy indentation
9. **Phase 9**: US6 - Performance optimizations
10. **Phase 10**: US7 - Export functionality
11. **Phase 11**: Polish - Documentation and examples

### Incremental Delivery

Each user story adds value without breaking previous stories:

1. **After US1+US8**: Users can configure multi-level hierarchies (validation works)
2. **After US2**: Users can explore hierarchies by clicking rows (rendering works)
3. **After US3**: Child queries filter correctly based on parent selections
4. **After US5**: Users can collapse grids to manage screen space
5. **After US4**: Visual hierarchy makes relationships obvious
6. **After US6**: Performance optimized for deep hierarchies
7. **After US7**: Users can export data from any level

---

## Task Count Summary

- **Total Tasks**: 55
- **Setup Tasks**: 3
- **Foundational Tasks**: 3
- **US1 (Configuration)**: 5 tasks
- **US8 (Validation)**: 4 tasks
- **US2 (Rendering)**: 6 tasks
- **US3 (Template Substitution)**: 5 tasks
- **US5 (Collapse/Expand)**: 7 tasks
- **US4 (Visual Hierarchy)**: 5 tasks
- **US6 (Performance)**: 5 tasks
- **US7 (Export)**: 4 tasks
- **Polish**: 8 tasks

**Parallel Opportunities**: 11 tasks marked [P] (20% can run in parallel)

**MVP Scope**: Phases 1-6 = 26 tasks (47% of total)

---

## Notes

- All tasks reference exact file paths (index.html or js/configValidator.js)
- No automated tests (manual browser testing per Zero-Build constraint)
- Each user story independently testable with manual test checklist
- Backward compatibility maintained (existing 1-level configs continue working)
- No new dependencies required (uses existing Tabulator, jQuery, SQLite WASM)
- Tasks follow strict checklist format: `- [ ] [ID] [P?] [Story?] Description with file path`
