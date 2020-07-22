package sidemenu

import (
	"time"
	"encoding/json"
	"github.com/apm-ai/datav/backend/pkg/db"
	"github.com/apm-ai/datav/backend/internal/acl"
	"github.com/apm-ai/datav/backend/pkg/models"
	"github.com/apm-ai/datav/backend/internal/invasion"
	"github.com/apm-ai/datav/backend/pkg/i18n"
	"github.com/apm-ai/datav/backend/pkg/common"
	"github.com/gin-gonic/gin"
	"strconv"
)

func GetMenu(c *gin.Context) {
	teamId,_ := strconv.ParseInt(c.Param("teamId"),10,64)
	if teamId == 0 {
		invasion.Add(c)
		c.JSON(400, common.ResponseErrorMessage(nil,i18n.OFF,"bad team id"))
		return 
	}


	menu,err := QuerySideMenu(0,teamId)
	if err != nil {
		logger.Error("query side menu error","error",err)
		c.JSON(500, common.ResponseErrorMessage(nil,i18n.ON, i18n.DbErrMsg))
		return 
	}

	c.JSON(200, common.ResponseSuccess(menu))
}

func UpdateMenu(c *gin.Context) {
	teamId,_ := strconv.ParseInt(c.Param("teamId"),10,64)
	if teamId == 0 {
		invasion.Add(c)
		c.JSON(400, common.ResponseErrorMessage(nil,i18n.OFF,"bad team id"))
		return 
	}

	menu := &models.SideMenu{}
	c.Bind(&menu)

	if !acl.IsTeamAdmin(menu.TeamId, c) {
		c.JSON(403, common.ResponseErrorMessage(nil, i18n.ON, i18n.NoPermissionMsg))
		return
	}
	
	data,_ := json.Marshal(menu.Data)
	_,err := db.SQL.Exec("UPDATE sidemenu SET desc=?,data=?,updated=? WHERE id=? and team_id=?",menu.Desc,data,time.Now(),menu.Id,menu.TeamId)
	if err != nil {
		logger.Error("update sidemenu error", "error", err)
		c.JSON(500, common.ResponseErrorMessage(nil, i18n.OFF, err.Error()))
		return
	}

	c.JSON(200, common.ResponseSuccess(nil))
}