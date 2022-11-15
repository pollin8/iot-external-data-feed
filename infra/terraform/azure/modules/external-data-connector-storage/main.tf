locals {
  location              = var.location
  module_name           = "external-data-feed-storage"
  environment           = var.environment
  resource_group_name   = var.resource_group_name

  # Must be globally unique
  storage_account_name  = var.storage_account_name

  # table names to create
  client_data_table_names = [
    "currentOyster", "historyOyster",
    "currentBinLevel", "historyBinLevel",
    "currentPeopleSense", "historyPeopleSense",
  ]
}



####################################################
## Data
####################################################
resource "azurerm_storage_account" "feed-storage" {
  name                            = local.storage_account_name
  location                        = local.location
  resource_group_name             = local.resource_group_name
  account_tier                    = "Standard"
  account_replication_type        = "LRS"
  allow_nested_items_to_be_public = false
  cross_tenant_replication_enabled= true
}

##################################################
# Exported data
##################################################

##################################################
resource "azurerm_storage_table" "clientdata" {
  for_each             = toset(local.client_data_table_names)
  name                 = each.value
  storage_account_name =  azurerm_storage_account.feed-storage.name
  lifecycle {
    prevent_destroy    = true
  }
}