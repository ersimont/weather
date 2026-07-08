import { ErrorHandler as Interface, inject, Service } from '@angular/core';
import { BugsnagService } from 'app/to-replace/bugsnag/bugsnag.service';

@Service()
export class BugsnagErrorHandler implements Interface {
  #service = inject(BugsnagService);

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types -- this is Anuglar's API, not ours
  handleError(error: any): void {
    console.error(error);
    this.#service.notify(error);
  }
}
