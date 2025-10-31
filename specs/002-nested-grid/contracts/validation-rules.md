# Validation Rules Contract: Unlimited Nested Grid Levels

**Feature**: 002-nested-grid  
**Created**: 2025-10-31  
**Purpose**: Define validation rules for parent-child hierarchy configuration

## Circular Reference Detection Contract

### Algorithm Specification

**Function**: `detectCircularReferences(dashboardItems)`

**Input Contract**:
```typescript
interface DashboardItem {
  title: string;           // Unique identifier
  parent?: string;         // Optional reference to parent item title
  type: "grid" | "chart";
  query: string;
  // ... other fields
}

function detectCircularReferences(
  dashboardItems: DashboardItem[]
): ValidationError[]
```

**Output Contract**:
```typescript
interface ValidationError {
  code: "CIRCULAR_REFERENCE" | "ORPHANED_PARENT" | "DUPLICATE_TITLE";
  message: string;
  itemTitle: string;
  parentChain?: string[];  // For CIRCULAR_REFERENCE errors
  severity: "error";
}
```

**Behavior Contract**:

1. **Circular Reference Detection**:
   ```
   GIVEN dashboard items [A, B, C] where:
     - B.parent = "A"
     - C.parent = "B"
     - A.parent = "C"
   WHEN detectCircularReferences() executes
   THEN return ValidationError {
     code: "CIRCULAR_REFERENCE",
     message: "Circular parent reference detected in chain: A → B → C → A",
     itemTitle: "A",
     parentChain: ["A", "B", "C", "A"],
     severity: "error"
   }
   ```

2. **Orphaned Parent Detection**:
   ```
   GIVEN dashboard items [A, B] where:
     - B.parent = "NonExistent"
   WHEN detectCircularReferences() executes
   THEN return ValidationError {
     code: "ORPHANED_PARENT",
     message: "Parent item 'NonExistent' not found for item 'B'",
     itemTitle: "B",
     severity: "error"
   }
   ```

3. **Valid Hierarchy**:
   ```
   GIVEN dashboard items [A, B, C] where:
     - B.parent = "A"
     - C.parent = "B"
     - No circular references
   WHEN detectCircularReferences() executes
   THEN return [] (empty array - no errors)
   ```

### Implementation Requirements

**Time Complexity**: O(N × D) where:
- N = number of dashboard items
- D = maximum depth of hierarchy

**Space Complexity**: O(D) for visited set per item

**Error Handling**:
- MUST detect ALL circular references (not just first encountered)
- MUST validate each item independently
- MUST build complete parent chain for error messages
- MUST halt rendering if ANY circular reference found

## Validation Error Codes

### Error Code Registry

| Code | Message Template | Severity | Halt Rendering |
|------|------------------|----------|----------------|
| `VAL-CIRCULAR-001` | "Circular parent reference detected in chain: {chain}" | error | Yes |
| `VAL-ORPHAN-002` | "Parent item '{parent}' not found for item '{child}'" | error | Yes |
| `VAL-DUPLICATE-003` | "Duplicate dashboard item title found: '{title}'" | error | Yes |
| `VAL-DEPTH-004` | "Hierarchy depth ({depth}) exceeds recommended limit of 10 levels" | warning | No |

### Error Message Format

**Standard Format**:
```
[VAL-{TYPE}-{NUMBER}] {Human-readable message}

Examples:
[VAL-CIRCULAR-001] Circular parent reference detected in chain: Customers → Orders → Line Items → Customers
[VAL-ORPHAN-002] Parent item 'NonExistent Grid' not found for item 'Child Grid'
[VAL-DEPTH-004] Hierarchy depth (12) exceeds recommended limit of 10 levels
```

**Toast Notification Display**:
- Error severity: Red toast, persistent until dismissed
- Warning severity: Yellow toast, auto-dismiss after 5 seconds
- Multiple errors: Display first 5, then summary "... and N more errors"

## Parent Chain Traversal Contract

### Function Specification

**Function**: `buildParentChain(item, allItems)`

**Input**:
```typescript
function buildParentChain(
  item: DashboardItem,
  allItems: DashboardItem[]
): ParentChain

interface ParentChain {
  chain: string[];          // Ordered from root to current item
  depth: number;            // Length of chain
  isValid: boolean;         // False if circular or orphaned
  error?: ValidationError;  // Present if isValid === false
}
```

**Output Examples**:

1. **Valid Chain**:
   ```javascript
   {
     chain: ["Customers", "Orders", "Line Items"],
     depth: 3,
     isValid: true
   }
   ```

2. **Circular Reference**:
   ```javascript
   {
     chain: ["A", "B", "C", "A"],
     depth: 4,
     isValid: false,
     error: {
       code: "CIRCULAR_REFERENCE",
       message: "Circular parent reference detected in chain: A → B → C → A",
       itemTitle: "A",
       parentChain: ["A", "B", "C", "A"],
       severity: "error"
     }
   }
   ```

3. **Orphaned Parent**:
   ```javascript
   {
     chain: ["Customers", "Orders", "NonExistent"],
     depth: 3,
     isValid: false,
     error: {
       code: "ORPHANED_PARENT",
       message: "Parent item 'NonExistent' not found for item 'Orders'",
       itemTitle: "Orders",
       severity: "error"
     }
   }
   ```

## Depth Limit Contract

### Soft Limit Policy

**Recommended Limit**: 10 levels  
**Enforcement**: Warning only (not error)  
**Rationale**: Performance degradation likely beyond 10 levels, but no hard technical limit

**Validation Behavior**:
```javascript
if (parentChain.depth > 10) {
  warnings.push({
    code: "VAL-DEPTH-004",
    message: `Hierarchy depth (${parentChain.depth}) exceeds recommended limit of 10 levels`,
    itemTitle: item.title,
    severity: "warning"
  });
  // Continue rendering despite warning
}
```

**User Communication**:
- Display warning toast on configuration load
- Log warning to browser console
- Allow users to proceed (no blocking)

## Template Variable Validation

### Variable Substitution Contract

**Function**: `validateTemplateVariables(query, availableColumns)`

**Not implemented in this feature** - template variables validated at runtime during query execution, not during configuration validation. Missing variables result in:
1. Variable remains as literal string `${missing_var}` in query
2. SQLite query may fail if column doesn't exist
3. Error caught and displayed via toast notification

**Future Enhancement Opportunity**: Pre-validate template variables against expected parent query result columns.

## Test Cases

### Required Validation Test Cases

1. **No circular references** (valid multi-level hierarchy):
   ```json
   [
     {"title": "A", "parent": undefined},
     {"title": "B", "parent": "A"},
     {"title": "C", "parent": "B"},
     {"title": "D", "parent": "C"}
   ]
   Expected: [] (no errors)
   ```

2. **Direct circular reference** (A → B → A):
   ```json
   [
     {"title": "A", "parent": "B"},
     {"title": "B", "parent": "A"}
   ]
   Expected: CIRCULAR_REFERENCE error for both A and B
   ```

3. **Indirect circular reference** (A → B → C → A):
   ```json
   [
     {"title": "A", "parent": "C"},
     {"title": "B", "parent": "A"},
     {"title": "C", "parent": "B"}
   ]
   Expected: CIRCULAR_REFERENCE error with full chain
   ```

4. **Orphaned parent reference**:
   ```json
   [
     {"title": "A", "parent": "NonExistent"}
   ]
   Expected: ORPHANED_PARENT error for A
   ```

5. **Multiple independent hierarchies** (valid):
   ```json
   [
     {"title": "Root1", "parent": undefined},
     {"title": "Child1A", "parent": "Root1"},
     {"title": "Root2", "parent": undefined},
     {"title": "Child2A", "parent": "Root2"}
   ]
   Expected: [] (no errors)
   ```

6. **Deep hierarchy (11 levels)** (valid with warning):
   ```json
   [
     {"title": "L1", "parent": undefined},
     {"title": "L2", "parent": "L1"},
     ... (continue to L11)
   ]
   Expected: [] (no errors), warning for depth > 10
   ```

## Performance Requirements

**Validation Performance Contract**:
- Configuration with 50 items, max depth 5: Validate in <100ms
- Configuration with 100 items, max depth 10: Validate in <500ms
- Configuration with 10 items, circular reference: Detect in <50ms

**Memory Contract**:
- Visited set per item: O(D) space where D = depth
- Total memory for validation: O(N × D) worst case
- Release all temporary structures after validation completes

## Backward Compatibility

**Contract**: All existing valid configurations MUST pass validation without changes.

**Test Case**:
```json
// Existing 1-level parent-child (currently supported)
[
  {"title": "Parent", "type": "grid", "query": "SELECT * FROM table1"},
  {"title": "Child", "type": "grid", "query": "SELECT * FROM table2 WHERE id = ${id}", "parent": "Parent"}
]

Expected: PASS (no errors, no warnings)
```

This configuration format remains 100% compatible with the enhanced validator.
