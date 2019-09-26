import {
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpResponse,
} from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { tap } from "rxjs/operators";

@Injectable()
export class LoadingInterceptor implements HttpInterceptor {
  inFlight$ = new BehaviorSubject(false);
  private inFlightCount = 0;

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    ++this.inFlightCount;
    this.inFlight$.next(true);
    const finish = () => {
      this.inFlight$.next(--this.inFlightCount > 0);
    };
    return next.handle(req).pipe(
      tap(
        (event) => {
          if (event instanceof HttpResponse) {
            finish();
          }
        },
        finish,
        finish,
      ),
    );
  }
}
