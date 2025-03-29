module game::gaming_token {
    use sui::balance::{Balance};
    use sui::coin::{Coin, TreasuryCap};
    use sui::tx_context::TxContext;
    use std::string::String;
    use sui::transfer;
    use sui::object;

    /// Custom error codes
    const E_INSUFFICIENT_FUNDS: u64 = 1;
    const E_GAME_NOT_FOUND: u64 = 2;
    const E_GAME_ALREADY_JOINED: u64 = 3;

    /// Gaming Token Struct
    public struct GamingToken has key, store {
        id: UID,
        treasury: TreasuryCap<GAME_TOKEN>,
    }

    /// The gaming token
    public struct GAME_TOKEN has drop {}

    /// Game struct
    public struct Game has key, store {
        id: UID,
        player1: address,
        player2: Option<address>,
        stake: u64,
    }

    /// Global games map
    struct Games has key, store {
        entries: Table<String, Game>,
    }

    /// Initialize the token
    public fun init(ctx: &mut TxContext): GamingToken {
        let (treasury, _) = coin::create_currency(
            GAME_TOKEN {},
            0,
            b"GAM",
            b"Gaming Token",
            b"A token for gaming",
            None,
            ctx,
        );

        GamingToken { id: object::new(ctx), treasury }
    }

    /// Mint new gaming tokens
    public fun mint(admin: &GamingToken, amount: u64, ctx: &mut TxContext): Coin<GAME_TOKEN> {
        coin::mint(&admin.treasury, amount, ctx)
    }

    /// Burn gaming tokens
    public fun burn(coin: Coin<GAME_TOKEN>, ctx: &mut TxContext) {
        coin::burn(coin, ctx)
    }

    /// Create a new game lobby
    public fun host_a_game(
        games: &mut Games,
        lobby_code: String,
        player1: address,
        stake: u64,
        stake_coin: Coin<GAME_TOKEN>,
        ctx: &mut TxContext
    ) {
        assert!(coin::value(&stake_coin) >= stake, E_INSUFFICIENT_FUNDS);
        coin::burn(stake_coin, ctx);
        let game = Game { id: object::new(ctx), player1, player2: None, stake };
        table::insert(&mut games.entries, lobby_code, game);
    }

    /// Join an existing game lobby
    public fun join_a_game(
        games: &mut Games,
        lobby_code: String,
        player2: address,
        stake_coin: Coin<GAME_TOKEN>,
        ctx: &mut TxContext
    ) {
        let game = table::borrow_mut(&mut games.entries, &lobby_code);
        assert!(game.is_some(), E_GAME_NOT_FOUND);
        let g = game.unwrap();
        assert!(g.player2.is_none(), E_GAME_ALREADY_JOINED);
        assert!(coin::value(&stake_coin) >= g.stake, E_INSUFFICIENT_FUNDS);
        g.player2 = Some(player2);
        coin::burn(stake_coin, ctx);
    }

    /// Claim reward and delete game entry
    public fun claim_reward(
        games: &mut Games,
        lobby_code: String,
        winner_index: u8,
        admin: &GamingToken,
        ctx: &mut TxContext
    ) -> Coin<GAME_TOKEN> {
        let game = table::borrow_mut(&mut games.entries, &lobby_code);
        assert!(game.is_some(), E_GAME_NOT_FOUND);
        let g = game.unwrap();
        let winner = if winner_index == 1 { g.player1 } else { g.player2.unwrap() };
        let reward = coin::mint(&admin.treasury, 2 * g.stake, ctx);
        table::remove(&mut games.entries, &lobby_code);
        transfer::transfer(reward, winner)
    }

    /// Delete a specific game
    public fun delete_game(games: &mut Games, lobby_code: String) {
        table::remove(&mut games.entries, &lobby_code);
    }

    /// Delete all games
    public fun delete_all_games(games: &mut Games) {
        games.entries.clear();
    }
}
