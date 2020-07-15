package users

import (
	"fmt"
	"sort"
	"strconv"
	"strings"
	"time"

	"github.com/apm-ai/datav/backend/internal/session"
	"github.com/apm-ai/datav/backend/pkg/common"
	"github.com/apm-ai/datav/backend/pkg/db"
	"github.com/apm-ai/datav/backend/pkg/i18n"
	"github.com/apm-ai/datav/backend/pkg/models"
	"github.com/apm-ai/datav/backend/pkg/utils"
	"github.com/gin-gonic/gin"
)

func GetUsers(c *gin.Context) {
	rows, err := db.SQL.Query(`SELECT id,username,name,email,mobile,role,last_seen_at FROM user`)
	if err != nil {
		logger.Warn("get all users error", "error", err)
		c.JSON(500, common.ResponseErrorMessage(nil, i18n.OFF, err.Error()))
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

	user,err := QueryUser(id,username,email)
	if err != nil {
		c.JSON(400, common.ResponseErrorMessage(nil, i18n.OFF, err.Error()))
		return
	}

	c.JSON(200, common.ResponseSuccess(user))
}

func NewUser(c *gin.Context) {
	req := make(map[string]string)
	c.Bind(&req)
	username := strings.TrimSpace(req["username"])
	password := strings.TrimSpace(req["password"])
	email := strings.TrimSpace(req["email"])
	role := models.RoleType(strings.TrimSpace(req["role"]))
	if username == "" || password == "" {
		c.JSON(400, common.ResponseErrorMessage(nil, i18n.OFF, "username or password cannot be empty"))
		return
	}

	if !role.IsValid() {
		c.JSON(400, common.ResponseErrorMessage(nil, i18n.OFF, "bad user role"))
		return
	}

	if email == "" {
		email = fmt.Sprintf("%s@localhost", username)
	}

	salt, _ := utils.GetRandomString(10)
	encodedPW, _ := utils.EncodePassword(password, salt)
	now := time.Now()

	res, err := db.SQL.Exec("INSERT INTO user (username,password,salt,email,role,created,updated) VALUES (?,?,?,?,?,?,?)",
		username, encodedPW, salt, email, role, now, now)
	if err != nil {
		logger.Warn("new user error", "error", err)
		c.JSON(500, common.ResponseErrorMessage(nil, i18n.OFF, err.Error()))
		return
	}

	id, _ := res.LastInsertId()

	c.JSON(200, common.ResponseSuccess(&models.User{
		Id:       id,
		Username: username,
		Email:    email,
		Created:  now,
		Updated:  now,
		Role:     role,
	}))
}

func DeleteUser(c *gin.Context) {
	userId, _ := strconv.ParseInt(c.Param("id"), 10, 64)
	if userId == 0 {
		c.JSON(400, common.ResponseErrorMessage(nil, i18n.OFF, "bad user id"))
		return
	}

	currentUserId := session.CurrentUserId(c)
	if userId == currentUserId {
		c.JSON(400, common.ResponseErrorMessage(nil, i18n.OFF, "You cannot delete yourself"))
		return
	}

	_, err := db.SQL.Exec("DELETE FROM user WHERE id=?", userId)
	if err != nil {
		logger.Warn("delete user error", "error", err)
		c.JSON(500, common.ResponseErrorMessage(nil, i18n.OFF, err.Error()))
		return
	}

	c.JSON(200, nil)
}

func UpdateUser(c *gin.Context) {
	user := &models.User{}
	c.Bind(&user)

	if !user.Role.IsValid() {
		c.JSON(400, common.ResponseErrorMessage(nil, i18n.OFF, "bad user role"))
		return
	}

	_, err := db.SQL.Exec("UPDATE user SET username=?,name=?,email=?,role=?,updated=? WHERE id=?",
		user.Username, user.Name, user.Email, user.Role, time.Now(), user.Id)
	if err != nil {
		logger.Warn("update user error", "error", err)
		c.JSON(500, common.ResponseErrorMessage(nil, i18n.OFF, err.Error()))
		return
	}

	c.JSON(200, common.ResponseSuccess(nil))
}

func UpdatePassword(c *gin.Context) {
	req := make(map[string]string)
	c.Bind(&req)

	userId, _ := strconv.ParseInt(req["id"], 10, 64)
	password := req["password"]

	if userId == 0 || password == "" {
		c.JSON(400, common.ResponseErrorMessage(nil, i18n.OFF, "bad userid or password"))
		return
	}

	user,err := QueryUser(userId,"","")
	if err != nil {
		c.JSON(500, common.ResponseErrorMessage(nil, i18n.OFF, err.Error()))
		return 
	}

	if user.Id == 0 {
		c.JSON(400, common.ResponseErrorMessage(nil, i18n.OFF, "target user not exist"))
		return
	}

	encodedPW, _ := utils.EncodePassword(password, user.Salt)

	_, err = db.SQL.Exec("UPDATE user SET password=?,updated=? WHERE id=?",
		encodedPW, time.Now(), user.Id)
	if err != nil {
		logger.Warn("update user password error", "error", err)
		c.JSON(500, common.ResponseErrorMessage(nil, i18n.OFF, err.Error()))
		return
	}

	c.JSON(200, common.ResponseSuccess(nil))
}
