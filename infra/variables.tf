variable "image_repo_api" {
  default = "ghcr.io/ismael-2306347/ingsoft3-tp01-backend" # SIN la etiqueta
}

variable "image_repo_front" {
  default = "ghcr.io/ismael-2306347/ingsoft3-tp01-frontend" # SIN la etiqueta
}

variable "image_tag" {
  default = "sha-944dbf01fbae1bee9cbdb93f9980f55f4a50c6c6" # commit del ultimo merge del TP7
}

variable "region" {
  default = "oregon" # frankfurt | ohio | oregon | singapore | virginia
}
