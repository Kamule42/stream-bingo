import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth';
import { map, } from 'rxjs';

export const hasRightGuard: CanActivateFn = (route) => {
  const rights = route.data['rights'] as Array<string | {right: string, streamId: string}> ?? []

  return inject(AuthService).session$.pipe(
    map(session => session != undefined && (
      rights.length === 0 || 
      rights.some(r => {
        if(typeof r === 'string'){
          return session?.rights.some(({right}) => right === r)
        }
        return session?.rights.some(({right, streamId}) => right === r.right && streamId === r.streamId)
      })
    )),
  )
}
