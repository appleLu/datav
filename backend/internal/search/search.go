package search

import (
	"time"
	"github.com/apm-ai/datav/backend/pkg/db"
	"github.com/apm-ai/datav/backend/internal/dashboard"
	"github.com/apm-ai/datav/backend/pkg/log"
)

var dashboardCache = make(map[string]*dashboard.Dashboard)
var logger = log.RootLogger.New("logger", "search")

const (
	Search_Dash_By_Title = "1"
)

// InitCache load dashboard data from sql store periodically
func InitCache() {
	go func() {
		for {
			rows,err := db.SQL.Query(`SELECT id,title,uid FROM dashboard`)
			if err != nil {
				logger.Warn("load dashboard into search cache,query error","error",err)
				time.Sleep(60 * time.Second)
				continue 
			}

			var id int64 
			var title,uid string 
			for rows.Next() {
				err := rows.Scan(&id,&title,&uid)
				if err != nil {
					logger.Warn("load dashboard into search cache,scan error","error",err)
					continue
				}

				dashboardCache[title] = &dashboard.Dashboard{
					Id: id,
					Uid: uid,
					Title: title,
				}
			}

			time.Sleep(60 * time.Second)
		}
	}()
}

