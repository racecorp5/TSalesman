import {
  to = azurerm_resource_group.rg
  id = "/subscriptions/5b671f90-555c-45c2-af70-3833287bcadb/resourceGroups/tsalesmangroup"
}

import {
  to = azurerm_storage_account.storage
  id = "/subscriptions/5b671f90-555c-45c2-af70-3833287bcadb/resourceGroups/tsalesmangroup/providers/Microsoft.Storage/storageAccounts/tsalesmanaccount"
}

import {
  to = azurerm_service_plan.app_service_plan
  id = "/subscriptions/5b671f90-555c-45c2-af70-3833287bcadb/resourceGroups/tsalesmangroup/providers/Microsoft.Web/serverFarms/prod-app-service-plan"
}

import {
  to = azurerm_storage_container.static_content
  id = "/subscriptions/5b671f90-555c-45c2-af70-3833287bcadb/resourceGroups/tsalesmangroup/providers/Microsoft.Storage/storageAccounts/tsalesmanaccount/blobServices/default/containers/static-content"
}

import {
  to = azurerm_linux_function_app.function_app
  id = "/subscriptions/5b671f90-555c-45c2-af70-3833287bcadb/resourceGroups/tsalesmangroup/providers/Microsoft.Web/sites/prod-function-app-tsalesman"
}