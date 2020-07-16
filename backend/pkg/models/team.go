package models

import (
	"time"
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