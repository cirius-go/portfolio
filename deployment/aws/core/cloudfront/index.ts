import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as cloudfront from "@aws-sdk/client-cloudfront";

import * as util from "../../util";
import { BucketPolicy } from "@pulumi/aws/s3";
import { Distribution } from "@pulumi/aws/cloudfront";

export type CreateDistWithS3Params = {
  name: string;
  bucket: {
    id: pulumi.Input<string>,
    bucket: pulumi.Input<string>,
    arn: pulumi.Input<string>,
    bucketRegionalDomainName: pulumi.Input<string>
  };
  priceClass: string;
  acmCertArn: string;
  aliases: string[];
};

export type CreateDistWithS3Result = {
  oacArn: pulumi.Output<string>;
  distribution: Distribution;
  bucketPolicy: BucketPolicy;
}

export const createDistributionWithS3 = (
  params: CreateDistWithS3Params = {
    name: "example-repo",
    bucket: {
      id: "example-bucket-id",
      bucket: "example-bucket",
      arn: "arn:aws:s3:::example-bucket",
      bucketRegionalDomainName: "example-bucket.example.com"
    },
    priceClass: "PriceClass_200",
    acmCertArn: "arn:aws:s3:::example-arn",
    aliases: ["sub.example.com"],
  }

): CreateDistWithS3Result => {
  // create origin access control for setup distribution later.
  const oac = new aws.cloudfront.OriginAccessControl(
    util.mkResourceName(params.name, "oac"),
    {
      name: util.mkResourceName(params.name, "oac"),
      originAccessControlOriginType: "s3",
      signingBehavior: "always",
      signingProtocol: "sigv4",
    },
  );

  const { bucket, priceClass, acmCertArn } = params;
  const distribution = new aws.cloudfront.Distribution(
    util.mkResourceName(params.name, "cdn"),
    {
      enabled: true,
      origins: [
        {
          originId: bucket.id,
          domainName: bucket.bucketRegionalDomainName,
          originAccessControlId: oac.id,
        },
      ],
      defaultCacheBehavior: {
        targetOriginId: bucket.id,
        viewerProtocolPolicy: "redirect-to-https",
        allowedMethods: ["GET", "HEAD", "OPTIONS"],
        cachedMethods: ["GET", "HEAD", "OPTIONS"],
        cachePolicyId: "658327ea-f89d-4fab-a63d-7e88639e58f6",
        responseHeadersPolicyId: "67f7725c-6f97-4210-82d7-5512b31e9d03",
      },
      priceClass: priceClass,
      customErrorResponses: [
        {
          errorCode: 404,
          responseCode: 200,
          responsePagePath: "/index.html",
        },
        {
          errorCode: 403,
          responseCode: 200,
          responsePagePath: "/index.html",
        },
      ],
      restrictions: { geoRestriction: { restrictionType: "none" } },
      viewerCertificate: {
        sslSupportMethod: "sni-only",
        cloudfrontDefaultCertificate: true,
        acmCertificateArn: acmCertArn,
      },
      aliases: params.aliases,
      tags: util.mkCtxTags(params.name, "cf-distribution"),
    },
  );

  // define new bucket policy to allow cloudfront to read from bucket.
  const bucketPolicy = new aws.s3.BucketPolicy(
    util.mkResourceName(params.name, "bucket-policy"),
    {
      bucket: bucket.bucket,
      policy: pulumi.all([bucket.arn, distribution.arn]).apply(([arn, dArn]) =>
        JSON.stringify({
          Version: "2012-10-17",
          Statement: [
            {
              Sid: "AllowCloudFrontRead",
              Effect: "Allow",
              Principal: { Service: "cloudfront.amazonaws.com" },
              Action: ["s3:GetObject"],
              Resource: [`${arn}/*`],
              Condition: {
                StringEquals: {
                  "AWS:SourceArn": dArn,
                },
              },
            },
          ],
        }),
      ),
    },
  );
  return {
    oacArn: oac.arn,
    distribution: distribution,
    bucketPolicy: bucketPolicy,
  };
}

export const createInvalidateCache = async (
  cfDistributionId: string,
  region: string,
) => {
  const cf = new cloudfront.CloudFront({
    region: region,
  });

  const command = new cloudfront.CreateInvalidationCommand({
    DistributionId: cfDistributionId,
    InvalidationBatch: {
      Paths: { Quantity: 1, Items: ["/*"] },
      CallerReference: `${Date.now()}`,
    },
  });

  try {
    const response = await cf.send(command);
    console.log("Invalidation created:", response.Invalidation?.Id);
  } catch (error) {
    console.error("Error invalidating cache:", error);
  }
};
