class ConfigValidator {
    /**
     * Build parent chain for a dashboard item
     * @param {string} itemTitle - Title of the item to trace
     * @param {Array} items - Array of all dashboard items
     * @returns {Array} Array of titles from root to itemTitle (e.g., ['root', 'parent', 'child'])
     */
    static buildParentChain(itemTitle, items) {
        const chain = [];
        const itemMap = new Map(items.map(item => [item.title, item]));
        
        let current = itemTitle;
        const visited = new Set();
        
        while (current) {
            if (visited.has(current)) {
                // Circular reference detected - return chain with duplicate to indicate cycle
                chain.push(current);
                break;
            }
            
            visited.add(current);
            chain.push(current);
            
            const item = itemMap.get(current);
            current = item?.parent || null;
        }
        
        return chain.reverse(); // Return root-to-leaf order
    }

    /**
     * Detect circular references in parent-child chains
     * @param {Array} items - Array of dashboard items with parent fields
     * @param {number} templateIdx - Index of template for error reporting
     * @returns {Array} Array of error messages
     */
    static detectCircularReferences(items, templateIdx) {
        const errors = [];
        const itemTitles = new Set(items.map(item => item.title));
        
        items.forEach((item, itemIdx) => {
            if (!item.parent) return; // Root items cannot have circular refs
            
            const chain = this.buildParentChain(item.title, items);
            
            // Check for circular reference (duplicate in chain)
            const uniqueChain = new Set(chain);
            if (uniqueChain.size !== chain.length) {
                // Found circular reference
                const cyclePath = chain.join(' → ');
                errors.push({
                    code: 'VAL-CIRCULAR-001',
                    message: `Template[${templateIdx}].items[${itemIdx}]: Circular reference detected: ${cyclePath}`,
                    itemTitle: item.title,
                    chain: chain
                });
            }
            
            // Check for orphaned parent (parent not found in items)
            if (item.parent && !itemTitles.has(item.parent)) {
                errors.push({
                    code: 'VAL-ORPHAN-002',
                    message: `Template[${templateIdx}].items[${itemIdx}]: Parent item '${item.parent}' not found`,
                    itemTitle: item.title,
                    missingParent: item.parent
                });
            }
        });
        
        // Check for excessive depth (warning, not error)
        items.forEach((item, itemIdx) => {
            const chain = this.buildParentChain(item.title, items);
            if (chain.length > 10) {
                errors.push({
                    code: 'VAL-DEPTH-004',
                    message: `Template[${templateIdx}].items[${itemIdx}]: Nesting depth ${chain.length} exceeds recommended limit (10). Performance may be impacted.`,
                    itemTitle: item.title,
                    depth: chain.length,
                    severity: 'warning'
                });
            }
        });
        
        return errors;
    }

    static validateConfig(config) {
        const errors = [];

        // Validate top-level structure
        if (!config.datasets || !Array.isArray(config.datasets)) {
            errors.push("Missing or invalid 'datasets' array");
            return { isValid: false, errors };
        }

        if (!config.dashboard_templates || !Array.isArray(config.dashboard_templates)) {
            errors.push("Missing or invalid 'dashboard_templates' array");
            return { isValid: false, errors };
        }

        // Validate datasets
        config.datasets.forEach((dataset, idx) => {
            if (!dataset.title) {
                errors.push(`Dataset[${idx}]: Missing required 'title' field`);
            }
            if (!dataset.db_url) {
                errors.push(`Dataset[${idx}]: Missing required 'db_url' field`);
            }
            if (!dataset.dashboard_items_tempate) {
                errors.push(`Dataset[${idx}]: Missing required 'dashboard_items_tempate' field`);
            }
        });

        // Validate dashboard templates
        const templateNames = new Set();
        config.dashboard_templates.forEach((template, idx) => {
            // Validate template name
            if (!template.name) {
                errors.push(`Template[${idx}]: Missing required 'name' field`);
            } else if (templateNames.has(template.name)) {
                errors.push(`Template[${idx}]: Duplicate template name '${template.name}'`);
            } else {
                templateNames.add(template.name);
            }

            // Validate dashboard items
            if (!template.dashboard_items || !Array.isArray(template.dashboard_items)) {
                errors.push(`Template[${idx}]: Missing or invalid 'dashboard_items' array`);
                return;
            }

            // TILE-001: Single tile widget per template
            const tileWidgets = template.dashboard_items.filter(item => item.type === 'tiles');
            if (tileWidgets.length > 1) {
                errors.push(`Template[${idx}]: Only one tile widget allowed per template (found ${tileWidgets.length})`);
            }

            // TILE-002: Tile widget must be first item
            if (tileWidgets.length === 1) {
                const tileWidgetIndex = template.dashboard_items.findIndex(item => item.type === 'tiles');
                if (tileWidgetIndex !== 0) {
                    errors.push(`Template[${idx}]: Tile widget must be the first item in dashboard_items (currently at index ${tileWidgetIndex})`);
                }
            }

            const itemTitles = new Set();
            template.dashboard_items.forEach((item, itemIdx) => {
                // Validate basic fields
                if (!item.title) {
                    errors.push(`Template[${idx}].items[${itemIdx}]: Missing required 'title' field`);
                } else if (itemTitles.has(item.title)) {
                    errors.push(`Template[${idx}].items[${itemIdx}]: Duplicate item title '${item.title}'`);
                } else {
                    itemTitles.add(item.title);
                }

                // Query field is required for grid and chart types, but NOT for tiles
                if (item.type !== 'tiles' && !item.query) {
                    errors.push(`Template[${idx}].items[${itemIdx}]: Missing required 'query' field`);
                }

                // Validate visualization type
                if (item.type && !['grid', 'chart', 'tiles'].includes(item.type)) {
                    errors.push(`Template[${idx}].items[${itemIdx}]: Invalid type '${item.type}'. Must be 'grid', 'chart', or 'tiles'`);
                }

                // Validate chart configuration
                if (item.type === 'chart') {
                    if (!item.chartType) {
                        errors.push(`Template[${idx}].items[${itemIdx}]: Chart type required for chart visualization`);
                    } else if (!['bar', 'line', 'doughnut', 'pie'].includes(item.chartType)) {
                        errors.push(`Template[${idx}].items[${itemIdx}]: Invalid chart type '${item.chartType}'`);
                    }
                    
                    if (!item.options) {
                        errors.push(`Template[${idx}].items[${itemIdx}]: Chart requires options configuration`);
                    } else {
                        if (!item.options.xField) {
                            errors.push(`Template[${idx}].items[${itemIdx}]: Chart requires options.xField`);
                        }
                        if (!item.options.yField) {
                            errors.push(`Template[${idx}].items[${itemIdx}]: Chart requires options.yField`);
                        }
                    }
                }

                // Validate tile widget configuration
                if (item.type === 'tiles') {
                    // Tile widgets cannot have a parent (they are always root-level)
                    if (item.parent) {
                        errors.push(`Template[${idx}].items[${itemIdx}]: Tile widget cannot have a parent - it must be a root-level item`);
                    }
                    
                    // TILE-003: Tiles array not empty
                    if (!item.config || !item.config.tiles || !Array.isArray(item.config.tiles)) {
                        errors.push(`Template[${idx}].items[${itemIdx}]: Tile widget missing required config.tiles array`);
                    } else if (item.config.tiles.length === 0) {
                        errors.push(`Template[${idx}].items[${itemIdx}]: Tile widget must contain at least one tile`);
                    } else {
                        // Validate individual tiles
                        const tileNames = new Set();
                        item.config.tiles.forEach((tile, tileIdx) => {
                            // TILE-004: Tile name required
                            if (!tile.name || typeof tile.name !== 'string' || tile.name.trim() === '') {
                                errors.push(`Template[${idx}].items[${itemIdx}].tiles[${tileIdx}]: Tile missing required field 'name' at index ${tileIdx}`);
                            } else {
                                // TILE-006: Duplicate tile names (warning)
                                if (tileNames.has(tile.name)) {
                                    // Note: This is a warning but we'll add it to errors array
                                    // The implementation will need to distinguish warnings from errors
                                    errors.push(`Template[${idx}].items[${itemIdx}]: WARNING: Duplicate tile name '${tile.name}' found`);
                                }
                                tileNames.add(tile.name);
                            }
                            
                            // TILE-005: Tile query required
                            if (!tile.query || typeof tile.query !== 'string' || tile.query.trim() === '') {
                                errors.push(`Template[${idx}].items[${itemIdx}].tiles[${tileIdx}]: Tile missing required field 'query' at index ${tileIdx}`);
                            }
                            
                            // TILE-007: Invalid color format (warning)
                            if (tile.color) {
                                // Simple validation - try to create a temporary element to test color
                                // This will be validated more thoroughly in the browser
                                if (typeof tile.color !== 'string') {
                                    errors.push(`Template[${idx}].items[${itemIdx}].tiles[${tileIdx}]: WARNING: Invalid color type for tile '${tile.name || tileIdx}', using default`);
                                }
                            }
                        });
                    }
                }

                // Validate grid menu configuration (only for grid type)
                if (item.grid_row_menus) {
                    // Grid row menus only make sense for grid visualizations
                    if (item.type && item.type !== 'grid') {
                        errors.push(`Template[${idx}].items[${itemIdx}]: grid_row_menus only applicable to grid type (current type: '${item.type}')`);
                    } else if (!Array.isArray(item.grid_row_menus)) {
                        errors.push(`Template[${idx}].items[${itemIdx}]: grid_row_menus must be an array`);
                    } else {
                        item.grid_row_menus.forEach((menu, menuIdx) => {
                            if (!menu.label) {
                                errors.push(`Template[${idx}].items[${itemIdx}].menus[${menuIdx}]: Missing required 'label' field`);
                            }
                            if (!menu.url) {
                                errors.push(`Template[${idx}].items[${itemIdx}].menus[${menuIdx}]: Missing required 'url' field`);
                            }
                        });
                    }
                }
            });

            // Validate parent-child relationships (circular references, orphaned parents)
            const relationshipErrors = ConfigValidator.detectCircularReferences(template.dashboard_items, idx);
            relationshipErrors.forEach(err => {
                errors.push(err.message);
            });
        });

        // Validate template references
        config.datasets.forEach((dataset, idx) => {
            if (!templateNames.has(dataset.dashboard_items_tempate)) {
                errors.push(`Dataset[${idx}]: Referenced template '${dataset.dashboard_items_tempate}' not found`);
            }
        });

        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }
}