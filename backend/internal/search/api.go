package search

import (
	"strconv"
	"strings"

	"github.com/apm-ai/datav/backend/internal/cache"
	"github.com/apm-ai/datav/backend/internal/dashboard"
	"github.com/apm-ai/datav/backend/internal/folders"
	"github.com/apm-ai/datav/backend/pkg/common"
	"github.com/apm-ai/datav/backend/pkg/i18n"
	"github.com/apm-ai/datav/backend/pkg/models"
	"github.com/apm-ai/datav/backend/pkg/utils"
	"github.com/gin-gonic/gin"
)

type SearchReq struct {
	Query       string `json:"query"`
	Starred     bool   `json:"starred"`
	SkipRecent  bool   `json:"skipRecent"`
	SkipStarred bool   `json:"skipStarred"`
	Sort        string `json:"sort"`
	FolderIds   string `json:"folderIds"`
	Tags        string `json:"tags"`
	Layout      string `json:"layout"`
	Type        string `json:"type"`
}

func Search(c *gin.Context) {
	folderIds, _ := strconv.Atoi(c.Query("folderIds"))
	layout := c.Query("layout")
	tp := c.Query("type")
	query := strings.ToLower(strings.TrimSpace(c.Query("query")))

	// search folders and dashboard with query
	if  (query != "") || (folderIds == models.RootFolderId && layout == FoldersLayout) {
		res := make([]utils.Map, 0)
		if layout == FoldersLayout {
			// folders and dashboard
			fs := folders.QueryAll()
			for _, f := range fs {
				if (query != "") {
					if !strings.Contains(strings.ToLower(f.Title), query) {
						continue
					}
				}

				f.Type = TypeFolder
				f.Tags = make([]string, 0)

				res = append(res, utils.Map{
					"id":    f.Id,
					"uid":   f.Uid,
					"title": f.Title,
					"url":   f.Url,
					"tags":  f.Tags,
					"type":  f.Type,
				})
			}
		}
		for _, dash := range cache.Dashboards {
			if (c.Query("folderIds") != "") {
				if (dash.FolderId != folderIds) {
					continue
				}
			}

			if (query != "") {
				if !strings.Contains(strings.ToLower(dash.Title), query) {
					continue
				}
			}

			f := folders.QueryById(dash.FolderId)
			if f == nil {
				c.JSON(400, common.ResponseErrorMessage(nil, i18n.OFF, "get folder error"))
				return
			}

			dash.UpdateSlug()
			r := utils.Map{
				"id":          dash.Id,
				"uid":         dash.Uid,
				"title":       dash.Title,
				"url":         dash.GenerateUrl(),
				"slug":        dash.Slug,
				"type":        TypeDashboard,
				"tags":        make([]string, 0),
				"isStarred":   false,
				"folderId":    f.Id,
				"folderTitle": f.Title,
				"folderUid":   f.Uid,
				"folderUrl":   f.Url,
			}

			res = append(res, r)
		}

		c.JSON(200, common.ResponseSuccess(res))
		return

	}

	if folderIds == models.RootFolderId && layout == FoldersLayout {
		// get folders and the dashboard of general folder
		fs := folders.QueryAll()
		for _, f := range fs {
			f.Type = TypeFolder
			f.Tags = make([]string, 0)
		}
		c.JSON(200, common.ResponseSuccess(fs))
		return
	}

	if layout == ListLayout && tp == TypeDashboard {
		// get all dashboards
		res := make([]*DashboardSearchRes, 0)
		for _, dash := range cache.Dashboards {
			if query != "" {
				if !strings.Contains(strings.ToLower(dash.Title), query) {
					continue
				}
			}
			f := folders.QueryById(dash.FolderId)
			if f == nil {
				c.JSON(400, common.ResponseErrorMessage(nil, i18n.OFF, "get folder error"))
				return
			}

			dash.UpdateSlug()
			r := &DashboardSearchRes{
				Id:          dash.Id,
				Uid:         dash.Uid,
				Title:       dash.Title,
				Url:         dash.GenerateUrl(),
				Slug:        dash.Slug,
				Type:        TypeDashboard,
				Tags:        make([]string, 0),
				IsStarred:   false,
				FolderId:    f.Id,
				FolderTitle: f.Title,
				FolderUid:   f.Uid,
				FolderUrl:   f.Url,
			}

			res = append(res, r)
		}
		c.JSON(200, common.ResponseSuccess(res))
		return
	}

	if folderIds >= 0 && layout == NullLayout {
		// get all dashboards in the folder
		dashes := dashboard.QueryByFolderId(folderIds)
		f := folders.QueryById(folderIds)
		if f == nil {
			c.JSON(400, common.ResponseErrorMessage(nil, i18n.OFF, "get folder error"))
			return
		}

		res := make([]*DashboardSearchRes, 0)
		for _, dash := range dashes {
			if query != "" {
				if !strings.Contains(strings.ToLower(dash.Title), query) {
					continue
				}
			}
			dash.UpdateSlug()
			r := &DashboardSearchRes{
				Id:          dash.Id,
				Uid:         dash.Uid,
				Title:       dash.Title,
				Url:         dash.GenerateUrl(),
				Slug:        dash.Slug,
				Type:        TypeDashboard,
				Tags:        make([]string, 0),
				IsStarred:   false,
				FolderId:    f.Id,
				FolderUid:   f.Uid,
				FolderTitle: f.Title,
				FolderUrl:   f.Url,
			}
			res = append(res, r)
		}
		c.JSON(200, common.ResponseSuccess(res))
		return
	}
	c.JSON(400, common.ResponseErrorMessage(nil, i18n.OFF, "unsupportedy search query"))
}

func Dashboard(c *gin.Context) {
	tp := c.Query("type")
	fuzzy, _ := strconv.ParseBool(c.Query("fuzzy"))

	query := c.Query("query")
	if query == "" {
		c.JSON(400, common.ResponseErrorMessage(nil, i18n.OFF, "invalid request, search query not founded"))
		return
	}
	switch tp {
	case Search_Dash_By_Title:
		if !fuzzy {
			dashboard := &models.Dashboard{}
			d, ok := cache.Dashboards[query]
			if ok {
				dashboard = d
			}

			c.JSON(200, common.ResponseSuccess(dashboard))
		}
	default:
		c.JSON(400, common.ResponseErrorMessage(nil, i18n.OFF, "invalid request, search type not found"))
	}
}
