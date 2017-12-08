

// CREATE ALL CARDS
// First we'll create all of the cards, providing the suits,
// values, and then mapping all the combinations.
const suits = ['Clubs', 'Diamonds', 'Hearts', 'Spades'];

// Note that the line below captures the values from 2 - A, where J, Q, K,
// and A are 11 - 14.  This way is a bit craftier, but you could just simply
// do: const values = [ 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14 ]
const raw_values =  Array.from(Array(13).keys(), x => x + 2);
// And the lines below will give us names to the numbers, associating 13
// 'King', 7 with '7', etc.
const values = raw_values.map(function(x) {
  switch(x) {
    case 11:
      return {value: x, name: 'Jack'};
      break;
    case 12:
      return {value: x, name: 'Queen'};
      break;
    case 13:
      return {value: x, name: 'King'};
      break;
    case 14:
      return {value: x, name: 'Ace'};
      break;
    default:
      return {value: x, name: x.toString()};
  }
});

// Finally creating cards with both the value and the suit
var cards = function () {
  var card_array = Array.prototype.concat.apply([], values.map(function(x) {
    return suits.map(function(y) {
      return {
        value: x.value,
        suit: y,
        name: x.name + ' of ' + y
      };
    });
  }));
  card_array.arrange = function(ascending=false) {
    if (ascending) {
      this.sort(function(card1, card2) {
        if (card1.value !== card2.value) {
          return card1.value - card2.value;
        }
        return card1.suit.charCodeAt(0) - card2.suit.charCodeAt(0);
      });
    } else {
      this.sort(function(card1, card2) {
        if (card1.value !== card2.value) {
          return card2.value - card1.value;
        }
        return card2.suit.charCodeAt(0) - card1.suit.charCodeAt(0);
      });
    }
    return this;
  }
  return card_array;
};

module.exports = {
  suits: new Set(suits),
  values: new Set(values),
  cards: new Set(cards()),  
  deck: cards(),
  shuffled: false,
  // NEXT CREATE A FUNCTION TO SHUFFLE THE CARDS
  shuffle: function() {
    let i, j, tmp1, tmp2;
    for (i=0; i<this.deck.length; i+=1) {
      j = Math.floor(Math.random() * (i + 1));
      tmp1 = this.deck[i];
      tmp2 = this.deck[j];
      this.deck[i] = tmp2;
      this.deck[j] = tmp1;
    }
    return this.deck
  },
  deal: function(num) {
    if (num > this.deck.length || !this.shuffled) {
      console.log('    Shuffling...');
      this.shuffled = true;
      this.deck = cards();
      this.shuffle();
    }
    let delt = this.deck.splice(0, num);
    delt.arrange = this.deck.arrange;
    // This next check is just in case exactly 0 cards are left.  In that case, the
    // deck is now empty and will have a different structure.
    if (this.deck.length === 0) {
      console.log('    Shuffling...');
      this.shuffled = true;
      this.deck = cards();
      this.shuffle();
    }
    return delt;
  }
}
