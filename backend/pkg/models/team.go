package models

import (
	"database/sql"
	"github.com/apm-ai/datav/backend/pkg/db"
	"time"
)

// dont change !
const (
	GlobalTeamId = 1
	GlobalTeamName = "global"
)

type Team struct {
	Id          int64     `json:"id"`
	Name        string    `json:"name"`
	CreatedBy   string    `json:"createdBy"`   // creator's username
	CreatedById int64     `json:"createdById"` // creator's username
	Created     time.Time `json:"created,omitempty"`
	Updated     time.Time `json:"updated,omitempty"`
	MemberCount int       `json:"memberCount,omitempty"`
}

type Teams []*Team

func (s Teams) Len() int      { return len(s) }
func (s Teams) Swap(i, j int) { s[i], s[j] = s[j], s[i] }
func (s Teams) Less(i, j int) bool {
	return s[i].MemberCount > s[j].MemberCount
}

type TeamMember struct {
	Id       int64     `json:"id"`
	TeamId   int64     `json:"teamId,omitempty"`
	Username string    `json:"username"`
	Created  time.Time `json:"created"`
	Role     RoleType    `json:"role"`
	RoleSortWeight int   `json:"-"`
	CreatedAge string `json:"createdAge"`
}


type TeamMembers []*TeamMember

func (s TeamMembers) Len() int      { return len(s) }
func (s TeamMembers) Swap(i, j int) { s[i], s[j] = s[j], s[i] }
func (s TeamMembers) Less(i, j int) bool {
	return s[i].RoleSortWeight > s[j].RoleSortWeight
}


func QueryTeam(id int64, name string) (*Team,error) {
	team := &Team{}
	err := db.SQL.QueryRow(`SELECT id,name,created_by FROM team WHERE id=? or name=?`,
		id, name).Scan(&team.Id,  &team.Name, &team.CreatedById)
	if err != nil && err != sql.ErrNoRows{
		return team,err
	}

	return team,nil
}

func QueryTeamMember(teamId int64,userId int64) (*TeamMember,error) {
	member := &TeamMember{}
	member.Role = ROLE_VIEWER
	err := db.SQL.QueryRow(`SELECT role FROM team_member WHERE team_id=? and user_id=?`,
		teamId, userId).Scan(&member.Role)
	if err != nil && err != sql.ErrNoRows{
		return member,err
	}

	if err == sql.ErrNoRows {
		return member,nil
	}

	member.Id = userId
	member.TeamId = teamId
	
	return member,nil
}