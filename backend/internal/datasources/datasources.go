package datasources

import (
	// "fmt"
	"github.com/apm-ai/datav/backend/pkg/utils/simplejson"
	"time"
	"github.com/apm-ai/datav/backend/pkg/db"
	"github.com/apm-ai/datav/backend/pkg/log"
	"strconv"
)


var logger = log.RootLogger.New("logger","datasources")
const InitDataSourceVersion = 1

func LoadAllDataSources() []*DataSource {
	datasources := make([]*DataSource,0)
	rows,err := db.SQL.Query("select id,name, uid, version, type, url, is_default, json_data,basic_auth,created,updated from data_source")
	if err != nil {
		logger.Warn("get datasources error","error",err)
		return nil
	}

	var id int64
	var version int
	var name,uid,tp,url string
	var isDefault,basicAuth bool
	var created,updated time.Time
	var rawJSON []byte
	for rows.Next() {
		err = rows.Scan(&id,&name,&uid,&version,&tp,&url,&isDefault,&rawJSON,&basicAuth,&created,&updated)
		if err != nil {
			logger.Warn("scan datasources error","error",err)
			continue
		}

		jsonData := simplejson.New()
		err = jsonData.UnmarshalJSON(rawJSON)
		if err != nil {
			logger.Warn("unmarshal json data error","error",err)
			continue
		}

		ds := &DataSource{
			Id: id,
			Name: name,
			Uid: uid,
			Version:version,
			Type:tp,
			Url: url,
			IsDefault: isDefault,
			JsonData: jsonData,
			BasicAuth: basicAuth,
			Created: created,
			Updated: updated,
		}

		datasources = append(datasources,ds)
	}

	return datasources
}

func LoadDataSource(id string) *DataSource{
	var version int
	var name,uid,tp,url string
	var isDefault,basicAuth bool
	var created,updated time.Time
	var rawJSON []byte



	err := db.SQL.QueryRow("select id,name, uid, version, type, url, is_default, json_data,basic_auth,created,updated from data_source where id=?",
	id).Scan(&id,&name,&uid,&version,&tp,&url,&isDefault,&rawJSON,&basicAuth,&created,&updated)
	if err != nil {
		logger.Warn("get datasources error","error",err)
		return nil
	}

	jsonData := simplejson.New()
	err = jsonData.UnmarshalJSON(rawJSON)
	if err != nil {
		logger.Warn("unmarshal json data error","error",err)
		return nil
	}

	idN, _ := strconv.ParseInt(id,10,64)
	ds := &DataSource{
		Id: idN,
		Name: name,
		Uid: uid,
		Version:version,
		Type:tp,
		Url: url,
		IsDefault: isDefault,
		JsonData: jsonData,
		BasicAuth: basicAuth,
		Created: created,
		Updated: updated,
	}

	return ds
}

func updateIsDefaultFlag(ds *DataSource) error {
	// Handle is default flag
	if ds.IsDefault {
		_,err := db.SQL.Exec("UPDATE data_source SET is_default=? WHERE  id <> ?",false, ds.Id)
		return err
	}
	return nil
}
