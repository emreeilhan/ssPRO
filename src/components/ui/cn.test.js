import { test, describe } from 'node:test';
import assert from 'node:assert';
import { cn } from './cn.js';

describe('cn utility', () => {
  test('combines standard classes correctly', () => {
    assert.strictEqual(cn('class1', 'class2'), 'class1 class2');
    assert.strictEqual(cn('a', 'b', 'c', 'd'), 'a b c d');
  });

  test('filters out falsy values', () => {
    assert.strictEqual(cn('a', false, 'b'), 'a b');
    assert.strictEqual(cn('a', null, 'b'), 'a b');
    assert.strictEqual(cn('a', undefined, 'b'), 'a b');
    assert.strictEqual(cn('a', '', 'b'), 'a b');
    assert.strictEqual(cn('a', 0, 'b'), 'a b');
  });

  test('handles a single class correctly', () => {
    assert.strictEqual(cn('single'), 'single');
    assert.strictEqual(cn(''), '');
  });

  test('handles no arguments correctly', () => {
    assert.strictEqual(cn(), '');
  });

  test('handles conditional classes effectively', () => {
    const isTrue = true;
    const isFalse = false;
    assert.strictEqual(cn('base', isTrue && 'active', isFalse && 'inactive'), 'base active');
  });

  test('handles array of classes correctly (using spread syntax)', () => {
    const classes = ['a', 'b', 'c'];
    assert.strictEqual(cn(...classes), 'a b c');
  });
});
