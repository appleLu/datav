package models

import (
	"database/sql"
	"github.com/apm-ai/datav/backend/pkg/db"
	"time"
)

const (
	SuperAdminUsername = "admin"
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



func QueryUser(id int64, username string, email string) (*User,error) {
	user := &User{}
	err := db.SQL.QueryRow(`SELECT id,username,name,email,mobile,role,salt,last_seen_at FROM user WHERE id=? or username=? or email=?`,
		id, username, email).Scan(&user.Id, &user.Username, &user.Name, &user.Email, &user.Mobile, &user.Role, &user.Salt, &user.LastSeenAt)
	if err != nil && err != sql.ErrNoRows{
		return user,err
	}

	if user.Role == "" {
		user.Role = ROLE_VIEWER
	}

	return user,nil
}
