output "resource_group_name" {
  value = azurerm_resource_group.rg.name
}

output "storage_account_name" {
  value = azurerm_storage_account.storage.name
}

output "static_content_url" {
  value = azurerm_storage_account.storage.primary_blob_endpoint
}

output "function_app_url" {
  value = azurerm_linux_function_app.function_app.default_hostname
}