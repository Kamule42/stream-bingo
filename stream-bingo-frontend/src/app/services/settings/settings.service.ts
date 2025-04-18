import { Injectable } from '@angular/core';
import { BehaviorSubject, map, shareReplay, tap } from 'rxjs';
import { CheckType, ISaveParams } from './setting.types';
import { enumFromStringValue } from '../../shared/helpers/enum.helper';


const SETTINGS_BASE_KEY = '@SETTINGS_' 
const SETTINGS_CHECK = SETTINGS_BASE_KEY + 'CHECK'
const SETTINGS_CHECK_COLOR = SETTINGS_BASE_KEY + 'CHECK_COLOR'
const SETTINGS_STRIPE_COLOR = SETTINGS_BASE_KEY + 'STRIPE_COLOR'

const MAIN_COLOR =  window.getComputedStyle(document.body).getPropertyValue('--main-color') ?? '#097679'
const SECONDARY_COLOR =  window.getComputedStyle(document.body).getPropertyValue('--secondary-color') ?? '#ffc000'


@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private readonly _check$ = new BehaviorSubject<CheckType | null | undefined>(undefined)

  private readonly _checkColor$ = new BehaviorSubject<string>(MAIN_COLOR)
  private readonly _stripeColor$ = new BehaviorSubject<string>(SECONDARY_COLOR)


  constructor() {
    this._check$.next(enumFromStringValue(
      CheckType, localStorage.getItem(SETTINGS_CHECK)
    ))
    this._checkColor$.next(localStorage.getItem(SETTINGS_CHECK_COLOR) ?? MAIN_COLOR)
    this._stripeColor$.next(localStorage.getItem(SETTINGS_STRIPE_COLOR) ?? SECONDARY_COLOR)
  }

  public check$ = this._check$.asObservable().pipe(
    map(val => val ?? null),
    tap(val => val ? 
      localStorage.setItem(SETTINGS_CHECK, `${val}`) :
      localStorage.removeItem(SETTINGS_CHECK)),
    shareReplay(1),
  )
  public set check(val: CheckType | null){
    this._check$.next(val)
  }

  public checkColor$ = this._checkColor$.asObservable().pipe(
    map(val => val ?? null),
    tap(val => val ? 
      localStorage.setItem(SETTINGS_CHECK_COLOR, `${val}`) :
      localStorage.removeItem(SETTINGS_CHECK_COLOR)),
    shareReplay(1),
  )
  public set checkColor(val: string | null){
    this._checkColor$.next(val ?? MAIN_COLOR)
  }

  public stripeColor$ = this._stripeColor$.asObservable().pipe(
    map(val => val ?? null),
    tap(val => val ? 
      localStorage.setItem(SETTINGS_STRIPE_COLOR, `${val}`) :
      localStorage.removeItem(SETTINGS_STRIPE_COLOR)),
    shareReplay(1),
  )
  public set stripeColor(val: string | null){
    this._stripeColor$.next(val ?? SECONDARY_COLOR)
  }
  
  save(toSave: ISaveParams) {
    if(toSave.check !== undefined){
      this._check$.next(toSave.check)
    }
    if(toSave.checkColor !== undefined){
      this._checkColor$.next(toSave.checkColor)
    }
  }
}
