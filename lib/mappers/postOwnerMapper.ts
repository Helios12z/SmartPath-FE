import type { StoredUser, UserProfile } from "../types";

export type PostOwner = {
    id: string,
    username: string,
    avatar_url: string 
}

export function mapUserToPostOwner(p: UserProfile): PostOwner {
    return {
        id: p.id,
        avatar_url: p.avatarUrl??"",
        username: p.username
    }
}