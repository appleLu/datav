package server

import (
	// "time"
	"github.com/apm-ai/datav/backend/pkg/i18n"
	"github.com/apm-ai/datav/backend/pkg/common"
	"github.com/apm-ai/datav/backend/internal/datasources"
	"bytes"
	"fmt"
	"io"
	"net/http"
	"net/url"

	"github.com/gin-gonic/gin"
)

func proxy(c *gin.Context)  {
	dsID := c.Param("datasourceID")
	// find datasource store url 
	ds := datasources.LoadDataSource(dsID)
	if ds == nil {
		c.JSON(500, common.ResponseErrorMessage(nil,i18n.OFF,"load datasource error"))
		return 
	}

	targetURL := c.Param("target")

	client := &http.Client{}

	var params = url.Values{}

	for k, v := range c.Request.URL.Query(){
		params.Add(k, v[0])
	}

	var url1 = ds.Url + targetURL + "?" + params.Encode()

	outReq, err := http.NewRequest("GET", url1, nil)
	if err != nil {
		fmt.Println(err)
	}

	// step 3
	for key, value := range c.Request.Header {
		for _, v := range value {
			// 这个暂时不能加，会乱码，后面看看怎么解决
			if key == "Accept-Encoding" {
				continue
			}
			outReq.Header.Add(key, v)
		}
	}

	res, err := client.Do(outReq)
	if err != nil {
		c.JSON(502, common.ResponseErrorMessage(nil,i18n.OFF,"reqeust to datasource store error: " + err.Error()))
		return 
	}

	buffer := bytes.NewBuffer(nil)
	io.Copy(buffer, res.Body)
	c.String(res.StatusCode, buffer.String())
}
