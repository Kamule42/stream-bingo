import { StreamEntity } from "src/stream/entities/stream.entity";
import { RightEntity } from "src/user/entities/right.entity";
import { INextStream, IStream } from "./stream.interface";
import { NextStreamEntity } from "src/stream/entities/next-stream.entity";

export const streamMapper = ({id, name, twitchLogin, twitchId, enabled, rights}: StreamEntity, extended: boolean = false): IStream => ({
    id, 
    name,
    urlHandle: twitchLogin,
    twitchId,
    ...(extended ? {
      enabled,
      rights: rightsMapper(rights)
    } : undefined)
  })


export const nextStreamMapper = (entity: NextStreamEntity  | null): INextStream | null => {
  if(entity == null){
    return null
  }
  const {id, name, twitchLogin, twitchId, enabled, startAt} = entity
  return {
    id, 
    name,
    urlHandle: twitchLogin,
    twitchId,
    startAt,
    enabled,
  }
}

export const rightsMapper = (rights: Array<RightEntity>) => rights?.map(({ rightKey, user }) => ({
  right: rightKey,
  user_id: user.id,
  username: user.discordUsername
}))
