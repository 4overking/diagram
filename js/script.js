$(document).ready(function () {
    document.documentGrid = [50, 20];
    document.rowCount = 0;
    addRow();
    addRow();
    addRow();
    $("#addRow").click(addRow);
    drawDiagram();
    /**Draggable ****/
    $("#diagram").draggable({
        grid: document.documentGrid,
        containment: 'parent'
    }).on("dragstop", function () {
        updatePaths();
    });
    $("#InputSetFillColor").on("change", function () {

        $("#selectTexture").attr("disabled", "");
        $("#InputFillColor").removeAttr("disabled");
    })
    $("#InputSetFillTexture").on("change", function () {
        $(this).val("");
        $("#selectTexture").removeAttr("disabled");
        $("#InputFillColor").attr("disabled", "");
    });
    $("#selectTexture").click(function () {

        $('#InputFillTexture').trigger("click");
    })
    //при выборе нового цвета заливки
    $('#InputFillColor').on("change", fillBackground);
    //при выборе заливки
    $('#InputFillTexture').on("change", fillTextureBackground);

    $("#radialPref").find("input, select").on("change", function () {
        drawDiagram();
    });
    $(".dataVal").on("change", drawDiagram);
    //обработка галки путей
    $("#InputShowPaths").change(function () {
        if ($(this)[0].checked)
        {
            $("#InpuPathColor").removeAttr("disabled");
            $("#InputLineThickness").removeAttr("disabled");
        }
        else
        {
            $("#InpuPathColor").attr("disabled", "");
            $("#InputLineThickness").attr("disabled", "");

        }
    });
    $('#diagramSelector label').click(function () {
        $(this).parent().find("label").removeClass("active");
        $(this).addClass("active");
    })
    //показывать проценты
    $("#InputShowPers").change(function () {
        if ($(this)[0].checked)
        {

            $(this).parent().parent().find("input[type=radio]").removeAttr("disabled");
        }
        else
        {
            $(this).parent().parent().find("input[type=radio]").attr("disabled", "");
        }

    });
    $("#InputOuterRadius").change(function () {

        $("#diagram").attr("width", $(this).val()).attr("height", $(this).val());
        drawDiagram();
    })
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
            '<td><input type="number" class="form-control dataVal" placeholder="Значение"  value="1"></td>' +
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
        drawDiagram();
    });
    drawDiagram();
    $("#table").change(drawDiagram).on("keyup", drawDiagram);
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
        stack.sum +=(parseInt(dataVal)>0)?parseInt(dataVal):0;
        if (parseInt(dataVal)<0)
        {
            stack.negative = dataVal;
        }
    });
    return stack;
}
/*
 * Ф-ция получения настроек вида диаграммы
 * @returns {getConfigJson.scriptAnonym$1}
 */
function getConfigJson()
{
    var fontSize = $("#InputFontSize").val(),
            fontName = $("#InputFontName").val(),
            fontColor = $("#InputFontColor").val(),
            pathsColor = $("#InpuPathColor").val(),
            showPaths = $("#InputShowPaths")[0].checked,
            showPers = $("#InputShowPers")[0].checked,
            fillColor = $("#InputSetFillColor")[0].checked,
            fillColorVal = $("#InputFillColor").val(),
            fillTexture = $("#InputSetFillTexture")[0].checked,
            fillTextureVal = $("#InputFillTexture").val();

    return {fontSize: fontSize, fontName: fontName, fontColor: fontColor, showPaths: showPaths,
        pathsColor: pathsColor, showPers: showPers, fillColor: fillColor, fillColorVal: fillColorVal, fillTexture: fillTexture, fillTextureVal: fillTextureVal};

}
/*
 * Функция отрисовывающая круговую диаграмму
 * @returns {undefined}
 */
function drawCircleDiagram(sect)
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


        var circlePart = CIRCLE * (part["dataVal"] / sum);

        drawSector(centerX, centerY, diagramRadius, lastEnd, lastEnd + circlePart);


        //var startXY = [centerX + diagramRadius, centerY]
        var angle = lastEnd + circlePart / 2;
        var sectorX = centerX + diagramRadius * Math.cos(angle);
        var sectorY = centerY + diagramRadius * Math.sin(angle);
        var sectorCenter = {X: sectorX, Y: sectorY};
        var desc = createDescStrip(part["dataColor"], part["dataText"], part["dataVal"], sum, sectorCenter);
        //buildDescConnection(desc);
        /**************** Точки присоединения на секторе**********************/
        if (document.getElementById("InputShowPaths").checked)
        {
            ctx.fillStyle = part["dataColor"];
            ctx.beginPath();
            ctx.rect(sectorX - 2, sectorY - 2, 5, 5);
            ctx.fillStyle = document.getElementById("InpuPathColor").value;
            ctx.fill();
        }
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

    function drawSector(centerX, centerY, diagramRadius, sAngle, eAngle)
    {

        var innerRadius = document.getElementById("InputRadius").value;
        ctx.fillStyle = part["dataColor"];
        var lineWidth = document.getElementById("InputSectorSepWidth").value;
        ctx.lineWidth = lineWidth;
        ctx.beginPath();
        ctx.arc(centerX, centerY, diagramRadius, sAngle * 0.99, eAngle, false); // Outer: CCW
        ctx.arc(centerX, centerY, innerRadius, eAngle, sAngle, true); // Inner: CW
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.arc(centerX, centerY, diagramRadius, sAngle * 0.99, eAngle, false);
        ctx.globalCompositeOperation = "destination-out";
        ctx.lineTo(centerX, centerY);
        ctx.closePath();
        if (lineWidth > 0)
            ctx.stroke();
        ctx.globalCompositeOperation = "source-over";
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
function createDescStrip(color, txt, val, sum, sectorCenter)
{
    txt = txt || "!!!!!!!!!!!!!";
    var pers = val / sum * 100;
    var strip = document.createElement("canvas");
    var wrapper = document.createElement("div");
    var container = document.getElementById("diagram-wrapper");
    var ctx = strip.getContext('2d');
    strip.className = "DescStrip";
    wrapper.className = "DescStripWrapper";
    wrapper.sectorCenter = sectorCenter;
    var fontSize = document.getElementById("InputFontSize").value + "pt";
    var fontName = document.getElementById("InputFontName").value;
    var fontColor = document.getElementById("InputFontColor").value;
    var showPers = document.getElementById("InputShowPers").checked;
    if (showPers)
    {
        if (document.getElementById("showPers").checked)
            txt += " (" + pers.toFixed(2) + "%" + ")";
        else if (document.getElementById("showVal").checked)
            txt += " " + val;
    }
    ctx.font = fontSize + " " + fontName;
    ctx.fillStyle = fontColor;
    var txtWidth = ctx.measureText(txt).width;

    strip.width = txtWidth + 50;
    wrapper.style.width = txtWidth + 50 + "px";


    strip.height = 30;
    if (document.getElementById("InputColorDesc").checked) {
        ctx.beginPath();
        ctx.rect(5, 5, 20, 20);
        ctx.fillStyle = color;
        ctx.fill();
    }
    ctx.font = fontSize + " " + fontName;
    ctx.fillStyle = fontColor;
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
    for (var i = 0; i < descs.length; i++)
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
    if (!document.getElementById("InputShowPaths").checked)
        return false;
    var canvas = document.getElementById("diagramSignature");
    var diagram = document.getElementById("diagram");
    var ctx = canvas.getContext('2d');
    var sectorCenter = desc.sectorCenter;
    ctx.lineWidth = document.getElementById("InputLineThickness").value;
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
    ctx.strokeStyle = document.getElementById("InpuPathColor").value;
    ctx.stroke();

    function Pathfinding(start, end)
    {
        if (end.X < start.X)
        {
            end.X += desc.offsetWidth;
            var tail = {X: end.X + 5, Y: end.Y};
        } else {
            var tail = {X: end.X - 5, Y: end.Y};
        }
        return [start, tail, end];
    }
}
/**
 * Отрисовка ленточной диаграммы
 * @returns {undefined}
 */
function drawBarDiagram()
{
    deleteDescStrip();
    updatePaths();

    var canvas = document.getElementById('diagram'),
            ctx = canvas.getContext('2d'),
            canvasWidth = canvas.width,
            canvasHeight = canvas.height,
            data = getJson(),
            colWidth = 10;
            
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    ctx.font = "10pt Calibri";
    ctx.fillStyle = "black";
    var leftSpace = 42,
        bottomSpace = 40;
    var startX, endX;

    drawCoord();
    verticalDiagram();

    function drawCoord() {
        var coordVal;
        if (false)
            coordVal = [100, 80, 60, 40, 20, 0];
        else
            coordVal = [100, 80, 60, 40, 20, 0, -20, -40, -60, -80, -100];
        var spacingH = canvasHeight / coordVal.length;
        ctx.strokeStyle = "black";
        ctx.beginPath();
        ctx.lineWidth = 2;
        ctx.moveTo(leftSpace, 10);
        ctx.lineTo(leftSpace, canvasHeight);
        ctx.stroke();

        ctx.font = "10pt Calibri";

        endX = spacingH;
        for (var i in coordVal)
        {
            ctx.beginPath();
            ctx.lineWidth = 1;
            ctx.moveTo(leftSpace, spacingH + i * spacingH);
            ctx.lineTo(canvasWidth, spacingH + i * spacingH);
            
            ctx.strokeStyle = "gray";
            ctx.stroke();
            if (coordVal[i] === 0){
                startX = spacingH + i * spacingH;
            }
            ctx.strokeStyle = "black";
            ctx.fillText(coordVal[i] + '%', 5, spacingH + i * spacingH);
        }


    }
    function verticalDiagram() {
        var distanse = leftSpace;
        var maxHeight = 100;
        ctx.lineWidth = colWidth;
        var height = (startX -endX);
        for (var i = 0; i< data.length; i++)
        {
            console.log(pers)
            ctx.beginPath();
            leftSpace += colWidth;
            ctx.moveTo(leftSpace, startX);
            var pers = data[i]["dataVal"]/data.sum;
            ctx.lineTo(leftSpace, endX + height*(1-pers));
             ctx.strokeStyle = data[i]["dataColor"];
            ctx.stroke();
            leftSpace += colWidth;
        }
    }


    /*
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
     //   var desc = createDescStrip(part["dataColor"], part["dataText"], part["dataVal"] , sum, sectorCenter);
     drawCoord();
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
     
     */
}
function drawCoord22()
{
    var canvas = document.getElementById('diagram'),
            ctx = canvas.getContext('2d'),
            canvasWidth = canvas.width,
            canvasHeight = canvas.height;
    if (true)
        var coordDigits = [100, 80, 60, 40, 20, 0];
    else
        var coordDigits = [100, 80, 60, 40, 20, 0, -20, -40, -60, -80, -100];

    ctx.font = "10pt Calibri";
    ctx.fillStyle = "black";
    var spacingH = canvasHeight / coordDigits.length;

    for (var i in coordDigits)
    {
        ctx.beginPath();
        ctx.fillText(coordDigits[i] + '%', 5, spacingH - 5 + i * spacingH);
    }

    ctx.lineWidth = 4;
    ctx.strokeStyle = "gray"
    ctx.lineTo(0, canvasHeight);
    ctx.lineTo(canvasWidth, canvasHeight)
    ctx.stroke();
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
function saveDiagram()
{
    $("#saveDiagram").attr("href", mergeLayers());

}
function mergeLayers()
{
    var diagramWrapper = document.getElementById("diagram-wrapper");
    var diagramSignature = document.getElementById("diagramSignature");
    var diagramBackground = document.getElementById("diagramBackground");
    var width = diagramWrapper.offsetWidth;
    var height = diagramWrapper.offsetHeight;
    var canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    var ctx = canvas.getContext("2d");
    var diagram = document.getElementById("diagram");
    ctx.drawImage(diagramBackground, 0, 0);
    ctx.drawImage(diagram, diagram.offsetLeft, diagram.offsetTop);

    var descs = document.getElementsByClassName("DescStrip");

    for (var i = 0; i < descs.length; i++)
    {
        var parent = descs[i].parentNode;
        ctx.drawImage(descs[i], parent.offsetLeft, parent.offsetTop);
    }
    ctx.drawImage(diagramSignature, 0, 0);
    return canvas.toDataURL();
}

function fillBackground()
{
    var back = document.getElementById("diagramBackground");
    var ctx = back.getContext("2d");
    var color = document.getElementById("InputFillColor").value;
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, back.width, back.height);
}
function fillTextureBackground()
{
    var file = document.getElementById("InputFillTexture").files[0];
    if (!file)
    {
        console.error("Файл не выбран");
        return;
    }
    var reader = new FileReader();
    reader.onload = function (event) {
        var dataUri = event.target.result,
                img = document.createElement("img");
        img.onload = function ()
        {
            var back = document.getElementById("diagramBackground");
            var ctx = back.getContext("2d");
            var pattern = ctx.createPattern(img, 'repeat');
            ctx.rect(0, 0, back.width, back.height);
            ctx.fillStyle = pattern;
            ctx.fill();
        }
        img.src = dataUri;
    }
    reader.onerror = function (event) {
        console.error("Файл не может быть прочитан! код " + event.target.error.code);
    };
    reader.readAsDataURL(file);
}
function drawDiagram()
{
    var id = $("#diagramSelector").find(".active").attr("id");
    if (id === "RadialDiagram") {
        drawCircleDiagram()
    }
    else if (id === "LineralDiagram") {
        drawBarDiagram()
    }
}