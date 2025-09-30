// Operators
export type Operator = '=' | '<>' | '!=' | '<' | '>' | '<=';

// A single field rule (leaf node)
export interface SimpleRule {
  field: string;
  operator: Operator;
  value: string;
}

// A group of rules with AND/OR
export interface GroupRule {
  condition: 'AND' | 'OR';
  rules: Array<SimpleRule | GroupRule>;
}

// An IF/THEN condition
export interface IfThenRule {
  condition: GroupRule;   // nested condition
  thenValue: string;
  elseValue: string;
}

// Wrapper for IF_THEN format
export interface IfThenWrapper {
  outputField: string;
  scriptFormat: IfThenRule[];
}

// Script criteria (both formats supported)
export interface ScriptCriteria {
  format: 'SINGLE' | 'IF_THEN';
  rules: Array<GroupRule | IfThenWrapper>;
}

// Root
export interface CriteriaRoot {
  criteria: {
    script: ScriptCriteria;
  };
}
