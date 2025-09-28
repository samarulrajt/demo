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
        sqlPart = `${rule.field} IN ${rule.value}`;
        break;

      case 'not in':
        sqlPart = `${rule.field} NOT IN ${rule.value}`;
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