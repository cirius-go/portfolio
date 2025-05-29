import * as pulumi from "@pulumi/pulumi";

export const mkResourceName = (monorepoName: string, resource?: string) => {
  const elems = [pulumi.getProject(), monorepoName, pulumi.getStack()];
  if (resource) elems.push(resource);
  return elems.join("-");
};


export const mkCtxTags = (monorepoName: string, resourceName: string): pulumi.Input<{ [key: string]: pulumi.Input<string> }> => {
  const tags = {
    "resourceTagId": mkResourceName(monorepoName, resourceName),
  };
  return tags
}
