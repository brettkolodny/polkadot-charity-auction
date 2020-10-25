module Api = {
    type t;
    [@bs.module "./dapp.js"] external connect: unit => Js.Promise.t(t) = "connect";
}

module Contract = {
    [@bs.module "./dapp.js"] external enterRaffle: Api.t => unit = "enterRaffle";
    [@bs.module "./dapp.js"] external getDrawCountdown: Api.t => string = "getDrawCountdown";
    [@bs.module "./dapp.js"] external getWinners: Api.t => string = "getWinners";
    [@bs.module "./dapp.js"] external draw: Api.t => unit = "draw";
    [@bs.module "./dapp.js"] external numWinners: Api.t => string = "numWinners";
    [@bs.module "./dapp.js"] external numEntries: Api.t => string = "numEntires";
};