package log


import log "github.com/inconshreveable/log15"

var RootLogger = log.New()
func InitLogger(level string) {
	l:= log.StdoutHandler
	RootLogger.SetHandler(l)
}



