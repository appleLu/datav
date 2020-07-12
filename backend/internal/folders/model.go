package folders

import (
	"time"
	"github.com/apm-ai/datav/backend/pkg/utils"
	"fmt"
)
type Folder struct {
	Id int `json:"id"`
	ParentId int `json:"parent_id"`
	Uid string `json:"uid"`

	Title string `json:"title"`
	Slug string `json:"slug"`
	Url string `json:"url"`
	
	
	Type string `json:"type"`
	Tags []string `json:"tags"`

	Created time.Time `json:"created"`
	Updated time.Time `json:"updated"`

}


func (folder *Folder) InitNew() {
	folder.Uid = utils.GenerateShortUID()
	folder.Created = time.Now()
	folder.Updated = time.Now()

	folder.UpdatSlug()
	folder.UpdateUrl()
}



// UpdateSlug updates the slug
func (folder *Folder) UpdatSlug() {
	folder.Slug = utils.Slugify(folder.Title)
}

// UpdateUrl updates the url
func (folder *Folder) UpdateUrl() {
	folder.Url = fmt.Sprintf("/f/%s/%s",  folder.Uid, folder.Slug)
}
