import { Injectable } from '@angular/core'
import { BehaviorSubject, map, share, tap } from 'rxjs'
import { ConsentType } from './consent.types'
import { enumFromStringValue } from '../../shared/helpers/enum.helper'

const CONSENT_BASE_KEY = '@CONSENT_' 
const CONSENT_STATUS = CONSENT_BASE_KEY + 'STATUS'

@Injectable({
  providedIn: 'root'
})
export class ConsentService {
  private readonly _status$  = new BehaviorSubject<ConsentType | null | undefined>(undefined)
  public readonly status$ = this._status$.asObservable().pipe(
    tap(status => {
      if(status === null){
        localStorage.removeItem(CONSENT_STATUS)
      }
      else if(status != null){
        localStorage.setItem(CONSENT_STATUS, status)
      }
    }),
    map(status => status ?? null),
    share(),
  )
  
  constructor(){
    const typeStr = localStorage.getItem(CONSENT_STATUS)
    this._status$.next(typeStr != null ? enumFromStringValue(ConsentType, typeStr) : null)
  }

  consent() {
    this._status$.next(ConsentType.ALL)
  }
  
  resetStatus(){
    this._status$.next(null)
  }
}
