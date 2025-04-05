import { StreamEntity } from "src/stream/entities/stream.entity";

export const streamMapper = ({id, name, twitchLogin, twitchId}: StreamEntity) => ({
    id, 
    name,
    urlHandle: twitchLogin,
    twitchId,
  })
