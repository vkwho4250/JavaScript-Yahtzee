
//Variable Assignments:

// -- navigation elements
let menuToggle = document.querySelector("#menu-btn");
let navigation = document.querySelector("#nav");
let soundOn = false;

//-- game constants
const bigStraight = [[1,2,3,4,5], [2,3,4,5,6]];
const smallStraight = [[1,2,3,4], [2,3,4,5], [3,4,5,6],[0,0,0,0]];
const diceIconName = ["X","one","two","three","four","five","six"]

// -- display elements
let root = document.documentElement; //to change display to the color scheme of current player
let backDisplay = document.querySelectorAll(".back-display");
let playerColor = ["yellow","green","pink","purple"];

// -- during Intro -> player initialization (dependent on user selection)

let playerNumElement = document.querySelector("#num-of-players");
let playerNumOptions =  document.querySelectorAll("#num-of-players button");
let playerArray = [];
let numOfPlayers = null; //up to 4 players, will be defined by user

// -- game elements that change/react to each player's interaction
let diceIcons = document.querySelectorAll(".dice-icon");
let diceCards = document.querySelectorAll(".dice-card");
let diceFront = document.querySelectorAll(".front");
let diceCardBtns = document.querySelectorAll(".dice-container");
let rollCountElement = document.querySelector("#roll-counter");
let interactBtn = document.querySelector(".interact-btn");
let interactBorderElement = document.querySelector(".circle-container");
let totalScoreElement = document.querySelectorAll(".total-score");

// -- game elements for game operation
// -- per roll
let diceFreq = new Array(6).fill(0);
let lockedIndices = new Array(5).fill(false); 
let diceResults = [];  
let rollCount = 1; // roll 1,2,3

//--per player turn
let playerNum = 1; //up to numOfPlayers
let currentPlayer = null; //active player object
let turnStarted = false; //turns true after player makes first roll per turn

//-- per round
let roundNum = 1; //up to 13
let gameEnded = false; //turns true after 13 rounds



// INTRO 

setTimeout(() => {
   document.querySelector(".top-container").classList.add("intro-start");
    setTimeout(() => {
        root.style.setProperty("--player-color","var(--neon-"+playerColor[0]+")");
        setTimeout(() => {
            root.style.setProperty("--player-color","var(--neon-"+playerColor[1]+")");
            setTimeout(() => {
                root.style.setProperty("--player-color","var(--neon-"+playerColor[2]+")");
                setTimeout(() => {
                    root.style.setProperty("--player-color","var(--neon-"+playerColor[3]+")");

                    setTimeout(() => {
                        root.style.setProperty("--player-color","var(--neon-"+playerColor[0]+")");
                        document.querySelector("#title-sequence").classList.add("exit");
                        playerNumElement.classList.add("enter");
                        navigation.classList.remove("no-display");
                    }, 1000);
                }, 500);
            }, 500);
        }, 500);   
    }, 500);
}, 1000);

playerNumOptions.forEach(el=>{
    el.addEventListener("click", e =>{
        console.log(e.currentTarget.id[10]);
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


// == MAIN GAME === 

function initialize (numOfPlayers){

    for (let i=0; i<numOfPlayers;i++){
        playerArray[i] = new Player(i+1,playerColor[i]);
    }

    currentPlayer = playerArray[0];
    
    currentPlayer.scoreDisplay.forEach(el=>{
        el.classList.add("active");
    })

    currentPlayer.header.forEach(el =>{
        el.classList.add("active");
})

//Action: assign scoreboard button responses and records selected scores
playerArray.forEach(player=>{
    player.scoreDisplay.forEach(el =>{
        el.addEventListener("click", e=>{
            if (turnStarted === true && gameEnded === false){
                for(let i=0;i<13;i++){
                    if (e.target === currentPlayer.scoreDisplay[i] && currentPlayer.selectedScores[i] === false){
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

 //Action: rolls dice
 interactBtn.addEventListener("click", ()=>{
    console.log("click");
    turnStarted = true;
   if (rollCount !== 4 && gameEnded === false){
       rollCountElement.textContent = rollCount;

       if (rollCount !== 1){

           displayDiceResults();
       }

       setTimeout(() => {
           randomDiceRoll();
           countFreq();
           displayDiceResults()
           let newScore = calcScore();
           updateScore(newScore);  
           rollCount++;
       }, 500);
   }
})

//Action: toggle dice locks
diceCardBtns.forEach((el)=>{
   el.addEventListener("click", e =>{
       if (turnStarted === true && gameEnded === false){
           let cardLocked = parseInt(el.id[4])-1;
           lockedIndices[cardLocked] = !lockedIndices[cardLocked]
           diceCards[cardLocked].classList.toggle("selected");
       }
   })
})

}

// ==== NAVIGATION EVENT LISTENERS  ====

//ACTION: Toggles menu options
menuToggle.addEventListener("click", ()=>{
    if (navigation.classList.length === 0){
        navigation.classList.add("open1");
    } else{
        navigation.classList.remove("open1");
    }
    
    navigation.classList.remove("open2");
    menuToggle.classList.toggle("open");
})

//ACTION: opens game instructions
document.querySelector("#instructions").addEventListener("click", ()=>{
    navigation.classList.remove("open1");
    document.querySelector(".about-response").classList.add("no-display");
    document.querySelector(".instructions-response").classList.remove("no-display");
    navigation.classList.add("open2");
})

//ACTION: confirmation to restart game
document.querySelector("#about").addEventListener("click", ()=>{
    navigation.classList.remove("open1");
    document.querySelector(".about-response").classList.remove("no-display");
    document.querySelector(".instructions-response").classList.add("no-display");
    navigation.classList.add("open2");
})

//ACTION: toggles sound on/off

document.querySelector("#sound-btn").addEventListener("click",()=>{
    document.querySelector("#sound-btn i").classList.toggle("fa-volume-mute");
        document.querySelector("#sound-btn i").classList.toggle("fa-volume-up");
    if (soundOn) {      
        soundOn = false;
    } else{
        soundOn = true;
    }
})

// === GAME FUNCTIONS ====

// -- Player Object
function Player(number, color) {
    this.number = number;
    this.color = color;
    this.scoreTotal = 0;
    this.eachScore = new Array(13).fill(0);
    this.scoreDisplay = document.querySelectorAll(".p"+number+" .point");
    this.selectedScores = new Array(13).fill(false);
    this.header = document.querySelectorAll("#scoreboard-headers .p"+number+" h4");
}

// -- resets turn
function resetTurn (){

    //checks if it is the last player turn out of 13 rounds
    if (roundNum === 13 && playerNum === numOfPlayers){
        gameOver();

    } else {

        //reset locks, flips to back of dice cards and restarts roll count
        lockedIndices = lockedIndices.fill(false);
        diceCards.forEach( el=>{
            el.classList.remove("selected");
        })
        displayDiceResults();
        rollCount = 1;
        rollCountElement.textContent = rollCount;


        //remove current player indicators
        currentPlayer.selectedScores.forEach((el,index) =>{
            if (el === false) {
                currentPlayer.scoreDisplay[index].textContent = 0;
            }
        })

        currentPlayer.scoreDisplay.forEach(el=>{
            el.classList.remove("active");
        })
        
        currentPlayer.header.forEach(el =>{
            el.classList.remove("active");
        })


        //move to next player
        if (playerNum === numOfPlayers) {
            playerNum = 1;
            roundNum++;
   
        } else {
            playerNum++;
        }
        turnStarted = false;

        //change to next player indicators
        currentPlayer = playerArray[playerNum-1];
        backDisplay[1].textContent = playerNum;

        currentPlayer.scoreDisplay.forEach(el=>{
            el.classList.add("active");
        })
        
        currentPlayer.header.forEach(el =>{
            el.classList.add("active");
        })
        root.style.setProperty("--player-color","var(--neon-"+currentPlayer.color+")");
        
    }
}

function gameOver(){

    backDisplay[0].textContent = "Game";
    backDisplay[1].textContent = "Over";
    gameEnded = true;

    //Adds Upper Bonus if applicable
    const reducerSum = (acc, curr) => acc + curr;

    playerArray.forEach( player =>{
        console.log("check bonus");
        let upperScores = player.eachScore.slice(0,5);
        if (upperScores.reduce(reducerSum) >= 63){
            player.scoreTotal += 35;
            document.querySelector(".p"+player.number+" .points-bonus").textContent = 35;
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
            root.style.setProperty("--player-color","var(--neon-"+playerColor[winner-1]+")");
            backDisplay[0].textContent = "Player";
            backDisplay[1].textContent = winner+" wins";
        }, 500);
    }
}

// Purpose: roll dice if dice is not locked
function randomDiceRoll (){

    for (let i=0; i<5; i++){

        console.log(lockedIndices[i])
        if (lockedIndices[i] === false){
            diceResults[i] = Math.ceil(Math.random()*6);
            diceIcons[i].classList.remove(diceIcons[i].classList[2])
            diceIcons[i].classList.add("fa-dice-"+diceIconName[diceResults[i]]);
        }
    }
}

// Purpose: flips over dice card to display roll results
function displayDiceResults(){
    for (let i=0; i<5;i++){
        if (lockedIndices[i] === false){
            diceCards[i].classList.toggle("flip-card");
        }
    }
}

// Purpose: counts occurrence of each dice digit used for score calculations
function countFreq(){
    diceFreq = diceFreq.fill(0);
    diceResults.forEach(el =>{
        diceFreq[el-1]++;
    })
}

// Purpose: calculates sum of the five dice results used for score calculations
function sumOfResults() {
    let sum = 0;
    let diceNum = 1;
    diceFreq.forEach((el)=>{
        sum += el*diceNum;
        diceNum++;
    })
    return sum
}

//Purpose: calculates score for each category
function calcScore (){

    let newScoreArray =[];
    newScoreArray[6] = 0; //sets bonus category to zero (calculated at end of game or under yahtzee category)
    let sumResults = sumOfResults();

    //Ones to Sixes
    for(let i=0;i<6;i++){
        newScoreArray[i] = (i+1)*diceFreq[i];  
    }

    // 3 of a Kind and Full House
    if (diceFreq.indexOf(3) !== -1){
        newScoreArray[6] = sumResults
        if (diceFreq.indexOf(2) !== -1){
            newScoreArray[8] = 25;
        } else {
            newScoreArray[8] = 0;
        }
    } else { 
        newScoreArray[6] = 0;
        newScoreArray[8] = 0;
    }
    
    //4 of a Kind
    if (diceFreq.indexOf(4) !== -1){
        newScoreArray[7] = sumResults
    } else{
        newScoreArray[7] = 0;
    }

    //Little Straight and Big Straight
    let sortedResults = [...(new Set(diceResults))]; //removes duplicates
    sortedResults.sort((a,b) => a - b); //sorts dice values from small to large
 
    //checks for equality against big straights
    if (sortedResults.length === 5 && isEqual(bigStraight[sortedResults[0]-1],sortedResults)){
        newScoreArray[9] = 30;
        newScoreArray[10] = 40;   
        
    //checks for equality against little straights
    } else if (sortedResults.length >= 4 && (isEqual(smallStraight[sortedResults[0]-1],sortedResults.slice(0,4)) || isEqual(smallStraight[sortedResults[1]-1],sortedResults.slice(1,5)))) {
        newScoreArray[9] = 30;
        newScoreArray[10] = 0;
    } else {
        newScoreArray[9] = 0;
        newScoreArray[10] = 0;
    }  

    // Yahtzee
    if (diceFreq.indexOf(5) !== -1){
        // Yahtzee Bonus -- for every subsequent yahtzee after the first (assuming it had been selected with a non-zero score)
        if (currentPlayer.selectedScores[11] === true && currentPlayer.eachScore[11] > 0){
            newScoreArray[6]+= 100;
        } else{
            newScoreArray[11] = 50;
        }
    } else {
        newScoreArray[11] = 0;
    }

    //Chance
    newScoreArray[12] = sumResults;


    return newScoreArray
}

//check for equality between two arrays (used for checking Straights)
function isEqual(arr1, arr2) {
    return arr1.every((val,idx) => val === arr2[idx]);
}

// updates scoreboard with new calculated scores only if category has not been already selected/accounted for
function updateScore(newScoreArray){
    for(let i=0;i<13;i++){
        if (currentPlayer.selectedScores[i] === false){
            currentPlayer.eachScore[i] = newScoreArray[i];
            currentPlayer.scoreDisplay[i].textContent = newScoreArray[i];
        }
    }
}


