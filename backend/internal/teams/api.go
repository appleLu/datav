package teams

import (
	"github.com/apm-ai/datav/backend/internal/session"
	"database/sql"

	"github.com/apm-ai/datav/backend/internal/acl"
	"github.com/apm-ai/datav/backend/internal/invasion"
	"github.com/apm-ai/datav/backend/pkg/utils"

	// "fmt"
	"sort"
	"strconv"
	"strings"
	"time"

	"github.com/apm-ai/datav/backend/pkg/common"
	"github.com/apm-ai/datav/backend/pkg/db"
	"github.com/apm-ai/datav/backend/pkg/i18n"
	"github.com/apm-ai/datav/backend/pkg/models"
	"github.com/gin-gonic/gin"
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
		err := rows.Scan(&team.Id, &team.Name, &team.CreatedById)
		if err != nil {
			logger.Warn("get all users scan error", "error", err)
			continue
		}

		user, _ := models.QueryUser(team.CreatedById, "", "")
		team.CreatedBy = user.Username

		count := 0
		err = db.SQL.QueryRow("SELECT count(*) FROM team_member WHERE team_id=?", team.Id).Scan(&count)
		if err != nil {
			logger.Warn("select team member count error", "error", err)
		}

		team.MemberCount = count
		teams = append(teams, team)
	}

	sort.Sort(teams)

	c.JSON(200, common.ResponseSuccess(teams))
}

func GetTeam(c *gin.Context) {
	id, _ := strconv.ParseInt(strings.TrimSpace(c.Query("id")), 10, 64)
	name := strings.TrimSpace(c.Query("name"))
	if id == 0 && name == "" {
		c.JSON(400, common.ResponseErrorMessage(nil, i18n.OFF, "team name or id cannot be empty"))
		return
	}

	team, err := models.QueryTeam(id, name)
	if err != nil {
		c.JSON(400, common.ResponseErrorMessage(nil, i18n.OFF, err.Error()))
		return
	}

	c.JSON(200, common.ResponseSuccess(team))
}

func GetTeamMembers(c *gin.Context) {
	id, _ := strconv.ParseInt(c.Param("teamId"), 10, 64)
	if id == 0 {
		c.JSON(400, common.ResponseErrorMessage(nil, i18n.OFF, "bad team id"))
		return
	}

	members := make(models.TeamMembers, 0)
	rows, err := db.SQL.Query("SELECT user_id,role,created FROM team_member WHERE team_id=?", id)
	if err != nil && err != sql.ErrNoRows {
		logger.Warn("get team members error", "error", err)
		c.JSON(500, common.ResponseErrorMessage(nil, i18n.OFF, err.Error()))
		return
	}

	for rows.Next() {
		member := &models.TeamMember{}
		err := rows.Scan(&member.Id, &member.Role, &member.Created)
		if err != nil {
			logger.Warn("get team members scan error", "error", err)
			continue
		}

		u, _ := models.QueryUser(member.Id, "", "")
		member.Username = u.Username
		member.RoleSortWeight = models.RoleSortWeight(member.Role)
		member.CreatedAge = utils.GetAgeString(member.Created)
		members = append(members, member)
	}

	sort.Sort(members)

	c.JSON(200, common.ResponseSuccess(members))
}

func GetTeamMember(c *gin.Context) {
	teamId,_ := strconv.ParseInt(c.Param("teamId"), 10, 64)
	userId,_ := strconv.ParseInt(c.Param("userId"), 10, 64)

	if teamId == 0 || userId == 0 {
		invasion.Add(c)
		c.JSON(400, common.ResponseErrorMessage(nil, i18n.OFF, "bad data"))
		return
	}

	member, err := models.QueryTeamMember(teamId,userId)
	if err != nil {
		logger.Warn("get team member error", "error", err)
		c.JSON(500, common.ResponseErrorMessage(nil, i18n.OFF, err.Error()))
		return
	}

	c.JSON(200, common.ResponseSuccess(member))
}

type AddMemberReq struct {
	MemberIds []int64         `json:"members"`
	Role      models.RoleType `json:"role"`
}

func AddTeamMembers(c *gin.Context) {
	teamId, _ := strconv.ParseInt(c.Param("teamId"), 10, 64)
	req := &AddMemberReq{}
	c.Bind(&req)

	members := req.MemberIds
	role := req.Role

	if teamId == models.GlobalTeamId {
		c.JSON(400, common.ResponseErrorMessage(nil, i18n.OFF, "You cannot add members to global team, please use 'Add User' instead"))
		return	
	}

	if teamId == 0 || len(members) == 0 || !role.IsValid() {
		c.JSON(400, common.ResponseErrorMessage(nil, i18n.OFF, "teamId or members cannot be empty"))
		return
	}

	// only global admin and team admin can do this
	if !acl.IsGlobalAdmin(c) && !acl.IsTeamAdmin(teamId, c) {
		c.JSON(403, common.ResponseErrorMessage(nil, i18n.ON, i18n.NoPermissionMsg))
		return
	}

	// if target role is admin, only global admin and team creator can do this
	if role.IsAdmin() {
		if !acl.IsGlobalAdmin(c) && !acl.IsTeamCreator(teamId, c) {
			c.JSON(403, common.ResponseErrorMessage(nil, i18n.ON, i18n.NoPermissionMsg))
			return
		}
	}
	// check team exists
	var id int64
	err := db.SQL.QueryRow("SELECT id FROM team WHERE id=?", teamId).Scan(&id)
	if err != nil && err != sql.ErrNoRows {
		logger.Warn("get team error", "error", err)
		c.JSON(500, common.ResponseErrorMessage(nil, i18n.OFF, err.Error()))
		return
	}

	if id != teamId {
		c.JSON(400, common.ResponseErrorMessage(nil, i18n.OFF, "bad team id"))
		return
	}

	// check user exists
	for _, memberId := range members {
		var id int64
		err := db.SQL.QueryRow("SELECT id FROM user WHERE id=?", memberId).Scan(&id)
		if err != nil && err != sql.ErrNoRows {
			logger.Warn("get user error", "error", err)
			c.JSON(500, common.ResponseErrorMessage(nil, i18n.OFF, err.Error()))
			return
		}

		if id != memberId {
			c.JSON(400, common.ResponseErrorMessage(nil, i18n.OFF, "bad member id"))
			return
		}
	}

	now := time.Now()
	for _, memberId := range members {
		_, err := db.SQL.Exec("INSERT INTO team_member (team_id,user_id,role,created,updated) VALUES (?,?,?,?,?)", teamId, memberId, role, now, now)
		if err != nil {
			logger.Warn("add team member error", "error", err)
			c.JSON(500, common.ResponseErrorMessage(nil, i18n.OFF, err.Error()))
			return
		}
	}

	c.JSON(200, common.ResponseSuccess(nil))
}

func DeleteTeamMember(c *gin.Context) {
	teamId, _ := strconv.ParseInt(c.Param("teamId"), 10, 64)
	memberId, _ := strconv.ParseInt(c.Param("memberId"), 10, 64)

	if teamId == 0 || memberId == 0 {
		c.JSON(400, common.ResponseErrorMessage(nil, i18n.OFF, "bad team id or member id"))
		return
	}

	if teamId == models.GlobalTeamId {
		c.JSON(400, common.ResponseErrorMessage(nil, i18n.OFF, "You cannot delete member in global team, please use 'Delete User' instead"))
		return	
	}

	team, err := models.QueryTeam(teamId, "")
	if err != nil {
		c.JSON(500, common.ResponseErrorMessage(nil, i18n.OFF, err.Error()))
		return
	}

	if team.Id == 0 {
		c.JSON(400, common.ResponseErrorMessage(nil, i18n.OFF, "this team not exist"))
		return
	}

	// cannot delete team creator
	if memberId == team.CreatedById {
		c.JSON(400, common.ResponseErrorMessage(nil, i18n.OFF, "Team creator cannot be deleted, transfer the team first"))
		return
	}

	if acl.IsUserSelf(memberId,c) {
		c.JSON(400, common.ResponseErrorMessage(nil, i18n.OFF, "You cannot delete your self"))
		return
	}

	hasPermission := canChangeTeamMember(teamId, memberId, c)
	if !hasPermission {
		c.JSON(403, common.ResponseErrorMessage(nil, i18n.ON, i18n.NoPermissionMsg))
		return
	}



	_, err = db.SQL.Exec("DELETE FROM team_member where team_id=? and user_id=?", teamId, memberId)
	if err != nil {
		logger.Warn("delete team member error", "error", err)
		c.JSON(500, common.ResponseErrorMessage(nil, i18n.OFF, err.Error()))
		return
	}

	c.JSON(200, common.ResponseSuccess(nil))
}

func UpdateTeam(c *gin.Context) {
	team := &models.Team{}
	c.Bind(&team)

	if team.Id == 0 || team.Name == "" {
		c.JSON(400, common.ResponseErrorMessage(nil, i18n.OFF, "bad team data"))
		return
	}


	if team.Id == models.GlobalTeamId {
		c.JSON(400, common.ResponseErrorMessage(nil, i18n.OFF, "Global team cannot be updated"))
		return	
	}

	if !acl.IsTeamAdmin(team.Id,c) {
		c.JSON(403, common.ResponseErrorMessage(nil, i18n.ON, i18n.NoPermissionMsg))
		return
	}
	
	_, err := db.SQL.Exec("UPDATE team SET name=? WHERE id=?", team.Name, team.Id)
	if err != nil {
		logger.Warn("update team error", "error", err)
		c.JSON(500, common.ResponseErrorMessage(nil, i18n.OFF, err.Error()))
		return
	}

	c.JSON(200, common.ResponseSuccess(nil))
}

func UpdateTeamMember(c *gin.Context) {
	member := &models.TeamMember{}
	c.Bind(&member)

	if member.TeamId == 0 || member.Id == 0 || !member.Role.IsValid() {
		c.JSON(400, common.ResponseErrorMessage(nil, i18n.OFF, "bad team member data"))
		return
	}

	team, err := models.QueryTeam(member.TeamId, "")
	if member.Id == team.CreatedById && !member.Role.IsAdmin() {
		c.JSON(400, common.ResponseErrorMessage(nil, i18n.OFF, "Team creator's role must be 'Admin'"))
		return
	}

	hasPermission := canChangeTeamMember(member.TeamId, member.Id, c)
	if !hasPermission {
		c.JSON(403, common.ResponseErrorMessage(nil, i18n.ON, i18n.NoPermissionMsg))
		return
	}

	if member.Role.IsAdmin() {
		// only global admin and team creator can set team admin
		if !acl.IsGlobalAdmin(c) && !acl.IsTeamCreator(member.TeamId,c) {
			c.JSON(403, common.ResponseErrorMessage(nil, i18n.ON, i18n.NoPermissionMsg))
			return
		}
	}

	_, err = db.SQL.Exec("UPDATE team_member SET role=?,updated=? WHERE team_id=? and user_id=?", member.Role, time.Now(), member.TeamId, member.Id)
	if err != nil {
		logger.Warn("update team member error", "error", err)
		c.JSON(500, common.ResponseErrorMessage(nil, i18n.OFF, err.Error()))
		return
	}

	c.JSON(200, common.ResponseSuccess(nil))
}

func TransferTeam(c *gin.Context) {
	teamId, _ := strconv.ParseInt(c.Param("teamId"), 10, 64)
	req := make(map[string]int64)
	c.Bind(&req)
	memberId := req["memberId"]

	if teamId == 0 || memberId == 0 {
		c.JSON(400, common.ResponseErrorMessage(nil, i18n.OFF, "bad data"))
		return
	}

	
	if teamId == models.GlobalTeamId {
		c.JSON(400, common.ResponseErrorMessage(nil, i18n.OFF, "Global team cannot be transferred,it must belongs to 'admin' user"))
		return	
	}

	// only global admin and team creator can transfer team
	if !acl.IsGlobalAdmin(c) && !acl.IsTeamCreator(teamId,c) {
		c.JSON(403, common.ResponseErrorMessage(nil, i18n.ON, i18n.NoPermissionMsg))
		return
	}

	_, err := db.SQL.Exec("UPDATE team SET created_by=?,updated=? WHERE id=?", memberId, time.Now(), teamId)
	if err != nil {
		logger.Warn("update team  error", "error", err)
		c.JSON(500, common.ResponseErrorMessage(nil, i18n.OFF, err.Error()))
		return
	}

	// update new creator's team role to admin
	_, err = db.SQL.Exec("UPDATE team_member SET role=?,updated=? WHERE team_id=? and user_id=?",models.ROLE_ADMIN, time.Now(),  teamId,memberId)
	if err != nil {
		logger.Warn("update team member error", "error", err)
		c.JSON(500, common.ResponseErrorMessage(nil, i18n.OFF, err.Error()))
		return
	}

	c.JSON(200, common.ResponseSuccess(nil))
}

func DeleteTeam(c *gin.Context) {
	teamId, _ := strconv.ParseInt(c.Param("teamId"), 10, 64)

	if teamId == 0 {
		invasion.Add(c)
		c.JSON(400, common.ResponseErrorMessage(nil, i18n.OFF, "bad data"))
		return
	}

	// only global admin and team creator can delete team
	if !acl.IsGlobalAdmin(c) && !acl.IsTeamCreator(teamId,c) {
		c.JSON(403, common.ResponseErrorMessage(nil, i18n.ON, i18n.NoPermissionMsg))
		return
	}
	
	if teamId == models.GlobalTeamId {
		c.JSON(400, common.ResponseErrorMessage(nil, i18n.OFF, "Global team cannot be deleted"))
		return	
	}

	_, err := db.SQL.Exec("DELETE FROM team WHERE id=?", teamId)
	if err != nil {
		logger.Warn("delete team  error", "error", err)
		c.JSON(500, common.ResponseErrorMessage(nil, i18n.OFF, err.Error()))
		return
	}

	_, err = db.SQL.Exec("DELETE FROM team_member WHERE team_id=?", teamId)
	if err != nil {
		logger.Warn("delete team member error", "error", err)
	}

	c.JSON(200, common.ResponseSuccess(nil))
}

func LeaveTeam(c *gin.Context) {
	teamId,_ := strconv.ParseInt(c.Param("teamId"), 10, 64)
	if teamId == 0 {
		invasion.Add(c)
		c.JSON(400, common.ResponseErrorMessage(nil, i18n.OFF, "bad data"))
		return
	}

	// team creator cannot leave team,must transfer team first
	if acl.IsTeamCreator(teamId, c) {
		c.JSON(400, common.ResponseErrorMessage(nil,i18n.OFF,"team creator cannot leave team, need transfer team to another member first"))
		return
	}

	if teamId == models.GlobalTeamId {
		c.JSON(400, common.ResponseErrorMessage(nil, i18n.OFF, "You cannot leave global team,this team is default team in datav"))
		return	
	}

	userId := session.CurrentUserId(c)
	_, err := db.SQL.Exec("DELETE FROM team_member where team_id=? and user_id=?", teamId, userId)
	if err != nil {
		logger.Warn("leave team  error", "error", err)
		c.JSON(500, common.ResponseErrorMessage(nil, i18n.OFF, err.Error()))
		return
	}

	c.JSON(200, common.ResponseSuccess(nil))
}

func canChangeTeamMember(teamId, memberId int64, c *gin.Context) bool {
	if !acl.IsGlobalAdmin(c) && !acl.IsTeamCreator(teamId, c) {
		member, err := models.QueryTeamMember(teamId, memberId)
		if err != nil {
			logger.Warn("query team member error", "error", err)
			return false
		}
		if member.Role.IsAdmin() { //only global admin and team creator can delete team admin
			return false
		}
		if !acl.IsTeamAdmin(teamId, c) {
			return false
		}

	}

	return true
}
