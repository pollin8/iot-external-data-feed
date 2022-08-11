#####################################################################
locals {
    location = "westus"
    environment = "dev"

    common = {
        resource_group_name = "external-data-feed"
        app_insights_con = null
    }
    storageModule = {
        feed_storage_account_name = "externaldatafeed${unique_id}"
    }
    functionModule = {
        event_consumer_connection = ""
    }
}

#####################################################################
resource "random_id" "rand" {
  byte_length = 1
}

resource "azurerm_resource_group" "func" {
  name      = "${local.environment}-${local.resource_group_name}"
  location  = local.location
}


#####################################################################
module "external-data-connector-storage" {
    source = "../modules/external-data-connector-storage"
    localtion = local.location
    environment = local.environment
    resource_group_name = azurerm_resource_group.func.name
    storage_account_name = local.feed_storage_account_name
}

module "external-data-connector-app" {
    source = "../modules/external-data-connector-app"
    localtion = local.location
    environment = local.environment
    app_insights_con = local.common.app_insights_con
    event_consumer_connection = local.functionModule.event_consumer_connection
    feed_storage_account_name = local.feed_storage_account_name

    depends_on = [module.external-data-connector-storage]
}