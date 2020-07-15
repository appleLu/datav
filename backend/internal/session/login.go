package session

import (
	"github.com/apm-ai/datav/backend/pkg/utils"
	"github.com/apm-ai/datav/backend/pkg/models"
	"fmt"
	"net/http"
	"strconv"
	"time"

	"github.com/apm-ai/datav/backend/pkg/common"
	"github.com/apm-ai/datav/backend/pkg/db"
	"github.com/apm-ai/datav/backend/pkg/i18n"
	"github.com/gin-gonic/gin"
)

// LoginModel ...
type LoginModel struct {
	Username string `json:"username"`
	Password string `json:"password"` 
}

// Login ...
func Login(c *gin.Context) {
	var lm = &LoginModel{}
	c.Bind(&lm)

	username := lm.Username
	password := lm.Password

	logger.Info("User loged in", "username", username)

	// 检查信息是否正确
	var id int64
	var pw, role, name, mobile, email,salt string
	row := db.SQL.QueryRow(`select id,password,salt,role,name,mobile,email FROM user WHERE username=?`, username)
	err := row.Scan(&id, &pw,&salt, &role, &name, &mobile, &email)
	if err != nil {
		logger.Warn("query user when login", "error", err)
		c.JSON(http.StatusInternalServerError, common.ResponseErrorMessage(nil, i18n.ON, i18n.DbErrMsg))
		return
	}
	
	fmt.Println("pw: ",pw,"salt:",salt)
	encodedPassword,_ := utils.EncodePassword(password,salt)
	if encodedPassword != pw{
		fmt.Println(password,salt,pw)
		c.JSON(http.StatusForbidden, common.ResponseErrorMessage(nil, i18n.ON, i18n.UsePwInvalidMsg))
		return
	}

	token := getToken(c)
	deleteSession(token)

	token = strconv.FormatInt(time.Now().UnixNano(), 10)

	// 设置权限
	if role == "" {
		role = models.ROLE_VIEWER
	}

	session := &Session{
		Token: token,
		User: &models.User{
			Id:       id,
			Username: username,
			Role:     models.RoleType(role),
			Name:     name,
			Email:    email,
			Mobile:   mobile,
		},
		CreateTime: time.Now(),
	}
	//sub token验证成功，保存session
	err = storeSession(session)
	if err != nil {
		c.JSON(http.StatusInternalServerError, common.ResponseErrorMessage(nil, i18n.ON, i18n.DbErrMsg))
		return
	} 
 
	// 更新数据库中的user表
	_, err = db.SQL.Exec(`UPDATE user SET last_seen_at=? WHERE id=?`, time.Now(), id)
	if err != nil {
		logger.Warn("set last login date error", "error", err)
	}

	c.JSON(http.StatusOK, common.ResponseSuccess(session))
}

// Logout ...
func Logout(c *gin.Context) {
	token := getToken(c)
	// 删除用户的session
	deleteSession(token)

	c.JSON(http.StatusOK, common.ResponseSuccess(nil))
}
