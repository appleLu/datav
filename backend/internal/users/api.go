package users

import (
	"sort"
	"strconv"
	"strings"

	"github.com/apm-ai/datav/backend/pkg/common"
	"github.com/apm-ai/datav/backend/pkg/db"
	"github.com/apm-ai/datav/backend/pkg/i18n"
	"github.com/apm-ai/datav/backend/pkg/models"
	"github.com/gin-gonic/gin"
)

func GetUsers(c *gin.Context) {
	rows, err := db.SQL.Query(`SELECT id,username,name,email,mobile,role,last_seen_at FROM user`)
	if err != nil {
		logger.Warn("get all users error", "error", err)
		c.JSON(500, common.ResponseErrorMessage(nil, i18n.OFF, err.Error()))
		return 
	}

	users := make(models.Users, 0)
	for rows.Next() {
		user := &models.User{}
		err := rows.Scan(&user.Id, &user.Username, &user.Name, &user.Email, &user.Mobile, &user.Role, &user.LastSeenAt)
		if err != nil {
			logger.Warn("get all users scan error", "error", err)
			continue
		}

		users = append(users, user)
	}

	sort.Sort(users)
	c.JSON(200, common.ResponseSuccess(users))
}

func GetUser(c *gin.Context) {
	id,_ := strconv.ParseInt(strings.TrimSpace(c.Query("id")),10,64)
	username := strings.TrimSpace(c.Query("username"))
	email := strings.TrimSpace(c.Query("email"))
	if id == 0 && username == "" && email == "" {
		c.JSON(400, common.ResponseErrorMessage(nil, i18n.OFF, "user name or id cannot be empty"))
		return
	}

	user,err := models.QueryUser(id,username,email)
	if err != nil {
		c.JSON(400, common.ResponseErrorMessage(nil, i18n.OFF, err.Error()))
		return
	}

	c.JSON(200, common.ResponseSuccess(user))
}
