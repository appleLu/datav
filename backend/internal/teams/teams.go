package teams

import (
	"database/sql"
	"github.com/apm-ai/datav/backend/pkg/db"
	"github.com/apm-ai/datav/backend/pkg/log"
	"github.com/apm-ai/datav/backend/pkg/models"
)

var logger = log.RootLogger.New("logger", "teams")


func QueryTeam(id int64, name string) (*models.Team,error) {
	team := &models.Team{}
	err := db.SQL.QueryRow(`SELECT id,name,created_by FROM team WHERE id=? or name=?`,
		id, name).Scan(&team.Id,  &team.Name, &team.CreatedById)
	if err != nil && err != sql.ErrNoRows{
		logger.Warn("query user error", "error", err)
		return team,err
	}

	return team,nil
}