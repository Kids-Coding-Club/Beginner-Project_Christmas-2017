

var deck = require('./deck.js');

// Here is the ordering of all of the poker hands (from highest to lowest):
/// 10. 5 of a kind (impossible without wilds)
/// 9. Straight flush (Royal flush being the highest straight flush)
/// 8. 4 of a kind
/// 7. Full house (1 three of a kind and 1 pair)
/// 6. Flush (all 5 cards of the same suit, e.g., all clubs)
/// 5. Straight (all 5 cards in a row, e.g., 7, 8, 9, 10, Jack)
/// 4. 3 of a kind
/// 3. 2 pair (1 pair and a different pair, e.g., 2 4's and 2 Queens)
/// 2. A pair
// 1. Singlet ("highest card")
// Within any particular hand, the order is decided by whichever cards are
// the highest.  E.g., if 2 players each have 3 of a kind, but one player has
// 3 Jacks while the other has 3 7's, the person with 3 Jacks wins.
// In the case of a full house, the 3 of a kind is measured first.  For
// example, 3 4's and 2 2's will beat 3 3's and a pair of aces.  This is
// because the 3 of a kinds are primarily compared, and 3 4's beats out
// 3 3's.

var find_value_matches = function(hand, match_count) {
  let value = hand[0].value; // In case match_count is 1.
  for (let i=0; i<(hand.length-1); i+=1) {
    let count = 1;
    let idxs = [i];
    for (let j=(i+1); j<hand.length; j+=1) {
      if (hand[i].value === hand[j].value) {
        count+=1;
        idxs.push(j);
        value = hand[i].value;
      }
      if (count >= match_count) {
        // The lines below filter out the matched values from the hand.
        for (let k=(idxs.length-1); k>-1; k-=1) {
          hand.splice(idxs[k], 1);
        }
        return {
          found: true,
          value: value
        }
      }
    }
  }
  return {
    found: false,
    value: null
  }
};

module.exports = {
  find_5_of_kind: function(hand, num_wilds=0) {
    const result = find_value_matches(hand, 5 - num_wilds);
    if (result.found) {
      return {
        found: true,
        value: result.value
      }
    }
    return {
      found: false,
      value: null
    }
  },
  find_4_of_kind: function(hand, num_wilds=0) {
    const result = find_value_matches(hand, 4 - num_wilds);
    if (result.found) {
      return {
        found: true,
        value: result.value
      }
    }
    return {
      found: false,
      value: null
    }
  },
  find_3_of_kind: function(hand, num_wilds=0) {
    const result = find_value_matches(hand, 3 - num_wilds);
    if (result.found) {
      return {
        found: true,
        value: result.value
      }
    }
    return {
      found: false,
      value: null
    }
  },
  find_pair: function(hand, num_wilds=0) {
    const result = find_value_matches(hand, 2 - num_wilds);
    if (result.found) {
      return {
        found: true,
        value: result.value
      }
    }
    return {
      found: false,
      value: null
    }
  },
  find_straight: function(hand, num_wilds=0) {
    // This function presumes the hand is already sorted
    // in descending order.
    let value = hand[0].value;
    let count_in_a_row = 1;
    let idxs = [0];
    // Flaw in this method, related to the wild cards.
    // Do you see it??
    for (let i=1; i<hand.length; i+=1) {
      if ((hand[(i-1)].value - hand[i].value) > 1) {
        count_in_a_row = 1;
        value = hand[i].value;
        idxs = [i];
      }
      if ((hand[(i-1)].value - hand[i].value) === 1) {
        count_in_a_row += 1;
        idxs.push(i);
      }
      if (count_in_a_row > 4 - num_wilds) {
        for (let j=(idxs.length-1); j>-1; j-=1) {
          hand.splice(idxs[j], 1);
        }
        return {
          found: true,
          value: value
        }
      }
    }
    return {
      found: false,
      value: null
    }
  },
  find_flush: function(hand, num_wilds=0) {
    // Since a straight flush needs to be considered, and a flush does not
    // involve values, all of the matching cards need to be returned instead
    // of just a value, so that a straight flush can be tested.
    const suits = Array.from(deck.suits)
    let cards = deck.deal(0);
    let count = 0;
    let result = {
      found: false,
      cards: null
    };
    for (let i=0; i<suits.length; i+=1) {
      for (let j=0; j<hand.length; j+=1) {
        if (hand[j].suit === suits[i]) {
          count += 1;
          cards.push(hand[j]);
        }
      }
      if (count > 4 - num_wilds) {
        cards.arrange();
        if ((result.cards === null)
          || (cards[0].value > result.cards[0].value))
        result = {
          found: true,
          cards: cards
        }
      }
      count = 0;
      cards = deck.deal(0);
    }
    return result;
  },
  find_2_pair: function(orig_hand, num_wilds=0) {
    let hand = orig_hand.map(card => card);
    let wilds_consumed = 0;
    let first_pair = this.find_pair(hand);
    while (!first_pair.found && wilds_consumed < num_wilds) {
      wilds_consumed += 1;
      first_pair = this.find_pair(hand, wilds_consumed);
    }
    if (!first_pair.found) {
      return {
        found: false,
        values: null
      }
    }
    num_wilds -= wilds_consumed;
    const second_pair = this.find_pair(hand, num_wilds);
    if (second_pair.found) {
      for (let i=(orig_hand.length-1); i>-1; i-=1) {
        if (orig_hand[i].value === first_pair.value ||
            orig_hand[i].value === second_pair.value) {
          orig_hand.splice(i, 1);
        }
      }
      return {
        found: true,
        values: [first_pair.value, second_pair.value]
      }
    }
    return {
      found: false,
      values: null
    }
  },
  find_full_house: function(orig_hand, num_wilds=0) {
    let hand = orig_hand.map(card => card);
    let wilds_consumed = 0;
    const trips = this.find_3_of_kind(hand);
    while (!trips.found && wilds_consumed < num_wilds) {
      wilds_consumed += 1;
      trips = this.find_3_of_kind(hand, wilds_consumed);
    }
    if (!trips.found) {
      return {
        found: false,
        values: null
      }
    }
    num_wilds -= wilds_consumed;
    const pair = this.find_pair(hand, num_wilds);
    if (pair.found) {
      for (let i=(orig_hand.length-1); i>-1; i-=1) {
        if (orig_hand[i].value === trips.value ||
            orig_hand[i].value === pair.value) {
          orig_hand.splice(i, 1);
        }
      }
      return {
        found: true,
        values: [trips.value, pair.value]
      }
    }
    return {
      found: false,
      values: null
    }
  },
  find_straight_flush: function(hand, num_wilds = 0) {
    let straight = {
      found: false
    };
    let rounds = 0;
    // The line below is needed for a "deep copy".
    let remaining_hand = hand.map(card => card);
    do {
      rounds += 1;
      let flush = this.find_flush(remaining_hand, num_wilds);
      if (!flush.found) {
        break;
      }
      let flush_cards = flush.cards.map(card => card.name);
      var flush_suit = flush.cards[0].suit
      straight = this.find_straight(flush.cards, num_wilds);
      for (let i=(remaining_hand.length-1); i > -1; i-=1) {
        if (flush_cards.indexOf(remaining_hand[i].name) > -1) {
          remaining_hand.splice(i, 1);
        }
      }
    } while (!straight.found && rounds < 10);
    if (straight.found) {
      for (let i=(hand.length-1); i > -1; i-=1) {
        if ((hand[i].suit === flush_suit) && (hand[i].value <= straight.value)
          && (hand[i].value > (straight.value - 5))) {
          hand.splice(i, 1);
        }
      }
      return {
        found: true,
        value: straight.value
      }
    }
    return {
        found: false,
        value: null
      }
  },
  generate_wilds: function(generic_wilds) {
    // This function allows you to pass wild card descriptions in "shorthand"
    // and generate the full card name.
    // E.g., if "generic_wilds" is [ 7, '6 of clubs' ], it will return
    // Set {
    //   '7 of clubs',
    //   '7 of diamonds',
    //   '7 of hearts',
    //   '7 of spades',
    //   '6 of clubs' }
    let full_array = [];
    generic_wilds.map(generic_wild => {
      if (typeof(generic_wild) === 'number') {
        deck.cards.forEach(card => {
          if (card.value === generic_wild) {
            full_array.push(card.name)
          }
        })
      } else if (typeof(generic_wild) === 'string') {
        deck.cards.forEach(card => {
          if (card.name === generic_wild) {
            full_array.push(card.name)
          }
        })
      }
    })
    return new Set(full_array);
  },
  find_wilds: function(hand, wild_cards=new Set()) {
    // This will find the number of wild cards in a given hand, and return
    // the number of wild cards AND THOSE CARDS ARE REMOVED FROM THE HAND!!!
    // This allows for the other functions to work properly with wild cards.
    // (If you think about it, wild cards have no value, per se.)
    // The full card object must be passed, which can be generated in the
    // "generate_wilds" function above.
    if (wild_cards.size < 1) {
      return 0; // This is the number of wild cards found in the hand.
    }
    let num_wilds = 0;
    for (let i=(hand.length-1); i>-1; i-=1) {
      if (wild_cards.has(hand[i].name)) {
        hand.splice(i, 1);
        num_wilds += 1;
      }
    }
    return num_wilds;
  },
  hand_score: function(hand, wild_cards=new Set()) {
    // Presumes that the set of wild cards has already been generated
    // through the generate_wilds function.
    const num_wilds = this.find_wilds(hand, wild_cards)
    hand.arrange();
// Here is the ordering of all of the poker hands (from highest to lowest):
/// 10. 5 of a kind (impossible without wilds)
/// 9. Straight flush (Royal flush being the highest straight flush)
/// 8. 4 of a kind
/// 7. Full house (1 three of a kind and 1 pair)
/// 6. Flush (all 5 cards of the same suit, e.g., all clubs)
/// 5. Straight (all 5 cards in a row, e.g., 7, 8, 9, 10, Jack)
/// 4. 3 of a kind
/// 3. 2 pair (1 pair and a different pair, e.g., 2 4's and 2 Queens)
/// 2. A pair
// 1. Singlet ("highest card")
    let best_hand = this.find_5_of_kind(hand, num_wilds)
    if (best_hand.found) {
      return {
        name: 'Five of a Kind',
        article: 'a ',
        rank: 10,
        value: best_hand.value,
        remaining: []
      }
    }
    best_hand = this.find_straight_flush(hand, num_wilds);
    if (best_hand.found) {
      return {
        name: 'Straight Flush',
        article: 'a ',
        rank: 9,
        value: best_hand.value,
        remaining: []
      }
    }
    best_hand = this.find_4_of_kind(hand, num_wilds);
    if (best_hand.found) {
      return {
        name: 'Four of a Kind',
        article: 'a ',
        rank: 8,
        value: best_hand.value,
        remaining: hand.map(card => card.value).splice(0,1)
      }
    }
    best_hand = this.find_full_house(hand, num_wilds);
    if (best_hand.found) {
      return {
        name: 'Full House',
        article: 'a ',
        rank: 7,
        values: best_hand.values,
        remaining: []
      }
    }
    best_hand = this.find_flush(hand, num_wilds);
    if (best_hand.found) {
      return {
        name: 'Flush',
        article: 'a ',
        rank: 6,
        cards: best_hand.cards,
        remaining: []
      }
    }
    best_hand = this.find_straight(hand, num_wilds);
    if (best_hand.found) {
      return {
        name: 'Straight',
        article: 'a ',
        rank: 5,
        value: best_hand.value,
        remaining: []
      }
    }
    best_hand = this.find_3_of_kind(hand, num_wilds);
    if (best_hand.found) {
      return {
        name: 'Three of a Kind',
        article: 'a ',
        rank: 4,
        value: best_hand.value,
        remaining: hand.map(card => card.value).splice(0,2)
      }
    }
    best_hand = this.find_2_pair(hand, num_wilds);
    if (best_hand.found) {
      return {
        name: 'Two Pair',
        article: '',
        rank: 3,
        values: best_hand.values,
        remaining: hand.map(card => card.value).splice(0,1)
      }
    }
    best_hand = this.find_pair(hand, num_wilds);
    if (best_hand.found) {
      return {
        name: 'Pair',
        article: 'a ',
        rank: 2,
        value: best_hand.value,
        remaining: hand.map(card => card.value).splice(0,3)
      }
    }
    const card_values = hand.map(card => card.value)
    return {
      name: 'high card',
      article: 'a ',
      rank: 1,
      value: card_values[0],
      remaining: card_values.slice(1,5)
    }
  },
  test_set1:
    [ { value: 13, suit: 'spades', name: 'King of spades' },
      { value: 12, suit: 'clubs', name: 'Queen of clubs' },
      { value: 11, suit: 'spades', name: 'Jack of spades' },
      { value: 11, suit: 'clubs', name: 'Jack of clubs' },
      { value: 10, suit: 'spades', name: '10 of spades' },
      { value: 10, suit: 'clubs', name: '10 of clubs' },
      { value: 9, suit: 'clubs', name: '9 of clubs' },
      { value: 8, suit: 'hearts', name: '8 of hearts' },
      { value: 8, suit: 'diamonds', name: '8 of diamonds' },
      { value: 8, suit: 'clubs', name: '8 of clubs' },
      { value: 6, suit: 'hearts', name: '6 of hearts' },
      { value: 6, suit: 'clubs', name: '6 of clubs' },
      { value: 5, suit: 'hearts', name: '5 of hearts' },
      { value: 4, suit: 'spades', name: '4 of spades' },
      { value: 4, suit: 'hearts', name: '4 of hearts' },
      { value: 4, suit: 'clubs', name: '4 of clubs' },
      { value: 3, suit: 'spades', name: '3 of spades' },
      { value: 3, suit: 'diamonds', name: '3 of diamonds' },
      { value: 3, suit: 'clubs', name: '3 of clubs' },
      { value: 2, suit: 'diamonds', name: '2 of diamonds' }
    ],
  test_set2:
  [ { value: 11, suit: 'spades', name: 'Jack of spades' },
    { value: 5, suit: 'clubs', name: '5 of clubs' },
    { value: 12, suit: 'clubs', name: 'Queen of clubs' },
    { value: 7, suit: 'clubs', name: '7 of clubs' },
    { value: 6, suit: 'spades', name: '6 of spades' },
    { value: 8, suit: 'diamonds', name: '8 of diamonds' },
    { value: 4, suit: 'hearts', name: '4 of hearts' }
  ],
  test_wilds: [7]
}
