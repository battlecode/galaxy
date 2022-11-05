# infra

terraform configs!

## one-time setup for Google Cloud Project

These need only be done once per project. (We've already done these on the `mitbattlecode` project, here: https://console.cloud.google.com/home/dashboard?project=mitbattlecode. These instructions are here just for posterity)

create an iam worker for terraform, and give it some necessary permissions. See https://console.cloud.google.com/iam-admin/iam?referrer=search&project=mitbattlecode for an example.

if the bucket referenced in `state.tf` doesn't exist in the Google Cloud project yet, you should create it, on the Google Cloud website interface. Go to `Cloud Storage`, which lists frontend buckets, and press `create bucket`, which should take you here: https://console.cloud.google.com/storage/create-bucket?project=mitbattlecode

## one-time setup for your personal machine

These steps need to be run only once for each local machine / installation.

**DO NOT GENERATE KEYS FOR ANY SERVICE ACCOUNT.** Keys may be revoked summarily without consulting you, because they are a security risk.
Instead, you should ensure your Google Cloud SDK is authenticated _as you_, and this Terraform setup has been configured to automatically impersonate (convert to) the Terraform service account.

**if you have not run this step on your machine yet**, configure docker to push to our container registry:

```
gcloud auth configure-docker us-east1-docker.pkg.dev
```

**ask devs for any further configuration steps, eg via Slack or Notion**

finally, **if not done on your machine yet, initialize terraform!**

```
terraform init
```

## deployment

**NOTE: these notes are old. Don't follow them blindly; instead, adjust every step to fit the new repo and setup. When a section is up-to-date, remove the "OLD" note from each section**

### deploying saturn workers

**OLD DO NOT USE**

build & push images:

```
cd ../worker && make push && cd ../infra
```

then, update `variables.tf` with the new sha256 hashes of the pushed images. these hashes are at the bottom of `make push`'s output, here:
![image](https://user-images.githubusercontent.com/14008996/147513611-59030a82-e771-4d75-b904-fbe841910778.png)

you may now run

```
terraform apply -var-file="secret.tfvars"
```

verify that the deployment is what you expect it to be! and then answer `yes` when it prompts you

next, do a rolling **replace** of the **execute** images. this ought to be unnecessary, but terraform is weird. anyways

finally, commit and push your changes (to all `.tf` files and the `.terraform.lock.hcl` if applicable)

### releasing bc22

**OLD DO NOT USE**

in `distribution22.tf`, simply uncomment the `member = "allUsers"` line. that should be enough!

after doing that, run

```
terraform apply -var-file="secret.tfvars"
```

verify that the deployment is what you expect it to be! and then answer `yes` when it prompts you

finally, commit and push your changes (to all `.tf` files and the `.terraform.lock.hcl` if applicable)

### other deploys

**OLD DO NOT USE**

first do any changes you want to do in the `.tf` files.
when you have done that and everything else to prepare for deploy, run

```
terraform apply -var-file="secret.tfvars"
```

verify that the deployment is what you expect it to be! and then answer `yes` when it prompts you

finally, commit and push your changes (to all `.tf` files and the `.terraform.lock.hcl` if applicable)
