package users

import (
	"database/sql"
	"github.com/apm-ai/datav/backend/pkg/db"
	"github.com/apm-ai/datav/backend/pkg/log"
	"github.com/apm-ai/datav/backend/pkg/models"
)

var logger = log.RootLogger.New("logger", "users")

func QueryUser(id int64, username string, email string) (*models.User,error) {
	user := &models.User{}
	err := db.SQL.QueryRow(`SELECT id,username,name,email,mobile,role,salt,last_seen_at FROM user WHERE id=? or username=? or email=?`,
		id, username, email).Scan(&user.Id, &user.Username, &user.Name, &user.Email, &user.Mobile, &user.Role, &user.Salt, &user.LastSeenAt)
	if err != nil && err != sql.ErrNoRows{
		logger.Warn("query user error", "error", err)
		return user,err
	}

	if user.Role == "" {
		user.Role = models.ROLE_VIEWER
	}

	return user,nil
}
