import { RoundStatus } from "../rounds/round.interface"

export interface IRight {
	right: string
	user_id: string
	username: string
}

export interface IStream<T = IRight> {
	id: string
	name: string
	twitchId: string
	urlHandle: string
	enabled?: boolean
	rights?: T[]
	isFav?: boolean,
	cells?: ICell[],
	status?: RoundStatus,
}

export interface ICell {
	id: string,
	name: string,
	description: string,
	active: boolean,
}



export interface ISeason {
	id: string,
	name: string,
	date: Date,
}

export interface IRawSeason {
	id: string,
	name: string,
	date: string,
}
