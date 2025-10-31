# Quick Start: Unlimited Nested Grid Levels

**Feature**: 002-nested-grid  
**Audience**: Dashboard creators and users  
**Time to Complete**: 10 minutes

## Overview

This feature extends the SQLite Browser Dashboard to support unlimited levels of parent-child relationships in data grids. You can now create deep hierarchies like Customers → Orders → Line Items → Product Details → Supplier Info through simple configuration changes.

## Prerequisites

- Existing SQLite Browser Dashboard deployment (see main README.md)
- SQLite database with related tables (foreign key relationships)
- Basic understanding of `index.json` configuration format

## 5-Minute Quick Start

### Step 1: Create Multi-Level Hierarchy Configuration

Create an `index.json` with chained parent references:

```json
{
  "datasets": [
    {
      "title": "Sales Database",
      "db_url": "sales.db",
      "dashboard_items_tempate": "Sales Drill-Down"
    }
  ],
  "dashboard_templates": [
    {
      "name": "Sales Drill-Down",
      "dashboard_items": [
        {
          "title": "Customers",
          "type": "grid",
          "query": "SELECT customer_id, name, email FROM customers"
        },
        {
          "title": "Orders",
          "type": "grid",
          "query": "SELECT order_id, order_date, total FROM orders WHERE customer_id = ${customer_id}",
          "parent": "Customers"
        },
        {
          "title": "Line Items",
          "type": "grid",
          "query": "SELECT product_name, quantity, price FROM line_items WHERE order_id = ${order_id}",
          "parent": "Orders"
        },
        {
          "title": "Product Details",
          "type": "grid",
          "query": "SELECT description, category, supplier FROM products WHERE product_name = ${product_name}",
          "parent": "Line Items"
        }
      ]
    }
  ]
}
```

**Key Points**:
- Each child grid references its parent via the `parent` field
- Child queries use `${variable}` template substitution from parent row data
- No depth limit - chain as many levels as needed

### Step 2: Load Dashboard and Explore Hierarchy

1. Navigate to `index.html?url=<config-url>`
2. Select "Sales Database" from dropdown
3. Click a customer row → Orders grid appears below
4. Click an order row → Line Items grid appears indented further
5. Click a line item row → Product Details grid appears even deeper

### Step 3: Collapse Expanded Grids

Click any expanded parent row again to collapse all its child grids and free memory.

## Common Use Cases

### Use Case 1: E-Commerce Order Tracking

**Hierarchy**: Customers → Orders → Line Items → Shipments

```json
{
  "dashboard_items": [
    {
      "title": "Customers",
      "type": "grid",
      "query": "SELECT customer_id, name, total_orders FROM customers ORDER BY total_orders DESC"
    },
    {
      "title": "Orders for Customer",
      "type": "grid",
      "query": "SELECT order_id, order_date, status, total FROM orders WHERE customer_id = ${customer_id} ORDER BY order_date DESC",
      "parent": "Customers"
    },
    {
      "title": "Line Items for Order",
      "type": "grid",
      "query": "SELECT line_item_id, product_name, quantity, unit_price FROM line_items WHERE order_id = ${order_id}",
      "parent": "Orders for Customer"
    },
    {
      "title": "Shipments for Line Item",
      "type": "grid",
      "query": "SELECT tracking_number, carrier, ship_date, status FROM shipments WHERE line_item_id = ${line_item_id}",
      "parent": "Line Items for Order"
    }
  ]
}
```

### Use Case 2: Organizational Hierarchy

**Hierarchy**: Companies → Departments → Teams → Employees

```json
{
  "dashboard_items": [
    {
      "title": "Companies",
      "type": "grid",
      "query": "SELECT company_id, company_name, employee_count FROM companies"
    },
    {
      "title": "Departments",
      "type": "grid",
      "query": "SELECT dept_id, dept_name, manager FROM departments WHERE company_id = ${company_id}",
      "parent": "Companies"
    },
    {
      "title": "Teams",
      "type": "grid",
      "query": "SELECT team_id, team_name, team_lead FROM teams WHERE dept_id = ${dept_id}",
      "parent": "Departments"
    },
    {
      "title": "Team Members",
      "type": "grid",
      "query": "SELECT employee_id, name, role, hire_date FROM employees WHERE team_id = ${team_id}",
      "parent": "Teams"
    }
  ]
}
```

### Use Case 3: Software Development Project Tracking

**Hierarchy**: Projects → Milestones → Tasks → Subtasks → Time Entries

```json
{
  "dashboard_items": [
    {
      "title": "Projects",
      "type": "grid",
      "query": "SELECT project_id, name, status, start_date FROM projects"
    },
    {
      "title": "Milestones",
      "type": "grid",
      "query": "SELECT milestone_id, title, due_date, completion FROM milestones WHERE project_id = ${project_id}",
      "parent": "Projects"
    },
    {
      "title": "Tasks",
      "type": "grid",
      "query": "SELECT task_id, description, assignee, status FROM tasks WHERE milestone_id = ${milestone_id}",
      "parent": "Milestones"
    },
    {
      "title": "Subtasks",
      "type": "grid",
      "query": "SELECT subtask_id, description, completed FROM subtasks WHERE task_id = ${task_id}",
      "parent": "Tasks"
    },
    {
      "title": "Time Entries",
      "type": "grid",
      "query": "SELECT entry_id, user, hours, date FROM time_entries WHERE subtask_id = ${subtask_id}",
      "parent": "Subtasks"
    }
  ]
}
```

## Configuration Best Practices

### 1. Use Descriptive Titles

**Good**:
```json
{"title": "Orders for Customer ${name}", "parent": "Customers"}
```

**Bad**:
```json
{"title": "Grid 2", "parent": "Grid 1"}
```

Template variables in titles help users understand context.

### 2. Design Efficient Queries

**Good**:
```sql
SELECT order_id, order_date, total 
FROM orders 
WHERE customer_id = ${customer_id}
LIMIT 1000
```

**Bad**:
```sql
SELECT * FROM orders  -- No filter, returns all orders
```

Always filter child queries using parent row data.

### 3. Avoid Circular References

**Invalid** (will fail validation):
```json
[
  {"title": "A", "parent": "B"},
  {"title": "B", "parent": "C"},
  {"title": "C", "parent": "A"}  // Circular: A → B → C → A
]
```

**Valid**:
```json
[
  {"title": "A"},
  {"title": "B", "parent": "A"},
  {"title": "C", "parent": "B"}  // Linear: A → B → C
]
```

### 4. Limit Practical Depth

While unlimited depth is supported, consider usability:
- **Good**: 3-5 levels for typical use cases
- **Warning**: 10+ levels (performance may degrade)
- **Extreme**: 20+ levels (not recommended)

## Troubleshooting

### Error: "Circular parent reference detected in chain: A → B → C → A"

**Cause**: Configuration has circular parent references.

**Solution**: Review parent field assignments and ensure no item appears in its own ancestry.

**Example Fix**:
```json
// Before (circular)
{"title": "A", "parent": "C"}
{"title": "B", "parent": "A"}
{"title": "C", "parent": "B"}

// After (linear)
{"title": "A"}
{"title": "B", "parent": "A"}
{"title": "C", "parent": "B"}
```

### Error: "Parent item 'XYZ' not found for item 'ABC'"

**Cause**: Parent reference points to non-existent dashboard item.

**Solution**: Verify parent title matches exactly (case-sensitive).

**Example Fix**:
```json
// Before (typo in parent)
{"title": "Orders", "parent": "Costumers"}  // Typo: "Costumers"

// After (correct)
{"title": "Orders", "parent": "Customers"}  // Matches parent title exactly
```

### Warning: "Hierarchy depth (12) exceeds recommended limit of 10 levels"

**Cause**: Configuration has very deep hierarchy.

**Solution**: This is a warning, not an error. Dashboard will still work, but consider:
1. Simplifying hierarchy if possible
2. Testing performance with real data
3. Monitoring browser memory usage

### Child grid not appearing when row clicked

**Possible Causes**:
1. **Query returns no results**: Check SQL syntax and template variables
2. **Template variable missing**: Ensure parent query returns columns used in child query
3. **Query executing**: Click ignored while previous query running (wait for completion)

**Debug Steps**:
1. Open browser console (F12)
2. Look for SQL errors or template substitution issues
3. Verify parent row contains expected column names

## Performance Tips

### 1. Use Indexes in SQLite Database

```sql
-- Add indexes on foreign key columns
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_line_items_order_id ON line_items(order_id);
CREATE INDEX idx_products_name ON products(product_name);
```

Indexes dramatically improve child query performance.

### 2. Limit Result Sets

```json
{
  "query": "SELECT * FROM orders WHERE customer_id = ${customer_id} LIMIT 100"
}
```

Prevent queries from returning thousands of rows per child grid.

### 3. Collapse Unused Grids

Click expanded parent rows to collapse child grids when done exploring. This frees browser memory.

### 4. Monitor Memory Usage

For deep hierarchies:
1. Open browser dev tools → Performance/Memory tab
2. Expand multiple levels
3. Check memory usage
4. Collapse parents and verify memory released

## Advanced Configuration

### Dynamic Titles with Template Variables

```json
{
  "title": "Orders for ${name} (Customer #${customer_id})",
  "parent": "Customers",
  "query": "SELECT order_id, order_date, total FROM orders WHERE customer_id = ${customer_id}"
}
```

Title updates dynamically based on clicked parent row.

### Mixing Charts and Grids

```json
{
  "dashboard_items": [
    {"title": "Customers", "type": "grid", "query": "..."},
    {"title": "Order Trend", "type": "chart", "chartType": "line", "parent": "Customers", "query": "SELECT order_date, SUM(total) as revenue FROM orders WHERE customer_id = ${customer_id} GROUP BY order_date"}
  ]
}
```

Charts can be children of grids (visualize parent row data).

### Row Context Menus at All Levels

```json
{
  "title": "Line Items",
  "parent": "Orders",
  "grid_row_menus": [
    {
      "label": "View Product in Catalog",
      "url": "https://catalog.example.com/product/${product_id}"
    }
  ]
}
```

Context menus work at every nesting level with proper variable substitution.

## Next Steps

- Read [data-model.md](./data-model.md) for detailed configuration schema
- Review [validation-rules.md](./contracts/validation-rules.md) for error reference
- See main README.md for deployment instructions

## Support

For issues or questions:
1. Check browser console for error messages
2. Verify configuration against examples above
3. Review validation errors displayed in toast notifications
