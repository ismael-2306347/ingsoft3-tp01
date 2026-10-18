terraform {
  required_version = ">= 1.5"

  required_providers {
    neon = {
      source  = "kislerdm/neon"
      version = "0.18.0" # fijada: ver la advertencia del encabezado de la guia del TP8
    }
    render = {
      source  = "render-oss/render"
      version = "1.9.1"
    }
  }
}

provider "neon" {}   # lee NEON_API_KEY
provider "render" {} # lee RENDER_API_KEY y RENDER_OWNER_ID

# --- El proyecto de Neon de PREPROD: no existe hasta que esto se aplica ---

resource "neon_project" "preprod" {
  name   = "rachas-preprod"
  org_id = "org-shiny-brook-48214021" # tu cuenta de Neon ahora exige asociar el proyecto a una organizacion

  # Sin esta linea el primer apply falla: el provider pide por defecto 86400
  # segundos (un dia) de historial y el tope del plan gratuito es 21600 (seis
  # horas).
  history_retention_seconds = 21600
}

resource "neon_role" "preprod" {
  project_id = neon_project.preprod.id
  branch_id  = neon_project.preprod.default_branch_id # default_branch_id, NO branch_id
  name       = "app_preprod_owner"
}

resource "neon_database" "preprod" {
  project_id = neon_project.preprod.id
  branch_id  = neon_project.preprod.default_branch_id
  name       = "app_preprod"
  owner_name = neon_role.preprod.name
}

# --- Los 2 servicios de Render de PREPROD, corriendo la imagen del TP7 ---

locals {
  # La cadena de conexion se ARMA aca, con lo que devolvio Neon. Mi backend
  # lee DATABASE_URL como una URI de Postgres (app/database.py), no como
  # pares Clave=Valor (eso es .NET, lo de la guia).
  conn = "postgresql://${neon_role.preprod.name}:${neon_role.preprod.password}@${neon_project.preprod.database_host}/${neon_database.preprod.name}?sslmode=require"
}

resource "render_web_service" "api" {
  name   = "rachas-api-preprod"
  plan   = "free"
  region = var.region

  runtime_source = {
    image = {
      image_url = var.image_repo_api # SIN la etiqueta pegada
      tag       = var.image_tag      # la etiqueta va en su propio campo
    }
  }

  env_vars = {
    DATABASE_URL = { value = local.conn }
  }
}

resource "render_web_service" "front" {
  name   = "rachas-front-preprod"
  plan   = "free"
  region = var.region

  runtime_source = {
    image = {
      image_url = var.image_repo_front
      tag       = var.image_tag
    }
  }

  env_vars = {
    BACKEND_URL  = { value = render_web_service.api.url } # la URL sale de Terraform, no de un copy-paste
    DNS_RESOLVER = { value = "8.8.8.8" }
  }
}
