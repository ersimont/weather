import { assert } from '@s-libs/js-core';
import { describe, expect, it } from 'vitest';
import { toNotifiableError } from './to-notifiable-error';

describe('toNotifiableError()', () => {
  it('handles strings', () => {
    const input = 'some string error';
    expect(toNotifiableError(input)).toBe(input);
  });

  it('handles Error instances', () => {
    const input = new Error();
    expect(toNotifiableError(input)).toBe(input);
  });

  it('handles objects with name and message', () => {
    const input = { name: 'ErrorName', message: 'Something went wrong' };
    expect(toNotifiableError(input)).toBe(input);
  });

  it('handles objects with errorClass and errorMessage', () => {
    const input = {
      errorClass: 'ErrorClass',
      errorMessage: 'Something went wrong',
    };
    expect(toNotifiableError(input)).toBe(input);
  });

  it('handles objects without proper keys', () => {
    const input = { foo: 'bar' };
    const result = toNotifiableError(input);
    assert(result instanceof Error);
    expect(result.message).toBe('[object Object]');
    expect(result.cause).toBe(input);
  });

  it('handles numbers', () => {
    const input = 123;
    const result = toNotifiableError(input);
    assert(result instanceof Error);
    expect(result.message).toBe('123');
    expect(result.cause).toBe(input);
  });

  it('handles null', () => {
    const input = null;
    const result = toNotifiableError(input);
    assert(result instanceof Error);
    expect(result.message).toBe('null');
    expect(result.cause).toBe(input);
  });

  it('handles undefined', () => {
    const input = undefined;
    const result = toNotifiableError(input);
    assert(result instanceof Error);
    expect(result.message).toBe('undefined');
    expect(result.cause).toBe(input);
  });
});
