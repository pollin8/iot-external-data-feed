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

variable storage_account_name {
    type = string
    description = "Name of storage account used to store data"
}