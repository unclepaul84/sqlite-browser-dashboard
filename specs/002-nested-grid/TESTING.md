# Manual Testing Guide - Unlimited Nested Grids

## Test Environment Setup

### 1. Start Local Server
```bash
cd /workspaces/sqlite-browser-dashboard
python3 -m http.server 8080
```

### 2. Open Test Configuration
Navigate to: `http://localhost:8080/?url=docs/examples/nested-grid-test-config.json`

## Test Scenarios

### Test 1: Basic 3-Level Nesting
**User Story**: US1 (Configuration), US2 (Rendering), US3 (Template Substitution)

**Steps**:
1. Open test config URL
2. Click on any customer row (e.g., "Acme Corp")
3. **Expected**: "Orders for Acme Corp" grid appears below
4. Click on any order row (e.g., Order #101)
5. **Expected**: "Line Items for Order #101" grid appears below orders
6. Verify template variables substituted correctly in grid titles

**Success Criteria**:
- ✅ Grid titles show customer name from parent row
- ✅ Order query filtered by customer_id
- ✅ Line items query filtered by order_id
- ✅ No JavaScript errors in console

### Test 2: 5-Level Deep Hierarchy
**User Story**: US2 (Unlimited Depth), US3 (Template Chaining)

**Steps**:
1. Click customer → order → line item (e.g., "Widget A")
2. **Expected**: "Product Details: Widget A" grid appears
3. Click on product row
4. **Expected**: "Supplier Info for Parts Unlimited" grid appears
5. Verify all 5 levels visible simultaneously

**Success Criteria**:
- ✅ All 5 levels render without errors
- ✅ Template variables from ancestors accessible (${name}, ${order_id}, ${product_name})
- ✅ Visual indentation increases per level
- ✅ Blue border indicators on nested containers

### Test 3: Multiple Branch Navigation
**User Story**: US2 (Independent Branches)

**Steps**:
1. Click on "Acme Corp" customer
2. Click on "Global Industries" customer (different row)
3. **Expected**: Both customers' orders visible in separate containers
4. Click different orders under each customer
5. **Expected**: Line items appear under respective orders

**Success Criteria**:
- ✅ Multiple branches don't interfere with each other
- ✅ Unique container IDs prevent collisions (check HTML inspect)
- ✅ Correct data displayed in each branch

### Test 4: Re-clicking Parent Row
**User Story**: US8 (Memory Management)

**Steps**:
1. Click customer row to expand orders
2. Click same customer row again
3. **Expected**: Orders container clears and re-renders
4. Check browser memory (F12 → Performance → Memory)

**Success Criteria**:
- ✅ Previous children removed before re-render
- ⚠️ **Known Issue**: Tabulator instances may not be destroyed (Phase 4 pending)
- ✅ No duplicate containers in DOM

### Test 5: Circular Reference Detection
**User Story**: US1 (Validation)

**Steps**:
1. Create test config with circular reference:
```json
{
  "dashboard_items": [
    {"title": "A", "parent": "C", "query": "SELECT 1"},
    {"title": "B", "parent": "A", "query": "SELECT 1"},
    {"title": "C", "parent": "B", "query": "SELECT 1"}
  ]
}
```
2. Load configuration
3. **Expected**: Red toast error appears

**Success Criteria**:
- ✅ Error message: "Circular reference detected: A → B → C → A"
- ✅ Error code: VAL-CIRCULAR-001
- ✅ Configuration load blocked

### Test 6: Orphaned Parent Detection
**User Story**: US1 (Validation)

**Steps**:
1. Create test config with missing parent:
```json
{
  "dashboard_items": [
    {"title": "Orders", "parent": "NonExistentCustomers", "query": "SELECT 1"}
  ]
}
```
2. Load configuration
3. **Expected**: Red toast error appears

**Success Criteria**:
- ✅ Error message: "Parent item 'NonExistentCustomers' not found"
- ✅ Error code: VAL-ORPHAN-002
- ✅ Configuration load blocked

### Test 7: Depth Warning (11 Levels)
**User Story**: US1 (Performance Warning)

**Steps**:
1. Create test config with 11-level hierarchy
2. Load configuration
3. **Expected**: Orange/yellow toast warning appears

**Success Criteria**:
- ✅ Warning message: "Nesting depth 11 exceeds recommended limit (10)"
- ✅ Error code: VAL-DEPTH-004
- ✅ Severity: "warning" (non-blocking)
- ✅ Configuration still loads successfully

### Test 8: Template Variable Chaining
**User Story**: US3 (Multi-Level Substitution)

**Steps**:
1. Navigate to 5th level (Supplier Info)
2. Inspect grid title and query
3. **Expected**: Title includes ${product_name} from level 3 and ${supplier} from level 4

**Success Criteria**:
- ✅ Variables from all ancestor levels available
- ✅ Data context merge: `{customer_id, name, order_id, product_name, supplier}`
- ✅ Query executes with correct parameter values

## Browser Console Checks

### Check for Errors
```javascript
// Open Browser DevTools (F12)
// Navigate through nested grids
// Look for errors in Console tab

// Expected: No errors
// Warnings acceptable: "Tabulator instance not destroyed" (Phase 4 pending)
```

### Inspect Container IDs
```javascript
// After expanding 3 levels, run in console:
document.querySelectorAll('[id*="_row"]').forEach(el => console.log(el.id));

// Expected output pattern:
// grid_Customers_row0_Orders_for_Acme_Corp
// grid_Customers_row0_Orders_for_Acme_Corp_row0_Line_Items_for_Order_101
```

### Check Tabulator Instances
```javascript
// Count active Tabulator instances
document.querySelectorAll('.tabulator').length

// Expected: Number of visible grids
// Warning: May include destroyed instances (Phase 4 will fix)
```

## Performance Testing

### Large Dataset Simulation
**User Story**: US6 (Performance)

**Steps**:
1. Add 100+ customers to database:
```sql
INSERT INTO customers SELECT 
  customer_id + 100,
  'Customer ' || (customer_id + 100),
  'customer' || (customer_id + 100) || '@test.com',
  (customer_id * 5) % 50
FROM customers, (SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4);
```
2. Reload page and expand multiple customers
3. Measure render time (Browser DevTools → Performance)

**Success Criteria**:
- ⏱️ Grid render < 500ms per level (Phase 9 target)
- ⚠️ **Known Issue**: No lazy loading yet (renders all children immediately)

## Known Limitations (To Be Addressed)

### Phase 4 (Memory Management) - NOT YET IMPLEMENTED
- ❌ Tabulator instances not destroyed on re-click
- ❌ No global instance tracking
- ❌ Memory may accumulate with many expansions

### Phase 7 (Collapse/Expand) - NOT YET IMPLEMENTED  
- ❌ No collapse button (must reload page to reset)
- ❌ No "Collapse All" / "Expand All" controls
- ❌ Expand state not persisted

### Phase 8 (Visual Hierarchy) - NOT YET IMPLEMENTED
- ✅ Basic indentation working (20px per level)
- ❌ No breadcrumb trail
- ❌ No depth indicator badges
- ❌ No visual connection lines

### Phase 9 (Performance) - NOT YET IMPLEMENTED
- ❌ No lazy loading (all children render immediately)
- ❌ No query caching
- ❌ No virtual scrolling

### Phase 10 (Export) - NOT YET IMPLEMENTED
- ❌ CSV export only exports current grid (not hierarchy)

## Debugging Tips

### Issue: Grids not appearing
**Check**:
1. Browser console for JavaScript errors
2. Network tab - database file loaded successfully?
3. Query syntax - Run query manually in SQLite to verify

### Issue: Template variables not substituting
**Check**:
1. Field names match exactly (case-sensitive)
2. Parent row data contains expected fields
3. Console log `rowData` in `renderNestedGrids()` to inspect

### Issue: Performance slow
**Check**:
1. Number of rows in query results
2. Number of simultaneously expanded grids
3. Browser memory usage (F12 → Performance Monitor)

## Test Data Reference

### Customers Table
| customer_id | name | email | total_orders |
|-------------|------|-------|--------------|
| 1 | Acme Corp | contact@acme.com | 15 |
| 2 | Global Industries | info@global.com | 8 |
| 3 | Tech Solutions | hello@techsol.com | 23 |

### Expected Hierarchy Paths
```
Acme Corp (customer_id=1)
├── Order #101 (order_id=101, total=$1250.00)
│   ├── Widget A (line_item_id=1, qty=10)
│   │   └── Product: Widget A (Parts Unlimited)
│   │       └── Supplier: Parts Unlimited LLC
│   └── Widget B (line_item_id=2, qty=5)
│       └── Product: Widget B (Parts Unlimited)
│           └── Supplier: Parts Unlimited LLC
└── Order #102 (order_id=102, total=$890.50)
    └── Gadget X (line_item_id=3, qty=3)
        └── Product: Gadget X (Tech Depot)
            └── Supplier: Tech Depot Inc
```

## Success Indicators

✅ **Core MVP Working**:
- Unlimited depth rendering functional
- Circular reference validation prevents invalid configs
- Template variables cascade through all levels
- Visual hierarchy with indentation

⚠️ **Quality Improvements Needed**:
- Memory management (Phase 4)
- Collapse/expand UI (Phase 7)
- Performance optimization (Phase 9)

## Reporting Issues

When reporting test results, include:
1. Browser and version (Chrome, Firefox, Safari, Edge)
2. Test scenario number
3. Expected vs actual behavior
4. Browser console errors (copy/paste)
5. Screenshot of grid hierarchy state
