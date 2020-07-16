export interface Team {
    id : number 
    name: string
    createdBy?: string
    createdById?: number
    memberCount?: number
}

export interface TeamMember {
    id: number 
    username: string 
    created: string 
    role: string 
}