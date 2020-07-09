package session

import (
	"sync"

	"github.com/apm-ai/datav/backend/pkg/db" 
)

var UserMap = &sync.Map{}
var UserList = make([]*User, 0)

type User struct {
	ID        string `json:"id"`
	Name      string `json:"name"`
	AvatarURL string `json:"avatarUrl"`
	Email     string `json:"email"`
	Mobile    string `json:"mobile"`
	Priv      string `json:"priv"`
}

func loadUser(id string) *User {
	var name, email, mobile, priv, avatarURL string
	err := db.SQL.QueryRow(`SELECT name,email,mobile,priv,avatar_url FROM users WHERE id=?`, id).Scan(&name, &email, &mobile, &priv, &avatarURL)
	if err != nil {
		logger.Warn("load user error", "error",err)
		return nil
	}

	if priv == "" {
		return nil
	}

	return &User{
		ID:        id,
		Name:      name,
		AvatarURL: avatarURL,
		Email:     email,
		Mobile:    mobile,
		Priv:      priv,
	}
}
