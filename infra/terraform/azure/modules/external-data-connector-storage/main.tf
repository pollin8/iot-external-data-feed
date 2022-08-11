locals {
  location              = var.location
  module_name           = "external-data-feed-storage"
  environment           = var.environment
  resource_group_name   = var.resource_group_name

  # Must be globally unique
  storage_account_name  = var.storage_account_name
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
# Oyster
resource "azurerm_storage_table" "oyster" {
  name                 = "oyster"
  storage_account_name =  azurerm_storage_account.feed-storage.name
}

resource "azurerm_storage_table" "oysterHistory" {
  name                 = "oysterHistory"
  storage_account_name =  azurerm_storage_account.feed-storage.name
}


##################################################
#binLevel
resource "azurerm_storage_table" "binLevel" {
  name                 = "binLevel"
  storage_account_name =  azurerm_storage_account.feed-storage.name
}

resource "azurerm_storage_table" "binLevelHistory" {
  name                 = "binLevelHistory"
  storage_account_name =  azurerm_storage_account.feed-storage.name
}

##################################################
#peopleCounter
resource "azurerm_storage_table" "peopleCounter" {
  name                 = "peopleCounter"
  storage_account_name =  azurerm_storage_account.feed-storage.name
}

resource "azurerm_storage_table" "peopleCounterHistory" {
  name                 = "peopleCounterHistory"
  storage_account_name =  azurerm_storage_account.feed-storage.name
}