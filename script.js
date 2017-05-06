//canvas and context
var canvas = document.getElementById('gCanvas');
var context = canvas.getContext('2d');
var rect;
var style = document.querySelector(".gameCanvas");

//time variables
var timer = document.getElementById('timer');
var seconds = 0;
var minutes = 0;
var hours = 0;
var time;
var firstClick = true;

//modes options
var easy =
    {
        rows: 9,
        cols: 9,
        width: 35,
        height: 35,
        bombs: 10
    };
var medium =
    {
        rows: 16,
        cols: 16,
        width: 35,
        height: 35,
        bombs: 40
    };
var expert =
    {
        rows: 30,
        cols: 16,
        width: 35,
        height: 35,
        bombs: 99
    };

var listOfModes = {'easy': easy, 'medium': medium, 'expert': expert};

//game settings
var settings;
var menu = document.getElementById("menu");
var modes = menu.options[menu.selectedIndex].value;

//2D array of cells
var cells = new Array();

//num of bombs and num of revealed cells
var numRevealed = 0;
var gameDone = false;

getDifficulty();

//new game button is pressed
function newGame()
{
    context.clearRect(0,0,canvas.width,canvas.height); //clears the board entirely
    getDifficulty();
    drawBoard();
    firstClick = true;
    numBombs = 0;
    numRevealed = 0;
    gameDone = false;
    cells = new Array();
    clear();
    stop();
}

function getDifficulty()
{
    var menu = document.getElementById("menu");
    var modes = menu.options[menu.selectedIndex].value;
    settings = listOfModes[modes];
    if (settings.bombs == 10)
        style.style.left = "65px";
    else if (settings.bombs == 40)
        style.style.left = "80px";
    else if (settings.bomb == 90)
        style.style.left = "5px";

    //set size of canvas to fit board
    canvas.width = settings.rows * settings.width;
    canvas.height = settings.cols * settings.height;
    drawBoard();
}

//mouse clicked
canvas.addEventListener("mousedown", mousePress, false);
function mousePress(event)
{
    event.preventDefault(); //prevents the context menu popping up when right-clicking
    rect = canvas.getBoundingClientRect();

    //gets the row and column of the board
    var clickedX = Math.floor((event.clientX - rect.left)/settings.width);
    var clickedY = Math.floor((event.clientY - rect.top)/settings.height);

    if (gameDone){} //if game is done, do nothing
    if (firstClick)
    {
        add();
        initializeCells();
        createBombs(clickedX,clickedY);
        setUpValues();
        firstClick = false;
    }
    if (event.button == 0 && !gameDone) //left-click
        reveal(clickedX,clickedY,true);
    else if (event.button == 2 && !gameDone) //right-click
        flag(clickedX,clickedY);
}

//right-click for flagging
function flag(row, column)
{
    var image = new Image();
    image.setAtX = row * settings.width;
    image.setAtY = column * settings.height;
    image.onload = function()
    {
        context.drawImage(this, this.setAtX, this.setAtY);
    };

    //flag if the cell has not been flagged and revealed yet
    if (!cells[row][column].flagged && !cells[row][column].beenRevaled)
    {
        image.src = "flag.png";
        cells[row][column].flagged = true;
    }

    //unflag a flagged cell
    else if (cells[row][column].flagged && !cells[row][column].beenRevaled)
    {
        image.src = "box.png";
        cells[row][column].flagged = false;
    }
}

//left-click to reveal cell
function reveal(row, column, clicked)
{
    //lose game if bomb is clicked
    if (clicked == true && cells[row][column].value == -1 && !cells[row][column].flagged)
    {
        alert("BOOM! You Lose!");
        revealBoard();
        stop();
        gameDone = true;
    }
    else
    {
        var image = new Image();
        image.setAtX = row * settings.width;
        image.setAtY = column * settings.height;
        image.onload = function()
        {
            context.drawImage(this, this.setAtX, this.setAtY);
        };

        //reveal a number cell that is not flagged
        if (cells[row][column].value > 0 && cells[row][column].flagged == false)
        {
            image.src = "numbers/" + cells[row][column].value + ".png";
            cells[row][column].beenRevaled = true;
            numRevealed++;
        }

        //reveal a 0-value cell that has not been flagged yet
        else if (cells[row][column].value == 0 && !cells[row][column].flagged)
        {
            image.src = "zero.png";
            cells[row][column].beenRevaled = true;
            numRevealed++;
            revealNeighbors(row,column);
        }

        //game has been won at this condition
        if (numRevealed == (settings.rows * settings.cols - settings.bombs))
        {
            alert("You win!");
            revealBoard();
            stop();
            gameDone = true;
        }
    }
}

//reveal neighbors of 0 value cells
function revealNeighbors(row, column)
{
    for (var r = row-1; r <= row+1; r++)
        for (var c = column-1; c <= column+1; c++)
            if (inBounds(r,c) && (r != row|| c != column) && cells[r][c].value != -1 && !cells[r][c].beenRevaled && !cells[row][column].flagged)
                reveal(r,c,false);
}

//get the number of surrounding bombs of non-bomb cells
function getSurroundingBombsValue(row, column)
{
    var value = 0;
    for (var r = row-1; r <= row + 1; r++)
        for (var c = column-1; c <= column + 1; c++)
            //checks if a cell is in bounds, not it self, and is not a bomb
            if (inBounds(r,c) && (r != row|| c != column) && cells[r][c].value == -1)
                value++;
    return value;

}

//give values to every non-bomb cells
function setUpValues()
{
    for (var r = 0; r < settings.rows; r++)
        for (var c = 0; c < settings.cols; c++)
            //checks if cell is not a bomb
            if (cells[r][c].value != -1)
                cells[r][c].value = getSurroundingBombsValue(r,c);
}

//randomly gives cells values of -1
function createBombs(firstRow, firstCol)
{
    for (var i = 0; i < settings.bombs; i++)
    {
        while (true)
        {
            var r = Math.floor(Math.random()*settings.rows);
            var c = Math.floor(Math.random()*settings.cols);
            if (!duplicateBomb(r,c) && !(r == firstRow && c == firstCol))
            {
                cells[r][c].value = -1;
                break;
            }
        }
    }
}

//checks if there is a already bomb at that cell
function duplicateBomb(r,c)
{
    //no need to check if there aren't any bombs
    if (firstClick)
        return false;
    return cells[r][c].value == -1;
}

//draw the initial board
function drawBoard()
{
    for (var r = 0; r < settings.rows; r++)
    {
        for (var c = 0; c < settings.cols; c++)
        {
            var image = new Image();
            image.setAtX = r * settings.width;
            image.setAtY = c * settings.height;
            image.onload = function()
            {
                context.drawImage(this, this.setAtX, this.setAtY);
            };
            image.src = "box.png";
        }
    }
}

//checks if a row and column are in bounds of the board
function inBounds(row, column)
{
    return (0 <= row && row < settings.rows && 0 <= column && column < settings.cols);
}

//reveal the entire board
function revealBoard()
{
    for (var r = 0; r < settings.rows; r++)
    {
        for (var c = 0; c < settings.cols; c++)
        {
            var image = new Image();
            image.setAtX = r * settings.width;
            image.setAtY = c * settings.height;
            image.onload = function()
            {
                context.drawImage(this, this.setAtX, this.setAtY);
            };
            if (cells[r][c].value == -1)
                image.src = "bomb.png";
            else if (cells[r][c].value == 0)
                image.src = "zero.png";
            else if (cells[r][c].value > 0)
                image.src = "numbers/" + cells[r][c].value + ".png";
        }
    }
}

//set up cells array
function initializeCells()
{
    for (var r = 0; r < settings.rows; r++)
        cells[r] = new Array(settings.rows);
    for (var r = 0; r < settings.rows; r++)
        for (var c = 0; c < settings.cols; c++)
            cells[r][c] =
            {
                value: 0,
                beenRevaled: false,
                flagged: false
            }
}

/* time methods */

//increment the time
function add()
{
    seconds++;
    if (seconds >= 60)
    {
        seconds = 0;
        minutes++;
        if (minutes >= 60)
        {
            minutes = 0;
            hours++;
        }
    }
    timer.textContent = "TIME: " +(hours ? (hours > 9 ? hours : "0" + hours) : "00") + ":" + (minutes ? (minutes > 9 ? minutes : "0" + minutes) : "00") + ":" +  (seconds > 9 ? seconds : "0" + seconds);
    update();
}

//update the setTimeout
function update()
{
    time = setTimeout(add, 1000);
}

//stop the time
function stop()
{
    clearTimeout(time);
}

//clear back to 00:00:00
function clear()
{
    timer.textContent = "TIME: 00:00:00";
    seconds = 0;
    minutes = 0;
    hours = 0;
}

/* Debugging methods */

//locate bombs
function locateBombs()
{
    for (var i = 0; i < settings.rows; i++)
        for (var k = 0; k < settings.cols; k++)
            if (cells[i][k].value == -1)
                console.log("Bomb at " + i + " " + k);
}
