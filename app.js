//Variable Assignments:

// -- menu elements
const menuToggle = document.querySelector("#menu-btn");
const menuContainer = document.querySelector("#menu-container");
let soundOn = false;
const rollSound = new Audio("sounds/dice-sound.mp3");

//-- game constants
const bigStraight = [[1,2,3,4,5], [2,3,4,5,6]];
const littleStraight = [[1,2,3,4], [2,3,4,5], [3,4,5,6],[0,0,0,0]];
const diceIconName = ["X","one","two","three","four","five","six"]


// -- display elements
const root = document.documentElement; //to change display to the color scheme of current player
const backDisplay = document.querySelectorAll(".back-display");
const playerColor = ["yellow","green","pink","purple"];

// -- player elements
const playerNumElement = document.querySelector("#num-of-players");
const playerNumOptions =  document.querySelectorAll("#num-of-players button");
let playerArray = [];
let numOfPlayers = null; //up to 4 players, will be defined by user

// -- game elements that change/react to each player's interaction
const diceIcons = document.querySelectorAll(".dice-icon");
const diceCards = document.querySelectorAll(".dice-card");
const diceCardBtns = document.querySelectorAll(".dice-container");
const rollCountElement = document.querySelector("#roll-counter");
const interactBtn = document.querySelector(".interact-btn");
const interactBorderElement = document.querySelector(".circle-container");
const totalScoreElement = document.querySelectorAll(".total-score");

// -- game elements for game operation
// ---- udpates per roll
let diceFreq = Array(6).fill(0);
let lockedIndices = Array(5).fill(false); 
let diceResults = [];  
let rollCount = 1; // roll 1,2,3

//---- updates per player turn
let playerNum = 1; //up to numOfPlayers
let currentPlayer = null; //active player object
let turnStarted = false; //turns true after player makes first roll per turn

//---- updates per round
let roundNum = 1; //up to 13
let gameEnded = false; //turns true after 13 rounds



// == Intro Sequence ==

setTimeout(() => {
   document.querySelector(".top-container").classList.add("intro-start");
    setTimeout(() => {
        root.style.setProperty("--player-color",`var(--neon-${playerColor[0]})`);
        setTimeout(() => {
            root.style.setProperty("--player-color",`var(--neon-${playerColor[1]})`);
            setTimeout(() => {
                root.style.setProperty("--player-color",`var(--neon-${playerColor[2]})`);
                setTimeout(() => {
                    root.style.setProperty("--player-color",`var(--neon-${playerColor[3]})`);

                    setTimeout(() => {
                        document.querySelector("#title-sequence").classList.add("exit");
                        root.style.setProperty("--player-color",`var(--neon-${playerColor[0]})`);
                        playerNumElement.classList.add("enter");
                        menuContainer.classList.remove("no-display");
                    }, 1000);
                }, 500);
            }, 500);
        }, 500);   
    }, 500);
}, 1000);

playerNumOptions.forEach(el =>{
    el.addEventListener("click", e =>{
        numOfPlayers = parseInt(e.currentTarget.id[10]);
        initialize(numOfPlayers);
        setTimeout(() => {
            document.querySelector("#intro-options").classList.add("exit");
            playerNumElement.classList.remove("enter");
            setTimeout(()=>{
                document.querySelector("#intro-options").classList.add("no-display");
            },1000);
        }, 500);
    })
})


// == Main Game ==

function initialize (numOfPlayers){

    //creates Player object for each player and adds to player array
    for (let i=0;i<numOfPlayers;i++) playerArray.push(new Player(i+1,playerColor[i]));

    //assigns Player 1 as the player of the first turn
    currentPlayer = playerArray[0];
    currentPlayer.scoreDisplay.forEach(el => el.classList.add("active"));
    currentPlayer.header.forEach(el => el.classList.add("active"));
    
    //assigns scoreboard button responses and records selected scores
    playerArray.forEach(player=>{
        player.scoreDisplay.forEach(el =>{
            el.addEventListener("click", e =>{
                if (turnStarted && !gameEnded){
                    for(let i=0;i<13;i++){
                        if (e.target === currentPlayer.scoreDisplay[i] && !currentPlayer.selectedScores[i]){
                            currentPlayer.selectedScores[i] = true;
                            currentPlayer.scoreDisplay[i].classList.add("selected");
                            currentPlayer.scoreTotal += currentPlayer.eachScore[i];
                            totalScoreElement[currentPlayer.number-1].textContent = currentPlayer.scoreTotal;
                            rollCount++;
                            resetTurn();
                            break;
                        }
                    }
                }
            })
        })
    })

    //rolls dice
    interactBtn.addEventListener("click", ()=>{
        turnStarted = true;
        if (rollCount !== 4 && !gameEnded){

            rollCountElement.textContent = rollCount;

            if (rollCount !== 1) displayDiceResults();
            if(soundOn) rollSound.play(); 
            setTimeout(() => {
                randomDiceRoll();
                countFreq();
                displayDiceResults()
                updateScore(calcScore());  
                rollCount++;
            }, 500);
        }
    })

    //toggle dice locks
    diceCardBtns.forEach((el)=>{
        el.addEventListener("click", e =>{
            if (turnStarted && !gameEnded){
                let cardLocked = parseInt(el.id[4])-1;
                lockedIndices[cardLocked] = !lockedIndices[cardLocked];
                diceCards[cardLocked].classList.toggle("selected");
            }
        })
    })

}

// ==== MENU EVENT LISTENERS  ====

// toggles menu options
menuToggle.addEventListener("click", ()=>{

    menuContainer.classList.length === 0? menuContainer.classList.add("open1") : menuContainer.classList.remove("open1");  
    menuContainer.classList.remove("open2");
    menuToggle.classList.toggle("open");
})

//opens Instructions details
document.querySelector("#instructions-btn").addEventListener("click", ()=>{
    menuContainer.classList.remove("open1");
    document.querySelector(".about-response").classList.add("no-display");
    document.querySelector(".instructions-response").classList.remove("no-display");
    menuContainer.classList.add("open2");
})

//opens About details
document.querySelector("#about-btn").addEventListener("click", ()=>{
    menuContainer.classList.remove("open1");
    document.querySelector(".about-response").classList.remove("no-display");
    document.querySelector(".instructions-response").classList.add("no-display");
    menuContainer.classList.add("open2");
})

//toggles sound on/off

document.querySelector("#sound-btn").addEventListener("click",()=>{
    document.querySelector("#sound-btn i").classList.toggle("fa-volume-mute");
    document.querySelector("#sound-btn i").classList.toggle("fa-volume-up");
    soundOn = !soundOn;
})

// === GAME FUNCTIONS ====

// Player Object constructor
function Player(number, color) {
    this.number = number;
    this.color = color;
    this.scoreTotal = 0;
    this.eachScore = Array(13).fill(0);
    this.scoreDisplay = document.querySelectorAll(`.p${number} .point`);
    this.selectedScores = Array(13).fill(false);
    this.header = document.querySelectorAll(`#scoreboard-headers .p${number} h4`);
}

// Resets turn
function resetTurn (){

    //checks if it is end of game
    if (roundNum === 13 && playerNum === numOfPlayers) gameOver();
    
    else {
        //reset locks, flips to back of dice cards and restarts roll count
        lockedIndices = lockedIndices.fill(false);
        diceCards.forEach(el => el.classList.remove("selected"));
        displayDiceResults();
        rollCount = 1;
        rollCountElement.textContent = rollCount;

        //remove current player indicators
        currentPlayer.selectedScores.forEach((el,index) => {if (!el) currentPlayer.scoreDisplay[index].textContent = 0;});
        currentPlayer.scoreDisplay.forEach(el => el.classList.remove("active"));
        currentPlayer.header.forEach(el => el.classList.remove("active"));
 
        //move on to next player
        turnStarted = false;
        if (playerNum === numOfPlayers) {
            playerNum = 1;
            roundNum++;
        } else playerNum++;
 
        //change to next player indicators
        currentPlayer = playerArray[playerNum-1];
        backDisplay[1].textContent = playerNum;
        currentPlayer.scoreDisplay.forEach(el=> el.classList.add("active"));
        currentPlayer.header.forEach(el => el.classList.add("active"));
        root.style.setProperty("--player-color",`var(--neon-${currentPlayer.color})`);
    }
}

// End of game response
function gameOver(){

    backDisplay[0].textContent = "Game";
    backDisplay[1].textContent = "Over";
    gameEnded = true;

    //Adds Upper Bonus if applicable
    const reducerSum6 = (acc, cur) => acc + cur;

    playerArray.forEach((player, idx) =>{
        const upperScores = player.eachScore.slice(0,6);
        if (upperScores.reduce(reducerSum6) >= 63){
            player.scoreTotal += 35;
            document.querySelector(`.p${player.number} .points-bonus`).textContent = 35;
            totalScoreElement[idx].textContent = player.scoreTotal;
        } 
    })

    
    //Determines and displays winner of game if more than one player
    if (numOfPlayers > 1){
        let max = 0;
        let winner = 0;
        playerArray.forEach(player =>{
            if (player.scoreTotal > max){
                max = player.scoreTotal;
                winner++;
            }
        })
    
        setTimeout(() => {
            root.style.setProperty("--player-color",`var(--neon-${playerColor[winner-1]})`);
            backDisplay[0].textContent = "Player";
            backDisplay[1].textContent = winner+" wins";
        }, 500);
    }
}

// Roll dice if dice is not locked
function randomDiceRoll (){
    for (let i=0; i<5; i++){
        if (!lockedIndices[i]){
            diceResults[i] = Math.ceil(Math.random()*6);
            diceIcons[i].classList.remove(diceIcons[i].classList[2])
            diceIcons[i].classList.add(`fa-dice-${diceIconName[diceResults[i]]}`);
        }
    }
}

// Flips over dice card to display roll results
function displayDiceResults(){
    for (let i=0; i<5;i++){
        if (lockedIndices[i] === false) diceCards[i].classList.toggle("flip-card");
    }
}

//Counts occurrence of each dice digit used for score calculations
function countFreq(){
    diceFreq.fill(0);
    diceResults.forEach(el => diceFreq[el-1]++);
}

//Calculates sum of the five dice results used for score calculations
function sumOfResults() {
    const reducerSumAll = (acc, cur, idx) => acc + cur*(idx+1);
    return diceFreq.reduce(reducerSumAll);
}

//Calculates score for each category
function calcScore (){

    let newScoreArray =[];
    const sumResults = sumOfResults();

    //Ones to Sixes
    for(let i=0;i<6;i++) newScoreArray[i] = (i+1)*diceFreq[i];  

    // 3 of a Kind and Full House
    if (diceFreq.indexOf(3) !== -1){
        (diceFreq.indexOf(2) !== -1)? newScoreArray[8] = 25 : newScoreArray[8] = 0;
        newScoreArray[6] = sumResults
    } else { 
        newScoreArray[6] = 0;
        newScoreArray[8] = 0;
    }
    
    //4 of a Kind
    (diceFreq.indexOf(4) !== -1)? newScoreArray[7] = sumResults : newScoreArray[7] = 0;

    //Little Straight and Big Straight
    let sortedResults = [...(new Set(diceResults))]; //removes duplicates
    sortedResults.sort((a,b) => a - b); //sorts dice values from small to large
 
    if (sortedResults.length === 5 && isEqual(bigStraight[sortedResults[0]-1],sortedResults)){
        newScoreArray[9] = 30;
        newScoreArray[10] = 40;   
        
    } else if (sortedResults.length >= 4 && (isEqual(littleStraight[sortedResults[0]-1],sortedResults.slice(0,4)) || isEqual(littleStraight[sortedResults[1]-1],sortedResults.slice(1,5)))) {
        newScoreArray[9] = 30;
        newScoreArray[10] = 0;
    } else {
        newScoreArray[9] = 0;
        newScoreArray[10] = 0;
    }  

    // Yahtzee
    if (diceFreq.indexOf(5) !== -1){
        // Yahtzee Bonus
        if(currentPlayer.selectedScores[11] && currentPlayer.eachScore[11] > 0){
            currentPlayer.eachScore[11]+= 100;
            currentPlayer.scoreTotal+= 100;
            currentPlayer.scoreDisplay[11].textContent = currentPlayer.eachScore[11];

        } else newScoreArray[11] = 50;
    } else newScoreArray[11] = 0;

    //Chance
    newScoreArray[12] = sumResults;

    return newScoreArray
}

//check for equality between two arrays (used for Straights)
function isEqual(array1, array2) {
    return array1.every((val,idx) => val === array2[idx]);
}

// updates scoreboard with new calculated scores only if category has not been already selected/accounted for
function updateScore(newScoreArray){
    for(let i=0;i<13;i++){
        if (!currentPlayer.selectedScores[i]){
            currentPlayer.eachScore[i] = newScoreArray[i];
            currentPlayer.scoreDisplay[i].textContent = currentPlayer.eachScore[i];
        }
    }
}

