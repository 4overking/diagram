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
    }).on("dragstop", function () {
        updatePaths();
    });
});
/*
 * Добавления строк в таблицу
 * @returns {undefined}
 */
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
/*
 * Ф-ция получения исходных дынных для отрисовки
 * @returns {Array|getJson.stack}
 */
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
/*
 * Функция отрисовывающая круговую диаграмму
 * @returns {undefined}
 */
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
        //var startXY = [centerX + diagramRadius, centerY]
        var angle = lastEnd + circlePart / 2;
        var sectorX = centerX + diagramRadius * Math.cos(angle);
        var sectorY = centerY + diagramRadius * Math.sin(angle);
        var sectorCenter = {X: sectorX, Y: sectorY};
        var desc = createDescStrip(part["dataColor"], part["dataText"], part["dataVal"] / sum, sectorCenter);
       // buildDescConnection(desc);
        /**************************************/
        ctx.beginPath();
        ctx.rect(sectorX - 2, sectorY - 2, 5, 5);
        ctx.fillStyle = "red";
        ctx.fill();
        /**************************************/
       
        lastEnd += circlePart;
    }
    updatePaths();
    /*
     * Отрисовка сектора
     * @param {type} centerX - координата Х центра
     * @param {type} centerY - координата Y центра
     * @param {type} diagramRadius - радиус
     * @param {type} sAngle - начальный угол
     * @param {type} eAngle - конечный угол
     * @param {type} fill - цвет заливки
     * @returns {undefined}
     */
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
    }).on("dragstop", function () {
            updatePaths();
    });
}
/*
 * создание мини опианий и вставка их в обёртку
 * @param {type} color - цвет квадрата
 * @param {type} txt - текст описания
 * @param {type} pers - проценты
 * @param {type} sectorCenter - координаты центра сектора на круговой диаграмме
 * @returns {Element|createDescStrip.wrapper}
 */
function createDescStrip(color, txt, pers, sectorCenter)
{
    txt = txt || "!!!!!!!!!!!!!";
    var strip = document.createElement("canvas");
    var wrapper = document.createElement("div");
    var container = document.getElementById("diagram-wrapper");
    var ctx = strip.getContext('2d');
    strip.className = "DescStrip";
    wrapper.className = "DescStripWrapper";
    wrapper.sectorCenter = sectorCenter;
    ctx.font = '16pt Calibri';
    var txtWidth = ctx.measureText(txt).width;
    if (txtWidth > 200)
    {
        strip.width = txtWidth + 50;
        wrapper.style.width = txtWidth + 50 + "px";
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
    // console.log(strip.width);
    return wrapper;

}
/*
 * Удаление описаний
 * @returns {undefined}
 */
function deleteDescStrip()
{
    var strips = document.getElementsByClassName("DescStripWrapper");
    for (var i = strips.length; i > 0; i--)
    {
        var el = strips[i - 1];
        el.parentNode.removeChild(el);
    }

}
/*
 * Обновление всех привязок описаний к круговой диаграмме
 * @returns {undefined}
 */
function updatePaths()
{
    var descs = document.getElementsByClassName("DescStripWrapper");
     var canvas = document.getElementById("diagramSignature");
     var ctx = canvas.getContext('2d');
     ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (var i=0; i< descs.length;i++)
    {
        buildDescConnection(descs[i]);
    }
}
/**
 * создание соеденений описаний к диаграмме
 * @param {type} desc - координаты описания
 * @returns {undefined}
 */
function buildDescConnection(desc)
{
    var canvas = document.getElementById("diagramSignature");
    var diagram = document.getElementById("diagram");
    var ctx = canvas.getContext('2d');
    var sectorCenter = desc.sectorCenter;
    var start = {X: diagram.offsetLeft + sectorCenter.X,
        Y: diagram.offsetTop + sectorCenter.Y};
    var end = {X: desc.offsetLeft,
        Y: desc.offsetTop + 15};
    var path = Pathfinding(start, end);
    ctx.beginPath();
    for (var i in path) {
        if (i == 0)
            ctx.moveTo(path[i].X, path[i].Y);
        else
            ctx.lineTo(path[i].X, path[i].Y);
    }
    ctx.stroke();

}
function Pathfinding(start, end)
{
    var tail = {X:end.X-5, Y:end.Y};
    return [start, tail,end];
}
function PathSelect(btn)
{

    if (btn.state != "start")
    {
       $(btn).html(' <span class="glyphicon glyphicon-pencil" aria-hidden="true"></span> Завершить');
        btn.state = "start"
        $("#diagram-wrapper").on("click", function (e){
            
         /*$("#diagram-wrapper").on("click", function (e){
            //console.log({X: e.offsetX, Y:e.offsetY});
            if (stack.length===0)
            {
               if (e.target.className ==="DescStrip")
               { 
                   var wrapper = e.target.parentNode;
                   endPoint = wrapper.sectorCenter;
                   stack.push({X:wrapper.offsetTop, Y:wrapper.offsetLeft});
                    //console.log(endPoint);
               }
                else
                {
                    endPoint = {X:e.offsetTop, Y:e.offsetLeft};
                    stack.push(endPoint);
                }
            }
        });*/
        
    }
    else
    {
        console.log(this);
        $(btn).html(' <span class="glyphicon glyphicon-pencil" aria-hidden="true"></span> Редактор пути');
        btn.state = "";

    }
}
/*******************методы для поиска соеденителей диаграммы с описанием**************/
function detectMouseClickOnLine(){};
function detectDoubleMouseClickOnLine(e)
{
    e = e || window.event;
    
};

/**
 * Отрисовка ленточной диаграммы
 * @returns {undefined}
 */
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


/*
 * надпись преследующая мышь
 * @returns {undefined}
 */
function mouseHelper()
{
    var helper = document.getElementById("mouseHelper") || document.createElement("div");
    helper.id = "mouseHelper";
    document.body.appendChild(helper);
    helper.innerHTML = "";
    /*for (var i in state)
     helper.innerHTML+=i+" - "+state[i]+"<br>";*/
    helper.innerHTML = "i`m a helper";

    helper.style.top = e.pageY + 13 + "px";
    helper.style.left = e.pageX + 10 + "px";
}


