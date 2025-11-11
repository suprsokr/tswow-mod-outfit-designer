/**
 * Logger utility for unit-creator module
 */

const PREFIX = '[UNIT-CREATOR]';

export function log(message: string): void {
    console.log(`${PREFIX} ${message}`);
}

export function error(message: string): void {
    console.log(`${PREFIX} ERROR: ${message}`);
}

export function warn(message: string): void {
    console.log(`${PREFIX} WARNING: ${message}`);
}

export function debug(message: string): void {
    console.log(`${PREFIX} DEBUG: ${message}`);
}

export function info(message: string): void {
    console.log(`${PREFIX} INFO: ${message}`);
}

