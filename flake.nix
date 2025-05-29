{
  description = "portfolio Frontend Flake";
  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable";
    snowfall-lib = {
      url = "github:snowfallorg/lib";
      inputs.nixpkgs.follows = "nixpkgs";
    };
  };

  outputs =
    inputs:
    let
      lib = inputs.snowfall-lib.mkLib {
        inherit inputs;
        src = ./.;
        snowfall = {
          root = ./nix;
          meta = {
            name = "portfolio-frontend-flake";
            title = "portfolio Frontend Flake";
          };
          namespace = "portfolio-frontend";
        };
      };
    in
    lib.mkFlake {
      channels-config = {
        allowUnfree = false;
      };
      overlays = [ ];
      systems.modules = {
        nixos = [ ];
        darwin = [ ];
      };
      outputs-builder = channels: { formatter = channels.nixpkgs.nixfmt-rfc-style; };
    };
}
