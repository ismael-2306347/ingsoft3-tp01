variable "image_repo_api" {
  default = "ghcr.io/ismael-2306347/ingsoft3-tp01-backend" # SIN la etiqueta
}

variable "image_repo_front" {
  default = "ghcr.io/ismael-2306347/ingsoft3-tp01-frontend" # SIN la etiqueta
}

variable "image_tag" {
  default = "sha-29debd4ceafb93b21927c46d5a811f992d6c4914" # commit de la release v9.0.0
}

variable "region" {
  default = "oregon" # frankfurt | ohio | oregon | singapore | virginia
}
