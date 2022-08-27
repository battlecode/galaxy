## POST
### Creation 

POST to `/api/team/create`. 

Creates a team in this league, where the authenticated user is the first user to join the team. The user must not already be on a team in this episode. The team's name must be unique within the episode.

Returns the newly created team's ID.
```
{
    // name_short of the episode the team belongs to
    episode: string 
    // name of the team
    name: string 

    // new name of the team (for renaming)
    new_name: string
    // whether the team auto accepts ranked match requests 
    auto_accept_ranked: boolean 
    // whether the team auto accepts unranked match requests
    auto_accept_unranked: boolean 
    // eligibility criterion that are satisfied (array of eligibility criterion ids)
    eligible_for: string[]

    // max length 80
    quote?: string 
    // max length 1024
    biography?: string
    // where to find the team's avatar 
    avatar_url?: string

    // STAFF ONLY FIELDS
    // status of the team, see the TeamStatus class. by default this is "R" (regular)
    status?: string 
    // ids of the team members
    members? string
}
```

### Join 

POST to `/api/team/join`. 

Join a team. The episode must not be archived.
```
{
    // name of the team to join 
    name: string
    // episode that the team is in (needed for uniqueness)
    episode: string
    // passcode of the team to join 
    join_key: string 
}
```

## Leave

POST to `/api/team/leave`. 

Leave a team. The authenticated user must be on the 
```
{
    // name of the team to leave
    name: string 
    // episode that the team is in (needed for uniqueness)
    episode: string
}
```

## Edit

POST to `/api/team/edit`. Edit a team.
```
{
    // name_short of the episode the team belongs to
    episode: string 
    // name of the team
    name: string 

    // whether the team auto accepts ranked match requests 
    auto_accept_ranked?: boolean 
    // whether the team auto accepts unranked match requests
    auto_accept_unranked?: boolean 
    // eligibility criterion that are satisfied (array of eligibility criterion ids)
    eligible_for?: string[]

    // max length 80
    quote?: string 
    // max length 1024
    biography?: string
    // where to find the team's avatar 
    avatar_url?: string

    // ADMIN ONLY FIELDS
    // status of the team, see the TeamStatus class. by default this is "R" (regular)
    status?: string 
    // ids of the team members
    members?: string[]
}
```

## Delete Team, Remove Member, Add Member

These will be implemented in a future version of the API


## GET
### Team List

Get team list, taking into account if it should be ordered by ranking, if it should be filtered, etc.

### Team

Get information about a single team.

