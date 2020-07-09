package models

type RoleType string

const (
	ROLE_VIEWER  = "Viewer"
	ROLE_EDITOR  = "Editor"
	ROLE_ADMIN   = "Admin"
)

func (r RoleType) IsValid() bool {
	return r == ROLE_VIEWER || r == ROLE_ADMIN || r == ROLE_EDITOR
}

func IsAdmin(r string) bool {
	return r == ROLE_ADMIN
}