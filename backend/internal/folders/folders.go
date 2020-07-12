package folders

import (
	"database/sql"
	"github.com/apm-ai/datav/backend/pkg/db"
	"github.com/apm-ai/datav/backend/pkg/log"
)


var logger = log.RootLogger.New("logger","dashboard")

// Index get folders and the dashboards of general folder
func QueryAll() []*Folder {
	folders := make([]*Folder,0)
	rows, err := db.SQL.Query("SELECT id,parent_id,uid,title from folder")
	if err != nil {
		logger.Warn("query all folders error","error",err)
		return folders
	}

	var id,pid int 
	var uid,title string 
	for rows.Next() {
		err := rows.Scan(&id,&pid,&uid,&title)
		if err != nil {
			logger.Warn("query all folders scan error","error",err)
			continue 
		} 

		f := &Folder{
			Id: id,
			ParentId: pid,
			Uid: uid,
			Title: title,
		}
		f.UpdatSlug()
		f.UpdateUrl()
		folders = append(folders,f)
	}

	// add general folder
	generalFolder := &Folder {
		Id: 0,
		ParentId: -1,
		Uid: "general",
		Title: "General",
	}
	generalFolder.UpdatSlug()
	generalFolder.UpdateUrl()
	folders = append(folders,generalFolder)

	return folders
}

func QueryById(id int) (*Folder) {
	f := &Folder{}
	if id > 0 {
		err := db.SQL.QueryRow("SELECT uid,title FROM folder WHERE id=?",id).Scan(&f.Uid,&f.Title)
		if err != nil {
			if err == sql.ErrNoRows{
				logger.Warn("find no folder with given id","id",id)
			} else {
				logger.Warn("query by id error","error",err)
			}
			return nil
		}	
	} else{
		f.Uid = "general"
		f.Title = "General"
	}

	f.Id = id 
	f.UpdateUrl()

	return f
}