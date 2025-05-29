import * as aws from "@pulumi/aws";
import * as util from "../../util";
import { Record } from "@pulumi/aws/route53";
import { Input } from "@pulumi/pulumi";

export type CreateRoute53RecordWithCFDistributionParams = {
  name: string;
  hostedZoneId: string;
  domain: string;
  distribution: {
    domainName: Input<string>;
    hostedZoneId: Input<string>;
  }
};

export type CreateRoute53RecordWithCFDistributionResult = Record

export const createRecordWithCFDistribution = (
  params: CreateRoute53RecordWithCFDistributionParams = {
    name: "example-repo",
    hostedZoneId: "Z2FDTNDATAQYW2",
    domain: "example.com",
    distribution: {
      domainName: "cf-example.com",
      hostedZoneId: "cf_Z2FDTNDATAQYW2",
    },
  }
): CreateRoute53RecordWithCFDistributionResult => {
  const { name, hostedZoneId, distribution, domain } = params;

  return new aws.route53.Record(
    util.mkResourceName(name, "dns-record"),
    {
      zoneId: hostedZoneId,
      name: domain,
      type: "A",
      aliases: [
        {
          name: distribution.domainName,
          zoneId: distribution.hostedZoneId,
          evaluateTargetHealth: true,
        },
      ],
    },
  );
};
