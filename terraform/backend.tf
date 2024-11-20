terraform {
  backend "azurerm" {
    resource_group_name   = "tsalesmangroup"
    storage_account_name  = "tsalesmanaccount"
    container_name        = "tsalesmantfstate"
    key                   = "tsalesman.tfstate"
  }
}