variable "location" {
  description = "The Azure region to deploy resources"
  type        = string
}

variable "resource_group_name" {
  description = "The name of the resource group"
  type        = string
}

variable "storage_account_name" {
  description = "The name of the storage account"
  type        = string
}

variable "app_service_plan_name" {
  description = "The name of the App Service plan"
  type        = string
}

variable "app_service_plan_sku" {
  description = "The SKU of the App Service plan"
  type        = object({
    tier = string
    size = string
  })
}

variable "function_app_name" {
  description = "The name of the Function App"
  type        = string
}