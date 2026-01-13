export function isEmptyString(str){
    return !str || str.trim() === ""
}

export const isNotEmpty = (value)=>{
    if(value){
        if (Array.isArray(value)) {
            return value.length > 0;  // Check for non-empty array
        } else if (typeof value === 'object') {
            return Object.keys(value).length > 0;  // Check for non-empty object
        }
    }
    return false; // Return false for non-array, non-object values
}

export const buildTree = (...dataSets) => {
    const map = new Map();

    dataSets.flat().forEach(item => {
        map.set(item.key, {
            ...item,
            children: item.sub ? item.sub : [],
        });
    });

    const tree = [];

    map.forEach((item) => {
        const node = {
            ...item,
            iconClass: item.icon ? `fa-regular ${item.icon}` : null,   // <-- only string
        };

        if (node.parentId) {
            const parent = map.get(node.parentId);
            if (parent) parent.children.push(node);
        } else {
            tree.push(node);
        }
    });

    return tree;
};

export const extractParam = (lines)=>{
    const result = {};
    const uniqueKeys = new Set();
    let currentSection = null;

    lines.forEach(line => {
        const trimmed = line.trim();

        // Detect section headers like [broker] or [%query_editor]
        const sectionMatch = trimmed.match(/^\[(%?[\w_]+)]$/);
        if (sectionMatch) {
            currentSection = sectionMatch[1];
            result[currentSection] = {};
            return;
        }

        // Handle key=value lines
        if (currentSection && trimmed.includes('=') && !trimmed.startsWith("#")) {
            const [key, value] = trimmed.split('=');
            const cleanKey = key.trim();
            result[currentSection][cleanKey] = value.trim();
            uniqueKeys.add(cleanKey);
        }
    });

    return [result, uniqueKeys];
}

export function extractSQL(logText) {
    // Regex to match SQL statements that start with common keywords
    const sqlRegex = /\b(CREATE|ALTER|INSERT|UPDATE|DELETE|SELECT|DROP|TRUNCATE)\b[\s\S]*?(?=$|\r?\n)/gi;

    let statements = [];
    let match;
    while ((match = sqlRegex.exec(logText)) !== null) {
        let stmt = match[0].trim();

        // Skip lines that are not valid SQL
        if (!stmt.toLowerCase().startsWith("error")) {
            statements.push(stmt);
        }
    }

    return statements;
}