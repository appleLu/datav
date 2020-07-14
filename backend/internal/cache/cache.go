package cache

import (
	"time"
	"github.com/apm-ai/datav/backend/pkg/db"
	"github.com/apm-ai/datav/backend/pkg/models"
	"github.com/apm-ai/datav/backend/pkg/log"
	"github.com/apm-ai/datav/backend/pkg/utils/simplejson"
)

var logger = log.RootLogger.New("logger", "cache")

var Dashboards = make(map[string]*models.Dashboard)
var Folders =  make(map[int]*models.Folder)

// InitCache load dashboard data from sql store periodically
func InitCache() {
	go func() {
		for {
			rows,err := db.SQL.Query(`SELECT id,title,uid,folder_id,data FROM dashboard`)
			if err != nil {
				logger.Warn("load dashboard into search cache,query error","error",err)
				time.Sleep(5 * time.Second)
				continue 
			}

			var id int64 
			var folderId int
			var title,uid string
			var rawJSON []byte
			for rows.Next() {
				err := rows.Scan(&id,&title,&uid,&folderId,&rawJSON)
				if err != nil {
					logger.Warn("load dashboard into search cache,scan error","error",err)
					continue
				}

				data := simplejson.New()
				err = data.UnmarshalJSON(rawJSON)

				Dashboards[title] = &models.Dashboard{
					Id: id,
					Uid: uid,
					Title: title,
					FolderId: folderId,
					Data: data,
				}
			}

			rows,err = db.SQL.Query(`SELECT id,title,uid,parent_id FROM folder`)
			if err != nil {
				logger.Warn("load dashboard into search cache,query error","error",err)
				time.Sleep(5 * time.Second)
				continue 
			}

			var fid int
			for rows.Next() {
				err := rows.Scan(&fid,&title,&uid,&folderId)
				if err != nil {
					logger.Warn("load dashboard into search cache,scan error","error",err)
					continue
				}

				Folders[fid] = &models.Folder{
					Id: fid,
					Uid: uid,
					Title: title,
					ParentId: folderId,
				}
			}

			time.Sleep(5 * time.Second)
		}
	}()
}

