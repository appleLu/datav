package dashboard

import (
	"github.com/apm-ai/datav/backend/pkg/utils"
	"fmt"
	"time"
	"github.com/apm-ai/datav/backend/pkg/utils/simplejson"
)
// Dashboard model
type Dashboard struct {
	Id       int64 `json:"id"`
	Uid      string `json:"uid"`
	Slug     string `json:"slug,omitempty"`
	Title    string `json:"title"`
	Version  int `json:"version,omitempty"`
 
	Created  time.Time `json:"created,omitempty"`
	Updated  time.Time `json:"updated,omitempty"`

	CreatedBy string `json:"createdBy,omitempty"`
	FolderId  int `json:"folderId,omitempty"`
	IsFolder  bool `json:"isFolder,omitempty"`
	

	Data  *simplejson.Json `json:"data,omitempty"`
}

func (d *Dashboard) SetId(id int64) {
	d.Id = id
	d.Data.Set("id", id)
}

func (d *Dashboard) SetUid(uid string) {
	d.Uid = uid
	d.Data.Set("uid", uid)
}

func (d *Dashboard) SetVersion(version int) {
	d.Version = version
	d.Data.Set("version", version)
}

// UpdateSlug updates the slug
func (dash *Dashboard) UpdateSlug() {
	dash.Slug = utils.Slugify(dash.Title)
}

// GetUrl return the html url for a folder if it's folder, otherwise for a dashboard
func (dash *Dashboard) GetUrl() string {
	return GetDashboardFolderUrl(dash.IsFolder, dash.Uid, dash.Slug)
}

// Return the html url for a dashboard
func (dash *Dashboard) GenerateUrl() string {
	return GetDashboardUrl(dash.Uid, dash.Slug)
}

// GetDashboardFolderUrl return the html url for a folder if it's folder, otherwise for a dashboard
func GetDashboardFolderUrl(isFolder bool, uid string, slug string) string {
	if isFolder {
		return GetFolderUrl(uid, slug)
	}

	return GetDashboardUrl(uid, slug)
}

// GetDashboardUrl return the html url for a dashboard
func GetDashboardUrl(uid string, slug string) string {
	return fmt.Sprintf("/d/%s/%s",  uid, slug)
}

// GetFullDashboardUrl return the full url for a dashboard
func GetFullDashboardUrl(uid string, slug string) string {
	return fmt.Sprintf("d/%s/%s", uid, slug)
}

// GetFolderUrl return the html url for a folder
func GetFolderUrl(folderUid string, slug string) string {
	return fmt.Sprintf("/dashboards/f/%s/%s",  folderUid, slug)
}

type DashboardMeta struct {
	IsStarred             bool      `json:"isStarred,omitempty"`
	IsHome                bool      `json:"isHome,omitempty"`
	IsSnapshot            bool      `json:"isSnapshot,omitempty"`
	Type                  string    `json:"type,omitempty"`
	CanSave               bool      `json:"canSave"`
	CanEdit               bool      `json:"canEdit"`
	CanAdmin              bool      `json:"canAdmin"`
	CanStar               bool      `json:"canStar"`
	Slug                  string    `json:"slug"`
	Url                   string    `json:"url"`
	Expires               time.Time `json:"expires"`
	Created               time.Time `json:"created"`
	Updated               time.Time `json:"updated"`
	UpdatedBy             string    `json:"updatedBy"`
	CreatedBy             string    `json:"createdBy"`
	Version               int       `json:"version"`
	HasAcl                bool      `json:"hasAcl"`
	IsFolder              bool      `json:"isFolder"`
	FolderId              int64     `json:"folderId"`
	FolderTitle           string    `json:"folderTitle"`
	FolderUrl             string    `json:"folderUrl"`
	Provisioned           bool      `json:"provisioned"`
	ProvisionedExternalId string    `json:"provisionedExternalId"`
}