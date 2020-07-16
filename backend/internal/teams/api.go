package teams

import (
	"github.com/apm-ai/datav/backend/pkg/utils"
	"database/sql"
	// "fmt"
	"github.com/apm-ai/datav/backend/internal/users"
	"github.com/apm-ai/datav/backend/internal/session"
	"github.com/apm-ai/datav/backend/pkg/i18n"
	"github.com/apm-ai/datav/backend/pkg/common"
	"github.com/apm-ai/datav/backend/pkg/db"
	"github.com/apm-ai/datav/backend/pkg/models"
	"github.com/gin-gonic/gin"
	"strconv"
	"strings"
	"sort"
	"time"
)

func GetTeams(c *gin.Context) {
	rows, err := db.SQL.Query(`SELECT id,name,created_by FROM team`)
	if err != nil {
		logger.Warn("get all teams error", "error", err)
		c.JSON(500, common.ResponseErrorMessage(nil, i18n.OFF, err.Error()))
		return 
	}

	teams := make(models.Teams, 0)
	for rows.Next() {
		team := &models.Team{}
		err := rows.Scan(&team.Id,  &team.Name , &team.CreatedById)
		if err != nil {
			logger.Warn("get all users scan error", "error", err)
			continue
		}

		user,_ := users.QueryUser(team.CreatedById,"","")
		team.CreatedBy = user.Username
 
		count := 0 
		err = db.SQL.QueryRow("SELECT count(*) FROM team_member WHERE team_id=?",team.Id).Scan(&count)
		if err != nil {
			logger.Warn("select team member count error","error",err)
		}

		team.MemberCount = count
		teams = append(teams, team)
	}

	sort.Sort(teams)
 
	
	c.JSON(200, common.ResponseSuccess(teams))
}

func GetTeam(c *gin.Context) {
	id,_ := strconv.ParseInt(strings.TrimSpace(c.Query("id")),10,64)
	name := strings.TrimSpace(c.Query("name"))
	if id == 0 && name == "" {
		c.JSON(400, common.ResponseErrorMessage(nil, i18n.OFF, "team name or id cannot be empty"))
		return
	}

	team,err := QueryTeam(id,name)
	if err != nil {
		c.JSON(400, common.ResponseErrorMessage(nil, i18n.OFF, err.Error()))
		return
	}

	c.JSON(200, common.ResponseSuccess(team))
}


func NewTeam(c *gin.Context) {
	req := make(map[string]string)
	c.Bind(&req)
	name := strings.TrimSpace(req["name"])
	if name == "" {
		c.JSON(400, common.ResponseErrorMessage(nil, i18n.OFF, "team name cannot be empty"))
		return
	}

	now := time.Now()

	user := session.CurrentUser(c)
	res, err := db.SQL.Exec("INSERT INTO team (name,created_by,created,updated) VALUES (?,?,?,?)",
		name, user.Id, now, now)
	if err != nil {
		logger.Warn("new team error", "error", err)
		c.JSON(500, common.ResponseErrorMessage(nil, i18n.OFF, err.Error()))
		return
	}

	id, _ := res.LastInsertId()

	// insert self as first team member
	_,err = db.SQL.Exec("INSERT INTO team_member (team_id,user_id,created,updated) VALUES (?,?,?,?)",id,user.Id,now,now)
	if err != nil {
		logger.Warn("insert team member error", "error", err)
		db.SQL.Exec("DELETE FROM team WHERE id=?",id)
		c.JSON(500, common.ResponseErrorMessage(nil, i18n.OFF, err.Error()))
		return
	}

	c.JSON(200, common.ResponseSuccess(&models.Team{
		Id:       id,
		Name:  name,
		CreatedBy: user.Username, 
		Created:  now,
		Updated:  now,
		MemberCount: 1,
	}))
}


func GetTeamMembers(c *gin.Context) {
	id,_ := strconv.ParseInt(c.Param("id"),10,64)
	if id == 0 {
		c.JSON(400, common.ResponseErrorMessage(nil,i18n.OFF,"bad team id"))
		return 
	}

	members := make(models.TeamMembers,0)
	rows,err := db.SQL.Query("SELECT user_id,created FROM team_member WHERE team_id=?",id)
	if err != nil && err != sql.ErrNoRows {
		logger.Warn("get team members error","error",err)
		c.JSON(500, common.ResponseErrorMessage(nil,i18n.OFF,err.Error()))
		return 
	}

	for rows.Next() {
		member := &models.TeamMember{}
		err := rows.Scan(&member.Id,&member.Created)
		if err != nil {
			logger.Warn("get team members scan error","error",err)
			continue
		}

		u,_ := users.QueryUser(member.Id,"","")
		member.Role = u.Role
		member.Username = u.Username
		member.RoleSortWeight = models.RoleSortWeight(member.Role)
		member.CreatedAge = utils.GetAgeString(member.Created)
		members = append(members,member)
	}

	sort.Sort(members)

	c.JSON(200,common.ResponseSuccess(members))
}

func AddTeamMembers(c *gin.Context) {
	teamId,_ := strconv.ParseInt(c.Param("id"),10,64)
	req := make(map[string][]int64)
	c.Bind(&req)

	members := req["members"]
	
	if teamId == 0 || len(members) == 0 {
		c.JSON(400,common.ResponseErrorMessage(nil,i18n.OFF,"teamId or members cannot be empty"))
		return 
	}

	// check team exists
	var id int64
	err := db.SQL.QueryRow("SELECT id FROM team WHERE id=?",teamId).Scan(&id)
	if err != nil && err != sql.ErrNoRows {
		logger.Warn("get team error","error",err)
		c.JSON(500, common.ResponseErrorMessage(nil,i18n.OFF,err.Error()))
		return 
	}

	if (id != teamId) {
		c.JSON(400,common.ResponseErrorMessage(nil,i18n.OFF,"bad team id"))
		return 
	}

	// check user exists
	for _, memberId := range members{
		var id int64
		err := db.SQL.QueryRow("SELECT id FROM user WHERE id=?",memberId).Scan(&id)
		if err != nil && err != sql.ErrNoRows {
			logger.Warn("get user error","error",err)
			c.JSON(500, common.ResponseErrorMessage(nil,i18n.OFF,err.Error()))
			return 
		}
	
		if (id != memberId) {
			c.JSON(400,common.ResponseErrorMessage(nil,i18n.OFF,"bad member id"))
			return 
		}
	}

	now := time.Now()
	for _,memberId := range members {
		_,err := db.SQL.Exec("INSERT INTO team_member (team_id,user_id,created) VALUES (?,?,?)",teamId,memberId,now)
		if err != nil {
			logger.Warn("add team member error","error",err)
			c.JSON(500, common.ResponseErrorMessage(nil,i18n.OFF,err.Error()))
			return 
		}
	}

	c.JSON(200, common.ResponseSuccess(nil))
}

func DeleteTeamMember(c *gin.Context) {
	teamId,_ := strconv.ParseInt(c.Param("teamId"),10,64)
	memberId,_ := strconv.ParseInt(c.Param("memberId"),10,64)

	if teamId == 0 || memberId == 0 {
		c.JSON(400,common.ResponseErrorMessage(nil,i18n.OFF,"bad team id or member id"))
		return 
	}

	// cant delete self or team creator
	team,err := QueryTeam(teamId,"")
	if err != nil {
		c.JSON(500, common.ResponseErrorMessage(nil,i18n.OFF,err.Error()))
		return 
	}

	if team.Id == 0 {
		c.JSON(400,common.ResponseErrorMessage(nil,i18n.OFF,"this team not exist"))
		return 
	}

	currentUserId := session.CurrentUserId(c)
	if currentUserId == memberId {
		c.JSON(400,common.ResponseErrorMessage(nil,i18n.OFF,"You cannot delete your self"))
		return 
	}

	if memberId == team.CreatedById {
		c.JSON(400,common.ResponseErrorMessage(nil,i18n.OFF,"You cannot delete the team owner"))
		return 
	}


	//@todo : only creator can delete team admin


	_,err = db.SQL.Exec("DELETE FROM team_member where team_id=? and user_id=?",teamId,memberId)
	if err != nil {
		logger.Warn("delete team member error","error",err)
		c.JSON(500, common.ResponseErrorMessage(nil,i18n.OFF,err.Error()))
		return 
	}

	c.JSON(200, common.ResponseSuccess(nil))
}

func UpdateTeam(c *gin.Context) {
	team := &models.Team{}
	c.Bind(&team)

	if team.Id == 0 || team.Name == "" {
		c.JSON(400,common.ResponseErrorMessage(nil,i18n.OFF,"bad team data"))
		return 
	}

	_,err := db.SQL.Exec("UPDATE team SET name=? WHERE id=?",team.Name,team.Id)
	if err != nil {
		logger.Warn("update team error","error",err)
		c.JSON(500, common.ResponseErrorMessage(nil,i18n.OFF,err.Error()))
		return 
	}

	c.JSON(200,common.ResponseSuccess(nil))
}