// module contract::game_room {
//     use sui::table::{Self, Table};
//     use sui::event;

//     use sui::coin::{Self, Coin};
//     use coin_sample::mycoin::MYCOIN;
//     use std::string::{Self, String};
//     use std::option::{Self, Option};

//     // Error codes
//     const EInvalidRoom: u64 = 0;
//     const ERoomAlreadyExists: u64 = 1;
//     const ERoomAlreadyHasPlayer: u64 = 2;
//     const EPlayerNotInRoom: u64 = 3;
//     const EUnauthorizedPlayer: u64 = 4;
//     const EInsufficientStake: u64 = 5;

//     // Events
//     public struct RoomCreated has copy, drop {
//         room_code: String,
//         host: address,
//         stake: u64,
//     }

//     public struct PlayerJoinedRoom has copy, drop {
//         room_code: String,
//         player: address,
//     }

//     public struct GameWon has copy, drop {
//         room_code: String,
//         winner: address,
//         prize: u64,
//     }

//     // Room public structure
//     public struct Room has store {
//         host_address: address,
//         stake: u64,
//         player2_address: Option<address>,
//         active: bool,
//     }

//     // Room manager public structure
//     public struct RoomManager has key {
//         id: UID,
//         // Maps room code to Room data
//         rooms: Table<String, Room>,
//     }

//     // One-time initialization function
//     fun init(ctx: &mut TxContext) {
//         let room_manager = RoomManager {
//             id: object::new(ctx),
//             rooms: table::new(ctx),
//         };

//         // Share the room manager as a shared object
//         transfer::share_object(room_manager);
//     }

//     // ======== GAME ROOM MANAGEMENT FUNCTIONS ========

//     // Host a new game room
//     public entry fun host_game(
//         room_manager: &mut RoomManager,
//         room_code: vector<u8>,
//         stake_coin: Coin<MYCOIN>,
//         ctx: &mut TxContext
//     ) {
//         let host = tx_context::sender(ctx);
//         let room_code_str = string::utf8(room_code);
        
//         // Check if room code already exists
//         assert!(!table::contains(&room_manager.rooms, room_code_str), ERoomAlreadyExists);
        
//         // Get stake amount from the coin
//         let stake = coin::value(&stake_coin);
        
//         // Burn the stake coin (or could transfer to a treasury)
//         transfer::public_transfer(stake_coin, host); // Return coin for now, in a real app would handle differently
        
//         // Create new room
//         let new_room = Room {
//             host_address: host,
//             stake: stake,
//             player2_address: option::none(),
//             active: true,
//         };
        
//         // Add room to the rooms table
//         table::add(&mut room_manager.rooms, room_code_str, new_room);
        
//         // Emit event
//         event::emit(RoomCreated {
//             room_code: room_code_str,
//             host: host,
//             stake: stake,
//         });
//     }

//     // Join an existing game room
//     public entry fun join_game(
//         room_manager: &mut RoomManager,
//         room_code: vector<u8>,
//         stake_coin: Coin<MYCOIN>,
//         ctx: &mut TxContext
//     ) {
//         let player2 = tx_context::sender(ctx);
//         let room_code_str = string::utf8(room_code);
        
//         // Check if room exists
//         assert!(table::contains(&room_manager.rooms, room_code_str), EInvalidRoom);
        
//         // Get room data
//         let room = table::borrow_mut(&mut room_manager.rooms, room_code_str);
        
//         // Check if room already has a second player
//         assert!(option::is_none(&room.player2_address), ERoomAlreadyHasPlayer);
        
//         // Check if room is active
//         assert!(room.active, EInvalidRoom);
        
//         // Verify stake amount matches room stake
//         let stake = coin::value(&stake_coin);
//         assert!(stake >= room.stake, EInsufficientStake);
        
//         // Burn the stake coin (or could transfer to a treasury)
//         transfer::public_transfer(stake_coin, player2); // Return coin for now, in a real app would handle differently
        
//         // Add player2 to the room
//         room.player2_address = option::some(player2);
        
//         // Emit event
//         event::emit(PlayerJoinedRoom {
//             room_code: room_code_str,
//             player: player2,
//         });
//     }

//     // Record game result and distribute rewards
//     public entry fun win_game(
//         room_manager: &mut RoomManager,
//         room_code: vector<u8>,
//         winner: address,
//         treasury_cap: &mut coin::TreasuryCap<MYCOIN>,
//         ctx: &mut TxContext
//     ) {
//         let caller = tx_context::sender(ctx);
//         let room_code_str = string::utf8(room_code);
        
//         // Check if room exists
//         assert!(table::contains(&room_manager.rooms, room_code_str), EInvalidRoom);
        
//         // Get room data
//         let room = table::borrow_mut(&mut room_manager.rooms, room_code_str);
        
//         // Check if room is active
//         assert!(room.active, EInvalidRoom);
        
//         // Check if player2 has joined
//         assert!(option::is_some(&room.player2_address), EPlayerNotInRoom);
        
//         // Check if caller is either host or player2 (for security)
//         assert!(caller == room.host_address || option::contains(&room.player2_address, &caller), EUnauthorizedPlayer);
        
//         // Check if winner is either host or player2
//         assert!(winner == room.host_address || option::contains(&room.player2_address, &winner), EUnauthorizedPlayer);
        
//         // Calculate prize (double the stake)
//         let prize = room.stake * 2;
        
//         // Mint and award prize to winner
//         coin::mint_and_transfer(treasury_cap, prize, winner, ctx);
        
//         // Mark room as inactive
//         room.active = false;
        
//         // Emit event
//         event::emit(GameWon {
//             room_code: room_code_str,
//             winner: winner,
//             prize: prize,
//         });
//     }

//     // Get room details (view function)
//     public fun get_room_details(
//         room_manager: &RoomManager,
//         room_code: vector<u8>
//     ): (address, u64, Option<address>, bool) {
//         let room_code_str = string::utf8(room_code);
        
//         assert!(table::contains(&room_manager.rooms, room_code_str), EInvalidRoom);
        
//         let room = table::borrow(&room_manager.rooms, room_code_str);
        
//         (room.host_address, room.stake, *&room.player2_address, room.active)
//     }

//     // Cancel a room and refund stake (only host can do this, and only if no player2 yet)
//     public entry fun cancel_room(
//         room_manager: &mut RoomManager,
//         room_code: vector<u8>,
//         treasury_cap: &mut coin::TreasuryCap<MYCOIN>,
//         ctx: &mut TxContext
//     ) {
//         let caller = tx_context::sender(ctx);
//         let room_code_str = string::utf8(room_code);
        
//         // Check if room exists
//         assert!(table::contains(&room_manager.rooms, room_code_str), EInvalidRoom);
        
//         // Get room data
//         let room = table::borrow_mut(&mut room_manager.rooms, room_code_str);
        
//         // Check if caller is the host
//         assert!(caller == room.host_address, EUnauthorizedPlayer);
        
//         // Check if no player2 has joined yet
//         assert!(option::is_none(&room.player2_address), ERoomAlreadyHasPlayer);
        
//         // Check if room is active
//         assert!(room.active, EInvalidRoom);
        
//         // Refund stake to host by minting new coins
//         coin::mint_and_transfer(treasury_cap, room.stake, caller, ctx);
        
//         // Mark room as inactive
//         room.active = false;
//     }
// }