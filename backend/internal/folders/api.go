package folders

import (
	"github.com/apm-ai/datav/backend/pkg/utils"
	"database/sql"
	"strings"

	"github.com/apm-ai/datav/backend/internal/session"
	"github.com/apm-ai/datav/backend/pkg/common"
	"github.com/apm-ai/datav/backend/pkg/db"
	"github.com/apm-ai/datav/backend/pkg/i18n"
	"github.com/apm-ai/datav/backend/pkg/models"
	"github.com/gin-gonic/gin"
)

func GetByName(c *gin.Context) {
	name := c.Query("name")

	if strings.TrimSpace(name) == "" {
		c.JSON(400, common.ResponseErrorMessage(nil, i18n.OFF, "Folder name cannot be empty"))
		return
	}

	if strings.ToLower(name) == strings.ToLower(models.RootFolderName) {
		c.JSON(200, common.ResponseSuccess(0))
		return
	}

	id := -1
	err := db.SQL.QueryRow("SELECT id from folder WHERE title=?", name).Scan(&id)
	if err != nil {
		if err != sql.ErrNoRows {
			c.JSON(500, common.ResponseErrorMessage(nil, i18n.OFF, "Server Internal Error"))
			return
		}
	}
	c.JSON(200, common.ResponseSuccess(id))
}

func NewFolder(c *gin.Context) {
	folder := &Folder{}
	c.Bind(&folder)
	folder.InitNew()

	if strings.TrimSpace(folder.Title) == "" {
		c.JSON(400, common.ResponseErrorMessage(nil, i18n.OFF, "Folder name cannot be empty"))
		return
	}

	if strings.ToLower(folder.Title) == strings.ToLower(models.RootFolderName) {
		c.JSON(400, common.ResponseErrorMessage(nil, i18n.OFF, `Cannot use 'General' as folder name`))
		return
	}

	// check parent id exists
	if folder.ParentId != models.RootFolderId {
		var id int
		err := db.SQL.QueryRow("SELECT id from folder WHERE id=?", folder.ParentId).Scan(&id)
		if err != nil && err != sql.ErrNoRows {
			c.JSON(500, common.ResponseErrorMessage(nil, i18n.OFF, err.Error()))
			return
		}

		if id != folder.ParentId {
			c.JSON(400, common.ResponseErrorMessage(nil, i18n.OFF, "bad parent folder id"))
			return
		}
	}

	user := session.GetUser(c)

	res,err := db.SQL.Exec("INSERT INTO folder (parent_id,title,uid,created_by,created,updated) VALUES (?,?,?,?,?,?)",
		folder.ParentId, folder.Title, folder.Uid, user.ID, folder.Created, folder.Updated)
	if err != nil {
		c.JSON(500, common.ResponseErrorMessage(nil, i18n.OFF, err.Error()))
		return 
	}

	id, _ := res.LastInsertId()
	c.JSON(200,common.ResponseSuccess(utils.Map{
		"id": id,
		"url": folder.Url,
	}))
}
