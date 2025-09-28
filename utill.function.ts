import { IScript } from './model/package.interface';

export function buildScriptString(script: IScript): string {
  if (!script || !script.rules || script.rules.length === 0) {
    return '';
  }

  const groups: string[] = [];
  let currentGroup: string[] = [];

  script.rules.forEach((rule, index) => {
    // Build SQL part
    let sqlPart = '';
    switch (rule.operator?.toLowerCase()) {
      case '=':
      case '!=':
      case '<>':
      case '>':
      case '<':
      case '>=':
      case '<=':
        sqlPart = `${rule.field} ${rule.operator} '${rule.value}'`;
        break;
        case 'in':
        case 'not in': {
    // Ensure value is in correct SQL list format
    let values = rule.value;

    if (typeof values === 'string') {
      // Split string by comma, trim, wrap with quotes
      values = values
        .split(',')
        .map(v => `'${v.trim()}'`)
        .join(', ');
    } else if (Array.isArray(values)) {
      // If array → convert to quoted string list
      values = values.map(v => `'${v}'`).join(', ');
    }

    sqlPart = `${rule.field} ${rule.operator.toUpperCase()} (${values})`;
    }
break;
  
      break;

      case 'like':
        sqlPart = `${rule.field} LIKE '%${rule.value}%'`;
        break;

      default:
        sqlPart = `${rule.field} = '${rule.value}'`;
    }

    currentGroup.push(sqlPart);

    // If condition is OR → close current group and start a new one
    if (rule.condition?.toUpperCase() === 'OR' && index < script.rules.length - 1) {
      // For single item groups → no need for AND
      const groupExpr = currentGroup.length > 1
        ? `(${currentGroup.join(' AND ')})`
        : currentGroup[0];
      groups.push(groupExpr);
      currentGroup = [];
    }
  });

  // Push the last group
  if (currentGroup.length > 0) {
    const groupExpr = currentGroup.length > 1
      ? `(${currentGroup.join(' AND ')})`
      : currentGroup[0];
    groups.push(groupExpr);
  }

  // Join groups by OR
  return groups.join(' OR ');
}