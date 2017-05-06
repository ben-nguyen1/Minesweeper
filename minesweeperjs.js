var easy =
    {
        rows: 9,
        cols: 9,
        bombs: 10
    }

var medium =
    {
        rows: 16,
        cols: 16,
        bombs: 40
    }

var expert =
    {
        rows: 16,
        cols: 30,
        bombs: 99
    }

var settings =
    {
        rows: 10,
        cols: 10,
        width: 30,
        height: 30,
        bombs: 10
    }

var canvas = document.getElementById('gCanvas');
var context = canvas.getContext('2d');
context.font = "20px arial";
var clickedX;
var clickedY;
var bombs = [];
var clickedBoxes = [];

drawGrid();
createBombs();
//timer();

window.onclick = function(e)
{
    var mX = e.pageX;
    var mY = e.pageY;
    if (Math.floor(mX/settings.width) < settings.rows && Math.floor(mY/settings.height) < settings.cols)
    {
        clickedX = Math.floor(mX/settings.width);
        clickedY = Math.floor(mY/settings.height);
    }

    var clickedBomb = false;

    for (var i = 0; i < 10; i++)
    {
        if (clickedX == bombs[i][0] && clickedY == bombs[i][1])
        {
            clickedBomb = true;
            lose();
        }
    }
    if (clickedBomb == false)
    {
        clickPass(clickedX,clickedY);
    }
}
var rClickedX;
var rClickedY;
var rClickedBoxes = [];
window.oncontextmenu = function(e)
{
    e.preventDefault();
    var mX = e.pageX;
    var mY = e.pageY;
    if (Math.floor(mX/settings.width) < settings.rows && Math.floor(mY/settings.height) < settings.cols)
    {
        rClickedX = Math.floor(mX/settings.width);
        rClickedY = Math.floor(mY/settings.height);
    }

    var inRClickedBoxes = [false,0];

    for (in in rClickedBoxes)
    {
        if (rClickedBoxes[i][0] == rClickedX && rClickedBoxes[i][1] == rClickedY)
        {
            inRClickedBoxes = [true, i;
        }
    }
    if (inRClickedBoxes[0] == false)
    {
        rClickedBoxes[(rClickedBoxes.length)][0] = rClickedX;
        rClickedBoxes[(rClickedBoxes.length)][1] = rClickedY;

    }
    else
    {
        rClickedBoxes.splice(inRClickedBoxes[1], 1);
    }

    drawGrid();
}

function lose()
{

}



var time = 0;
function timer()
{
    setTimeout(function()
    {
        var timerDiv = document.getElementById("timer");
        time++;
        timerDiv.innerHTML = time;
        timer();
    }, 1000)
}

function checkBomb(i, x, y)
{
    if (bombs[i][0] == x && bombs[i][1] == y)
        return true;
    return false;
}

function createBombs()
{
    for (var i = 0; i < 10; i ++)
    {
        while (true)
        {
            var x = Math.floor(Math.random()*10);
            var y = Math.floor(Math.random()*10);
            if (!duplicateBomb(x,y))
            {
                bombs[i] = [x,y];
                break;
            }
        }
    }
}


function duplicateBomb(x,y)
{
    if (bombs.length == 0)
        return false;
    for (var i = 0; i < bombs.length; i++)
        if (bombs[i][0] == x && bombs[i][1] == y)
            return true;
    return false;
}

function drawGrid()
{
    context.clearRect(0,0,400,400);

    for (var i = 0; i < settings.rows; i++)
    {
        for (var n = 0; n < settings.cols; n++)
        {
            var image = new Image();

            var beenClicked = [0,false];

            if (clickedBoxes.length > 0)
            {
                for (var k = 0; k < clickedBoxes.length; k++)
                {
                    if (clickedBoxes[k][0] == n && clickedBoxes[k][1] == i)
                    {
                        beenClicked = [k,true];
                    }
                }
            }

            if (beenClicked[1] == true)
            {
                image.setAtX = n * settings.width;
                image.setAtY = i * settings.height;
                image.onload = function()
                {
                    context.drawImage(this, this.setAtX, this.setAtY);
                    for (var i in clickedBoxes)
                        if (clickedBoxes[i][2] > 0)
                            context.fillText(clickedBoxes[i][2],clickedBoxes[i][0]*settings.width+9, clickedBoxes[i][1]*settings.height+20);
                };

                if (clickedBoxes[(beenClicked[0])][2] > 0)
                {
                    image.src = "num.png";
                }
                else
                {
                    image.src = "zero.png";
                }
            }
            else
            {
                if (rClickedBoxes.length > 0)
                {
                    for (var k = 0; k < rClickedBoxes.length; k++)
                    {
                        if (rClickedBoxes[k][0] == n && rClickedBoxes[k][1] == i)
                        {
                            rBeenClicked = [k,true];
                        }
                    }
                }
                image.setAtX = n * settings.width;
                image.setAtY = i * settings.height;
                image.onload = function()
                {
                    context.drawImage(this, this.setAtX, this.setAtY);
                };
                image.src = "box.png";
            }
        }
    }
}


function clickPass(x, y)
{
    var boxesToCheck =
        [
            [-1,-1],
            [0,-1],
            [1,-1],
            [1,0],
            [1,1],
            [1,1],
            [0,1],
            [-1,1],
            [-1,0]
        ];

    var numOfBombsSurrounding = 0;

    for (i in boxesToCheck)
    {
        for (var n = 0; n < 10; n++)
        {
            if (checkBomb(n,x + boxesToCheck[i][0], y + boxesToCheck[i][1]) == true)
                numOfBombsSurrounding++;
        }
        if (numOfBombsSurrounding > 1)
            numOfBombsSurrounding--;
    }

    clickedBoxes[(clickedBoxes.length)] = [x, y, numOfBombsSurrounding];

    if (numOfBombsSurrounding == 0)
    {
        for(i in boxesToCheck)
        {
            if (x + boxesToCheck[i][0] >= 0 && x + boxesToCheck[i][0] <= 9 && y + boxesToCheck[i][1] >= 0 && y + boxesToCheck[i][1] <= 9)
            {
                var x1 = x + boxesToCheck[i][0];
                var y1 = y + boxesToCheck[i][1];

                var alreadyChecked = false;
                for (n in clickedBoxes)
                {
                    if (clickedBoxes[n][0] == x1 && clickedBoxes[n][1] == y1)
                    {
                        alreadyChecked = true;
                    }
                }
                if (alreadyChecked == false)
                {
                    clickPass(x1,y1);
                }
            }
        }
    }

    drawGrid();

}
