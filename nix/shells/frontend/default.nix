{ mkShell, pkgs, ... }:
mkShell {
  packages = with pkgs; [
    typescript
    pulumi
    pulumictl
    pulumi-esc
    pulumiPackages.pulumi-command
    pulumiPackages.pulumi-aws-native
    pulumiPackages.pulumi-language-nodejs
    act # Github act for local testing
  ];
}
