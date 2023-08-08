import { noop } from '@s-libs/micro-dash';
import { staticTest } from '@s-libs/ng-dev';
import { ensureSpiedOn } from 'app/to-replace/ng-dev/ensure-spied-on';
import { expectTypeOf } from 'expect-type';

describe('ensureSpiedOn()', () => {
  it('has fancy typing', () => {
    staticTest(() => {
      expectTypeOf(ensureSpiedOn(location, 'reload')).toEqualTypeOf(
        spyOn(location, 'reload'),
      );
    });
  });

  it('spies on the method', () => {
    const spy = ensureSpiedOn(document, 'addEventListener');
    expect(spy).toBe(document.addEventListener);

    document.addEventListener('mousedown', noop);
    expect(spy).toHaveBeenCalled();
  });

  it('returns an existing spy without re-spying', () => {
    const firstSpy = ensureSpiedOn(navigator, 'sendBeacon');
    const secondSpy = ensureSpiedOn(navigator, 'sendBeacon');

    expect(secondSpy).toBe(firstSpy);
    expect(navigator.sendBeacon).toBe(firstSpy);
  });
});
