package datasources

import (
	"github.com/apm-ai/datav/backend/internal/plugins"
	"github.com/apm-ai/datav/backend/internal/session"
	"github.com/apm-ai/datav/backend/pkg/common"
	"github.com/apm-ai/datav/backend/pkg/i18n"

	// "fmt"

	"time"

	"github.com/apm-ai/datav/backend/pkg/db"
	"github.com/apm-ai/datav/backend/pkg/utils"
	"github.com/apm-ai/datav/backend/pkg/utils/simplejson"
	"github.com/gin-gonic/gin"
)

func NewDataSource(c *gin.Context) {
	userId :=  session.CurrentUserId(c)
	ds := &DataSource{}
	c.BindJSON(&ds)

	ds.Uid = utils.GenerateShortUID()
	ds.Version = InitDataSourceVersion
	ds.Created = time.Now()
	ds.Updated = time.Now()
	if ds.JsonData == nil {
		ds.JsonData = simplejson.New()
	}

	jsonData, err := ds.JsonData.Encode()

	res, err := db.SQL.Exec(`INSERT INTO data_source (name, uid, version, type, url, is_default, json_data,basic_auth,created_by,created,updated) VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
		ds.Name, ds.Uid, ds.Version, ds.Type, ds.Url, ds.IsDefault, jsonData, ds.BasicAuth,userId, ds.Created, ds.Updated)
	if err != nil {
		logger.Warn("add datasource error", "error", err)
		c.JSON(500, common.ResponseErrorMessage(nil, i18n.OFF, err.Error()))
		return
	}

	id, _ := res.LastInsertId()
	ds.Id = id

	err = updateIsDefaultFlag(ds)
	if err != nil {
		logger.Warn("update datasource default flag error", "error", err)
	}

	c.JSON(200, common.ResponseSuccess(ds))
}

func GetDataSources(c *gin.Context) {
	datasources := LoadAllDataSources()
	for _, ds := range datasources {
		if plugin, exists := plugins.DataSources[ds.Type]; exists {
			ds.TypeLogoUrl = plugin.Info.Logos.Small
		} else {
			ds.TypeLogoUrl = "public/img/icn-datasource.svg"
		}
	}
	c.JSON(200, common.ResponseSuccess(datasources))
}

func GetDataSource(c *gin.Context) {
	ds := LoadDataSource(c.Param("dataSourceID"))
	c.JSON(200, common.ResponseSuccess(ds))
}

func EditDataSource(c *gin.Context) {
	ds := &DataSource{}
	c.BindJSON(&ds)

	ds.Updated = time.Now()
	jsonData, err := ds.JsonData.Encode()
	_, err = db.SQL.Exec(`UPDATE data_source SET name=?, version=?, type=?, url=?, is_default=?, json_data=?, basic_auth=?, updated=? WHERE id=?`,
		ds.Name, ds.Version, ds.Type, ds.Url, ds.IsDefault, jsonData, ds.BasicAuth, ds.Updated,ds.Id)
	if err != nil {
		logger.Warn("edit datasource error", "error", err)
		c.JSON(500, common.ResponseErrorMessage(nil, i18n.OFF, err.Error()))
		return
	}

	err = updateIsDefaultFlag(ds)
	if err != nil {
		logger.Warn("update datasource default flag error", "error", err)
	}
	
	c.JSON(200, common.ResponseSuccess(nil))
}

func DeleteDataSource(c *gin.Context) {
	dsID := c.Param("dataSourceID")
	_, err := db.SQL.Exec(`DELETE FROM data_source  WHERE id=?`, dsID)
	if err != nil {
		logger.Warn("delete datasource error", "error", err)
		c.JSON(500, common.ResponseErrorMessage(nil, i18n.OFF, err.Error()))
		return
	}

	c.JSON(200, common.ResponseSuccess(nil))
}

