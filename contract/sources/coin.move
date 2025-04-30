module contract::CGSCOIN {

    use sui::coin::{Self, Coin, TreasuryCap};
    

    public struct CGSCOIN has drop {}

    fun init(witness: CGSCOIN, ctx: &mut TxContext) {
        let (treasury_cap, metadata)
            = coin::create_currency<CGSCOIN>(
            witness,
            2, // decimals
            b"CGS", // symbol
            b"CGS_COIN", // name
            b"A Global currency for CGS Metaverse", // description
            option::none(),
            ctx
        );
        transfer::public_freeze_object(metadata);
        transfer::public_transfer(treasury_cap)
    }

    public entry fun mint(
        treasury_cap: &mut TreasuryCap<CGSCOIN>, amount:u64, recipient: address, ctx: &mut TxContext
    ) {
        coin::mint_and_transfer(treasury_cap, amount, recipient, ctx)
    }

    public entry fun burn(treasury_cap: &mut TreasuryCap<CGSCOIN>, coin: Coin<CGSCOIN>) {
        coin::burn(treasury_cap, coin);
    }


   
}