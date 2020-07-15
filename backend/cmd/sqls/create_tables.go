package sqls

import (
	"github.com/apm-ai/datav/backend/pkg/utils"
	"time"
	"fmt"
	"github.com/apm-ai/datav/backend/pkg/models"
	"github.com/apm-ai/datav/backend/pkg/db"
	"database/sql"
)
// go and sqlite types compare
// |int       | integer           |
// |int64     | integer           |
// |float64   | float             |
// |bool      | integer           |
// |[]byte    | blob              |
// |string    | text              |
// |time.Time | timestamp/datetime
// Tutorial: https://www.runoob.com/sqlite/sqlite-index.html
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

func CreateTables() {
	d, err := sql.Open("sqlite3", "./datav.db")
	if err != nil {
		fmt.Println("open sqlite error", "error:",err)
		panic(err)
	}
	db.SQL = d

	// create tables
	for _, q := range CreateTableSqls {
		_, err = d.Exec(q)
		if err != nil {
			fmt.Println("sqlite create table error", "error:",err, "sql:", q)
			panic(err)
		}
	}
	
	// insert init data
	_,err = db.SQL.Exec(`INSERT INTO user (username,password,salt,role,email,created,updated) VALUES (?,?,?,?,?,?,?)`,
		"admin",adminPW,adminSalt,models.ROLE_ADMIN,"admin@datav.dev",time.Now(),time.Now())
	if err != nil {
		fmt.Println("init data error","error:",err)
		panic(err)
	}
}


var CreateTableSqls = []string{
	`CREATE TABLE IF NOT EXISTS user (
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

	`CREATE TABLE IF NOT EXISTS sessions (
		sid              VARCHAR(255) primary key,   
		user_id          INTEGER
	);
	`,

	`CREATE TABLE IF NOT EXISTS data_source (
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

	`CREATE TABLE IF NOT EXISTS dashboard (
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

	`CREATE TABLE IF NOT EXISTS folder (
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
}

var DropTableSqls = []string{
	`drop table users`,
	`drop table sessions`,
}
