//#! /usr/bin/env node

// These *requires* below allow us to bring in other MODULES!
// 'readline-sync' is an asynchronous version of 'readline',
// it let's us be able to get input from the user.
// You need to run the following command (after installing npm):
// `npm install readline-sync`; that will install it for you.
// 'deck.js' and 'rules.js' are local modules I created.
// 'deck' allows us to easily deal cards, shuffle a deck, etc.
// 'rules' captures all the means of incorporating wild cards,
// finding straights, pairs, etc., and scoring how good a hand is.
const deck = require('./deck.js');
const rules = require('./rules.js');
const readline = require('readline-sync');
let quit = false;

const poker_styles = ['5-card stud', '7-card stud'];
let poker_style = {};

do {
  let num_players = readline.question("Let's play some poker! " +
    "How many players do we have? ");
  console.log("OK, cool!  We've got " + num_players + " players.");

  // console.log("\nFor now, we only have stud poker. ");
  // let hand_size = readline.question("How many cards in a hand? " +
  //   "(E.g., '5' for 5 card stud. '7' is default.) ", {
  //     defaultInput: '7'
  //   });
  console.log("\nFor now, we only have stud poker. ");
  let poker_idx = readline.keyInSelect(poker_styles, "What type of poker?");
  console.log("Alright, we're playing " + poker_styles[poker_idx] + '.');
  switch (poker_idx) {
    case 0: // 5 card stud
      poker_style = {
        name: poker_styles[0],
        hand_size: 5,
        ante: true,
        bet_rounds: [1,2,3,4],
        hidden_rounds: [0],
        initial_rounds: [0,1],
        draw_rounds: [], // for draw poker
        num_draw_cards: [] // for draw poker
      };
      break;
    case 1: // 7 card stud
      poker_style = {
        name: poker_styles[1],
        hand_size: 7,
        ante: true,
        bet_rounds: [2,3,4,5,6],
        hidden_rounds: [0,1,6],
        initial_rounds: [0,1,2],
        draw_rounds: [], // for draw poker
        num_draw_cards: [] // for draw poker
      };
    }
  }

  let player_names = [];
  let players = [];
  for (let i=0; i<num_players; i+=1) {
    let temp_name;
    let name_found;
    do {
      temp_name = readline.question("Player " + (i+1) +
        ": What is your name? ");
      name_found = player_names.indexOf(temp_name) > -1;
      if (name_found) {
        console.log("We're trying to keep all the names unique. " +
          "Please enter a distinct name. Thanks!")
      }
    } while (name_found);
    player_names.push(temp_name);
    players.push({
      name: temp_name,
      hand: deck.deal(hand_size)
    })
  }


  console.log(player_names);
  quit = !quit;
} while (!quit);

//       process.stdout.write('\x1Bc');



// const cli = readline.createInterface({
//   input: process.stdin,
//   output: process.stdout,
//   prompt: 'Poker Game> '
// });

// let find_num_players = function (num_players) {
//   console.log("OK, we'll play with " + num_players + " players!");
//   cli.question("What are each of the players names?")
// }

// cli.question("Let's play some poker!  How many players do we have?  ",
// find_num_players);


// cli.on('line', (line) => {
//   switch (line.trim()) {
//     case 'hello':
//       console.log('world!');
//       break;
//     case 'exit':
//       process.stdout.write('\x1Bc');
//       cli.close();
//     default:
//       console.log(`Say what? I might have heard '${line.trim()}'`);
//       break;
//   }
//   cli.prompt();
// }).on('close', () => {
//   console.log('Have a great day!');
//   process.exit(0);
// });




