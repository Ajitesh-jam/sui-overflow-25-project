module contract::game_currency {
    use sui::table::{Self, Table};
    use sui::event;
    use std::string::{Self, String};

    // Error codes
    const EInsufficientCoins: u64 = 0;
    const EInvalidRoom: u64 = 1;
    const ERoomAlreadyExists: u64 = 2;
    const ERoomAlreadyHasPlayer: u64 = 3;
    const EPlayerNotInRoom: u64 = 4;
    const EUnauthorizedPlayer: u64 = 5;

    // Events
    public struct CoinsPurchased has copy, drop {
        player: address,
        amount: u64,
    }

    public struct RoomCreated has copy, drop {
        room_code: String,
        host: address,
        stake: u64,
    }

    public struct PlayerJoinedRoom has copy, drop {
        room_code: String,
        player: address,
    }

    public struct GameWon has copy, drop {
        room_code: String,
        winner: address,
        prize: u64,
    }

    // Coin mapping public structure
    public struct CoinManager has key {
        id: UID,
        // Maps player address to their coin balance
        player_coins: Table<address, u64>,
    }

    // Room public structure
    public struct Room has store {
        host_address: address,
        stake: u64,
        player2_address: Option<address>,
        active: bool,
    }

    // Room manager public structure
    public struct RoomManager has key {
        id: UID,
        // Maps room code to Room data
        rooms: Table<String, Room>,
    }

    // One-time initialization function
    fun init(ctx: &mut TxContext) {
        let coin_manager = CoinManager {
            id: object::new(ctx),
            player_coins: table::new(ctx),
        };

        let room_manager = RoomManager {
            id: object::new(ctx),
            rooms: table::new(ctx),
        };

        // Share both managers as shared objects
        transfer::share_object(coin_manager);
        transfer::share_object(room_manager);
    }

    // ======== COIN MANAGEMENT FUNCTIONS ========

    // Buy coins for a player
    public entry fun buy_coins(
        coin_manager: &mut CoinManager,
        player: address,
        amount: u64,
    ) {
        // // Take payment from the user (simplified, in a real app would have conversion rate)
        // let payment_balance = coin::split(payment, amount, ctx);
        // transfer::public_transfer(payment_balance, tx_context::sender(ctx));  //------------------> This can't be done since the owner need to call the contract to transfer the payment, so we just assume the payment is done
        
        // Update player's coin balance
        if (table::contains(&coin_manager.player_coins, player)) {
            let current_amount = table::remove(&mut coin_manager.player_coins, player);
            table::add(&mut coin_manager.player_coins, player, current_amount + amount);
        } else {
            table::add(&mut coin_manager.player_coins, player, amount);
        };

        // Emit event
        event::emit(CoinsPurchased { player, amount });
    }

    // Get coins balance for a player (view function)
    public fun get_coins(coin_manager: &CoinManager, player: address): u64 {
        if (table::contains(&coin_manager.player_coins, player)) {
            *table::borrow(&coin_manager.player_coins, player)
        } else {
            0
        }
    }

    // Internal function to add coins to a player
    fun add_coins(coin_manager: &mut CoinManager, player: address, amount: u64) {
        if (table::contains(&coin_manager.player_coins, player)) {
            let current_amount = table::remove(&mut coin_manager.player_coins, player);
            table::add(&mut coin_manager.player_coins, player, current_amount + amount);
        } else {
            table::add(&mut coin_manager.player_coins, player, amount);
        }
    }

    // Internal function to deduct coins from a player
    fun deduct_coins(coin_manager: &mut CoinManager, player: address, amount: u64) {
        assert!(table::contains(&coin_manager.player_coins, player), EInsufficientCoins);
        
        let current_amount = table::remove(&mut coin_manager.player_coins, player);
        assert!(current_amount >= amount, EInsufficientCoins);
        
        table::add(&mut coin_manager.player_coins, player, current_amount - amount);
    }

    // ======== GAME ROOM MANAGEMENT FUNCTIONS ========

    // Host a new game room
    public entry fun host_game(
        coin_manager: &mut CoinManager,
        room_manager: &mut RoomManager,
        room_code: vector<u8>,
        stake: u64,
        ctx: &mut TxContext
    ) {
        let host = tx_context::sender(ctx);
        let room_code_str = string::utf8(room_code);
        
        // Check if room code already exists
        assert!(!table::contains(&room_manager.rooms, room_code_str), ERoomAlreadyExists);
        
        // Deduct stake from host's coin balance
        deduct_coins(coin_manager, host, stake);
        
        // Create new room
        let new_room = Room {
            host_address: host,
            stake: stake,
            player2_address: option::none(),
            active: true,
        };
        
        // Add room to the rooms table
        table::add(&mut room_manager.rooms, room_code_str, new_room);
        
        // Emit event
        event::emit(RoomCreated {
            room_code: room_code_str,
            host: host,
            stake: stake,
        });
    }

    // Join an existing game room
    public entry fun join_game(
        coin_manager: &mut CoinManager,
        room_manager: &mut RoomManager,
        room_code: vector<u8>,
        ctx: &mut TxContext
    ) {
        let player2 = tx_context::sender(ctx);
        let room_code_str = string::utf8(room_code);
        
        // Check if room exists
        assert!(table::contains(&room_manager.rooms, room_code_str), EInvalidRoom);
        
        // Get room data
        let room = table::borrow_mut(&mut room_manager.rooms, room_code_str);
        
        // Check if room already has a second player
        assert!(option::is_none(&room.player2_address), ERoomAlreadyHasPlayer);
        
        // Check if room is active
        assert!(room.active, EInvalidRoom);
        
        // Deduct stake from player2's coin balance
        deduct_coins(coin_manager, player2, room.stake);
        
        // Add player2 to the room
        room.player2_address = option::some(player2);
        
        // Emit event
        event::emit(PlayerJoinedRoom {
            room_code: room_code_str,
            player: player2,
        });
    }

    // Record game result and distribute rewards
    public entry fun win_game(
        coin_manager: &mut CoinManager,
        room_manager: &mut RoomManager,
        room_code: vector<u8>,
        winner: address,
        ctx: &mut TxContext
    ) {
        let caller = tx_context::sender(ctx);
        let room_code_str = string::utf8(room_code);
        
        // Check if room exists
        assert!(table::contains(&room_manager.rooms, room_code_str), EInvalidRoom);
        
        // Get room data
        let room = table::borrow_mut(&mut room_manager.rooms, room_code_str);
        
        // Check if room is active
        assert!(room.active, EInvalidRoom);
        
        // Check if player2 has joined
        assert!(option::is_some(&room.player2_address), EPlayerNotInRoom);
        
        // Check if caller is either host or player2 (for security)
        assert!(caller == room.host_address || option::contains(&room.player2_address, &caller), EUnauthorizedPlayer);
        
        // Check if winner is either host or player2
        assert!(winner == room.host_address || option::contains(&room.player2_address, &winner), EUnauthorizedPlayer);
        
        // Calculate prize (double the stake)
        let prize = room.stake * 2;
        
        // Award prize to winner
        add_coins(coin_manager, winner, prize);
        
        // Mark room as inactive
        room.active = false;
        
        // Emit event
        event::emit(GameWon {
            room_code: room_code_str,
            winner: winner,
            prize: prize,
        });
    }

    // Get room details (view function)
    public fun get_room_details(
        room_manager: &RoomManager,
        room_code: vector<u8>
    ): (address, u64, Option<address>, bool) {
        let room_code_str = string::utf8(room_code);
        
        assert!(table::contains(&room_manager.rooms, room_code_str), EInvalidRoom);
        
        let room = table::borrow(&room_manager.rooms, room_code_str);
        
        (room.host_address, room.stake, *&room.player2_address, room.active)
    }

    // Cancel a room and refund stake (only host can do this, and only if no player2 yet)
    public entry fun cancel_room(
        coin_manager: &mut CoinManager,
        room_manager: &mut RoomManager,
        room_code: vector<u8>,
        ctx: &mut TxContext
    ) {
        let caller = tx_context::sender(ctx);
        let room_code_str = string::utf8(room_code);
        
        // Check if room exists
        assert!(table::contains(&room_manager.rooms, room_code_str), EInvalidRoom);
        
        // Get room data
        let room = table::borrow_mut(&mut room_manager.rooms, room_code_str);
        
        // Check if caller is the host
        assert!(caller == room.host_address, EUnauthorizedPlayer);
        
        // Check if no player2 has joined yet
        assert!(option::is_none(&room.player2_address), ERoomAlreadyHasPlayer);
        
        // Check if room is active
        assert!(room.active, EInvalidRoom);
        
        // Refund stake to host
        add_coins(coin_manager, caller, room.stake);
        
        // Mark room as inactive
        room.active = false;
    }
}



