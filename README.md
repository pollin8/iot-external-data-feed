# Pollin8 External Data Feed Client Consumer

This project is a starter project for clients wishing to consume data from the Pollib8 Iot platform.
Data made available via EventHub Subscriptions.
Clients can subscribe to event hubs and receive iot telemetry data.
This reository represents a seed service that can be used to receive this data, otionally transform it and persist it.

It is recommended that this service be forked into you own private repositroy and maintained by your software teams.
You are encouraged to modify this code to perform any custom transformations / notifications / actions that you require for your internal systems.


## Sample Current Functionality

This sample receives Iot telemetry data in Json format. It simply flatterns the data and optionally stores it to a current state table and history table.

## Infrastructure as Code

The `infra` folder contains example terraform scripts for provisioning the required azure infrastructure to support this service.
Infrastructure requires:
 - A storage account with tables provsioned for persisting data
 - A Function Pland / App for hosting the code that receives iot telemetry


## Prerequistutes
1. A git repository to store scripts customised for your cloud environment
    - Create a private `Fork` of this repository

1. Either a Linux environment with the following installed
    - azure cl
    - terraform

   Or Docker
    - in which case we can use the docker image `zenika/terraform-azure-cli`
    - see `/infra/docker`

1. An azure subscription and a login that is granted sufficent priveledges to create resources:
    - Service Principle
    - Resource Groups
    - Storage Accounts
    - Function App
    - Possibly Key Vault


## Using a Docker
1. Start the docker container:
    ```bash
        docker-compose -f ./infra/docker/docker-compose.yml up -d
    ```

2. Connect to the bash prompt:
    ```bash
        docker-compose -f ./infra/docker/docker-compose.yml exec terraform-dev bash
    ```

    Inside the container the path `/app` is noy mapped to the root of this project

## Steps to prepare to use terraform
We must create a storage account for terraform to store its state files and a service principle for creating azure resources

## Login to you subscription
1. Log into you azure subscription
    ```bash
    az login
    ```
1. From the list of subscriptions you have access to choose which one you intend to use and copy its:
    - `id`  is the  (ARM_SUBSCRIPTION_ID )
    - `tenantId` is the (ARM_TENANT_ID)
1. Associate your session with the subscription
    ```bash
        az account set --subscription="<id from above>"
    ```
    Now all operations will be performed agains this subscription

## Create a storage account for terraform state
1. Create a storage account for terraform to store its state using the following example script:
    - As storage account name must be globally unique the storage account name contains a random suffix genreated from the current timestamp
    - Be sure to check that the settings in the file match your environment before running, especially `LOCATION`, Run
    - ```bash
      ./infra/script/create-terraform-remote-state.sh
      ```
    - copy and store the output of this script required later

1. Update file, `infra/terraform/azure/dev/providers.tf` replace the value of `storage_account_name` with the name of the storage account created in the previous step

## Create A Service Account
1. Create a service account
    - see here: https://markheath.net/post/create-service-principal-azure-cli
    ```bash
        az login
        az ad sp create-for-rbac --role="Owner" --scopes="/subscriptions/$SUBSCRIPTION_ID" --name "az-cli-serviceAccount"
    ```
    - Example Output
    ```JSON
    {
    "appId": "ARM_CLIENT_ID",
    "displayName": "az-cli-serviceAccount",
    "name": "http://az-cli-serviceAccount",
    "password": "ARM_CLIENT_SECRET",
    "tenant": "ARM_TENANT_ID"
    }
   ```
1. Setup your login script using `env-configureSubscription.sh` as a template and rename to indicate your cloud environment
    - e.g. `dev-configureSubscription.sh` would be used for your development environment
    - ```bash
        cp ./infra/script/env-configureSubscription.sh ./infra/script/dev-configureSubscription.sh
      ```
    - From the output of the previous steps copy the respective values into the script
    - do not commit this file to source control, store it somewhere locally as it contains your credentuals


## Run Terraform Scripts
1. Run your login script using the `source` command to import environment variables used by terraform to identify your account
    ```bash
    source /infra/scripts/dev-configureSubscription.sh
    ```

1. Initialise & Plan Terraform module
    1. Change to folder
        -  `./infra/terraform/azure/dev`

    1. Run terraform Init
        ```bash
        terraform init
        ```

    1. Terraform Plan
        ```bash
        terraform plan
        ```




# File system permissions
```bash
 groupadd -g 1001 docker
 sudo chown -R :1001 .
 chmod -R g=+rwx .
 sudo chown 1000 file
 ```