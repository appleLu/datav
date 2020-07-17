package server

import (
	"github.com/apm-ai/datav/backend/internal/users"
	"github.com/apm-ai/datav/backend/internal/datasources"
	"errors"
	"github.com/apm-ai/datav/backend/pkg/utils"
	// "net/http"

	"database/sql"

	"github.com/apm-ai/datav/backend/internal/session"
	"github.com/apm-ai/datav/backend/pkg/config"
	"github.com/apm-ai/datav/backend/pkg/common"
	"github.com/apm-ai/datav/backend/pkg/db"
	"github.com/apm-ai/datav/backend/pkg/i18n"
	"github.com/apm-ai/datav/backend/pkg/log"
	"github.com/apm-ai/datav/backend/internal/registry"	
	_ "github.com/mattn/go-sqlite3"
	"github.com/apm-ai/datav/backend/internal/plugins"
	"github.com/apm-ai/datav/backend/internal/dashboard"
	"github.com/apm-ai/datav/backend/internal/cache"
	"github.com/apm-ai/datav/backend/internal/search"
	"github.com/apm-ai/datav/backend/internal/folders"
	"github.com/apm-ai/datav/backend/internal/teams"
	"github.com/gin-gonic/gin"
	"net/http"
)
 
// Web ...
type Server struct {
}

// New ... 
func New() *Server {
	return &Server{}
}

var logger = log.RootLogger.New("logger","server")
// Start ...1
func (s *Server) Start() error {
	logger.Debug("server config", "config",*config.Data)
	// start registered services
	services := registry.GetServices()
	for _, service := range services {
		service.Instance.Init()
	}

	err := s.initDB()
	if err != nil {
		logger.Error("open sqlite error","error",err.Error())
		return err
	}

	// init search cache
	cache.InitCache()

	go func() {
		gin.SetMode(gin.ReleaseMode)
		r := gin.New()
		r.Use(Cors())
		
		// no auth apis
		{
			r.POST("/api/login",session.Login)
			r.POST("/api/logout",session.Logout)
			r.GET("/api/proxy/:datasourceID/*target", proxy)
			r.GET("/api/bootConfig", getBootConfig)
		}

		// auth apis
		authR := r.Group("",Auth())
		{
			pluginR := authR.Group("/api/plugins")
			{
				pluginR.GET("", plugins.GetPlugins)
				pluginR.GET("/setting", plugins.GetPluginSetting)
				pluginR.GET("/markdown", plugins.GetPluginMarkdown)
			}

			datasourceR := authR.Group("/api/datasources")
			{
				datasourceR.GET("", datasources.GetDataSources)
				datasourceR.GET("/:dataSourceID", datasources.GetDataSource)
				datasourceR.DELETE("/:dataSourceID", datasources.DeleteDataSource)
				datasourceR.POST("/new", datasources.NewDataSource)
				datasourceR.PUT("/edit", datasources.EditDataSource)
			}

			dashboardR := authR.Group("/api/dashboard")
			{
				dashboardR.POST("/save", dashboard.SaveDashboard)
				dashboardR.GET("/uid/:uid", dashboard.GetDashboard)
				dashboardR.POST("/import", dashboard.ImportDashboard)
				dashboardR.GET("/tags", dashboard.GetAllTags)
			}

			searchR := authR.Group("/api/search") 
			{
				searchR.GET("", search.Search)
				searchR.GET("/dashboard", search.Dashboard)
			} 

			folderR := authR.Group("/api/folder") 
			{
				folderR.GET("/checkExistByName", folders.CheckExistByName)
				folderR.GET("/uid/:uid", folders.GetByUid)
				folderR.POST("/new",folders.NewFolder)
				folderR.GET("/all",folders.GetAll)
			}

			userR := authR.Group("/api/users") 
			{ 
				userR.GET("", users.GetUsers)
				userR.GET("/user", users.GetUser)		
			}

			teamR := authR.Group("/api/teams") 
			{
				teamR.GET("", teams.GetTeams)
				teamR.GET("/team", teams.GetTeam)
				teamR.GET("/members/:id", teams.GetTeamMembers)	
				teamR.POST("/:id/members", teams.AddTeamMembers)	
				teamR.DELETE("/:teamId/:memberId", teams.DeleteTeamMember)	
				teamR.PUT("/team/:id", teams.UpdateTeam)
				teamR.POST("/:id/member", teams.UpdateTeamMember)	
				teamR.POST("/:id/transfer", teams.TransferTeam)	
				teamR.DELETE("/:teamId", teams.DeleteTeam)	
			} 

			adminR := authR.Group("/api/admin")
			{
				adminR.PUT("/password", users.UpdatePassword)
				adminR.PUT("/user/:id", users.UpdateUser)
				adminR.DELETE("/user/:id", users.DeleteUser)
				adminR.POST("/user/new", users.NewUser)

				adminR.POST("/team/new", teams.NewTeam)
			}
		}

		r.Run(config.Data.Web.Addr)
	}()


	return nil
}

// Close ...
func (s *Server) Close() error {
	return nil
}



func (s *Server) initDB() error {
	exist,_ := utils.FileExists("./datav.db")
	if !exist {
		return errors.New("db file not exist, please run init commant")
	}
	d, err := sql.Open("sqlite3", "./datav.db")
	if err != nil {
		return err
	}

	db.SQL = d
	return nil
}

// Cors is a gin middleware for cross domain.
func Cors() gin.HandlerFunc {
	return func(c *gin.Context) {
	   method := c.Request.Method
 
	   c.Header("Access-Control-Allow-Origin", "*")
	   c.Header("Access-Control-Allow-Headers", "Content-Type,AccessToken,X-CSRF-Token, Authorization,X-Token, X-PANEL-ID, X-DASHBOARD-ID,*")
	   c.Header("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE, OPTIONS")
	   c.Header("Access-Control-Expose-Headers", "Content-Length, Access-Control-Allow-Origin, Access-Control-Allow-Headers, Content-Type")
	   c.Header("Access-Control-Allow-Credentials", "true")
 
	   //放行所有OPTIONS方法
	   if method == "OPTIONS" {
		  c.AbortWithStatus(http.StatusNoContent)
	   }
	   // 处理请求
	   c.Next()
	}
 }

 // Auth is a gin middleware for user auth
 func Auth() gin.HandlerFunc {
	return func(c *gin.Context)  {
		user := session.CurrentUser(c)
		if user == nil {
			c.JSON(http.StatusUnauthorized, common.ResponseErrorMessage(nil, i18n.ON, i18n.NeedLoginMsg))
			return 
		}
		c.Next()
	}
}