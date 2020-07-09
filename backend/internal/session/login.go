package session

import (
	// "fmt"
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
	UserID   string `json:"userid"`
	Password string `json:"password"`
}

// Login ...
func Login(c *gin.Context) {
	var lm = &LoginModel{}
	c.Bind(&lm)

	userid := lm.UserID
	password := lm.Password

	logger.Info("login with password:", "userid", userid)

	// 检查信息是否正确
	var pw, priv, name, mobile, email, avatarURL string
	row := db.SQL.QueryRow(`select password,priv,name,mobile,email,avatar_url FROM users WHERE id=?`, userid)
	err := row.Scan(&pw, &priv, &name, &mobile, &email, &avatarURL)
	if err != nil {
		logger.Warn("query user when login", "error",err)
		c.JSON(http.StatusInternalServerError, common.ResponseErrorMessage(nil, i18n.ON, i18n.DbErrMsg))
		return 
	}

	if pw == "" || pw != password {
		c.JSON(http.StatusUnauthorized, common.ResponseErrorMessage(nil, i18n.ON, i18n.UsePwInvalidMsg))
		return 
	}

	// 若之前已登陆，则删除之前的登陆信息
	token := getToken(c)
	deleteSession(token)

	token = strconv.FormatInt(time.Now().UnixNano(), 10)

	// 设置权限
	if priv == "" {
		priv = common.PRIV_NORMAL
	}

	session := &Session{
		Token: token,
		User: &User{
			ID:        userid,
			Priv:      priv,
			Name:      name,
			Email:     email,
			Mobile:    mobile,
			AvatarURL:  avatarURL,
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
	_, err = db.SQL.Exec(`UPDATE users SET last_login_date=? WHERE id=?`, time.Now().Unix(), session.User.ID)
	if err != nil {
		logger.Warn("set last login date error", "error",err)
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
