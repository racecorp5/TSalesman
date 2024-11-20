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

variable "app_service_name" {
  description = "The name of the App Service"
  type        = string
}

variable "app_service_plan_name" {
  description = "The name of the App Service plan"
  type        = string
}

variable "function_app_name" {
  description = "The name of the Function App"
  type        = string
}

variable "client_id" {
  description = "The client ID of the Azure service principal"
  type        = string
  default     = ""
}

variable "client_secret" {
  description = "The client secret of the Azure service principal"
  type        = string
  default     = ""
}

variable "subscription_id" {
  description = "The subscription ID"
  type        = string
  default     = ""
}

variable "tenant_id" {
  description = "The tenant ID"
  type        = string
  default     = ""
}
