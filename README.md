# Charity Raffle

## Setup

### Using the hosted website
1) Run your local substrate node with the contract pallet (e.g. canvas) with `--dev --tmp`
3) Run the setup script with `node setup.js --no-write"
2) Navigate to https://charity-raffle-challenge.netlify.app/

### Building website
1) Run your local substrate node with the contract pallet (e.g. canvas) with `--dev --tmp`
2) Run the setup script with `node setup.js`
3) Run `yarn re:build`
4) Run `yarn server`
5) Navigate to localhost:1234

## Notes

## Building
If you're using the website I'm going off of the assumption that the contract will be deployed to the same address in memory every time.
This very well could not be the case (though in my testing it seems to be). If you are having issues using the hosted website try building it instead.

## Running
This app uses the polkadot extension to run. You can add the other dev accounts to your extension by importing an account with a pre-existing seed.
The seed for the dev accounts are `bottom drive obey lake curtain smoke basket hold race lonely fit walk//<name>` where \<name\> is Alice, Bob, Charlie, etc.

The app always uses the top address in the extension, so you will need to change the visibility of accounts in order to use the raffle entirely through website.

Either way you will need to transfer some funds through https://polkadot.js.org/apps/ around to make sure you have enough accounts with an adequate amount of tokens to use the app. 
