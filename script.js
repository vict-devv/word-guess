"use strict";

// Game Initialization  --------------------------------------------------------------------------------------------------------------------
// Our database consist of the animals' names and their respective images, the images are numbered to avoid some users to inspect the HTML
// and easily find out which animal it is by looking at the background-image property...
const GAME_DATABASE = {
  snake: "1.jpg",
  buffalo: "2.jpg",
  crocodile: "3.jpg",
  eagle: "4.jpg",
  frog: "5.jpg",
  elephant: "6.jpg",
  monkey: "7.jpg",
  zebra: "8.jpg",
};

const CONSTANTS = {
  MAXIMUM_FAILED_ATTEMPTS: 3,
  ENTER_KEYCODE: 13,
  INPUT_REGEX: "[a-z]{1}",
  NOT_FOUND_INDEX: -1,
};

// random_word picks a random word from the given words array
const random_word = (words) => {
  const random_idx = Math.floor(Math.random() * words.length);
  return words[random_idx];
};

// init_word_parameters return an object containing the maxAttempts allowed and the set of the unique word's letters
const init_game_parameters = () => {
  const word = random_word(Object.keys(GAME_DATABASE));
  return {
    word: word,
    word_len: word.length,
    image: "./images/" + GAME_DATABASE[word],
    covers: $("#image-container").children("div"),
    correct_letters: new Set(word),
    max_failed_attempts: CONSTANTS.MAXIMUM_FAILED_ATTEMPTS,
    failed_attempts: 0,
    successful_attempts: 0,
    total_attempts: 0,
    is_ended: false,
  };
};

let previous_guesses = new Set([]);

// game is a global parameteres object containing useful information to make it to run properly.
let game = init_game_parameters();
// -----------------------------------------------------------------------------------------------------------------------------------------

// Helper Functions ------------------------------------------------------------------------------------------------------------------------
// is_invalid_input checks if the input has only one single letter (no numbers or special symbols are allowed)
const is_invalid_guess = (guess) => {
  return !guess.match(CONSTANTS.INPUT_REGEX);
};

// is_win_condition checks if the user has correctly guessed all the word's letters (correct_letters)
const is_win_condition = () => {
  return game.successful_attempts == game.correct_letters.size;
};

// is_loss_condition checks if the user has made more failed guessed than allowed
const is_loss_condition = () => {
  return game.failed_attempts >= game.max_failed_attempts;
};

// reset_input_guess clears the input-guess element's value and trigger the focus status on it
const reset_input_guess = () => {
  $("#input-guess").val("").focus();
};

// remove_win_loss_titles clears the h2 win/loss titles from the DOM
const remove_win_loss_titles = () => {
  $("#win-title").remove();
  $("#loss-title").remove();
};
// -----------------------------------------------------------------------------------------------------------------------------------------

// Core Functions --------------------------------------------------------------------------------------------------------------------------
// updateSummaryContent relys on the three spans inside the 'Summary' div container to update the game's information back to the user
const update_summary_content = () => {
  $($("#summary-container span")[0]).text(
    `[ ${Array.from(previous_guesses)} ]`
  );
  $($("#summary-container span")[1]).text(game.failed_attempts);
  $($("#summary-container span")[2]).text(game.total_attempts);
  $($("#summary-container span")[3]).text(game.max_failed_attempts);
};

// populate_word_container creates divs for each letter providing its index as an ID parameter
const populate_word_container = () => {
  Array.from(game.word).forEach((_, idx) => {
    $("#word-container").append(`<div id='div-${idx}' class='letter'></div>`);
  });
};

// init_image_container inset the animal's image as a background
const init_image_container = () => {
  $("#image-container").css("background-image", `url(${game.image})`);
};

// reset_word_container recreates the letters div inside the 'word-container' section
const reset_word_container = () => {
  for (const div of $("#word-container").contents("div")) {
    div.remove();
  }
  populate_word_container();
};

// reset_image_container updates the image and covers it completly
const reset_image_container = () => {
  for (const cover of game.covers) {
    $(cover).addClass("cover");
  }
  init_image_container();
};

// show_letter_on_index will exhibit the letter at the right position based on the previously created div spaces
const show_letter_on_index = (letter, idx) => {
  $(`#div-${idx}`).text(letter);
};

// update_previous_guessed_set adds the guessed letter into the previous prompted guesses set
const update_previous_guessed_set = (guess) => {
  previous_guesses.add(guess);
};

//reveal_image_block randomly removes one of the cover divs to show part of the image
const reveal_image_block = () => {
  // this is our base condition for the recursive function... we want to avoid showing the whole picture in cases of many mixed attempts
  if (game.total_attempts >= game.word_len) {
    return;
  }

  const random_idx = Math.floor(Math.random() * game.covers.length);
  const cover = $(game.covers[random_idx]);

  // this is to avoid the cases when random_idx is already a revelead spot
  if (!cover.hasClass("cover")) {
    reveal_image_block();
    return;
  }

  cover.removeClass("cover");
  game.covers.splice(random_idx, 1);
};

// update_rendering_and_game_params peruses the game's word to render the guessed letter when necessary and updates the game counters
const update_rendering_and_game_params = (guess) => {
  let is_success_guess = false;
  // traverse the letters to show the multiple occurences or show anything in case the guess is not found inside the word
  for (const i in game.word) {
    const idxOf = game.word.indexOf(guess, i);

    if (idxOf == CONSTANTS.NOT_FOUND_INDEX && i == 0) {
      game.failed_attempts++;
      break;
    }

    is_success_guess = true;
    show_letter_on_index(guess, idxOf);
  }

  if (is_success_guess) {
    game.successful_attempts++;
  }

  game.total_attempts++;
};

// process_guess checks if the chosen word contains the guessed letter (input) or not
const process_guess = (guess) => {
  // if the current guess was already prompted before, we do not proceed
  if (previous_guesses.has(guess)) {
    return;
  }

  update_rendering_and_game_params(guess);
  update_previous_guessed_set(guess);
  reveal_image_block();
  update_summary_content();
};

// reveal_full_pictures removes all the cover
const reveal_full_pictures = () => {
  for (const cover of game.covers) {
    $(cover).removeClass("cover");
  }
};

// process_win_condition handles the necessary logic to show that the user has won the game
const process_win_condition = () => {
  if (!$("#win-title").length) {
    $("#summary-container").append("<h2 id='win-title'>You Won!!</h2>");
  }
  reveal_full_pictures();
  game.is_ended = true;
};

// process_loss_condition handle the necessary logic to show that the user has lost the game
const process_loss_condition = () => {
  if (!$("#loss-title").length) {
    $("#summary-container").append("<h2 id='loss-title'>You Lose =/</h2>");
  }
  reveal_full_pictures();
  game.is_ended = true;
};
// -----------------------------------------------------------------------------------------------------------------------------------------

// Handler Functions -----------------------------------------------------------------------------------------------------------------------
// toggle_instructions_handler toggles the Instructions's section to collapse or show the content
const toggle_instructions_handler = () => {
  const instructions_content = $("#instructions-content");
  const plus = $("#plus");
  const minus = $("#minus");

  if (plus.is(":visible")) {
    plus.hide();
    // .show() forces the minusSvg to be displayed as a block, we need to explicitly say it's a inline-block in this case...
    minus.attr("style", "display: inline-block");
    instructions_content.show();
  } else {
    plus.show();
    minus.hide();
    instructions_content.hide();
  }
};

// submit_handler validates the guessed letter, processes it, and then proceeds to the win or loss conditions
const submit_handler = (evt) => {
  evt.preventDefault();

  // if the game is over we stop here and wait for the user to reset
  if (game.is_ended) {
    return;
  }

  const guess = $("#input-guess").val().toLowerCase();
  // never rely on the HTML input's validation attributes only...
  if (is_invalid_guess(guess)) {
    reset_input_guess();
    return;
  }

  process_guess(guess);

  if (is_win_condition()) {
    process_win_condition();
  }

  if (is_loss_condition()) {
    process_loss_condition();
  }

  reset_input_guess();
};

// enter_keypress_handler checks if the 'Enter' key was pressed to invoke the submit_handler function
const enter_keypress_handler = (evt) => {
  if (
    evt.type == "keypress" &&
    evt.originalEvent.keyCode == CONSTANTS.ENTER_KEYCODE
  ) {
    submit_handler(evt);
  }
};

// reset_handler properly resets the game
const reset_handler = (evt) => {
  evt.preventDefault();
  // clear related DOM elements
  reset_input_guess();
  remove_win_loss_titles();
  // reset game parameters
  game = init_game_parameters();
  previous_guesses = new Set([]);
  // reset related DOM content
  update_summary_content();
  reset_word_container();
  reset_image_container();
};

// -----------------------------------------------------------------------------------------------------------------------------------------

// Main Document Ready Function ------------------------------------------------------------------------------------------------------------
$(document).ready(() => {
  $("#instructions-header").click(toggle_instructions_handler);
  $("#input-guess").on("keypress", enter_keypress_handler);
  $("#submit-button").click(submit_handler);
  $("#reset-button").click(reset_handler);

  populate_word_container();
  init_image_container();
  update_summary_content();
});
// -----------------------------------------------------------------------------------------------------------------------------------------
