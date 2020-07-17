package sqls

import (
	"github.com/apm-ai/datav/backend/pkg/utils"
	"time"
	"fmt"
	"github.com/apm-ai/datav/backend/pkg/models"
	"github.com/apm-ai/datav/backend/pkg/db"
	"database/sql"
	"github.com/apm-ai/datav/backend/pkg/log"
)

var adminSalt,adminPW string 

func init() {
	salt,err  := utils.GetRandomString(10)
	if err != nil {
		panic(err)
	}

	adminSalt = salt

	pw,err := utils.EncodePassword("admin",salt)
	if (err != nil) {
		panic(err)
	}

	adminPW = pw
}

func openSql() {
	d, err := sql.Open("sqlite3", "./datav.db")
	if err != nil {
		log.RootLogger.Crit("open sqlite error", "error:",err)
		panic(err)
	}
	db.SQL = d
}

func CreateTables() {
	openSql()
	// create tables
	for _, q := range CreateTableSqls {
		_, err := db.SQL.Exec(q)
		if err != nil {
			log.RootLogger.Crit("sqlite create table error", "error:",err, "sql:", q)
			panic(err)
		}
	}
	
	// insert init data
	_,err := db.SQL.Exec(`INSERT INTO user (id,username,password,salt,role,email,created,updated) VALUES (?,?,?,?,?,?,?,?)`,
		1,models.SuperAdminUsername,adminPW,adminSalt,models.ROLE_ADMIN,models.SuperAdminUsername+"@localhost",time.Now(),time.Now())
	if err != nil {
		log.RootLogger.Crit("init data error","error:",err)
		panic(err)
	}
}


func CreateTable(names []string) {
	defer func() {
		if err := recover();err != nil {
			DropTable(names)
		}
	}()
	openSql()
	for _,tbl := range names {
		q,ok := CreateTableSqls[tbl]
		if !ok {
			log.RootLogger.Crit("target sql table not exist","table_name",tbl)
			panic("create sql of '" + tbl + "' table not exist")
		}

		// check table already exists
		_,err :=db.SQL.Query(fmt.Sprintf("SELECT * from %s LIMIT 1",tbl))
		if err == nil || err == sql.ErrNoRows {
			log.RootLogger.Info("Table already exist,skip creating","table_name",tbl)
			continue
		}

		_,err = db.SQL.Exec(q)
		if err != nil {
			log.RootLogger.Crit("database error","error",err.Error())
			panic(err.Error())
		}

		log.RootLogger.Info("sql table created ok","table_name",tbl)
	}
}

func DropTable(names []string) {
	openSql()
	for _,tbl := range names {
		q := fmt.Sprintf("DROP TABLE IF EXISTS %s",tbl)
		_,err := db.SQL.Exec(q)
		if err != nil {
			log.RootLogger.Warn("drop table error", "error",err,"query",q)
		}
		log.RootLogger.Info("sql table dropped ok","table_name",tbl)
	}
}

var CreateTableSqls = map[string]string {
	"user" : `CREATE TABLE IF NOT EXISTS user (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		username VARCHAR(255) NOT NULL UNIQUE,
		name VARCHAR(255) DEFAULT '',
		password VARCHAR(50) DEFAULT '',
		salt VARCHAR(50),
		role VARCHAR(10) DEFAULT 'Viewer',

		mobile VARCHAR(11) DEFAULT '',
		email VARCHAR(255) NOT NULL UNIQUE,

		last_seen_at DATETIME DEFAULT CURRENT_DATETIME,
		is_diabled BOOL NOT NULL DEFAULT 'false',

		created DATETIME NOT NULL DEFAULT CURRENT_DATETIME,
		updated DATETIME NOT NULL DEFAULT CURRENT_DATETIME
	);
	CREATE INDEX IF NOT EXISTS user_username
		ON user (username);
	CREATE INDEX IF NOT EXISTS user_email
		ON user (email);`,

	"sessions" : `CREATE TABLE IF NOT EXISTS sessions (
		sid              VARCHAR(255) primary key,   
		user_id          INTEGER
	);
	`,

	"data_source" : `CREATE TABLE IF NOT EXISTS data_source (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		uid VARCHAR(40) NOT NULL UNIQUE,
		name VARCHAR(255) NOT NULL UNIQUE,

		version INT NOT NULL,
		type VARCHAR(255) NOT NULL,
		url VARCHAR(255) NOT NULL,
		
		is_default BOOL NOT NULL,

		password VARCHAR(255),
		user VARCHAR(255),
		database VARCHAR(255),

		with_credentials BOOL,
		basic_auth BOOL NOT NULL,
		basic_auth_user VARCHAR(255),
		basic_auth_password VARCHAR(255),
	
		json_data TEXT DEFAULT '{}',
		secure_json_data TEXT DEFAULT '{}',

		created_by  INTEGER NOT NULL,
		created DATETIME NOT NULL DEFAULT CURRENT_DATETIME,
		updated DATETIME NOT NULL DEFAULT CURRENT_DATETIME
	);
	CREATE INDEX IF NOT EXISTS datasource_name
		ON data_source (name);
	CREATE INDEX  IF NOT EXISTS datasource_name_uid
		ON data_source (uid);
	`,

	"dashboard" : `CREATE TABLE IF NOT EXISTS dashboard (
		id 					INTEGER PRIMARY KEY AUTOINCREMENT,
		uid                 VARCHAR(40) NOT NULL UNIQUE,
		title               VARCHAR(255) NOT NULL UNIQUE,
		version 			INT NOT NULL,
		created_by 			INTEGER NOT NULL,
		folder_id           INT NOT NULL DEFAULT '0',
		data				MEDIUMTEXT NOT NULL,
		created 			DATETIME NOT NULL DEFAULT CURRENT_DATETIME,
		updated 			DATETIME NOT NULL DEFAULT CURRENT_DATETIME
	);
	CREATE INDEX IF NOT EXISTS dashboard_uid
		ON dashboard (uid);
	CREATE INDEX IF NOT EXISTS dashboard_createdBy
		ON dashboard (created_by);
	CREATE INDEX IF NOT EXISTS dashboard_folder_id
		ON dashboard (folder_id);
	`,

	"folder" : `CREATE TABLE IF NOT EXISTS folder (
		id 					INTEGER PRIMARY KEY AUTOINCREMENT,
		parent_id           INT NOT NULL,
		uid                 VARCHAR(40) NOT NULL UNIQUE,
		title                VARCHAR(255) NOT NULL UNIQUE,
		created_by 			INTEGER NOT NULL,
		created 			DATETIME NOT NULL DEFAULT CURRENT_DATETIME,
		updated 			DATETIME NOT NULL DEFAULT CURRENT_DATETIME
	);
	CREATE INDEX IF NOT EXISTS folder_parent_id
		ON folder (parent_id);
	`,

	"team" : `CREATE TABLE IF NOT EXISTS team (
		id 					INTEGER PRIMARY KEY AUTOINCREMENT,
		name                VARCHAR(255) NOT NULL UNIQUE,
		created_by          INTEGER NOT NULL,        
		created 			DATETIME NOT NULL DEFAULT CURRENT_DATETIME,
		updated 			DATETIME NOT NULL DEFAULT CURRENT_DATETIME
	);
	CREATE INDEX IF NOT EXISTS team_name
		ON team (name);
	CREATE INDEX IF NOT EXISTS team_created_by
		ON team (created_by);
	`,

	"team_member" : `CREATE TABLE IF NOT EXISTS team_member (
		id 					INTEGER PRIMARY KEY AUTOINCREMENT,
		team_id             INTEGER NOT NULL,
		user_id 			INTEGER NOT NULL,   
		role 				VARCHAR(10) DEFAULT 'Viewer',
		created 			DATETIME NOT NULL DEFAULT CURRENT_DATETIME,
		updated 			DATETIME NOT NULL DEFAULT CURRENT_DATETIME
	);
	CREATE INDEX IF NOT EXISTS team_member_team_id
		ON team_member (team_id);
	CREATE INDEX IF NOT EXISTS team_member_user_id
		ON team_member (user_id);
	CREATE UNIQUE INDEX IF NOT EXISTS team_member_team_user_id 
		ON team_member (team_id, user_id);
	`,
}

