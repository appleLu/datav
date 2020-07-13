package dashboard

import (
	"database/sql"
	"github.com/apm-ai/datav/backend/pkg/db"
	"github.com/apm-ai/datav/backend/pkg/log"
	"github.com/apm-ai/datav/backend/pkg/models"
)

var logger = log.RootLogger.New("logger","dashboard")

func QueryByFolderId(folderId int) []*models.Dashboard {
	dashes := make([]*models.Dashboard,0)
	
	rows,err := db.SQL.Query("SELECT id,uid,title FROM dashboard WHERE folder_id=?",folderId)
	if err != nil {
		if err != sql.ErrNoRows {
			logger.Warn("query dashboard by folderId error","error",err)
		}
		return dashes
	}

	for rows.Next() {
		dash := &models.Dashboard{}
		err := rows.Scan(&dash.Id,&dash.Uid,&dash.Title)
		if err != nil {
			logger.Warn("query dashboard by folderId ,scan error","error",err)
			continue
		}
		dashes = append(dashes,dash)
	}

	return dashes
}