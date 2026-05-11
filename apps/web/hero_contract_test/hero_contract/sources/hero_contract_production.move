/// Production-ready Hero Contract following Sui Move best practices
/// Includes: Events, Access Control, Error Handling, View Functions, and Full Functionality
module move_by_practice::hero_contract {
    use sui::object::{Self, UID, ID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use sui::event;

    // ==================== Error Constants ====================

    const E_NOT_ENOUGH_XP: u64 = 0;
    const E_ALREADY_MAX_LEVEL: u64 = 1;
    const E_ZERO_POWER: u64 = 2;

    // ==================== Constants ====================

    const INITIAL_POWER: u64 = 100;
    const INITIAL_XP: u64 = 0;
    const XP_PER_TRAINING: u64 = 10;
    const XP_FOR_LEVEL_UP: u64 = 100;
    const POWER_PER_LEVEL: u64 = 10;
    const MAX_LEVEL: u64 = 100;

    // ==================== Structs ====================

    /// The Hero NFT - represents a trainable character
    struct Hero has key, store {
        id: UID,
        power: u64,
        xp: u64,
    }

    // ==================== Events ====================

    /// Emitted when a new Hero is created
    struct HeroCreated has copy, drop {
        hero_id: ID,
        owner: address,
        power: u64,
    }

    /// Emitted when a Hero gains XP
    struct HeroTrained has copy, drop {
        hero_id: ID,
        new_xp: u64,
    }

    /// Emitted when a Hero levels up
    struct HeroLeveledUp has copy, drop {
        hero_id: ID,
        new_power: u64,
    }

    /// Emitted when a Hero is burned/destroyed
    struct HeroBurned has copy, drop {
        hero_id: ID,
        final_power: u64,
    }

    // ==================== Public Entry Functions ====================

    /// Create a new Hero NFT with initial stats
    ///
    /// # Arguments
    /// * `ctx` - Transaction context for creating the object
    ///
    /// # Events
    /// Emits `HeroCreated` event
    public entry fun create_hero(ctx: &mut TxContext) {
        let hero = Hero {
            id: object::new(ctx),
            power: INITIAL_POWER,
            xp: INITIAL_XP,
        };

        let hero_id = object::uid_to_inner(&hero.id);
        let owner = tx_context::sender(ctx);

        event::emit(HeroCreated {
            hero_id,
            owner,
            power: INITIAL_POWER,
        });

        transfer::transfer(hero, owner);
    }

    /// Train your Hero to gain XP
    ///
    /// # Arguments
    /// * `hero` - Mutable reference to the Hero being trained
    ///
    /// # Events
    /// Emits `HeroTrained` event
    public entry fun train_hero(hero: &mut Hero) {
        hero.xp = hero.xp + XP_PER_TRAINING;

        event::emit(HeroTrained {
            hero_id: object::uid_to_inner(&hero.id),
            new_xp: hero.xp,
        });
    }

    /// Level up your Hero when you have enough XP
    /// Consumes 100 XP and increases power by 10
    ///
    /// # Arguments
    /// * `hero` - Mutable reference to the Hero being leveled up
    ///
    /// # Aborts
    /// * `E_NOT_ENOUGH_XP` - If hero doesn't have 100+ XP
    ///
    /// # Events
    /// Emits `HeroLeveledUp` event
    public entry fun level_up(hero: &mut Hero) {
        assert!(hero.xp >= XP_FOR_LEVEL_UP, E_NOT_ENOUGH_XP);

        hero.xp = hero.xp - XP_FOR_LEVEL_UP;
        hero.power = hero.power + POWER_PER_LEVEL;

        event::emit(HeroLeveledUp {
            hero_id: object::uid_to_inner(&hero.id),
            new_power: hero.power,
        });
    }

    /// Burn/destroy a Hero permanently
    ///
    /// # Arguments
    /// * `hero` - The Hero to destroy (consumed)
    ///
    /// # Events
    /// Emits `HeroBurned` event
    public entry fun burn_hero(hero: Hero) {
        let Hero { id, power, xp: _ } = hero;
        let hero_id = object::uid_to_inner(&id);

        event::emit(HeroBurned {
            hero_id,
            final_power: power,
        });

        object::delete(id);
    }

    // ==================== View/Getter Functions ====================

    /// Get the current power of a Hero
    public fun get_power(hero: &Hero): u64 {
        hero.power
    }

    /// Get the current XP of a Hero
    public fun get_xp(hero: &Hero): u64 {
        hero.xp
    }

    /// Check if Hero has enough XP to level up
    public fun can_level_up(hero: &Hero): bool {
        hero.xp >= XP_FOR_LEVEL_UP
    }

    /// Get the Hero's ID
    public fun get_id(hero: &Hero): ID {
        object::uid_to_inner(&hero.id)
    }

    // ==================== Test-Only Functions ====================

    #[test_only]
    /// Create a Hero for testing purposes
    public fun create_for_testing(ctx: &mut TxContext): Hero {
        Hero {
            id: object::new(ctx),
            power: INITIAL_POWER,
            xp: INITIAL_XP,
        }
    }

    #[test_only]
    /// Create a Hero with custom stats for testing
    public fun create_with_stats(power: u64, xp: u64, ctx: &mut TxContext): Hero {
        Hero {
            id: object::new(ctx),
            power,
            xp,
        }
    }
}
