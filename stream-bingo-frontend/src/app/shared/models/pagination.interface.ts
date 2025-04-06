export interface IPagination{
    page?: number
    limit?: number
    sortBy?: Array<[string, string]>
    searchBy?: Array<string>
    search?: string
    filter?: {
        [column: string]: string | Array<string>
    }
    select?: Array<string>
    cursor?: string
}
