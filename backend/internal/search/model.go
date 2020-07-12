package search
type DashboardSearchRes struct {
	Id int64 `json:"id"`
	Uid string  `json:"uid"`
	Title string `json:"title"`
	Url string  `json:"url"`
	Slug string  `json:"slug"`
	Type string  `json:"type"`
	Tags []string  `json:"tags"`
	IsStarred bool `json:"isStarred"`
	FolderId int `json:"folderId"`
	FolderUid string `json:"folderUid"`
	FolderTitle string  `json:"folderTitle"`
	FolderUrl string  `json:"folderUrl"`
}
