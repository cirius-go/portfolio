import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import { BucketV2 } from "@pulumi/aws/s3";
import { S3BucketFolder } from "@pulumi/synced-folder";
import * as syncedFolder from "@pulumi/synced-folder";

import * as util from "../../util";

export type SetupS3BucketFolderParams = {
  builtDir: string;
  name: string;
  toSyncFolder: string;
};

export type SetupS3BucketFolderResult = {
  bucket: BucketV2;
  toSyncFolder: S3BucketFolder;
};

export const setupBucketWithSyncFolder = (
  params: SetupS3BucketFolderParams,
): SetupS3BucketFolderResult => {
  const bucketName = util.mkResourceName(params.name);

  // create S3 bucket
  const bucket = new aws.s3.BucketV2(bucketName, {
    bucket: bucketName,
    tags: util.mkCtxTags(params.name, "s3-bucket"),
  });

  // configure S3 settings
  const ownershipControls = new aws.s3.BucketOwnershipControls(
    util.mkResourceName(params.name, "ownership-controls"),
    {
      bucket: bucket.bucket,
      rule: { objectOwnership: "BucketOwnerPreferred" },
    },
  );

  // to block public access directly through s3 api.
  const publicAccessBlock = new aws.s3.BucketPublicAccessBlock(
    util.mkResourceName(params.name, "public-access-block"),
    {
      bucket: bucket.bucket,
      blockPublicAcls: true,
      blockPublicPolicy: true,
      ignorePublicAcls: true,
      restrictPublicBuckets: true,
    },
  );

  // sync folder to created S3 bucket
  const toSyncFolder = new syncedFolder.S3BucketFolder(
    util.mkResourceName(params.name, "synced-folder"),
    {
      path: `${params.builtDir}/${pulumi.getStack()}/${params.name}/${params.toSyncFolder}`,
      bucketName: bucket.bucket,
      acl: "bucket-owner-full-control",
    },
    { dependsOn: [ownershipControls, publicAccessBlock] },
  );

  return {
    bucket: bucket,
    toSyncFolder: toSyncFolder,
  };
};
