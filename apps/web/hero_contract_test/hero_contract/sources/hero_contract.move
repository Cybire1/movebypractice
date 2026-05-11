module move_by_practice::hero_contract {
    use sui::object::{Self, UID, ID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use sui::event;

    // Error codes
    const E_NOT_ENOUGH_XP: u64 = 0;

    // Hero NFT with trainable stats
    struct Hero has key, store {
        id: UID,
        power: u64,
        xp: u64,
    }

    // Events
    struct HeroCreated has copy, drop {
        hero_id: ID,
        owner: address,
    }

    public entry fun create_hero(ctx: &mut TxContext) {
        let hero = Hero {
            id: object::new(ctx),
            power: 100,
            xp: 0,
        };

        event::emit(HeroCreated {
            hero_id: object::uid_to_inner(&hero.id),
            owner: tx_context::sender(ctx),
        });

        transfer::transfer(hero, tx_context::sender(ctx));
    }

    public entry fun train_hero(hero: &mut Hero) {
        hero.xp = hero.xp + 10;
        if (hero.xp >= 100) {
            hero.power = hero.power + 10;
            hero.xp = 0;
        }
    }
}
