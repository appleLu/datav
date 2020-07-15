package models

import (
	"time"
)

type User struct {
	Id         int64     `json:"id"`
	Username   string    `json:"username"`
	Name       string    `json:"name"`
	Email      string    `json:"email"`
	Mobile     string    `json:"mobile"`
	Role       RoleType  `json:"role"`
	LastSeenAt time.Time `json:"last_seen_at,omitempty"`
	Created    time.Time `json:"created,omitempty"`
	Updated    time.Time `json:"updated,omitempty"`
	Salt       string    `json:"-"`
}

type Users []*User

func (s Users) Len() int      { return len(s) }
func (s Users) Swap(i, j int) { s[i], s[j] = s[j], s[i] }
func (s Users) Less(i, j int) bool {
	return s[i].LastSeenAt.Unix() > s[j].LastSeenAt.Unix()
}
