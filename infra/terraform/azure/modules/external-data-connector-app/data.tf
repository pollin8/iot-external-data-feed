data azurerm_storage_account "feed_data_storage" {
  name = local.feed_storage_account_name
  resource_group_name = var.resource_group_name
}