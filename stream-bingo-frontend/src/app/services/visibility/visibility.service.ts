import { Injectable } from '@angular/core';
import { BehaviorSubject, distinctUntilChanged, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VisibilityService {
  private readonly _isVisible$$ = new BehaviorSubject<boolean>(true)
  private readonly _isVisible$ = this._isVisible$$
    .asObservable()
    .pipe(
      distinctUntilChanged(),
    )

  public get isVisible$(): Observable<boolean>{
    return this._isVisible$
  }
  public set isVisible$(val: boolean){
    this._isVisible$$.next(val)
  }
}
