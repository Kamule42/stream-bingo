import { StreamEntity } from "src/stream/entities/stream.entity";
import { RightEntity } from "src/user/entities/right.entity";
import { ICell, INextStream, IStream } from "./stream.interface";
import { NextStreamEntity } from "src/stream/entities/next-stream.entity";
import { CellEntity } from "src/stream/entities/cell.entity";

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
  const {id, name, twitchLogin, twitchId, enabled, startAt, streamStartAt, status} = entity
  return {
    id, 
    name,
    urlHandle: twitchLogin,
    twitchId,
    startAt,
    streamStartAt,
    enabled,
    status,
  }
}

export const rightsMapper = (rights: Array<RightEntity>) => rights?.map(({ rightKey, user }) => ({
  right: rightKey,
  user_id: user.id,
  username: user.discordUsername
}))

export const cellsMapper = (cells?: Array<CellEntity>): Array<ICell> => cells
  ?.map(({id, name, description, active}) => ({
  id, name, description, active,
})) ?? []
