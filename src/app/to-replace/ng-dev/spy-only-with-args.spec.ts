import { expectSingleCallAndReset } from '@s-libs/ng-dev';
import { spyOnlyWithArgs } from 'app/to-replace/ng-dev/spy-only-with-args';

describe('spyOnlyWithArgs()', () => {
  it('returns an object to configure what the spy does with those args', () => {
    spyOnlyWithArgs(window, 'btoa', ['in']).returnValue('out');
    expect(btoa('in')).toBe('out');
  });

  it("calls through when args don't match", () => {
    spyOnlyWithArgs(window, 'btoa', ['in']).returnValue('out');
    expect(btoa('other')).toBe('b3RoZXI=');
  });

  it('can be used multiple times', () => {
    const orig = jasmine.createSpy();
    const obj = {
      meth(num: number): number {
        orig(num);
        return -1;
      },
    };

    spyOnlyWithArgs(obj, 'meth', [1]).returnValue(1);
    spyOnlyWithArgs(obj, 'meth', [2]).returnValue(2);

    expect(obj.meth(1)).toBe(1);
    expect(obj.meth(2)).toBe(2);
    expect(obj.meth(3)).toBe(-1);
    expectSingleCallAndReset(orig, 3);
  });
});
