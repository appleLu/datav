package dashboard

import (
	// "fmt"
	"net/http"
	"time"

	"github.com/apm-ai/datav/backend/internal/session"
	"github.com/apm-ai/datav/backend/pkg/common"
	"github.com/apm-ai/datav/backend/pkg/db"
	"github.com/apm-ai/datav/backend/pkg/i18n"
	"github.com/apm-ai/datav/backend/pkg/utils"
	"github.com/apm-ai/datav/backend/pkg/utils/simplejson"
	"github.com/gin-gonic/gin"
)

type ReqDashboardData struct {
	Dashboard *simplejson.Json `json:"dashboard"`
	Overwrite bool             `json:"overwrite"`
	FolderId  int64            `json:"folderId"`
	IsFolder  bool             `json:"isFolder"`
}

func SaveDashboard(c *gin.Context) {
	user := session.GetUser(c)

	dsData := &ReqDashboardData{}
	err := c.Bind(&dsData)
	if err != nil {
		logger.Warn("save dashboard req data error", "error", err)
		c.JSON(http.StatusBadRequest, common.ResponseErrorMessage(nil, i18n.OFF, err.Error()))
		return
	}
	
	dash := &Dashboard{}
	if id, err := dsData.Dashboard.Get("id").Float64(); err == nil {
		dash.Id = int64(id)
	}
	
	dash.Data = dsData.Dashboard
	
	update := dash.Id != 0
	if(!update) {	// create dashboard
		dash.Uid = utils.GenerateShortUID()
		dash.Data.Set("version", 0)
		dash.CreatedBy = user.ID
		dash.Created = time.Now()
	} else {//update dashboard
		dash.Uid = dsData.Dashboard.Get("uid").MustString()
		if version, err := dsData.Dashboard.Get("version").Float64(); err == nil && update {
			dash.Version = int(version)	
		} 
	}
	dash.Title = dsData.Dashboard.Get("title").MustString()
	dash.UpdateSlug()


	dash.Updated = time.Now()

	dash.FolderId = dsData.FolderId
	dash.IsFolder = dsData.IsFolder

	jsonData, err := dash.Data.Encode()


	if (!update) {
		res, err := db.SQL.Exec(`INSERT INTO dashboard (uid, title, version, created_by, folder_id, data,created,updated) VALUES (?,?,?,?,?,?,?,?)`,
		dash.Uid, dash.Title, dash.Version, dash.CreatedBy, dash.FolderId, jsonData, dash.Created, dash.Updated)
		if err != nil {
			logger.Warn("create dashboard error", "error", err)
			c.JSON(500, common.ResponseErrorMessage(nil, i18n.OFF, err.Error()))
			return
		}

		id, _ := res.LastInsertId()
		dash.Id = id
	} else {
		_, err := db.SQL.Exec(`UPDATE dashboard SET title=?, version=?, folder_id=?, data=?,updated=? WHERE id=?`,
		 dash.Title, dash.Version, dash.FolderId, jsonData,dash.Updated, dash.Id)
		if err != nil {
			logger.Warn("update dashboard error", "error", err)
			c.JSON(500, common.ResponseErrorMessage(nil, i18n.OFF, err.Error()))
			return
		}
	}




	c.JSON(200, common.ResponseSuccess(utils.Map{
		"slug":    dash.Slug,
		"version": dash.Version,
		"id":      dash.Id,
		"uid":     dash.Uid,
		"url":     dash.GetUrl(),
	}))
}

func GetDashboard(c *gin.Context) {
	uid := c.Param("uid")

	var rawJSON []byte
	var id int64
	dashMeta := &DashboardMeta{}
	err := db.SQL.QueryRow(`SELECT id,version, created_by, folder_id, data,created,updated FROM dashboard WHERE uid=?`, uid).Scan(
		&id, &dashMeta.Version, &dashMeta.CreatedBy, &dashMeta.FolderId, &rawJSON, &dashMeta.Created, &dashMeta.Updated,
	)
	if err != nil {
		logger.Warn("get dashboard error", "error", err)
		c.JSON(500, common.ResponseErrorMessage(nil, i18n.OFF, err.Error()))
		return
	}

	data := simplejson.New()
	err = data.UnmarshalJSON(rawJSON)
	if err != nil {
		logger.Warn("unmarshal json data error", "error", err)
		c.JSON(500, common.ResponseErrorMessage(nil, i18n.OFF, err.Error()))
		return
	}

	data.Set("id",id)
	data.Set("uid",uid)

	c.JSON(200, common.ResponseSuccess(utils.Map{
		"dashboard": data,
		"meta":      dashMeta,
	}))
}
