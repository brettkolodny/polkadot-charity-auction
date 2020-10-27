module Api = {
    type t;
    [@bs.module "./dapp.js"] external connect: unit => Js.Promise.t(t) = "connect";
}

module Contract = {
    [@bs.module "./dapp.js"] external enterRaffle: (Api.t, int) => unit = "enterRaffle";
    [@bs.module "./dapp.js"] external getDrawCountdown: Api.t => string = "getDrawCountdown";
    [@bs.module "./dapp.js"] external getDrawCountdownSubscription: (Api.t, Js.nullable(int) => unit) => Js.Promise.t('a) = "getDrawCountdownSubscription";
    [@bs.module "./dapp.js"] external getWinners: Api.t => Js.Promise.t(array(string)) = "getWinners";
    [@bs.module "./dapp.js"] external getWinnersSubscription: (Api.t, array(string) => unit) => Js.Promise.t('a) = "getWinnersSubscription";
    [@bs.module "./dapp.js"] external draw: Api.t => unit = "draw";
    [@bs.module "./dapp.js"] external numWinners: Api.t => Js.Promise.t(string) = "numWinners";
    [@bs.module "./dapp.js"] external numEntries: Api.t => Js.Promise.t(string) = "numEntries";
    [@bs.module "./dapp.js"] external numEntriesSubscription: (Api.t, string => unit) => Js.Promise.t('a) = "numEntriesSubscription";
};