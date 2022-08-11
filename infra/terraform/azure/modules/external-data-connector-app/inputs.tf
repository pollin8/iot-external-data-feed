variable location {
  type = string
  description = "The Azure Region in which all resources in this example should be created. (westus)"
  default = "westus"
}

variable environment {
  type = string
  description = "Development(dev), Production (prod)"
  validation {
    condition   = contains(["dev", "prod"], var.environment)
    error_message = "Valid values for var: environment are (dev, prod)."
  }
}

variable resource_group_name {
    type = string
    description = "name of the resource group to create the resources with in"
}

variable app_insights_con {
  type = string
  description = "Application insignts connection string"
  default = null
}

variable event_consumer_connection {
  type = string
  description = "This is the event hub consumer connection used only by this service to connect to Pollin8 Event Hub"
  validation {
    condition     = can(regex("Endpoint=sb*", var.event_consumer_connection))
    error_message = "Must be a valid event hub connenction string."
  }
}

variable feed_storage_account_name {
  type = string
  description = "The storage account used for storring iot data"
}