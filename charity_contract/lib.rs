#![cfg_attr(not(feature = "std"), no_std)]

use ink_lang as ink;

#[ink::contract]
mod charity_contract {
    // extern crate rand;
    // use rand::{Rng, SeedableRng};

    const ZERO_POINT_ONE_UNIT: Balance = 100000000000000;
    const ZERO_POINT_ZERO_ONE_UNIT: Balance = 10000000000000;
    const FIFTEEN_MINUTES: u64 = 900000;
    const ENTRIES_REQUIRED_FOR_DRAW: u32 = 5;

    #[ink(event)]
    pub struct RaffleEntry {
        #[ink(topic)]
        entry: AccountId
    }

    #[ink(event)]
    pub struct RaffleWinner {
        #[ink(topic)]
        winner: AccountId
    }

    #[ink(storage)]
    pub struct CharityRaffle {
        transfer_address: AccountId,
        entries: ink_storage::collections::Vec<AccountId>,
        winners: ink_storage::collections::Vec<AccountId>,
        draw_countdown: Option<Timestamp>,
    }

    impl CharityRaffle {
        #[ink(constructor)]
        pub fn new(transfer_address: AccountId) -> Self {
            let entries = ink_storage::collections::Vec::new();
            let winners = ink_storage::collections::Vec::new();

            Self { 
                transfer_address,
                entries,
                winners,
                draw_countdown: None,
            }
        }

        #[ink(message, payable)]
        pub fn enter_raffle(&mut self) -> bool {
            let caller = self.env().caller();
            let transfered_amount = self.env().transferred_balance();

            if self.winners.len() > 2 {
                let _ = self.env().transfer(caller, transfered_amount);
                return false;
            }

            if transfered_amount > ZERO_POINT_ONE_UNIT || transfered_amount < ZERO_POINT_ZERO_ONE_UNIT {
                let _ = self.env().transfer(caller, transfered_amount);
                return false;
            }

            if !self.already_entered(&caller) {
                self.entries.push(caller);

                if self.entries.len() >= ENTRIES_REQUIRED_FOR_DRAW {
                    if let None = self.draw_countdown {
                        self.draw_countdown = Some(self.env().block_timestamp());
                    }
                }

                self.env().emit_event(
                    RaffleEntry {
                        entry: caller
                    }
                );

                return true;
            } else {
                let _ = self.env().transfer(caller, transfered_amount);
            }
            
            false
        }

        #[ink(message)]
        pub fn draw(&mut self) -> bool {
            let caller = self.env().caller();

            match self.draw_countdown {
                Some(t) => {
                    let current_block_timestamp = self.env().block_timestamp();

                    if current_block_timestamp - t < FIFTEEN_MINUTES {
                        return false;
                    }
                },
                None => return false,
            }

            if !self.already_entered(&caller) || self.winners.len() > 2 || self.already_won(&caller) {
                return false;
            }

            self.winners.push(caller);

            self.env().emit_event(
                RaffleWinner {
                    winner: caller
                }
            );

            if self.winners.len() >= 2 {
                let contract_balance = self.env().balance();
                let _ = self.env().transfer(self.transfer_address, contract_balance);
            }

            true
        }

        #[ink(message)]
        pub fn get_winners(&self) -> (Option<AccountId>, Option<AccountId>) {
            let winner1 = {
                if let Some(w) = self.winners.get(0) {
                    Some(*w)
                } else {
                    None
                }
            };

            let winner2 = {
                if let Some(w) = self.winners.get(1) {
                    Some(*w)
                } else {
                    None
                }
            };

            (winner1, winner2)
        }

        #[ink(message)]
        pub fn num_winners(&self) -> u32 {
            self.winners.len()
        }

        #[ink(message)]
        pub fn num_entries(&self) -> u32 {
            self.entries.len()
        }

        #[ink(message)]
        pub fn get_draw_countdown(&self) -> Option<u64> {
            if let Some(t) = self.draw_countdown {
                let current_block_timestamp = self.env().block_timestamp();

                let time_left = FIFTEEN_MINUTES.checked_sub(current_block_timestamp - t);

                if let Some(v) = time_left {
                    Some(v)
                } else {
                    Some(0)
                }
            } else {
                None
            }
        }

        fn already_entered(&self, account: &AccountId) -> bool {
            let entries_iter = self.entries.iter();

            for applicant in entries_iter {
                if applicant == account {
                    return true;
                }
            }

            false
        }

        fn already_won(&self, account: &AccountId) -> bool {
            let winners_iter = self.winners.iter();

            for winner in winners_iter {
                if winner == account {
                    return true
                }
            }

            false
        }
    }
}
