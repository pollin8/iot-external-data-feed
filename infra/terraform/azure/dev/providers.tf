###
# Provider Details
###

terraform {
  required_version = "~> 0.15.5"
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.10.0"
    }
    azuread = {
        source = "hashicorp/azuread"
        version = "~> 2.25.0"
    }
    random = {
        source = "hashicorp/random"
        version = "~> 3.3.2"
    }
  }
}

provider "azurerm" {
#   subscription_id = var.subscription_id
#   tenant_id       = var.tenant_id
  features {}
}

###
# Remote States
###
terraform {
  required_version = "~> 0.15.5"
  backend "azurerm" {
    # subscription_id      = "#{state_subscription_id}#"
    resource_group_name  = "rg-terraformstate"
    storage_account_name = "devtfstate<suffix>"
    container_name       = "iot-platform-terraform-state"
    key                  = "p8-application.tfstate"
  }
}






