module game::global_currency {
    use sui::coin::{Self, Coin, TreasuryCap};
    use sui::balance::{Self, Balance};



    use sui::sui::SUI;


    /// The gaming coin
    public struct GLOBAL_CURRENCY has drop {}

    /// Store for managing treasury and profits
    public struct CurrencyStore has key {
        id: UID,
        treasury: TreasuryCap<GLOBAL_CURRENCY>,
        profits: Balance<SUI>,
    }

    /// Initialize the module
    fun init(witness: GLOBAL_CURRENCY, ctx: &mut TxContext) {
        let (treasury_cap, coin_metadata) = coin::create_currency(
            witness,
            9, // Decimals (typical value, adjust as needed)
            b"GCOIN",
            b"Global Coin",
            b"Global currency for the game",
            option::none(),
            ctx,
        );

        transfer::share_object(CurrencyStore {
            id: object::new(ctx),
            treasury: treasury_cap,
            profits: balance::zero(),
        });

        transfer::public_freeze_object(coin_metadata);
    }

    /// Buy GCOIN by paying SUI
    public entry fun buy_currency(
        store: &mut CurrencyStore,
        amt: u64,
        recipient: address,
        ctx: &mut TxContext,
    ) {
        let payment_amount = coin::value(&payment);
        
        // Add the payment to profits
        coin::put(&mut store.profits, payment);
        
        // Mint new GCOIN for the buyer
        let minted_coin = coin::mint(&mut store.treasury, payment_amount, ctx);
        
        // Transfer the minted coin to the recipient
        transfer::public_transfer(minted_coin, recipient);
    }

    /// Burn GCOIN by sending it to a burn address
    public entry fun burn_currency(
        coin_to_burn: Coin<GLOBAL_CURRENCY>,
        _ctx: &mut TxContext,
    ) {
        // In SUI, the proper way to burn is to destroy the coin
        coin::destroy_zero(coin_to_burn);
    }

    /// Get the balance of GCOIN for a coin object
    public fun balance(coin: &Coin<GLOBAL_CURRENCY>): u64 {
        coin::value(coin)
    }
    
    /// Withdraw profits for the owner (you should add access control)
    public entry fun withdraw_profits(
        store: &mut CurrencyStore,
        amount: u64,
        recipient: address,
        ctx: &mut TxContext,
    ) {
        // In a real implementation, add access control here
        let coin_out = coin::take(&mut store.profits, amount, ctx);
        transfer::public_transfer(coin_out, recipient);
    }
}