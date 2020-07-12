package search

import (
	"time"
	"github.com/apm-ai/datav/backend/pkg/db"
	"github.com/apm-ai/datav/backend/internal/dashboard"
)

var DashboardCache = make(map[string]*dashboard.Dashboard)

// InitCache load dashboard data from sql store periodically
func InitCache() {
	go func() {
		for {
			rows,err := db.SQL.Query(`SELECT id,title,uid,folder_id FROM dashboard`)
			if err != nil {
				logger.Warn("load dashboard into search cache,query error","error",err)
				time.Sleep(60 * time.Second)
				continue 
			}

			var id int64 
			var folderId int
			var title,uid string 
			for rows.Next() {
				err := rows.Scan(&id,&title,&uid,&folderId)
				if err != nil {
					logger.Warn("load dashboard into search cache,scan error","error",err)
					continue
				}

				DashboardCache[title] = &dashboard.Dashboard{
					Id: id,
					Uid: uid,
					Title: title,
					FolderId: folderId,
				}
			}

			time.Sleep(60 * time.Second)
		}
	}()
}

