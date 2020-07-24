package users

import (
	"github.com/apm-ai/datav/backend/internal/invasion"
	"database/sql"
	"github.com/apm-ai/datav/backend/internal/sidemenu"
	"github.com/apm-ai/datav/backend/pkg/utils"
	"github.com/apm-ai/datav/backend/internal/session"
	// "fmt"
	"sort"
	"strconv"
	"strings"

	"github.com/apm-ai/datav/backend/pkg/common"
	"github.com/apm-ai/datav/backend/pkg/db"
	"github.com/apm-ai/datav/backend/pkg/i18n"
	"github.com/apm-ai/datav/backend/pkg/models"
	"github.com/gin-gonic/gin"
	"time"
)

func GetUsers(c *gin.Context) {
	rows, err := db.SQL.Query(`SELECT id,username,name,email,mobile,last_seen_at FROM user`)
	if err != nil {
		logger.Warn("get all users error", "error", err)
		c.JSON(500, common.ResponseErrorMessage(nil, i18n.OFF, err.Error()))
		return 
	}

	users := make(models.Users, 0)
	for rows.Next() {
		user := &models.User{}
		err := rows.Scan(&user.Id, &user.Username, &user.Name, &user.Email, &user.Mobile, &user.LastSeenAt)
		if err != nil {
			logger.Warn("get all users scan error", "error", err)
			continue
		}

		globalMember,err := models.QueryTeamMember(models.GlobalTeamId,user.Id)
		if err != nil {
			logger.Warn("get all users team member error", "error", err)
			continue
		}
		
		user.Role = globalMember.Role
		
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

type PasswordReq struct {
	New string `json:"new"`
	Old string `json:"old"`
	Confirm string `json:"confirm"`
}

func ChangePassword(c *gin.Context) {
	req := &PasswordReq{}
	c.Bind(&req)

	user := session.CurrentUser(c)

	if req.New == "" || req.Old == "" || req.Confirm == "" {
		c.JSON(400, common.ResponseErrorMessage(nil, i18n.OFF, "password cannot be empty"))
		return
	}

	if req.New != req.Confirm {
		c.JSON(400, common.ResponseErrorMessage(nil, i18n.OFF, "the new password does not match the confirm one"))
		return
	}

	// check old password matched
	password,_ := utils.EncodePassword(req.Old, user.Salt)
	if password != user.Password {
		c.JSON(400, common.ResponseErrorMessage(nil, i18n.OFF, "old password is not correct"))
		return
	}

	newPassword,_ := utils.EncodePassword(req.New,user.Salt)
	_, err := db.SQL.Exec("UPDATE user SET password=?,updated=? WHERE id=?",
	newPassword, time.Now(), user.Id)
	if err != nil {
		logger.Warn("update user password error", "error", err)
		c.JSON(500, common.ResponseErrorMessage(nil, i18n.OFF, err.Error()))
		return
	}

	c.JSON(200, common.ResponseSuccess(nil))
}	


func GetSideMenus(c *gin.Context) {
	userId := session.CurrentUserId(c)

	members,err := models.QueryTeamMembersByUserId(userId)
	if err != nil {
		logger.Warn("query team members by userId error", "error", err)
		c.JSON(500, common.ResponseErrorMessage(nil, i18n.OFF, err.Error()))
		return
	}

	sidemenus := make([]*models.SideMenu,0) 

	for _,member := range members {
		sm,err := sidemenu.QuerySideMenu(0,member.TeamId)
		if err != nil  {
			if  err != sql.ErrNoRows {
				logger.Error("query sidemenu error","teamId:",member.TeamId,"error",err)
			}		
			continue
		}
		
		team,err := models.QueryTeam(member.TeamId,"")
		if err != nil {
			logger.Error("query team error","teamId:",member.TeamId,"error",err)
			continue
		}

		sidemenus = append(sidemenus, &models.SideMenu{
			Id: sm.Id,
			Desc : sm.Desc,
			TeamId: team.Id,
			TeamName: team.Name,
		})
	}

	c.JSON(200, common.ResponseSuccess(sidemenus))
}

type UpdateSideMenuReq struct {
	MenuId int64 `json:"menuId"`
}

func UpdateSideMenu(c *gin.Context) {
	userId := session.CurrentUserId(c)
	req := &UpdateSideMenuReq{}
	c.Bind(&req)

	_,err := db.SQL.Exec("UPDATE user SET sidemenu=? WHERE id=?",req.MenuId,userId)
	if err != nil {
		logger.Warn("update side menu error", "error", err)
		c.JSON(500, common.ResponseErrorMessage(nil, i18n.OFF, err.Error()))
		return
	}

	c.JSON(200, common.ResponseSuccess(nil))
}

func UpdateUserInfo(c *gin.Context) {
	user := &models.User{}
	c.Bind(&user)

	if !user.Role.IsValid() {
		c.JSON(400, common.ResponseErrorMessage(nil, i18n.OFF, "bad user role"))
		return
	}
	
	now := time.Now()

	userId := session.CurrentUserId(c)
	if user.Id != userId {
		logger.Warn("update user invasion", "target_user_id", user.Id, "current_user_id", userId)
		invasion.Add(c)
	}

	_, err := db.SQL.Exec("UPDATE user SET name=?,email=?,updated=? WHERE id=?",
		 user.Name, user.Email, now, userId)
	if err != nil {
		logger.Warn("update user error", "error", err)
		c.JSON(500, common.ResponseErrorMessage(nil, i18n.OFF, err.Error()))
		return
	}

	c.JSON(200, common.ResponseSuccess(nil))
}

// the roles of current user in team
func GetUserTeamRoles(c *gin.Context) {
	members,err := models.QueryTeamMembersByUserId(session.CurrentUserId(c))
	if err != nil {
		logger.Warn("get team members by user id error", "error", err)
		c.JSON(500, common.ResponseErrorMessage(nil, i18n.OFF, err.Error()))
		return
	}

	roles := make(map[int64]models.RoleType) 
	for _,m := range members {
		roles[m.TeamId] = m.Role
	}

	c.JSON(200, common.ResponseSuccess(roles))
}