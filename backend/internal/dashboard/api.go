package dashboard

import (
	"github.com/apm-ai/datav/backend/internal/acl"
	"sort"
	"github.com/apm-ai/datav/backend/internal/cache"
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
	"strconv"
)

type ReqDashboardData struct {
	Dashboard *simplejson.Json `json:"dashboard"`
	Overwrite bool             `json:"overwrite"`
	FolderId  int            `json:"folderId"`
	IsFolder  bool             `json:"isFolder"`
}

func SaveDashboard(c *gin.Context) {
	userId := session.CurrentUserId(c)
  
	dsData := &ReqDashboardData{}
	err := c.Bind(&dsData)
	if err != nil {
		logger.Warn("save dashboard req data error", "error", err)
		c.JSON(http.StatusBadRequest, common.ResponseErrorMessage(nil, i18n.OFF, err.Error()))
		return
	}

	dash := &models.Dashboard{}
	if id, err := dsData.Dashboard.Get("id").Float64(); err == nil {
		dash.Id = int64(id)
	}

	dash.Data = dsData.Dashboard

	now := time.Now()
	update := dash.Id != 0
	if !update { // create dashboard
		dash.Uid = utils.GenerateShortUID()
		dash.Data.Set("version", 0)
		dash.CreatedBy = userId
		dash.Created = now
	} else { //update dashboard
		dash.Uid = dsData.Dashboard.Get("uid").MustString()
		if version, err := dsData.Dashboard.Get("version").Float64(); err == nil && update {
			dash.Version = int(version)
		}
	}
	dash.Title = dsData.Dashboard.Get("title").MustString()
	dash.UpdateSlug()

	dash.Updated = now

	dash.FolderId = dsData.FolderId


	jsonData, err := dash.Data.Encode()

	if !update {
		res, err := db.SQL.Exec(`INSERT INTO dashboard (uid, title, version,owned_by, created_by, folder_id, data,created,updated) VALUES (?,?,?,?,?,?,?,?,?)`,
			dash.Uid, dash.Title, dash.Version,models.GlobalTeamId, dash.CreatedBy, dash.FolderId, jsonData, dash.Created, dash.Updated)
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

	if !update {
		// set dashboard acl
		_,err := db.SQL.Exec("INSERT INTO dashboard_acl (dashboard_id,team_id,created) VALUES (?,?,?)",
		dash.Id,models.GlobalTeamId,now)
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

func UpdateOwnedBy(c *gin.Context) {
	req := make(map[string]int64)
	c.Bind(&req)
	
	dashId := req["dashId"]
	ownedBy := req["ownedBy"]

	if dashId == 0 || ownedBy == 0 {
		c.JSON(400, common.ResponseErrorMessage(nil,i18n.OFF,"bad data"))
		return 
	}
	
	// get current ownedby
	meta := QueryDashboardMeta(dashId)
	currentOwnedBy := meta.OwnedBy

	// check we have permission to do this
	if !acl.IsGlobalAdmin(c) && !acl.IsTeamAdmin(currentOwnedBy,c) {
		c.JSON(403, common.ResponseErrorMessage(nil,i18n.ON,i18n.NoPermissionMsg))
		return
	}

	// check target team id exists
	team,err := models.QueryTeam(ownedBy,"")
	if err != nil {
		logger.Warn("query team error", "error", err)
		c.JSON(500, common.ResponseErrorMessage(nil, i18n.OFF, err.Error()))
		return
	}
	if team.Id != ownedBy {
		c.JSON(400, common.ResponseErrorMessage(nil,i18n.OFF,"bad owned by"))
		return 
	}

	_,err = db.SQL.Exec("UPDATE dashboard SET owned_by=? WHERE id=?",ownedBy,dashId)
	if err != nil {
		logger.Warn("update dashboard ownedBy error", "error", err)
		c.JSON(500, common.ResponseErrorMessage(nil, i18n.OFF, err.Error()))
		return
	}

	c.JSON(200, common.ResponseSuccess(nil))
}

func GetDashboard(c *gin.Context) {
	uid := c.Param("uid")

	var rawJSON []byte
	var id int64
	dashMeta := &models.DashboardMeta{}
	err := db.SQL.QueryRow(`SELECT id,version, owned_by,created_by, folder_id, data,created,updated FROM dashboard WHERE uid=?`, uid).Scan(
		&id, &dashMeta.Version,&dashMeta.OwnedBy, &dashMeta.CreatedBy, &dashMeta.FolderId, &rawJSON, &dashMeta.Created, &dashMeta.Updated,
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

	if !acl.CanViewDashboard(id,dashMeta.OwnedBy,c) {
		c.JSON(403,common.ResponseErrorMessage(nil,i18n.ON,i18n.NoPermissionMsg))
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
	
	dashMeta.CanStar = true
	if acl.IsGlobalEditor(c) {
		dashMeta.CanEdit = true
		dashMeta.CanSave = true
	}
	
	if acl.IsGlobalAdmin(c) {
		dashMeta.CanAdmin = true
	}

	c.JSON(200, common.ResponseSuccess(utils.Map{
		"dashboard": data,
		"meta":      dashMeta,
	}))
}

func ImportDashboard(c *gin.Context) {
	userId := session.CurrentUserId(c)
 
	dsData := &ReqDashboardData{}
	err := c.Bind(&dsData)
	if err != nil {
		logger.Warn("save dashboard req data error", "error", err)
		c.JSON(http.StatusBadRequest, common.ResponseErrorMessage(nil, i18n.OFF, err.Error()))
		return
	}

	dash := &models.Dashboard{}
	dash.Data = dsData.Dashboard
	dash.Title = strings.TrimSpace(dsData.Dashboard.Get("title").MustString())
	dash.Uid = strings.TrimSpace(dsData.Dashboard.Get("uid").MustString())
	dash.Data.Set("title", dash.Title)
	dash.FolderId = dsData.FolderId
	dash.IsFolder = dsData.IsFolder

	dash.Data.Set("version", 0)

	now := time.Now()
	dash.CreatedBy = userId
	dash.Created = now
	dash.Updated = now

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

	res, err := db.SQL.Exec(`INSERT INTO dashboard (uid, title, version, created_by,owned_by, folder_id, data,created,updated) VALUES (?,?,?,?,?,?,?,?,?)`,
		dash.Uid, dash.Title, dash.Version, dash.CreatedBy,models.GlobalTeamId, dash.FolderId, jsonData, dash.Created, dash.Updated)
	if err != nil {
		logger.Warn("create dashboard error", "error", err)
		c.JSON(500, common.ResponseErrorMessage(nil, i18n.OFF, err.Error()))
		return
	}

	id, _ := res.LastInsertId()
	dash.Id = id

	// set dashboard acl
	_,err = db.SQL.Exec("INSERT INTO dashboard_acl (dashboard_id,team_id,created) VALUES (?,?,?)",
	dash.Id,models.GlobalTeamId,now)
	if err != nil {
		logger.Warn("update dashboard error", "error", err)
		c.JSON(500, common.ResponseErrorMessage(nil, i18n.OFF, err.Error()))
		return
	}

	c.JSON(200, common.ResponseSuccess(utils.Map{
		"slug":    dash.Slug,
		"version": dash.Version,
		"id":      dash.Id,
		"uid":     dash.Uid,
		"url":     dash.GetUrl(),
	}))
}

type TagRes struct {
	Term string `json:"term"`
	Count int `json:"count"`
}
type TagResList []*TagRes
func (s TagResList) Len() int      { return len(s) }
func (s TagResList) Swap(i, j int) { s[i], s[j] = s[j], s[i] }
func (s TagResList) Less(i, j int) bool {
	return s[i].Term < s[j].Term
}


func GetAllTags(c *gin.Context) {
	tagMap := make(map[string]int)
	for _,dash := range cache.Dashboards {
		tags := dash.Data.Get("tags").MustStringArray()
		for _,tag := range tags {
			tagMap[tag] = tagMap[tag] + 1
		}
	}

	tags := make(TagResList,0)
	for tag,count := range tagMap {
		tags = append(tags, &TagRes{tag,count})
	}

	sort.Sort(tags)

	c.JSON(200,common.ResponseSuccess(tags))
}

func GetAcl(c *gin.Context) {
	dashId,_ := strconv.ParseInt(c.Param("id"),10,64)
	if dashId == 0 {
		c.JSON(400, common.ResponseErrorMessage(nil,i18n.OFF, "bad dashboard id"))
		return 
	}

	teamIds := make([]int64,0)

	rows,err := db.SQL.Query("SELECT team_id FROM dashboard_acl WHERE dashboard_id=?",dashId)
	if err != nil  {
		logger.Warn("query dashboard acl error", "error", err)
		c.JSON(500, common.ResponseErrorMessage(nil, i18n.OFF, err.Error()))
		return
	}

	for rows.Next() {
		var id int64 
		err := rows.Scan(&id)
		if err != nil {
			logger.Warn("query dashboard acl scan error","error",err)
			continue 
		}
		teamIds = append(teamIds,id)
	}

	c.JSON(200, common.ResponseSuccess(teamIds))
}

type UpdateAclReq struct {
	DashId int64 `json:"dashId"`
	TeamIds []int64 `json:"teamIds"`
}
func UpdateAcl(c *gin.Context) {
	req := &UpdateAclReq{}
	c.Bind(&req)
	
	if req.DashId == 0 {
		c.JSON(400, common.ResponseErrorMessage(nil,i18n.OFF, "bad dashboard id"))
		return 
	}

	_,err :=db.SQL.Exec("DELETE from dashboard_acl WHERE dashboard_id=?",req.DashId)
	if err != nil {
		logger.Warn("update dashboard acl error", "error", err)
		c.JSON(500, common.ResponseErrorMessage(nil, i18n.OFF, err.Error()))
		return
	}

	for _,teamId := range req.TeamIds {
		_,err = db.SQL.Exec("INSERT INTO dashboard_acl (dashboard_id,team_id,created) VALUES (?,?,?)",
		req.DashId,teamId,time.Now())
		if err != nil {
			logger.Warn("update dashboard error", "error", err)
			c.JSON(500, common.ResponseErrorMessage(nil, i18n.OFF, err.Error()))
			return
		}
	}

	c.JSON(200, common.ResponseSuccess(nil))
}