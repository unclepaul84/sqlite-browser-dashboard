# Data Model: Unlimited Nested Grid Levels

**Feature**: 002-nested-grid  
**Created**: 2025-10-31  
**Purpose**: Document configuration schema changes and data structures for unlimited parent-child hierarchy support

## Configuration Schema Changes

### Dashboard Item (Enhanced)

**Existing Structure** (remains backward compatible):
```json
{
  "title": "Grid Title",
  "type": "grid",
  "query": "SELECT * FROM table",
  "parent": "Parent Grid Title",
  "templated": true,
  "grid_row_menus": [...],
  "chartType": "bar",
  "options": {...}
}
```

**Schema Changes**: None - existing `parent` field already supports chaining. This feature removes implicit 1-level depth limit.

### Parent-Child Chain Validation

**New Data Structure** (runtime only, not persisted):

```javascript
{
  "itemTitle": "Orders",
  "parentChain": ["Customers", "Orders"],  // Computed during validation
  "depth": 2,                               // Distance from root
  "hasCircularReference": false,            // Validation result
  "childItems": ["Line Items"]              // Computed reverse mapping
}
```

**Fields**:
- `itemTitle` (string): Dashboard item title being validated
- `parentChain` (string[]): Complete ancestry from root to current item
- `depth` (integer): Number of levels from root (0 = no parent)
- `hasCircularReference` (boolean): True if item appears in its own ancestry
- `childItems` (string[]): Titles of items that reference this item as parent

## Entity Relationships

### Hierarchy Tree

```
Root Grid (no parent)
├── Child Grid A (parent: "Root Grid")
│   ├── Grandchild Grid A1 (parent: "Child Grid A")
│   │   └── Great-Grandchild Grid A1a (parent: "Grandchild Grid A1")
│   └── Grandchild Grid A2 (parent: "Child Grid A")
└── Child Grid B (parent: "Root Grid")
    └── Grandchild Grid B1 (parent: "Child Grid B")
```

**Relationships**:
- Each dashboard item has 0 or 1 parent (via `parent` field)
- Each dashboard item can have 0 to N children (reverse lookup)
- Circular references are invalid (A → B → C → A)
- Multiple root items allowed (items with no parent)
- Orphaned references are invalid (parent references non-existent item)

## Runtime Data Structures

### Nested Container Registry

**Purpose**: Track active Tabulator instances for memory cleanup

```javascript
{
  "parentGridId_rowIndex": {
    "containerElement": HTMLDivElement,
    "tabulatorInstances": [
      { "itemTitle": "Child Grid", "instance": Tabulator, "depth": 2 }
    ],
    "expanded": true,
    "parentRowData": { "customer_id": 123, "name": "Acme Corp" }
  }
}
```

**Fields**:
- `parentGridId_rowIndex` (string): Composite key identifying parent row
- `containerElement` (DOM reference): Child container div
- `tabulatorInstances` (array): All Tabulator grids in this container
- `expanded` (boolean): Current expansion state
- `parentRowData` (object): Row data from parent for template substitution

### Template Variable Context

**Purpose**: Pass parent row data through hierarchy for variable substitution

```javascript
{
  "depth": 3,
  "currentRowData": { "order_id": 456, "customer_id": 123 },
  "ancestorData": [
    { "customer_id": 123, "name": "Acme Corp" },      // Depth 1
    { "order_id": 456, "customer_id": 123 }            // Depth 2
  ]
}
```

**Usage**: When rendering child grid at depth 3, use `currentRowData` for template substitution in query and title.

## Validation Rules

### Circular Reference Detection Algorithm

**Input**: Array of dashboard items from configuration  
**Output**: List of circular reference errors

**Pseudocode**:
```
For each dashboard item:
  Initialize visitedSet = empty
  Initialize currentChain = []
  currentItem = dashboard item
  
  While currentItem has parent:
    If currentItem.title in visitedSet:
      ERROR: "Circular reference detected in chain: " + join(currentChain, " → ")
      Break
    
    Add currentItem.title to visitedSet
    Add currentItem.title to currentChain
    currentItem = find item where title == currentItem.parent
    
    If currentItem not found:
      ERROR: "Parent item '" + parent + "' not found for item '" + child + "'"
      Break
```

**Time Complexity**: O(N × D) where N = number of items, D = max depth  
**Space Complexity**: O(D) for visitedSet and currentChain

### Parent Reference Validation

**Rules**:
1. If `parent` field exists, referenced item MUST exist in same dashboard_items array
2. Parent item MUST NOT create circular reference (detected via algorithm above)
3. Parent item CAN be any type (grid or chart), though charts typically don't have children
4. `templated` field automatically set to `true` for items with `parent` field
5. No hard limit on depth (soft warning at 10+ levels recommended)

## State Transitions

### Grid Expansion States

```
[Collapsed] 
  ↓ (user clicks row)
[Query Executing] ← (ignore clicks while in this state per FR-011)
  ↓ (query completes)
[Expanded with Children]
  ↓ (user clicks same row)
[Collapsing]
  ↓ (destroy Tabulator instances, clear containers)
[Collapsed]
```

**State Guards**:
- Clicks ignored during "Query Executing" state
- Collapse destroys ALL descendant grids (recursive cleanup)
- Expand re-queries database (fresh data, no caching)

## Performance Considerations

### Memory Management

**Problem**: Deep hierarchies with many expanded rows consume browser memory  
**Solution**: 
- Destroy Tabulator instances when parent collapses (call `tabulator.destroy()`)
- Clear DOM containers to release references
- Track instances in registry for cleanup

**Metrics**:
- Tabulator instance size: ~1-5 MB per 1000 rows
- Target: Support 50+ simultaneous instances (5-level hierarchy × 10 expanded rows per level)
- Cleanup latency: <100ms to destroy all descendants

### Rendering Performance

**Problem**: Rendering deep hierarchies synchronously blocks UI  
**Solution**:
- Tabulator virtual DOM handles large datasets efficiently
- Progressive disclosure limits initial render scope
- Each child grid renders independently (no cascade render)

**Metrics**:
- Grid render time: <500ms per level (per SC-003)
- Query execution: <300ms per query (per constraints)
- Total expand latency: <300ms query + render (per SC-004)

## Backward Compatibility

**Existing Configurations**: All existing 1-level parent-child configs remain valid  
**Migration Required**: None - this is a pure capability extension  
**Breaking Changes**: None

**Example**:
```json
// This existing config continues to work unchanged
{
  "dashboard_items": [
    { "title": "Customers", "type": "grid", "query": "SELECT * FROM customers" },
    { "title": "Orders", "type": "grid", "query": "SELECT * FROM orders WHERE customer_id = ${customer_id}", "parent": "Customers" }
  ]
}
```

**New Capability**:
```json
// Users can now extend to unlimited depth
{
  "dashboard_items": [
    { "title": "Customers", "type": "grid", "query": "SELECT * FROM customers" },
    { "title": "Orders", "type": "grid", "query": "SELECT * FROM orders WHERE customer_id = ${customer_id}", "parent": "Customers" },
    { "title": "Line Items", "type": "grid", "query": "SELECT * FROM line_items WHERE order_id = ${order_id}", "parent": "Orders" },
    { "title": "Product Details", "type": "grid", "query": "SELECT * FROM products WHERE product_id = ${product_id}", "parent": "Line Items" }
  ]
}
```

## Assumptions

- Dashboard item titles remain unique within a dataset (enforced by existing validator)
- Parent references use exact title matching (case-sensitive)
- Template variables follow existing `${variable_name}` syntax
- Queries return results fast enough for interactive exploration (<300ms)
- Users will not intentionally create pathological hierarchies (100+ levels)
