$(document).ready(function () {
    document.documentGrid = [50, 20];
    document.rowCount = 0;
    addRow();
    addRow();
    addRow();
    $("#addRow").click(addRow);
    drawCircleDiagram();
    /**Draggable ****/
    $("#diagram").draggable({
        grid: document.documentGrid,
        containment: 'parent'
    });
});
function addRow()
{
    var colorStack = ["#FF6347", "#7FFF00", "#4169E0", "#FFD700", "#FFA500", "#00BFFF", "#FF00FF",
        "#B22222", "#FF8C00", "#7CFC00", "#00FF00", "#1E90FF", "#9932CC", "#808080"];
    var color = colorStack[Math.floor(Math.random() * (colorStack.length))];
    document.rowCount++;
    var table = $("#table")[0];
    var tr = document.createElement("tr");
    tr.innerHTML = '<td class="Num">' + document.rowCount + '</td>' +
            '<td><input type="text" class="form-control dataText" placeholder="Текст"></td>' +
            '<td><input type="number" class="form-control dataVal" placeholder="Значение" onkeypress="return event.charCode >= 48 && event.charCode <= 57" min="44" max="72" value="1"></td>' +
            '<td><input type="color" value="' + color + '" class="dataColor" list="dataColorList">\n\
            </td>' +
            '<td>' +
            '<button type="button" class="btn btn-danger deleteMe" aria-label="Left Align">' +
            '<span class="glyphicon glyphicon-remove" aria-hidden="true"></span>' +
            'Удалить' +
            '</button>' +
            '</td>' +
            '</tr>';
    table.appendChild(tr);
    $(".deleteMe").click(function () {
        document.rowCount = 0;
        $(this).parents("tr").remove();
        $("#table").find(".Num").each(function () {
            $(this).html(++document.rowCount)
        });
    });
}

function getJson() {
    var stack = [];
    stack.sum = 0;
    $("#table").find("tr").each(function () {
        var dataText = $(this).find(".dataText").val();
        var dataVal = $(this).find(".dataVal").val();
        var dataColor = $(this).find(".dataColor").val();
        stack.push({dataText: dataText, dataVal: dataVal, dataColor: dataColor});
        stack.sum += parseInt(dataVal);
    });
    return stack;
}

function drawCircleDiagram()
{
    deleteDescStrip();
    var canvas = document.getElementById('diagram'),
            ctx = canvas.getContext('2d'),
            canvasWidth = canvas.width,
            canvasHeight = canvas.height,
            centerX = canvasWidth / 2,
            centerY = canvasHeight / 2,
            diagramRadius = canvasWidth / 2 - 25,
            data = getJson(),
            sum = 0,
            lastEnd = 0,
            CIRCLE = Math.PI * 2;

    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    ctx.strokeStyle = "white";
    ctx.lineWidth = 2;
    for (var i = 0; i < data.length; i++)
    {
        sum += parseInt(data[i]["dataVal"]);
    }
    for (var x = 0; x < data.length; x++)
    {
        var part = data[x];
        ctx.beginPath();
        ctx.fillStyle = part["dataColor"];
        var circlePart = CIRCLE * (part["dataVal"] / sum);
        drawSector(centerX, centerY, diagramRadius, lastEnd, lastEnd + circlePart, true);
        drawSector(centerX, centerY, diagramRadius, lastEnd, lastEnd + circlePart, false);
        var desc = createDescStrip(part["dataColor"], part["dataText"], part["dataVal"] / sum);
        buildDescConnection(desc);
        //var startXY = [centerX + diagramRadius, centerY]
        var angle = lastEnd+circlePart/2;
        var sectorX = centerX + diagramRadius*Math.cos(angle);
        var sectorY = centerY + diagramRadius*Math.sin(angle);
        /**************************************/
        ctx.beginPath();
        ctx.rect(sectorX-2, sectorY-2, 5, 5);
        ctx.fillStyle = "red";
        ctx.fill();
            /**************************************/
        lastEnd += circlePart;
    }
    function drawSector(centerX, centerY, diagramRadius, sAngle, eAngle, fill)
    {
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, diagramRadius, sAngle, eAngle);
        ctx.lineTo(centerX, centerY);
        ctx.closePath();
        if (fill)
        {
            ctx.fill();
        }
        else
        {
            ctx.stroke();
        }
    }
    $(".DescStripWrapper").draggable({
        containment: 'parent',
        grid: document.documentGrid,
    }).on("dragstop", function (){buildDescConnection($(this)[0])});
}

function createDescStrip(color, txt, pers)
{
    txt = txt || "!!!!!!!!!!!!!";

    var strip = document.createElement("canvas");
    var wrapper = document.createElement("div");
    var container = document.getElementById("diagram-wrapper");
    var ctx = strip.getContext('2d');
    strip.className = "DescStrip";
    wrapper.className = "DescStripWrapper";
    ctx.font = '16pt Calibri';
    var txtWidth = ctx.measureText(txt).width;
    if (txtWidth > 200)
    {
        strip.width = txtWidth+50;
        wrapper.style.width = txtWidth+50+"px";
    }
    else
    {
        strip.width = 200;
    }
    strip.height = 30;


    ctx.beginPath();
    ctx.rect(5, 5, 20, 20);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.fillStyle = "black";
    ctx.font = '16pt Calibri';
    ctx.fillText(txt, 40, 22);
    wrapper.appendChild(strip);
    container.appendChild(wrapper);
    return wrapper;

}
function deleteDescStrip()
{
    var strips = document.getElementsByClassName("DescStripWrapper");
    for (var i = strips.length; i > 0; i--)
    {
        var el = strips[i - 1];
        el.parentNode.removeChild(el);
    }

}

function buildDescConnection(desc)
{
   /*  var x = (event.offsetX == undefined) ? event.layerX : event.offsetX;
    var y = (event.offsetY == undefined )? event.layerY : event.offsetY;*/
    console.log($(desc).position());
    
}
function drawBarDiagram()
{
    var canvas = document.getElementById('diagram'),
            ctx = canvas.getContext('2d'),
            canvasWidth = canvas.width,
            canvasHeight = canvas.height,
            data = getJson(),
            colWidth = 50,
            colHeight = 100,
            colDistanceW = 0,
            colDistanceH = 0,
            colBlockBorder = 20,
            sum = 0;
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    for (var i = 0; i < data.length; i++)
    {
        sum += parseInt(data[i]["dataVal"]);
    }
    colDistanceW = (canvasWidth - colBlockBorder * 2 - data.length * colWidth) / data.length;
    colDistanceH = (canvasHeight - colBlockBorder * 2 - data.length * colWidth) / data.length;

    var position = colBlockBorder;
    for (var i = 0; i < data.length; i++)
    {
        var heightPerc = parseInt(data[i]["dataVal"]) / sum;
        ctx.strokeStyle = data[i]["dataColor"];
        ctx.lineWidth = colWidth;
        horisontalDiagram();
        //verticalDiagram();

    }
    function verticalDiagram() {
        ctx.beginPath();
        ctx.moveTo(0, position);
        ctx.lineTo(canvasWidth * heightPerc, position);
        ctx.stroke();
        position += colWidth + colDistanceH;
    }
    function horisontalDiagram() {
        ctx.beginPath();
        ctx.moveTo(position, canvasHeight);
        ctx.lineTo(position, canvasHeight - canvasHeight * heightPerc);
        ctx.stroke();
        position += colWidth + colDistanceW;
    }


}
$("iframe").each(function () {
    $(this).attr("src", $(this).attr("ssrc"));
    $(this).removeAttr("ssrc");

});





