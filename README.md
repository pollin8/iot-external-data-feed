# Pollin8 External Data Feed Client Consumer Seed Project

This project is a starter project for clients wishing to consume data from the Pollib8 Iot platform.
Data made available via EventHub Subscriptions.
Clients can subscribe to event hubs and receive iot telemetry data.
This reository represents a seed service that can be used to receive this data, otionally transform it and persist it.

It is recommended that this service be forked into you own private repositroy and maintained by your software teams.
You are encouraged to modify this code to perform any custom transformations / notifications / actions that you require for your internal systems.


## Sample Functionality

This sample receives Iot telemetry data in Json format. It simply flatterns the data and optionally stores it to a current state table and history table.

## Infrastructure as Code

The `infra` folder contains example terraform scripts for provisioning the required azure infrastructure to support this service.
Infrastructure requires:
 - A storage account with tables provsioned for persisting data
 - A Function Plan / App for hosting the code that receives iot telemetry, processes and stores it


# PART 1 - Configure Cloud Infrastructure
## Prerequistutes
1. A git repository to store scripts customised for your cloud environment
    - Create a private `Fork` of this repository

1. Either a Linux environment with the following installed
    - azure cl
    - terraform

   Or Docker
    - in which case we can use the docker image `zenika/terraform-azure-cli`
    - see `/infra/docker` for a sample compose file that makes use of this docker image

1. An azure subscription and a login that is granted sufficent priveledges to create the following resource types:
    - Service Principle
    - Resource Groups
    - Storage Accounts
    - Function App



## Using Docker
1. Start the docker container:
    ```bash
        docker-compose -f ./infra/docker/docker-compose.yml up -d
    ```

2. Connect to the bash prompt of the container:
    ```bash
        docker-compose -f ./infra/docker/docker-compose.yml exec terraform-dev bash
    ```

    Inside the container the root path to your workig files is `/app`

## Steps to prepare to use terraform
We must create a storage account for terraform to store its state files and a service principle for creating azure resources. If you already have these rouresource within your subscription then the terraform scripts can be updated to use your exsiting reources

## Login to you subscription
1. Log into you azure subscription
    ```bash
    az login
    ```
1. From the list of subscriptions you have access to choose which one you intend to use and copy these values for use later:
    - `id`  is the  (ARM_SUBSCRIPTION_ID )
    - `tenantId` is the (ARM_TENANT_ID)
1. Associate your session with the subscription you wish to work within
    ```bash
        az account set --subscription="<id from above>"
    ```
    Now all operations will be performed agains this subscription

## Create a storage account for terraform to store state
1. Create a storage account for terraform to store its state using the following example script:
    - As storage account name must be globally unique the storage account name contains a random suffix genreated from the current timestamp
    - Be sure to check that the settings in the script file below match your environment before running, especially `LOCATION`, Run
    - ```bash
      ./infra/script/create-terraform-remote-state.sh
      ```
    - copy and store the output of this script required later

1. Update file, `infra/terraform/azure/dev/providers.tf` replace the value of `storage_account_name` with the name of the storage account created in the previous step

## Create a Service Account
1. Create a service account
    - see here: https://markheath.net/post/create-service-principal-azure-cli
    - SUBSCRIPTION_ID is the value taken from previous steps
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

# Part 2 - Build and deploy Software
The software is provided under the `service` folder in this repository.
This contains an azure function written in Typescript targeting NodeJS.

The software must be built and deployed to the cloud infrastrucutre provisioned in Part 1.

If you are using a ci/cd pipeline the `./service/ci` folder contains a Azure Devops build and deploy pipline that can be used as an example to build and deploy tis service in your environment

## Prerequsites
Again this environment can either be setup locally or you can use the provided `docker-compose.yml` file and work within a docker container
1. NodeJS 16 or above with npm
1. A bash terminal


## Building the Software
From a bash terminal run the following commands
1. ``` cd ./service ```
1. ``` npm i ```
1. ```npm run package ```

The output of this script is a zip file named `iot-external-data-feed-2022-08-15-1660510879.zip` where the timestamp is generated and appended dynamically.

## Deploy to Azure function
Here the name of your azure function will be slightly different as it will have a different random suffix
Also the last parameter specifying the source will be the output from the section above and will differ by timestamp every time its run

```bash
az functionapp deployment source config-zip \
    --resource-group dev-external-data-feed \
    --name dev-external-data-feed-app-<your random suffix> \
    --src /service/deployments/iot-external-data-feed-2022-08-15-1660510879.zip
```



# Additional Info
## File system permissions
```bash
 groupadd -g 1001 docker
 sudo chown -R :1001 .
 chmod -R g=+rwx .
 sudo chown 1000 file
 ```

 ## Install 7Zip
 ```bash
 sudo apt-get update -y
 sudo apt-get install -y p7zip-full
 ```