import { DataStore } from "../shell/data-store";
import { Observable, of } from "rxjs";

export interface IResolvedRouteData<T> {
  data: T | DataStore<T>;
}

export class ResolverHelper<T> {
  public static extractData<T>(
    source: T | DataStore<T>,
    constructor: new (...args: any[]) => T
  ): Observable<T> {
    if (source instanceof DataStore) {
      return source.state;
    } else if (source instanceof constructor) {
      return of(source);
    }
  }
}
