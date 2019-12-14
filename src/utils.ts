export function isObject(value: any): boolean {
    const type = typeof value;
    return !!value && (type == 'object' || type == 'function');
}
