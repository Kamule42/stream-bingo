import { Injectable } from '@angular/core';
import { BehaviorSubject, map, share, shareReplay, tap } from 'rxjs';
import { CheckType, ISaveParams } from './setting.types';
import { enumFromStringValue } from '../../shared/helpers/enum.helper';


const SETTINGS_BASE_KEY = '@SETTINGS_' 
const SETTINGS_CHECK = SETTINGS_BASE_KEY + 'CHECK'
const SETTINGSCHECK_COLOR = SETTINGS_BASE_KEY + 'CHECK_COLOR'

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private readonly _check$      = new BehaviorSubject<CheckType | null | undefined>(undefined)
  private readonly _checkColor$ = new BehaviorSubject<string| null | undefined>(undefined)

  constructor() {
    this._check$.next(enumFromStringValue(
      CheckType, localStorage.getItem(SETTINGS_CHECK)
    ))
    this._checkColor$.next(localStorage.getItem(SETTINGSCHECK_COLOR))
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
      localStorage.setItem(SETTINGSCHECK_COLOR, `${val}`) :
      localStorage.removeItem(SETTINGSCHECK_COLOR)),
    shareReplay(1),
  )
  public set checkColor(val: string | null){
    this._checkColor$.next(val)
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
