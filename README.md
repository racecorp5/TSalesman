# Deploy the .NET backend to Azure:
  * `cd backend`
  * `dotnet publish -c Release`
  * `az webapp up --name myAppService --resource-group tsalesmangroup --plan myAppServicePlan --sku F1`

# Deploy the Angular app to Azure Storage:
  * `az storage blob upload-batch -d '$web' --account-name mystorageaccount -s ../frontend/dist/frontend`

