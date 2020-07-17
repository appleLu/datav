package acl

import (
	"github.com/apm-ai/datav/backend/pkg/models"
	"github.com/apm-ai/datav/backend/pkg/log"
	"github.com/apm-ai/datav/backend/internal/session"
	"github.com/gin-gonic/gin"
)

var logger = log.RootLogger.New("logger", "acl")

func IsSuperAdmin(c *gin.Context) bool {
	user := session.CurrentUser(c)
	if user.Username == models.SuperAdminUsername {
		return true
	}

	return false
}

func IsGlobalAdmin(c *gin.Context) bool {
	user := session.CurrentUser(c)
	return user.Role.IsAdmin()
}

func IsUserSelf(userId int64,c *gin.Context) bool {
	user := session.CurrentUser(c)
	return user.Id == userId
}

func IsTeamAdmin(teamId int64,c *gin.Context) bool {
	user := session.CurrentUser(c)
	if user.Role.IsAdmin() { //global admin is also team admin
		return true
	}


	teamMember, err := models.QueryTeamMember(teamId,user.Id)
	if err != nil {
		logger.Warn("query team member error","error",err)
		return false
	}

	if teamMember.Role.IsAdmin() {
		return true
	}

	return false
}

func IsTeamCreator(teamId int64,c *gin.Context) bool {
	team,err := models.QueryTeam(teamId,"")
	if err != nil {
		logger.Warn("query team  error","error",err)
		return false
	}

	userId := session.CurrentUserId(c)
	if team.CreatedById == userId {
		return true
	}

	return false
}