let pkgs = import <nixpkgs> {};

in pkgs.stdenv.mkDerivation rec {
  name = "airconpdf";

  buildInputs = with pkgs; [
    nodejs-9_x
  ];
}
