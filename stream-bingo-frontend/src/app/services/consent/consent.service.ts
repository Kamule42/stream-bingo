import { Injectable } from '@angular/core'
import { ConsentType, IConsent } from './consent.types'
import { enumFromStringValue } from '../../shared/helpers/enum.helper'
import { BehaviorSubject, map, share, tap } from 'rxjs'

const CONSENT_BASE_KEY = '@CONSENT_' 
const CONSENT_STATUS = CONSENT_BASE_KEY + 'STATUS'
const CONSENT_DATA = CONSENT_BASE_KEY + 'DATA'

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
  private readonly _data$    = new BehaviorSubject<IConsent | null| undefined>(undefined)
  public readonly data$ = this._data$.asObservable().pipe(
    map(val => val ?? null),
    share(),
  )
  
  constructor(){
    const typeStr = localStorage.getItem(CONSENT_STATUS)
    this._status$.next(typeStr != null ? enumFromStringValue(ConsentType, typeStr) : null)
    if(this._status$.getValue() === ConsentType.PARTIAL){
      try{
        this._data$.next(JSON.parse(localStorage.getItem(CONSENT_DATA) ?? ''))
      }
      catch(err){
        localStorage.removeItem(CONSENT_DATA)
      }
    }
  }

  consent() {
    this._status$.next(ConsentType.ALL)
  }
  
  resetStatus(){
    this._status$.next(null)
    this._data$.next(null)
  }
}
