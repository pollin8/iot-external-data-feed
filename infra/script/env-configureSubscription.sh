#!/bin/sh
set -e

export USER_NAME=<you user name (info only)>
export TF_VAR_environment=dev
export terraform_state_storage_account=devtfstate<terrafrom-state-suffix>

echo "Setting environment variables for Terraform"
export ARM_TENANT_ID=<Azure AD tenant id>
export ARM_SUBSCRIPTION_ID=<Azure subscription id>

export ARM_CLIENT_ID=<Service Principle client id>
export ARM_CLIENT_SECRET=<Service Principle secret/pwd>

# Not needed for public, required for usgovernment, german, china
export ARM_ENVIRONMENT=public

echo "Log in to DEVELOPMENT Azure with Service Account (name:$USER_NAME)"
az logout
az login --service-principal -u $ARM_CLIENT_ID -p "$ARM_CLIENT_SECRET" --tenant "$ARM_TENANT_ID"
az account set --subscription=$ARM_SUBSCRIPTION_ID

echo "Fetching Keys to Remote State... (This example fetches from a key vault but this value can be stored here directly)"
# export ARM_ACCESS_KEY=$(az keyvault secret show --name <terraform-backend-storage-account-key-name> --vault-name <vault-name> --query value -o tsv)

export ARM_ACCESS_KEY=<storage account access key>


echo "Check that terraform is installed"
terraform --version

cd ../terraform/dev