package sqls

import (
	"github.com/apm-ai/datav/backend/pkg/models"
	
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
var CreateTableSqls = []string{
	`CREATE TABLE IF NOT EXISTS users (
		id VARCHAR(255) not null primary key, 
		name VARCHAR(255) default 'New User',
		password VARCHAR(255) not null,
		mobile VARCHAR(11) default '',
		email VARCHAR(255) not null,
		priv VARCHAR(10) not null,
		avatar_url VARCHAR(255) default '',
		last_login_date DATETIME DEFAULT CURRENT_DATETIME
	);
	CREATE INDEX IF NOT EXISTS index_name
		ON users (name);
	INSERT INTO users (id,name,password,email,priv) VALUES ('admin','admin','admin','cto@188.com','` + string(models.ROLE_ADMIN) + "');",

	`CREATE TABLE IF NOT EXISTS sessions (
		sid              VARCHAR(255) primary key,   
		user_id          VARCHAR(255)
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
		created_by 			VARCHAR(255) NOT NULL,
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
		created_by 			VARCHAR(255) NOT NULL,
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
