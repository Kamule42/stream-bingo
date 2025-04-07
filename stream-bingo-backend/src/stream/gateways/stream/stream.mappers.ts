import { StreamEntity } from "src/stream/entities/stream.entity";
import { RightEntity } from "src/user/entities/rights.entity";

export const streamMapper = ({id, name, twitchLogin, twitchId, enabled, rights}: StreamEntity, extended: boolean = false) => ({
    id, 
    name,
    urlHandle: twitchLogin,
    twitchId,
    ...(extended ? {
      enabled,
      rights: rightsMapper(rights)
    } : undefined)
  })

export const rightsMapper = (rights: Array<RightEntity>) => rights?.map(({ rightKey, user }) => ({
  right: rightKey,
  user_id: user.id,
  usernma: user.discordUsername
}))
