# Quickstart Guide: SQLite Browser Dashboard

**Feature**: 001-sqlite-dashboard-spec  
**Created**: 2025-10-31  
**Purpose**: Step-by-step guide for deploying and using the SQLite Browser Dashboard

## Prerequisites

- Static file hosting (GitHub Pages, S3, Netlify, or local HTTP server)
- SQLite database file(s)
- Basic understanding of SQL
- Modern web browser (Chrome, Firefox, Safari, Edge)

---

## Quick Start (5 Minutes)

### Step 1: Prepare Your SQLite Database

Create or obtain a SQLite database file:

```bash
# Example: Create a simple test database
sqlite3 test.sqlite <<EOF
CREATE TABLE customers (id INTEGER PRIMARY KEY, name TEXT, email TEXT);
INSERT INTO customers VALUES (1, 'Alice', 'alice@example.com');
INSERT INTO customers VALUES (2, 'Bob', 'bob@example.com');
EOF
```

### Step 2: Create Configuration File

Create `index.json` in the same directory as your database:

```json
{
  "datasets": [
    {
      "title": "Test Database",
      "db_url": "test.sqlite",
      "dashboard_items_tempate": "default_template"
    }
  ],
  "dashboard_templates": [
    {
      "name": "default_template",
      "dashboard_items": [
        {
          "title": "All Customers",
          "query": "SELECT * FROM customers"
        }
      ]
    }
  ]
}
```

### Step 3: Serve Files via HTTP

**Option A: Python (simplest)**
```bash
# In directory containing index.json and test.sqlite
python3 -m http.server 8000
```

**Option B: Node.js (if installed)**
```bash
npx http-server -p 8000
```

**Option C: PHP (if installed)**
```bash
php -S localhost:8000
```

### Step 4: Open Dashboard

Navigate to:
```
http://localhost:8000/path/to/sqlite-browser-dashboard/index.html?url=http://localhost:8000
```

- `index.html` → path to the dashboard HTML file
- `?url=http://localhost:8000` → location of your `index.json`

### Step 5: Select Dataset

1. Page loads with dropdown menu
2. Select "Test Database"
3. Grid displays with customer data
4. Click column headers to sort
5. Type in filter boxes to filter

---

## Deployment Scenarios

### Scenario 1: GitHub Pages (Recommended)

**Advantages**: Free, automatic HTTPS, global CDN, version control

#### Setup

1. **Create Repository for Dashboard**:
```bash
git clone https://github.com/unclepaul84/sqlite-browser-dashboard.git my-dashboard
cd my-dashboard
git remote set-url origin https://github.com/YOUR_USERNAME/my-dashboard.git
git push
```

2. **Enable GitHub Pages**:
   - Go to repository Settings → Pages
   - Source: Deploy from branch `main` (or `master`)
   - Save

3. **Create Data Repository**:
```bash
mkdir my-data
cd my-data
git init
# Copy your SQLite files and index.json here
git add .
git commit -m "Initial data"
git remote add origin https://github.com/YOUR_USERNAME/my-data.git
git push -u origin main
```

4. **Enable GitHub Pages for Data Repo** (same steps as above)

5. **Access Dashboard**:
```
https://YOUR_USERNAME.github.io/my-dashboard/index.html?url=https://YOUR_USERNAME.github.io/my-data
```

#### CORS Configuration

GitHub Pages automatically serves with CORS headers enabled - no configuration needed!

---

### Scenario 2: AWS S3 + CloudFront

**Advantages**: Scalable, fast global delivery, pay-per-use

#### Setup

1. **Create S3 Buckets**:
```bash
# Dashboard bucket
aws s3 mb s3://my-dashboard
aws s3 sync /path/to/sqlite-browser-dashboard s3://my-dashboard --acl public-read

# Data bucket
aws s3 mb s3://my-data
aws s3 cp index.json s3://my-data/index.json --acl public-read
aws s3 cp test.sqlite s3://my-data/test.sqlite --acl public-read
```

2. **Enable Static Website Hosting**:
```bash
aws s3 website s3://my-dashboard --index-document index.html
aws s3 website s3://my-data --index-document index.json
```

3. **Configure CORS on Data Bucket**:

Create `cors.json`:
```json
{
  "CORSRules": [
    {
      "AllowedOrigins": ["*"],
      "AllowedMethods": ["GET"],
      "AllowedHeaders": ["*"],
      "MaxAgeSeconds": 3000
    }
  ]
}
```

Apply:
```bash
aws s3api put-bucket-cors --bucket my-data --cors-configuration file://cors.json
```

4. **Access**:
```
http://my-dashboard.s3-website-us-east-1.amazonaws.com/index.html?url=http://my-data.s3-website-us-east-1.amazonaws.com
```

---

### Scenario 3: Local Development

**Advantages**: Fast iteration, no deployment, private data

#### Setup

```bash
# Directory structure:
/my-project/
  ├── sqlite-browser-dashboard/   # Cloned repo
  │   └── index.html
  ├── data/
  │   ├── index.json
  │   └── database.sqlite
```

**Serve**:
```bash
cd /my-project
python3 -m http.server 8000
```

**Access**:
```
http://localhost:8000/sqlite-browser-dashboard/index.html?url=http://localhost:8000/data
```

---

## Configuration Examples

### Example 1: Single Grid

```json
{
  "datasets": [{"title": "Sales", "db_url": "sales.sqlite", "dashboard_items_tempate": "simple"}],
  "dashboard_templates": [
    {
      "name": "simple",
      "dashboard_items": [
        {"title": "All Sales", "query": "SELECT * FROM sales ORDER BY date DESC"}
      ]
    }
  ]
}
```

### Example 2: Grid with Context Menu

```json
{
  "dashboard_items": [
    {
      "title": "Customers",
      "query": "SELECT id, name, email FROM customers",
      "grid_row_menus": [
        {
          "label": "View Profile",
          "url": "https://crm.example.com/customer/${id}"
        },
        {
          "label": "Email",
          "url": "mailto:${email}"
        }
      ]
    }
  ]
}
```

### Example 3: Chart Visualization

```json
{
  "dashboard_items": [
    {
      "title": "Monthly Revenue",
      "type": "chart",
      "chartType": "bar",
      "query": "SELECT month, SUM(revenue) as total FROM sales GROUP BY month",
      "options": {
        "xField": "month",
        "yField": "total",
        "title": "Revenue by Month"
      }
    }
  ]
}
```

### Example 4: Parent-Child Drill-Down

```json
{
  "dashboard_items": [
    {
      "title": "Customers",
      "query": "SELECT id, name, email FROM customers"
    },
    {
      "title": "Orders for ${name}",
      "query": "SELECT * FROM orders WHERE customer_id = ${id}",
      "parent": "Customers",
      "templated": true
    }
  ]
}
```

**Usage**: Click a row in "Customers" grid → "Orders for {name}" grid appears below with filtered data

### Example 5: Markdown and Diagrams

```sql
-- Create table with special columns
CREATE TABLE docs (
  id INTEGER PRIMARY KEY,
  title TEXT,
  content_md TEXT,        -- Will render as markdown
  diagram_mermaid TEXT    -- Will render as Mermaid diagram
);

INSERT INTO docs VALUES (
  1,
  'Sample',
  '# Hello\n**Bold text** and [link](https://example.com)',
  'graph TD; A-->B; B-->C;'
);
```

```json
{
  "dashboard_items": [
    {"title": "Documentation", "query": "SELECT * FROM docs"}
  ]
}
```

---

## Testing Your Configuration

### Validation Checklist

Before deployment, verify:

1. **Schema Validation**:
   - Open browser console (F12)
   - Load dashboard
   - Check for validation errors in toast notifications
   - All errors must be fixed before dashboard functions

2. **SQL Queries**:
   - Use "Custom Query" button to test SQL
   - Verify columns match xField/yField in charts
   - Check for template variable placeholders

3. **CORS Issues**:
   - If cross-origin data, open Network tab in browser DevTools
   - Look for CORS errors (red text)
   - Verify CORS headers on data server

4. **Cache Issues**:
   - Dashboard automatically adds `?date=...` to prevent caching
   - If seeing stale data, hard refresh (Ctrl+Shift+R or Cmd+Shift+R)

### Common Errors and Solutions

**Error**: `must provide [?url=<your_url>] query parameter!`  
**Solution**: Add `?url=http://your-server/path` to URL

**Error**: `Error loading config file from {url}: 404`  
**Solution**: Verify `index.json` exists at `${url}/index.json`

**Error**: `Error loading sql database from {url}: Failed to fetch`  
**Solution**: Check CORS configuration on data server

**Error**: `Duplicate dashboard item title found: {title}`  
**Solution**: Ensure all titles within a template are unique

**Error**: `Referenced template '{name}' not found`  
**Solution**: Verify `dashboard_items_tempate` matches a template `name`

**Error**: `Chart requires options.xField`  
**Solution**: Add `options: {xField: "column", yField: "column"}` to chart

---

## Using the Dashboard

### Navigation

1. **Select Dataset**: Choose from dropdown
2. **Hash Routing**: Bookmark specific datasets via URL hash
   - Example: `index.html?url=...#dataset/MyDataset`
3. **Browser Back/Forward**: Navigate dataset history

### Grid Features

- **Sort**: Click column header (click again to reverse)
- **Filter**: Type in header input boxes (real-time filtering)
- **Export**: Click "Export" link → downloads CSV
- **Context Menu**: Right-click row (if configured) → custom actions
- **Drill-Down**: Click parent row → child grids appear below

### Custom Query

1. Click "Custom Query" button
2. Enter SQL: `SELECT * FROM table_name WHERE condition`
3. Click "Run"
4. Results display in filterable grid

**Helper Buttons**:
- "Show Tables": Lists all tables in database
- "Show All Fields": Shows table schema (columns, types, PKs, FKs)

### Database Schema

1. Click "Database Schema" button
2. View ER diagram showing:
   - Tables with columns
   - Data types
   - Primary keys (PK)
   - Foreign key relationships

---

## Advanced Configuration

### Multiple Datasets

```json
{
  "datasets": [
    {"title": "Sales 2023", "db_url": "sales_2023.sqlite", "dashboard_items_tempate": "sales"},
    {"title": "Sales 2024", "db_url": "sales_2024.sqlite", "dashboard_items_tempate": "sales"},
    {"title": "Customers", "db_url": "customers.sqlite", "dashboard_items_tempate": "crm"}
  ],
  "dashboard_templates": [
    {"name": "sales", "dashboard_items": [/* ... */]},
    {"name": "crm", "dashboard_items": [/* ... */]}
  ]
}
```

### Documentation Sidebar

```json
{
  "dashboard_templates": [
    {
      "name": "my_template",
      "documentation_url": "guide.md",  // Markdown file
      "dashboard_items": [/* ... */]
    }
  ]
}
```

Create `guide.md`:
```markdown
# Dashboard Guide

## Overview
This dashboard displays...

## How to Use
1. Select metric from dropdown
2. Filter using header boxes
3. Export results via Export link
```

### Complex Drill-Down (3 Levels)

```json
{
  "dashboard_items": [
    {
      "title": "Customers",
      "query": "SELECT * FROM customers"
    },
    {
      "title": "Orders for ${name}",
      "query": "SELECT * FROM orders WHERE customer_id = ${id}",
      "parent": "Customers",
      "templated": true
    },
    {
      "title": "Line Items for Order ${order_id}",
      "query": "SELECT * FROM line_items WHERE order_id = ${order_id}",
      "parent": "Orders for ${name}",
      "templated": true
    }
  ]
}
```

---

## Performance Tips

### Database Size

- **Optimal**: < 50MB (loads in ~2 seconds)
- **Acceptable**: 50-100MB (loads in ~5-10 seconds)
- **Large**: > 100MB (consider chunking or server-side solution)

### Query Optimization

- **Use Indexes**: Create indexes on filtered/sorted columns
- **Limit Results**: Use `LIMIT` for large tables
- **Aggregate Early**: Use `GROUP BY` to reduce row count

```sql
-- Good: Aggregates before returning
SELECT category, COUNT(*) as count FROM sales GROUP BY category;

-- Bad: Returns all rows (use LIMIT)
SELECT * FROM sales;  -- 100k+ rows

-- Better:
SELECT * FROM sales ORDER BY date DESC LIMIT 1000;
```

### Grid Performance

- Tabulator virtual scrolling handles 10k+ rows efficiently
- maxHeight: "600px" limits DOM size
- Export function works with filtered results only

---

## Security Considerations

### Data Exposure

- **Public Hosting**: Anyone with URL can access data
- **Private Data**: Use authentication layer (e.g., CloudFront signed URLs)
- **Sensitive Data**: Do not host PII/credentials in public SQLite files

### SQL Injection

- **Configuration**: Dashboard executes config-defined queries only
- **Custom Query**: User-entered SQL has full database access
- **Mitigation**: Deploy read-only database files (SQLite immutable flag)

### CORS Security

- **Wildcard (*)**: Allows any origin (use for public data only)
- **Specific Origins**: Limit to your dashboard domain
- **Credentials**: Not used (dashboard is anonymous client-side app)

---

## Troubleshooting

### Dashboard Won't Load

1. **Check Browser Console** (F12 → Console tab):
   - Look for JavaScript errors
   - Verify `index.json` fetched successfully
2. **Verify URL**: Ensure `?url=` parameter correct
3. **Test Config URL**: Navigate directly to `${url}/index.json`
4. **Hard Refresh**: Clear cache (Ctrl+Shift+R)

### Database Won't Load

1. **Check Network Tab** (F12 → Network):
   - Find `.sqlite` request
   - Check status code (200 = success, 404 = not found, 0 = CORS error)
2. **Verify CORS**: Response headers must include `Access-Control-Allow-Origin`
3. **Test Direct Access**: Navigate to database URL in browser
4. **Check File Size**: Ensure < 100MB for reasonable performance

### Queries Return No Results

1. **Use Custom Query**: Test SQL manually
2. **Check Table Names**: Run `SELECT * FROM sqlite_master`
3. **Verify Column Names**: Run `PRAGMA table_info(table_name)`
4. **Check SQL Syntax**: Look for toast error messages

### Charts Not Rendering

1. **Verify Query Results**: Use Custom Query to test
2. **Check Field Names**: Ensure xField/yField match query columns exactly
3. **Inspect Console**: Look for Chart.js errors
4. **Validate Config**: Ensure chartType is valid (bar/line/pie/doughnut)

---

## Next Steps

1. **Clone Repository**: `git clone https://github.com/unclepaul84/sqlite-browser-dashboard.git`
2. **Review README**: See full feature list and examples
3. **Check Live Demo**: https://unclepaul84.github.io/sqlite-browser-dashboard/?url=/sqlite-data-host/#dataset/Legislators
4. **Create Your Config**: Start with simple example, add features incrementally
5. **Deploy**: Choose hosting platform and go live!

---

## Getting Help

- **GitHub Issues**: https://github.com/unclepaul84/sqlite-browser-dashboard/issues
- **Example Configs**: https://github.com/unclepaul84/sqlite-data-host/blob/main/index.json
- **README**: Full documentation in repository root
