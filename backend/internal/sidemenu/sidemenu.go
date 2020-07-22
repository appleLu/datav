package sidemenu

import (
	"encoding/json"
	"database/sql"
	"github.com/apm-ai/datav/backend/pkg/models"
	"github.com/apm-ai/datav/backend/pkg/db"
	"github.com/apm-ai/datav/backend/pkg/log"
)

var logger = log.RootLogger.New("logger","server")

func QuerySideMenu(id int64, teamId int64) (*models.SideMenu,error) {
	menu := &models.SideMenu{}
	var rawJson []byte
	err := db.SQL.QueryRow("SELECT id,team_id,desc,data from sidemenu WHERE id=? or team_id=?",id,teamId).Scan(&menu.Id,&menu.TeamId,&menu.Desc,&rawJson)
	if err != nil && err != sql.ErrNoRows {
		return nil,err
	}
	
	if err == sql.ErrNoRows {
		return nil, nil
	}

	json.Unmarshal(rawJson, &menu.Data)
	return menu,nil
}

