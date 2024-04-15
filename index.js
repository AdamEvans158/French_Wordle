import JSONData from "../index.json" with { type: "json" }; // Import all the french words with at most 5 characters.

const words = JSONData.words;
let currentWord = words[Math.floor(Math.random() * words.length)].toUpperCase();

// Help/instructions menu elements
const startPlayingBtn = document.getElementById("startPlayingButton");
const blanket = document.getElementById("blanket");
const instructionsContainer = document.getElementById("instructionsContainer");

// Keyboard Elements
const allKeys = document.querySelectorAll("[data-key]");
const backspaceKey = document.getElementById("backspaceKey");
const enterKey = document.getElementById("enterKey");

// row and column numbers to contral the board flow
let rowIndex = 0;
let columnIndex = 0;
let guess = "";

// Variables about the games current state
let currentRowElement, currentRow, currentTile, currentLetter;
loadRow();

console.log(currentWord);

// EVENT LISTENERS // 
startPlayingBtn.addEventListener("click", () => {
    blanket.style.display = "none";
    instructionsContainer.style.display = "none";
    instructionsContainer.style.animation = ""; 
});

allKeys.forEach(key => {
    key.addEventListener("click", (e) =>{
        e.stopPropagation(); // Prevent clicking a child from triggering a click to the parent.
        const letter = e.target.innerText[0].toUpperCase(); // Get only the 0th index beause in situations with accents, the innerText has all the characters.
        
        addLetterToTile(letter);
    })
})

backspaceKey.addEventListener("click", () => {
    deleteLetter();
});

enterKey.addEventListener("click", () => {
    updateOnEnter();
});

window.addEventListener("keyup", e => {
    let key = e.key.toLowerCase();

    switch(key){
        case  "backspace":
            deleteLetter();
            break;

        case "enter":
            updateOnEnter();
            break;

        case "capslock":
        case "control":
        case " ":
            return;

        case "shift":
            toggleHelpMenu();
            return;

        default:
            addLetterToTile(key.toUpperCase());
    }

    const keyElement = document.getElementById(key + "Key");
    keyElement.style.animation = "key-pressed 200ms linear forwards"
    setTimeout(function(){
        keyElement.style.animation = "";
    }, 200)
})

// FUNCTIONS //
function deleteLetter(){
    let lastTile;
    
    // Do not decrease the index below zero
    if(columnIndex - 1 >= 0){
        columnIndex--;
    }

    lastTile = currentRow[columnIndex];
    
    let lastLetter = lastTile.children[0];
    lastLetter.innerText = "";
    guess = guess.substring(0,guess.length-1);

    currentLetter = lastLetter;
}

function updateOnEnter(){

    // Check to make sure their guess is a full 5-letter word. If not, play the error animation and stop.
    if(guess.length !== 5){
        currentRowElement.style.animation = "row-shake 100ms linear alternate-reverse 2"

        setTimeout(() => { // Must clear animation so it can be used again
            currentRowElement.style.animation = "";
        },100);

        return;
    }

    // Verify and animate each tile in the word. 
    const time = 300; // Time per tile flip
    for(let i = 0; i < currentRow.length; i++){
        const tile = currentRow[i];
        const backOfTile = tile.children[1];
        const numberElement = backOfTile.children[0].children[0]; // div.cell --> div.cell-back --> div.number-container --> p.number

        verifyWord(backOfTile, i);
        numberElement.innerText = countOccurrencesInWord(guess[i]);

        tile.style.animation = `flip-tile ${time}ms linear forwards`;
        tile.style.animationDelay = `${time * i}ms`;

        setTimeout(function() {
            backOfTile.style.display = "flex";
            backOfTile.appendChild(document.createTextNode(guess[i]));
        }, time * i + time/2)
    }

    // Check to see if the guess is the correct word only after the animation has fully finished
    setTimeout(function() {

        if(guess == currentWord){
            loadWinScreen();
            return;
        }

        // Check to see if they already at the last row, if not load the next row. 
        // if the top conditional evaluates to false --> the user is in the last row.
        // If this code executs --> they did not guess correctly. So if they are in the last row and did not guess correctly then load the play again screen.
        if(rowIndex + 1 !== 6){  
            rowIndex += 1;
            loadRow();
        } else{
            loadPlayAgainScreen();
        }
        
    },time * 5 + time/2) // time * 5 + time/2 is the total time the animation for 5 of the tiles will take. Only after that ends should we move to the next line.
}

function verifyWord(tile, index){
    let bgColor;
    if(guess[index] === currentWord[index]){
        bgColor = "#8ee418";
    } else if(currentWord.includes(guess[index])){
        bgColor = "#f6287d";
    } 
    // Chop off the accents to see if they match now, if so, then I know that the letter was right but the accent was wrong.
    else if(currentWord.normalize('NFD').replace(/[\u0300-\u036f]/g, '').
            includes(guess[index].normalize('NFD').replace(/[\u0300-\u036f]/g, ''))){
        bgColor = "#1837e4";
    } 
    else {
        bgColor = "#b915cc";
    }

    tile.style.backgroundColor = bgColor;
    tile.style.boxShadow = `${bgColor} 0px 0px 15px`;
}

function countOccurrencesInWord(letter){
    const currentWordNoAccents = currentWord.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const letterNoAccents = letter.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    let count = 0;
    for(let i = 0; i < currentWordNoAccents.length; i++){
        if(currentWordNoAccents[i] === letterNoAccents){
            count++;
        }
    }

    return count;
}

function addLetterToTile(letter){

    // This conditional evaluates to true at the last tile of the row.
    // You cannot add any more letters so play the error animation and stop executing the function
    if(currentLetter.innerText !== "") {
        currentRowElement.style.animation = "row-shake 100ms linear alternate-reverse 2"
        
        // Reset animation so it can be plated again.
        setTimeout(() => {
            currentRowElement.style.animation = "";
        },100);
        
        return; // Exit as to not attempt cells that don't exist
    };
    
    currentLetter.innerText = letter;
    guess += letter;

    // Calculate the position of the next tile if there is a next tile.
    columnIndex++;
    if(columnIndex <= 4){
        currentTile = currentRow[columnIndex];
        currentLetter = currentTile.children[0];
    }

}

function loadWinScreen(){

}

function loadPlayAgainScreen(){

}

function toggleHelpMenu(){
    // Get the current display of the menu and then toggle it based on that value.
    const menuVisibility = window.getComputedStyle(instructionsContainer).getPropertyValue("display");
    if(menuVisibility === "none"){
        instructionsContainer.style.display = "flex";
        blanket.style.display = "block";
    } else {
        blanket.style.display = "none";
        instructionsContainer.style.display = "none";
    }
}

function loadRow(){
    columnIndex = 0;
    guess = "";
    currentRowElement = document.getElementById(`gameRow${rowIndex + 1}`);
    currentRow  = document.getElementsByClassName(`cell-in-row${rowIndex + 1}`);
    currentTile = currentRow[columnIndex];
    currentLetter = currentTile.children[0];
}