locals {
  location              = var.location
  module_name           = "external-data-feed-app"
  environment           = var.environment
  resource_group_name   = var.resource_group_name
  event_consumer_conn   = var.event_consumer_connection
  unique_id             = lower(random_id.rand.hex)
  # Must be globally unique
  storage_account_name  = "externaldatafeedapp${local.unique_id}"

  feed_storage_account_name = var.feed_storage_account_name

  app_insights_key      = var.app_insights_key
  app_insights_con      = var.app_insights_con
}



#################################################
# Storage Account Names Suffix
#################################################
resource "random_id" "rand" {
  byte_length = 1
}

####################################################
## Data
####################################################
resource "azurerm_storage_account" "func" {
  name                            = local.storage_account_name
  location                        = local.location
  resource_group_name             = local.resource_group_name
  account_tier                    = "Standard"
  account_replication_type        = "LRS"
  allow_nested_items_to_be_public = false
  cross_tenant_replication_enabled= true
}

#############################################################
# Function managed identity
#############################################################
resource "azurerm_user_assigned_identity" "func" {
  name                        = "${local.environment}-${local.module_name}-identity"
  location                        = local.location
  resource_group_name             = local.resource_group_name
}


##################################################
## Resources
##################################################
resource "azurerm_service_plan" "func" {
  name                  = "${local.environment}-${local.module_name}-function-app-${local.unique_id}"
  location              = local.location
  resource_group_name   = local.resource_group_name
  os_type               = "Windows"
  sku_name              = "Y1"
}

resource "azurerm_windows_function_app" "func" {
  name                        = "${local.environment}-${local.module_name}-${local.unique_id}"
  location                    = local.location
  resource_group_name         = local.resource_group_name

  service_plan_id             = azurerm_service_plan.func.id

  storage_account_name        = azurerm_storage_account.func.name
  storage_account_access_key  = azurerm_storage_account.func.primary_access_key

  https_only                  = true
  builtin_logging_enabled     = true

  functions_extension_version     = "~4"
  key_vault_reference_identity_id = azurerm_user_assigned_identity.func.id

  identity {
    type = "SystemAssigned, UserAssigned"
    identity_ids = [azurerm_user_assigned_identity.func.id]
  }

  auth_settings  {
    enabled                        = false
    unauthenticated_client_action  = "AllowAnonymous"
  }

  site_config {
   ftps_state                             = "Disabled"
   use_32_bit_worker                      = true
   application_insights_connection_string = local.app_insights_con
   application_stack {
      node_version = "16"
    }
  }

  app_settings = {
    FUNCTIONS_WORKER_RUNTIME              = "node"
    FUNCTION_APP_EDIT_MODE                = "readonly"
    WEBSITE_RUN_FROM_PACKAGE              = "1"
    WEBSITE_TIME_ZONE                     = "New Zealand Standard Time"
    SCM_DO_BUILD_DURING_DEPLOYMENT        = false

    EventConsumerConnection               = local.event_consumer_conn
    StorageAccount                        = "DefaultEndpointsProtocol=https;AccountName=${azurerm_storage_account.feed_data_storage.name};AccountKey=${azurerm_storage_account.feed_data_storage.primary_access_key}"
  }
  tags = {
    "module" = local.module_name
  }

  lifecycle {
    ignore_changes = [
      # ignores azure hidden links
      tags["hidden-link: /app-insights-resource-id"],
      tags["hidden-link: /app-insights-instrumentation-key"],
    ]
  }
}