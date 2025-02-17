class ConfigValidator {
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

                if (!item.query) {
                    errors.push(`Template[${idx}].items[${itemIdx}]: Missing required 'query' field`);
                }

                // Validate visualization type
                if (item.type && !['grid', 'chart'].includes(item.type)) {
                    errors.push(`Template[${idx}].items[${itemIdx}]: Invalid type '${item.type}'. Must be 'grid' or 'chart'`);
                }

                // Validate chart configuration
                if (item.type === 'chart') {
                    if (!item.chartType) {
                        errors.push(`Template[${idx}].items[${itemIdx}]: Chart type required for chart visualization`);
                    } else if (!['bar', 'line', 'pie', 'scatter'].includes(item.chartType)) {
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

                // Validate grid menu configuration
                if (item.grid_row_menus) {
                    if (!Array.isArray(item.grid_row_menus)) {
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

                // Validate parent-child relationships
                if (item.parent && !itemTitles.has(item.parent)) {
                    errors.push(`Template[${idx}].items[${itemIdx}]: Parent item '${item.parent}' not found`);
                }
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