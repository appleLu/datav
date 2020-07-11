package search

import (
	"github.com/apm-ai/datav/backend/pkg/i18n"
	"github.com/apm-ai/datav/backend/pkg/common"
	"github.com/gin-gonic/gin"
	"github.com/apm-ai/datav/backend/internal/dashboard"
	"strconv"
)

 
func Dashboard(c *gin.Context) {
	tp := c.Query("type")
	fuzzy,_ := strconv.ParseBool(c.Query("fuzzy")) 
	
	query := c.Query("query")
	if query == "" {
		c.JSON(400, common.ResponseErrorMessage(nil,i18n.OFF,"invalid request, search query not founded"))
		return 
	}
		switch (tp) {
		case Search_Dash_By_Title:
			if (!fuzzy) {
				dashboard := &dashboard.Dashboard{}
				d,ok := dashboardCache[query]
				if (ok) {
					dashboard = d
				}

				c.JSON(200, common.ResponseSuccess(dashboard))
			}
		default:
			c.JSON(400, common.ResponseErrorMessage(nil,i18n.OFF,"invalid request, search type not found"))
		} 
}
