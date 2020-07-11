package dashboard

import (
	"database/sql"
	// "fmt"
	"net/http"
	"time"

	"strings"

	"github.com/apm-ai/datav/backend/internal/session"
	"github.com/apm-ai/datav/backend/pkg/common"
	"github.com/apm-ai/datav/backend/pkg/db"
	"github.com/apm-ai/datav/backend/pkg/i18n"
	"github.com/apm-ai/datav/backend/pkg/models"
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
	if !update { // create dashboard
		dash.Uid = utils.GenerateShortUID()
		dash.Data.Set("version", 0)
		dash.CreatedBy = user.ID
		dash.Created = time.Now()
	} else { //update dashboard
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

	if !update {
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
		_, err := db.SQL.Exec(`UPDATE dashboard SET uid=?, title=?, version=?, folder_id=?, data=?,updated=? WHERE id=?`,
			dash.Uid, dash.Title, dash.Version, dash.FolderId, jsonData, dash.Updated, dash.Id)
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
		if err ==sql.ErrNoRows {
			c.JSON(404,common.ResponseError(nil))
			return
		}
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

	data.Set("id", id)
	data.Set("uid", uid)

	c.JSON(200, common.ResponseSuccess(utils.Map{
		"dashboard": data,
		"meta":      dashMeta,
	}))
}

func ImportDashboard(c *gin.Context) {
	user := session.GetUser(c)

	dsData := &ReqDashboardData{}
	err := c.Bind(&dsData)
	if err != nil {
		logger.Warn("save dashboard req data error", "error", err)
		c.JSON(http.StatusBadRequest, common.ResponseErrorMessage(nil, i18n.OFF, err.Error()))
		return
	}

	dash := &Dashboard{}
	dash.Data = dsData.Dashboard
	dash.Title = strings.TrimSpace(dsData.Dashboard.Get("title").MustString())
	dash.Uid = strings.TrimSpace(dsData.Dashboard.Get("uid").MustString())
	dash.Data.Set("title", dash.Title)
	dash.FolderId = dsData.FolderId
	dash.IsFolder = dsData.IsFolder

	dash.Data.Set("version", 0)

	dash.CreatedBy = user.ID
	dash.Created = time.Now()
	dash.Updated = time.Now()

	dash.UpdateSlug()

	if dash.Title == "" {
		c.JSON(http.StatusBadRequest, common.ResponseErrorMessage(nil, i18n.OFF, "Dashboard title cannot be empty"))
		return
	}

	if dash.IsFolder && dash.FolderId > 0 {
		c.JSON(http.StatusBadRequest, common.ResponseErrorMessage(nil, i18n.OFF, "A Dashboard Folder cannot be added to another folder"))
		return
	}

	if dash.IsFolder && strings.EqualFold(dash.Title, models.RootFolderName) {
		c.JSON(http.StatusBadRequest, common.ResponseErrorMessage(nil, i18n.OFF, "A folder with that name already exists"))
		return
	}

	if !utils.IsValidShortUID(dash.Uid) {
		c.JSON(http.StatusBadRequest, common.ResponseErrorMessage(nil, i18n.OFF, "uid contains illegal characters"))
		return
	} else if len(dash.Uid) > 40 {
		c.JSON(http.StatusBadRequest, common.ResponseErrorMessage(nil, i18n.OFF, "uid to long. max 40 characters"))
		return
	}





	jsonData, err := dash.Data.Encode()

	res, err := db.SQL.Exec(`INSERT INTO dashboard (uid, title, version, created_by, folder_id, data,created,updated) VALUES (?,?,?,?,?,?,?,?)`,
		dash.Uid, dash.Title, dash.Version, dash.CreatedBy, dash.FolderId, jsonData, dash.Created, dash.Updated)
	if err != nil {
		logger.Warn("create dashboard error", "error", err)
		c.JSON(500, common.ResponseErrorMessage(nil, i18n.OFF, err.Error()))
		return
	}

	id, _ := res.LastInsertId()
	dash.Id = id

	c.JSON(200, common.ResponseSuccess(utils.Map{
		"slug":    dash.Slug,
		"version": dash.Version,
		"id":      dash.Id,
		"uid":     dash.Uid,
		"url":     dash.GetUrl(),
	}))
}
