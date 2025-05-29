# Deployment

## Create a role for Pulumi

I will create a role for pulumi to deploy the project, it will have **CRUD**
resources permissions. Because of that, this role will be only used in Github
Actions. It named **PulumiEscCiriusGoPortfolioDeployment**, combination of:

- IaC/Provider - **PulumiEsc**: IaC, OIDC provider that I used.
- Org - **CiriusGo**: Organization name.
- Proj - **Portfolio**: Project name.
- Purpose - **Deployment**: Indicate the purpose of this role.

Follow this rule, you can create role(s) for any provider, project,
organization, and purpose inside a same/multiple AWS account(s) without any
conflict.

### S3 Bucket

**PulumiEscCiriusGoPortfolioDeployment** should have permissions to create s3
bucket(s). So I created & attached policy name:
**CiriusGoPortfolioS3WebAppRootFullAccess**.

```jsonc
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:CreateBucket",
        "s3:DeleteBucket",
        "s3:ListBucket",
        "s3:ListBucketVersions",
        "s3:GetBucketPolicy",
        "s3:GetBucketAcl",
        "s3:GetObjectAcl",
        "s3:GetObjectVersionAcl",
        "s3:PutBucketAcl",
        "s3:PutObjectAcl",
        "s3:PutObjectVersionAcl",
        "s3:GetBucketCORS",
        "s3:PutBucketCORS",
        "s3:GetBucketWebsite",
        "s3:DeleteBucketWebsite",
        "s3:PutBucketWebsite",
        "s3:GetBucketVersioning",
        "s3:PutBucketVersioning",
        "s3:GetObjectVersion",
        "s3:DeleteObjectVersion",
        "s3:DeleteObjectVersionTagging",
        "s3:PutObjectVersionTagging",
        "s3:GetAccelerateConfiguration",
        "s3:PutAccelerateConfiguration",
        "s3:GetBucketRequestPayment",
        "s3:PutBucketRequestPayment",
        "s3:GetBucketLogging",
        "s3:PutBucketLogging",
        "s3:GetLifecycleConfiguration",
        "s3:PutLifecycleConfiguration",
        "s3:GetReplicationConfiguration",
        "s3:PutReplicationConfiguration",
        "s3:GetEncryptionConfiguration",
        "s3:PutEncryptionConfiguration",
        "s3:GetBucketObjectLockConfiguration",
        "s3:PutBucketObjectLockConfiguration",
        "s3:GetBucketTagging",
        "s3:PutBucketTagging",
        "s3:PutBucketPublicAccessBlock",
        "s3:GetBucketPublicAccessBlock",
        "s3:PutBucketOwnershipControls",
        "s3:GetBucketOwnershipControls"
      ],
      "Resource": [
        "arn:aws:s3:::cirius-go-portfolio-frontend-dev-*",
        "arn:aws:s3:::cirius-go-portfolio-frontend-prod-*"
      ]
    }
  ]
}
```

#TODO: move OAC policy to another roles. It can be shared to multiple
user/groups.

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "ForOAC",
      "Effect": "Allow",
      "Action": [
        "cloudfront:CreateOriginAccessControl",
        "cloudfront:UpdateOriginAccessControl",
        "cloudfront:DeleteOriginAccessControl",
        "cloudfront:GetOriginAccessControl"
      ],
      "Resource": [
        "arn:aws:cloudfront::891376956916:origin-access-control/*"
      ]
    },
    {
      "Sid": "ForDistribution",
      "Effect": "Allow",
      "Action": [
        "cloudfront:CreateDistribution"
      ],
      "Resource": [
        "arn:aws:cloudfront::891376956916:distribution/*"
      ],
      "Condition": {
        "StringLike": {
          "aws:RequestTag/resourceTagId": [
            "cirius-go-portfolio-frontend-dev-cf-distribution",
            "cirius-go-portfolio-frontend-prod-cf-distribution"
          ]
        }
      }
    }
  ]
}
```

To trigger aws resources behaviors from local (eg: Call API used s3 service to
put serveral files to specific bucket folder), you have to attach execution
role(s) instead.
