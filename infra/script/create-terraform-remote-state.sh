#!/bin/bash
set -e
random=$(date +%s)


#https://docs.microsoft.com/en-us/azure/developer/terraform/store-state-in-azure-storage

LOCATION=westus
RESOURCE_GROUP_NAME=rg-terraformstate

# Note this name must be globally unique and contain only letters and numbers
STORAGE_ACCOUNT_NAME=devtfstate${random}
CONTAINER_NAME=iot-platform-terraform-state

# Create resource group
az group create --name $RESOURCE_GROUP_NAME --location $LOCATION

# Create storage account
az storage account create --resource-group $RESOURCE_GROUP_NAME --name $STORAGE_ACCOUNT_NAME --sku Standard_LRS --encryption-services blob

# Get storage account key
ACCOUNT_KEY=$(az storage account keys list --resource-group $RESOURCE_GROUP_NAME --account-name $STORAGE_ACCOUNT_NAME --query [0].value -o tsv)

# Create blob container
az storage container create --name $CONTAINER_NAME --account-name $STORAGE_ACCOUNT_NAME --account-key $ACCOUNT_KEY

echo ""
echo "copy and store these values for use later..."
echo "storage_account_name: $STORAGE_ACCOUNT_NAME"
echo "container_name: $CONTAINER_NAME"
echo "ARM_ACCESS_KEY: $ACCOUNT_KEY"
