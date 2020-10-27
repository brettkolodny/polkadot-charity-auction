#![cfg_attr(not(feature = "std"), no_std)]

use ink_lang as ink;

#[ink::contract]
mod charity_contract {
    const ZERO_POINT_ONE_UNIT: Balance = 100000000000000;
    const ZERO_POINT_ZERO_ONE_UNIT: Balance = 10000000000000;
    const FIFTEEN_MINUTES: u64 = 900000;
    const ENTRIES_REQUIRED_FOR_DRAW: u32 = 5;
    const NUM_WINNERS: u32 = 2;

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

    #[ink(event)]
    pub struct RaffleOver;

    #[ink(storage)]
    pub struct CharityRaffle {
        transfer_address: AccountId,
        entries: ink_storage::collections::Vec<AccountId>,
        winners: ink_storage::collections::Vec<AccountId>,
        draw_countdown: Option<Timestamp>,
        balance: Balance,
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
                balance: 0,
            }
        }

        #[ink(message)]
        pub fn get_balance(&self) -> Balance {
            self.balance
        }

        #[ink(message, payable)]
        pub fn enter_raffle(&mut self) -> bool {
            let caller = self.env().caller();
            let transfered_amount = self.env().transferred_balance();

            if self.winners.len() >= NUM_WINNERS {
                self.env().transfer(caller, transfered_amount).unwrap();
                return false;
            }

            if transfered_amount > ZERO_POINT_ONE_UNIT || transfered_amount < ZERO_POINT_ZERO_ONE_UNIT {
                self.env().transfer(caller, transfered_amount).unwrap();
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

                self.balance += transfered_amount;

                return true;
            } else {
                self.env().transfer(caller, transfered_amount).unwrap();
            }
            
            false
        }

        #[ink(message)]
        pub fn draw(&mut self) -> bool {
            match self.draw_countdown {
                Some(t) => {
                    let current_block_timestamp = self.env().block_timestamp();

                    if current_block_timestamp - t < FIFTEEN_MINUTES {
                        return false;
                    }
                },
                None => return false,
            }

            if self.winners.len() >= NUM_WINNERS {
                return false;
            }

            let eligible_winners = self.get_eligible_winners();

            let random_index = Self::get_random_number() % eligible_winners.len();

            let winner = eligible_winners.get(random_index).unwrap();

            self.winners.push(*winner);

            self.env().emit_event(
                RaffleWinner {
                    winner: *winner
                }
            );

            if self.winners.len() >= NUM_WINNERS {
                self.env().transfer(self.transfer_address, self.balance).unwrap();
                self.balance = 0;

                self.env().emit_event(
                    RaffleOver {}
                );
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

        fn get_eligible_winners(&self) -> ink_storage::Vec<AccountId> {
            let mut eligible = ink_storage::Vec::<AccountId>::new();

            for entry in self.entries.iter() {
                if !self.already_won(entry) {
                    eligible.push(*entry);
                }
            }

            eligible
        }

        // Thank you to @LaurentTrk#4763 on discord for the following two functions
        fn get_random_number() -> u32 {
            let seed: [u8; 8] = [22, 102, 104, 141, 55, 71, 89, 88];
            let random_hash = Self::env().random(&seed);
            Self::as_u32_be(&random_hash.as_ref())
        }

        fn as_u32_be(array: &[u8]) -> u32 {
            ((array[0] as u32) << 24) +
                ((array[1] as u32) << 16) +
                ((array[2] as u32) << 8) +
                ((array[3] as u32) << 0)
        }
    }
}
