
export function isNullOrUndefined(value: any) : boolean {
  // Note difference from ===
  return value == null ? true : false
}

export function isDefined<T>(value: null | undefined | T): value is T {
  return !isNullOrUndefined(value)
}

export function isNumber(value: any): value is number  {
  return typeof value === 'number' && !isNaN(value);
};


export const isInteger = (value: any): value is  number => {
  return isNumber(value) && Number.isInteger(value);
};

export const isString = (s: any): s is string => {
  return typeof s === 'string';
};

export const isBoolean = (value: any): value is boolean => {
  return typeof value === 'boolean';
};

export const isDate = (value: any): value is Date => {
  return value instanceof Date;
};

