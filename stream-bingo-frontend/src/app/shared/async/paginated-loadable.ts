import { from, map, Observable, of, switchMap, toArray } from "rxjs"
import { IPaginated, IPaginationMeta } from "../models/pagination.interface"
import { Loadable } from "./loadable"
import { ILoadable, ILoadableParams } from "./loadble.interface"

export class PaginatedLoadable<P, R, V> implements ILoadable<P, V[]> {
  private readonly delegate: Loadable<P, IPaginated<R>, IPaginated<V>>

  constructor(params: ILoadableParams<P, R, V>) {
    this.delegate = new Loadable<P, IPaginated<R>, IPaginated<V>>({
      ...params,
      converter: (paginated: IPaginated<R>) : IPaginated<V> => ({
        data: paginated.data.map(params.converter ?? (v=>v as unknown as V)),
        meta: paginated.meta,
      }),
      resultOperations: obs => obs.pipe(
        switchMap(paginated => params.resultOperations ?
          params.resultOperations(from(paginated.data)).pipe(
            toArray(),
            map(data => ({
              data,
              meta: paginated.meta,
            }))
          ) :
          of(paginated)),
      )
    })
  }


  public load(params: P): void {
    this.delegate.load(params)
  }
  public get value$(): Observable<V[]> {
    return this.delegate.value$.pipe(
      map((data) => data.data),
    )
  }
  public get meta$(): Observable<IPaginationMeta> {
    return this.delegate.value$.pipe(
      map((data) => data.meta),
    )
  }
  public get isLoading$(): Observable<boolean> {
    return this.delegate.isLoading$
  }
}
