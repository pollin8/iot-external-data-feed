#####################################################################
locals {
    location            = "westus"
    environment         = "dev"
    resource_group_name = "external-data-feed"
    unique_id           = lower(random_id.rand.hex)
    storageModule = {
        feed_storage_account_name = "${local.environment}iotdata${local.unique_id}"
    }
    functionModule = {
        app_insights_con            = null
        event_consumer_connection   = ""
    }
}

#####################################################################
resource "random_id" "rand" {
  byte_length = 4
}

resource "azurerm_resource_group" "func" {
  name      = "${local.environment}-${local.resource_group_name}"
  location  = local.location
}


#####################################################################
module "external-data-connector-storage" {
    source = "../modules/external-data-connector-storage"
    location = local.location
    environment = local.environment
    resource_group_name = azurerm_resource_group.func.name
    storage_account_name = local.storageModule.feed_storage_account_name
}

module "external-data-connector-app" {
    source = "../modules/external-data-connector-app"
    location = local.location
    environment = local.environment
    resource_group_name = azurerm_resource_group.func.name

    app_insights_con = local.functionModule.app_insights_con
    event_consumer_connection = local.functionModule.event_consumer_connection
    feed_storage_account_name = local.storageModule.feed_storage_account_name

    depends_on = [module.external-data-connector-storage]
}