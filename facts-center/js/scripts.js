//////////////////////////


var data_grouped;
var categories;

var fromYear = 2008;
var toYear = 2018;
var chartType = 1;
var animationEnabled = true;


readCsvFile(fromYear, toYear, chartType);


function readCsvFile(minYear, maxYear, isLatest) {

    var parseDate = d3.timeParse("%Y")

    d3.csv("data/Ge3.csv", data => {

        var data_res = data.map((d, i) => {
                return {
                    date: parseDate(d.Year),
                    location: d.Location,
                    cvalue: +d.Value,
                    sourceid: d["Source Indicator ID"],
                    sourcename: d["Source Name"],
                    category: d["Indicator Category"],
                    name: d["Indicator Name"],
                    desc: d["Indicator Description"]
                    //,
                    // circlecolor: "#b0dfe8"


                }
            })
            .filter(function (f) {
                return f.cvalue != null;
            })


        data_res = data_res.filter(function (obj) {
            return obj.date >= parseDate(minYear) && obj.date <= parseDate(maxYear);
        });

        data_res.sort(dynamicSort("category"));

       // console.log(data_res);

        data_grouped = _.mapValues(_.groupBy(data_res, 'sourceid'),
            clist => clist.map(source => _.omit(source, 'sourceid')));



        //console.log(data_grouped);

        categories = data_res.map(item => item.category)
            .filter((value, index, self) => self.indexOf(value) === index);

        loadFilter();


        var htmlid;
        var filter_trend; // positive or negative
        var filter_difference;
        var filter_surpassed = 0;
        var filter_below = 0;
        var chart_status = "chart-inc"; //default increased
        var status_line_color = "#119eb9";
        var status_bg_color = "#b0dfe8";

        var currentKey = "";
        var currentCategory = "";
        var currentCount = 0;

        var groups = {};

        for (var key in data_grouped) {



            chart_status = "chart-inc";
            status_line_color = "#119eb9";
            status_bg_color = "#b0dfe8";


            //  if (key != "B25119_002E") continue;

        

            //clone and append chart html container

            groupArr = data_grouped[key];




            if (groupArr.length > 0) {
                if (currentKey != key) {


                    if (!groups[groupArr[0].category]) {

                        $("#chart-container").append("<div id='group-" + groupArr[0].category + "' class='cat-group'>" + groupArr[0].category + " (<span>1</span>)</div>");

                        groups[groupArr[0].category] = [];
                        groups[groupArr[0].category].push(0);
                        groups[groupArr[0].category]++;
                    } else groups[groupArr[0].category]++;


                }
            }



            groupArr.sort(dynamicSort("date"));

            var item;

            if (isLatest) 
                {
                        htmlid = "chart-last-" + key;
                    item = $("#sample-last").clone();
                    item.find(".chart").attr("id", htmlid);
                    item.find(".chart").attr("data-key", key);
                }
            else 
                {
                        htmlid = "chart-" + key;
                    item = $("#sample-item").clone();
                    item.find(".chart").attr("id", htmlid);
                     item.find(".chart").attr("data-key", key);
                }



            

            item.find("span.item-cat").html(groupArr[0].category);
            item.find("span.item-name").html(groupArr[0].name);
            item.find("span.item-desc").html(groupArr[0].desc);





            var arrayCA24 = _.filter(groupArr, function (group) {
                return group.location === "CA-24";
            });

            var minCA24 = arrayCA24[0].cvalue;
            var maxCA24 = arrayCA24[arrayCA24.length - 1].cvalue;

            if (maxCA24 < minCA24) {
                chart_status = "chart-dec";

                status_line_color = "#d03161";
                status_bg_color = "#fba5c2";

                // for (key in groupArr) {
                //     groupArr[key].circlecolor = "#fba5c2";
                // }

            }



            filter_trend = 100 * (maxCA24 - minCA24) / minCA24;


            var arrayCA = _.filter(groupArr, function (group) {
                return group.location === "CA";
            });

            var minCA = arrayCA[0].cvalue;
            var maxCA = arrayCA[arrayCA.length - 1].cvalue;

            filter_difference = 100 * (maxCA24 - maxCA) / maxCA;

            if (minCA24 < minCA && maxCA24 > maxCA) filter_surpassed = 1;

            if (minCA24 > minCA && maxCA24 < maxCA) filter_below = 1;

            //console.log(filter_trend);

            item.find("span.item-trend").html(filter_trend);

            item.find("span.item-diff").html(filter_difference);
            item.find("span.item-surpassed").html(filter_surpassed);
            item.find("span.item-below").html(filter_below);

  item.find(".detail-pop").addClass(chart_status);

            //make chart


            if (isLatest) {

            item.find(".detail-pop").attr("data-type", "latest");

                $("#chart-container").append($(item).html());
               lastestChart(groupArr, htmlid , maxYear, status_line_color);



            } else {

                item.find("span.item-line-color").html(status_line_color);

                item.find(".detail-pop").attr("data-type", "trend");

               

                $("#chart-container").append($(item).html());
                makeChart(groupArr, htmlid, 0, status_line_color, status_bg_color)
            }


            //console.log(groupArr);

            // break;

        }


        for (var key in groups) {

            $("#chart-container").find("#group-" + key + " span").text(groups[key]);


        }



        animationEnabled = false;
        if (isLatest) $(".bar-last").css("animation", "none");

    })
}

function lastestChart(groupArr, htmlid,maxYear, status_line_color ) {
    var elem = "#" + htmlid;

  //  console.log($(item));

item = $(elem);

$(elem).append( $(".chart-last-cont").clone().html());

 var widthCA24 = 100;
                var widthCA = 100;
                var widthUS = 100;
                var max = 100;

                 var arrayCA24 = _.filter(groupArr, function (group) {
                return group.location === "CA-24";
            });
 
            var maxCA24 = arrayCA24[arrayCA24.length - 1].cvalue;

            var arrayCA = _.filter(groupArr, function (group) {
                return group.location === "CA";
            });
 
            var maxCA = arrayCA[arrayCA.length - 1].cvalue;



                var arrayUS = _.filter(groupArr, function (group) {
                    return group.location === "US";
                });

                var maxUS = arrayUS[arrayUS.length - 1].cvalue;

                //  console.log(maxCA24 + " - " + maxCA + "-" + maxUS);

                const sorted = [maxCA24, maxCA, maxUS].sort((a, b) => b - a);

                max = sorted[0];

                // console.log(max);
                //  console.log(sorted[sorted.length - 1]);

                widthCA24 = maxCA24 * 100 / max;
                widthCA = maxCA * 100 / max;
                widthUS = maxUS * 100 / max;

                item.find("span.item-year").html(maxYear);

                item.find("span.item-line-color").html(status_line_color);

                item.find(".bar-last-cont").css("width", widthCA24 + "%");
                item.find(".ca-line").css("left", widthCA + "%");
                item.find(".us-line").css("left", widthUS + "%");

                item.find(".bar-last span").html(abbreviate_number(maxCA24));
                item.find(".ca-line span.value").html(abbreviate_number(maxCA));
                item.find(".us-line span.value").html(abbreviate_number(maxUS));

                if (maxCA24 >= max) {
                    item.find(".bar-last").css("background-color", "#119eb9");
                    item.find(".detail-pop").addClass("chart-inc");
                } else {
                    item.find(".bar-last").css("background-color", "#d03161");
                    item.find(".detail-pop").addClass("chart-dec");
                }

               

}


function makeChart(res, htmlid, isDetailChart, status_line_color, status_bg_color) {

    //  console.log(res);

    var chartId = htmlid;

    var elem = "#" + htmlid;


    var glines
    var mouseG
    var tooltip

    var parseDate = d3.timeParse("%Y")

    var margin = {
        top: 50,
        right: 20,
        bottom: 20,
        left: 25
    }

    var width = 300
    var height = 180;

    if (isDetailChart) {
        height = 350;
    }

    height = height - margin.top - margin.bottom

    var lineOpacity = 1
    var lineStroke = "2px"

    var xScale
    var yScale

    var svg

    var axisPad = 6 // axis formatting
    var R = 6 //legend marker

    var category = ["CA-24", "CA", "US"]

    if (!status_line_color) status_line_color = "#d03161";

    var colors = [status_line_color, "#f7e952", "#acacac"];

    //  if (isDecreased) colors = ["#d03161", "#f7e952", "#acacac"]

    var color = d3.scaleOrdinal()
        .domain(category)
        .range(colors)


    res.sort(dynamicSort("date"));

    width = $(elem).parent().width() - margin.left - margin.right
    if (width <= 0) width = 300 - margin.left - margin.right

    xScale = d3.scaleTime()
        .domain(d3.extent(res, d => d.date))
        .range([0, width])


        var yMin = d3.min(res, d => d.cvalue);

       // console.log(yMin);

       if(yMin>=4) yMin = yMin - 8;

    yScale = d3.scaleLinear()
        .domain([yMin, d3.max(res, d => d.cvalue)])
        .range([height, 0]);


    // $("#chart-container").append($("#sample-item").html())

    svg = d3.select(elem).append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append('g')
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


    // Add the X Axis
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(xScale).ticks(d3.timeYear.every(1)))
        .selectAll("text")
        .style("fill", "#A6A6A6");

    // if (isDetailChart) {

    var yAxis = d3.axisLeft(yScale).ticks(10, "s").tickSize(-width).tickValues([d3.min(res, d => d.cvalue), d3.max(res, d => d.cvalue)]); //ticks(10, "s").tickSize(-width) //horizontal ticks across svg width

    if (isDetailChart) {
        yAxis = d3.axisLeft(yScale).ticks(10, "s").tickSize(-width) //horizontal ticks across svg width
    }

     yScale2 = d3.scaleLinear()
        .domain([0, 1])
        .range([0, height]);


var heigh= height -20;

   yaxs =  svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
             .call(g => {
            g.selectAll("text")
                .style("text-anchor", "middle")
                .attr("x", -axisPad * 2)
                .attr('fill', '#A9A9A9')

            g.selectAll("line")
                .attr('stroke', '#A9A9A9')
                .attr('stroke-width', 0.7) // make horizontal tick thinner and lighter so that line paths can stand out
                .attr('opacity', 0.3)

         //   g.select(".domain").remove()

        })

        // .attr("transform", "translate(0,-30)")

        var img ="img/ww.png";
        var txtColor= "black";

        if(isDetailChart) {img ="img/ww2.png";  txtColor= "#A9A9A9";}

        if(yMin>=4)
        {

      yaxs.append('svg:image')
        .attr('xlink:href', img)
        .attr('class',"wave").attr('x', 0)
  .attr('width', 16)// pixels until the next tick
  .attr("transform", "translate(-8," + heigh  + ")")
  .attr('height', 20)
  
   yaxs.append("text")
   .attr("class", "wave-text")
   .attr("transform", "translate(-8," + height  + ")")
.attr('fill', txtColor)
  .text("0"); 

  }

    // svg.append("g")
    //     .attr("class", "y axis")
    //     .call(yAxis)
    //     .call(g => {
    //         g.selectAll("text")
    //             .style("text-anchor", "middle")
    //             .attr("x", -axisPad * 2)
    //             .attr('fill', '#A9A9A9')

    //         g.selectAll("line")
    //             .attr('stroke', '#A9A9A9')
    //             .attr('stroke-width', 0.7) // make horizontal tick thinner and lighter so that line paths can stand out
    //             .attr('opacity', 0.3)

    //         g.select(".domain").remove()

    //     })

    //}


    // line generator 
    var line = d3.line()
        //.curve(d3.curveCardinal)
        .x(d => xScale(d.date))
        .y(d => yScale(d.cvalue))


    var res_nested_raw = d3
        .nest() // necessary to nest data so that keys represent each region
        .key(d => d.location)
        .entries(res)


    // console.log("nested");
    // console.log(res_nested_raw);


    var res_nested24 = res_nested_raw.filter(function (obj) {
        return obj.key == "CA-24";
    });

    var res_nestedCA = res_nested_raw.filter(function (obj) {
        return obj.key == "CA";
    });

    var res_nestedUS = res_nested_raw.filter(function (obj) {
        return obj.key == "US";
    });

    var res_nested = res_nested24.concat(res_nestedCA);

    res_nested = res_nested.concat(res_nestedUS);

    //  console.log(res_nested);


    // APPEND MULTIPLE LINES //
    var lines = svg.append('g')
        .attr('class', 'lines')

    glines = lines.selectAll('.line-group')
        .data(res_nested).enter()
        .append('g')
        .attr('class', 'line-group')

    // if (d.values > 0) { //ignore empty values
    glines
        .append('path')
        .attr('class', 'line')
        .attr('d', d => line(d.values))
        .style('stroke', (d, i) => color(i))
        .style('fill', 'none')
        .style('opacity', lineOpacity)
        .style('stroke-width', lineStroke)


    if (animationEnabled) {

        var delay = 1500;

        if (isDetailChart) delay = 100;

        path = lines.select(".line-group:nth-child(1) path").node()

        totallength = path.getTotalLength();
        d3.select(path)
            .attr("stroke-dasharray", totallength + " " + totallength)
            .attr("stroke-dashoffset", totallength)
            .transition()
            .duration(1000)
            .delay(delay)
            .ease(d3.easeLinear)
            .attr("stroke-dashoffset", 0);


        path = lines.select(".line-group:nth-child(2) path").node()

        totallength = path.getTotalLength();
        d3.select(path)
            .attr("stroke-dasharray", totallength + " " + totallength)
            .attr("stroke-dashoffset", totallength)
            .transition()
            .duration(1000)
            .delay(delay)
            .ease(d3.easeLinear)
            .attr("stroke-dashoffset", 0);


        path = lines.select(".line-group:nth-child(3) path").node()

        totallength = path.getTotalLength();
        d3.select(path)
            .attr("stroke-dasharray", totallength + " " + totallength)
            .attr("stroke-dashoffset", totallength)
            .transition()
            .duration(1000)
            .delay(delay)
            .ease(d3.easeLinear)
            .attr("stroke-dashoffset", 0);



    }


    // }

    // CREATE HOVER TOOLTIP WITH VERTICAL LINE //
    tooltip = d3.select(elem).append("div")
        .attr('id', 'tooltip-' + chartId)
        .attr('class', 'chart-tooltip')
        .style('position', 'absolute')
        .style('padding', 6)
        .style('display', 'none')

    mouseG = svg.append("g")
        .attr("class", "mouse-over-effects");


    var lines = document.getElementsByClassName('line');

    var mousePerLine = mouseG.selectAll('.mouse-per-line-' + chartId)
        .data(res_nested)
        .enter()
        .append("g")
        .attr("class", "mouse-per-line-" + chartId);


    //var circle_fill = status_bg_color;
    var circle_fill = "#fff";

    if (isDetailChart) circle_fill = "#4a4a4a";
    //  else {
    //    if (isDecreased) circle_fill = "#fba5c2";
    // }

    // function (d) {
    //     console.log(color(d.key))
    // };

    mousePerLine.append("circle")
        .attr("r", 6)
        .style("stroke", function (d) {
            return color(d.key)
        })
        .style("fill", circle_fill)
        .style("stroke-width", "2px")
        .style("opacity", "0");

    mouseG.append('svg:rect') // append a rect to catch mouse movements on canvas
        .attr('width', width)
        .attr('height', height)
        .attr('fill', 'none')
        .attr('pointer-events', 'all')
        .on('mouseout', function () { // on mouse out hide line, circles and text
            d3.select(".mouse-line")
                .style("opacity", "0");
            d3.selectAll(".mouse-per-line-" + chartId + " circle")
                .style("opacity", "0");
            d3.selectAll(".mouse-per-line-" + chartId + " text")
                .style("opacity", "0");
            d3.selectAll("#tooltip-" + chartId)
                .style('display', 'none')

        })
        .on('mouseover', function () { // on mouse in show line, circles and text
            d3.select(".mouse-line")
                .style("opacity", "1");
            d3.selectAll(".mouse-per-line-" + chartId + " circle")
                .style("opacity", "1");
            d3.selectAll("#tooltip+" + chartId)
                .style('display', 'flex')
        })
        .on('mousemove',
            function () { // update tooltip content, line, circles and text when mouse moves
                var mouse = d3.mouse(this)

                d3.selectAll(".mouse-per-line-" + chartId)
                    .attr("transform", function (d, i) {
                        var xDate = xScale.invert(mouse[
                            0
                        ]) // use 'invert' to get date corresponding to distance from mouse position relative to svg
                        var bisect = d3.bisector(function (d) {
                            return d.date;
                        }).left // retrieve row index of date on parsed csv
                        var idx = bisect(d.values, xDate);

                        d3.select(".mouse-line")
                            .attr("d", function () {
                                var data = "M" + xScale(d.values[idx].date) + "," + (
                                    height);
                                data += " " + xScale(d.values[idx].date) + "," + 0;
                                return data;
                            });
                        return "translate(" + xScale(d.values[idx].date) + "," + yScale(d
                            .values[idx].cvalue) + ")";

                    });

                updateTooltipContent(mouse, res_nested)
            })
    //   }

    function updateTooltipContent(mouse, res_nested) {


        sortingObj = []
        res_nested.map(d => {
            var xDate = xScale.invert(mouse[0])
            var bisect = d3.bisector(function (d) {
                return d.date;
            }).left
            var idx = bisect(d.values, xDate)
            sortingObj.push({
                key: d.values[idx].vehicle_class,
                premium: d.values[idx].premium,
                bidding_no: d.values[idx].bidding_no,
                year: d.values[idx].date.getFullYear()
            })
        })



        sortingObj.sort(function (x, y) {
            return d3.descending(x.premium, y.premium);
        })

        var sortingArr = sortingObj.map(d => d.key)

        var res_nested1 = res_nested.slice().sort(function (a, b) {
            return sortingArr.indexOf(a.key) - sortingArr.indexOf(b.key)
        })

        //var tooltipdiv

        tooltip
            .html("")
            .style('display', 'inline-flex')
            .style('left', '10px')
            // .style('top', d3.event.pageY - 80)
            //.style('font-size', 11.5)
            .selectAll()
            .data(res_nested).enter()
            .append('div')
            .style('color', d => {
                return color(d.key)
            })
            .append('div')
            .html(
                d => {
                    var xDate = xScale.invert(mouse[0])
                    var bisect = d3.bisector(function (d) {
                        return d.date;
                    }).left
                    var idx = bisect(d.values, xDate)
                    return abbreviate_number(d.values[idx].cvalue)
                })
            .append('span')
            .html(
                d => {
                    return d.key
                }
            )

        tooltip.append('p').html(sortingObj[0].year)


    }


}



function cloning() {

    item = $("#sample-item").clone();


    item.find(".chart").attr("id", "chart-222");

    $("#chart-container").append($(item).html());

}

function makeSparkline(elem) {

    var chartId = elem;

    elem = "#" + elem;

    var glines
    var mouseG
    var tooltip

    var parseDate = d3.timeParse("%Y")

    var margin = {
        top: 20,
        right: 20,
        bottom: 20,
        left: 10
    }

    var width = 100
    var height = 80 - margin.top - margin.bottom

    var lineOpacity = 1
    var lineStroke = "3px"

    var xScale
    var yScale

    var svg

    var axisPad = 6 // axis formatting
    var R = 6 //legend marker

    var category = ["CA-24"]

    var color = d3.scaleOrdinal()
        .domain(category)
        .range(["#A6A6A6"])


    d3.csv("data/ca-24_population_data.csv", data => {

        var res = data.map((d, i) => {
            return {
                date: parseDate(d.Year),
                location: d.Location,
                cvalue: +d.Value
            }
        })

        res.sort(dynamicSort("date"));

        //  console.log(res);

        var res = res.filter(function (obj) {
            return obj.location == "CA-24";
        });


        var minVal = res[0].cvalue;
        var maxVal = res[res.length - 1].cvalue;

        var diff = 100 * (maxVal - minVal) / minVal;

        $("#top-value").text(kFormatter(maxVal));
        $("#top-diff").text(Math.round(diff) + "%");



        width = $(elem).parent().width() - margin.left - margin.right
        if (width <= 0) width = 100 - margin.left - margin.right

        xScale = d3.scaleTime()
            .domain(d3.extent(res, d => d.date))
            .range([0, width])

        yScale = d3.scaleLinear()
            .domain([0, d3.max(res, d => d.cvalue)])
            .range([height, 0]);


        svg = d3.select(elem).append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append('g')
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


        // Add the X Axis
        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(xScale).ticks(d3.timeYear.every(1)))
            .selectAll("text")
            .style("fill", "#A6A6A6");


        // line generator 
        var line = d3.line()
            .curve(d3.curveCardinal)
            .x(d => xScale(d.date))
            .y(d => yScale(d.cvalue))



        var res_nested = d3
            .nest() // necessary to nest data so that keys represent each region
            .key(d => d.location)
            .entries(res)


        // APPEND MULTIPLE LINES //
        var lines = svg.append('g')
            .attr('class', 'lines')

        glines = lines.selectAll('.line-group')
            .data(res_nested).enter()
            .append('g')
            .attr('class', 'line-group')

        glines
            .append('path')
            .attr('class', 'line')
            .attr('d', d => line(d.values))
            .style('stroke', (d, i) => color(i))
            .style('fill', 'none')
            .style('opacity', lineOpacity)
            .style('stroke-width', lineStroke)


        svg.append('circle')
            .attr('r', 5)
            .attr('cx', xScale(res[res.length - 1].date))
            .attr('cy', yScale(res[res.length - 1].cvalue))
            //.attr("transform", "translate(" + (width + 3) + "," + y(res[0].date) + ")")
            .attr('fill', '#A6A6A6');


        // CREATE HOVER TOOLTIP WITH VERTICAL LINE //
        tooltip = d3.select(elem).append("div")
            .attr('id', 'tooltip-' + chartId)
            .attr('class', 'chart-tooltip small')
            .style('position', 'absolute')
            .style('padding', 6)
            .style('display', 'none')

        mouseG = svg.append("g")
            .attr("class", "mouse-over-effects");


        var lines = document.getElementsByClassName('line');

        var mousePerLine = mouseG.selectAll('.mouse-per-line-' + chartId)
            .data(res_nested)
            .enter()
            .append("g")
            .attr("class", "mouse-per-line-" + chartId);



        mousePerLine.append("circle")
            .attr("r", 4)
            .style("stroke", function (d) {
                return color(d.key)
            })
            .style("fill", "#fff")
            .style("stroke-width", "2px")
            .style("opacity", "0");

        mouseG.append('svg:rect') // append a rect to catch mouse movements on canvas
            .attr('width', width)
            .attr('height', height)
            .attr('fill', 'none')
            .attr('pointer-events', 'all')
            .on('mouseout', function () { // on mouse out hide line, circles and text
                d3.select(".mouse-line")
                    .style("opacity", "0");
                d3.selectAll(".mouse-per-line-" + chartId + " circle")
                    .style("opacity", "0");
                d3.selectAll(".mouse-per-line-" + chartId + " text")
                    .style("opacity", "0");
                d3.selectAll("#tooltip-" + chartId)
                    .style('display', 'none')

            })
            .on('mouseover', function () { // on mouse in show line, circles and text
                d3.select(".mouse-line")
                    .style("opacity", "1");
                d3.selectAll(".mouse-per-line-" + chartId + " circle")
                    .style("opacity", "1");
                d3.selectAll("#tooltip+" + chartId)
                    .style('display', 'flex')
            })
            .on('mousemove',
                function () { // update tooltip content, line, circles and text when mouse moves
                    var mouse = d3.mouse(this)

                    d3.selectAll(".mouse-per-line-" + chartId)
                        .attr("transform", function (d, i) {
                            var xDate = xScale.invert(mouse[
                                0
                            ]) // use 'invert' to get date corresponding to distance from mouse position relative to svg
                            var bisect = d3.bisector(function (d) {
                                return d.date;
                            }).left // retrieve row index of date on parsed csv
                            var idx = bisect(d.values, xDate);

                            d3.select(".mouse-line")
                                .attr("d", function () {
                                    var data = "M" + xScale(d.values[idx].date) + "," + (
                                        height);
                                    data += " " + xScale(d.values[idx].date) + "," + 0;
                                    return data;
                                });
                            return "translate(" + xScale(d.values[idx].date) + "," + yScale(d
                                .values[idx].cvalue) + ")";

                        });

                    updateTooltipContent(mouse, res_nested)
                })
        //   }

        function updateTooltipContent(mouse, res_nested) {


            sortingObj = []
            res_nested.map(d => {
                var xDate = xScale.invert(mouse[0])
                var bisect = d3.bisector(function (d) {
                    return d.date;
                }).left
                var idx = bisect(d.values, xDate)
                sortingObj.push({
                    key: d.values[idx].vehicle_class,
                    premium: d.values[idx].premium,
                    bidding_no: d.values[idx].bidding_no,
                    year: d.values[idx].date.getFullYear()
                })
            })



            sortingObj.sort(function (x, y) {
                return d3.descending(x.premium, y.premium);
            })

            var sortingArr = sortingObj.map(d => d.key)

            var res_nested1 = res_nested.slice().sort(function (a, b) {
                return sortingArr.indexOf(a.key) - sortingArr.indexOf(b.key)
            })



            tooltip.html("")
                .style('display', 'flex')
                .selectAll()
                .data(res_nested).enter()
                .append('div')
                .style('color', d => {
                    return color(d.key)
                })
                .append('div')
                .html(
                    d => {
                        var xDate = xScale.invert(mouse[0])
                        var bisect = d3.bisector(function (d) {
                            return d.date;
                        }).left
                        var idx = bisect(d.values, xDate)
                        return d.values[idx].cvalue
                            .toLocaleString()
                    })

            tooltip.append('p').html(sortingObj[0].year)
        }

    })

}


// makeSparkline("top-chart");



function dynamicSort(property) {
    var sortOrder = 1;
    if (property[0] === "-") {
        sortOrder = -1;
        property = property.substr(1);
    }
    return function (a, b) {
        var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
        return result * sortOrder;
    }
}

function kFormatter(num) {
    return Math.abs(num) > 999 ? Math.sign(num) * ((Math.abs(num) / 1000).toFixed(1)) + 'k' : Math.sign(num) * Math.abs(num)
}


abbreviate_number = function (num, fixed) {
    if (num === null) {
        return null;
    } // terminate early
    if (num === 0) {
        return '0';
    } // terminate early
    fixed = (!fixed || fixed < 0) ? 0 : fixed; // number of decimal places to show
    var b = (num).toPrecision(2).split("e"), // get power
        k = b.length === 1 ? 0 : Math.floor(Math.min(b[1].slice(1), 14) / 3), // floor at decimals, ceiling at trillions
        c = k < 1 ? num.toFixed(0 + fixed) : (num / Math.pow(10, k * 3)).toFixed(1 + fixed), // divide by power
        d = c < 0 ? c : Math.abs(c), // enforce -0 is 0
        e = d + ['', 'K', 'M', 'B', 'T'][k]; // append power
    return e;
}

var toggleType=3;

function show_detail(elem, onDetail) {

if(onDetail)
{
     isTrend=0
    if($(elem).attr("data-type")=="trend") isTrend=1;
if(toggleType==3) { if(isTrend==1) isTrend=0; else isTrend=1; toggleType=isTrend} 
else{
    if(toggleType==1) isTrend=0; else isTrend=1; toggleType=isTrend
}

elem = $(".detail-pop.active");
}
else
{
     isTrend=0
    if($(elem).attr("data-type")=="trend") isTrend=1;
    $(".detail-pop").removeClass("active");
     $(elem).addClass("active");
}



   

    var line_color = $(elem).find(".item-line-color").text();

    var chartId = $(elem).find(".chart").attr("id");
    key = $(elem).find(".chart").attr("data-key");

    data = data_grouped[key];

    $(".modal-custom .chart-detail").html("");
     $(".modal-custom .chart-detail-mini").html("");

    $(".modal-custom .chart-detail-name").html(data[0].name);
    $(".modal-custom .chart-detail-desc").html(data[0].desc);
    $(".modal-custom .chart-detail-source").html("Source: " + data[0].sourcename);

if(isTrend)
{ $(".modal-custom .chart-detail-mini").html("<div class='mt-2 font-weight-bold'>2018 Data</div>");

    $(".modal-custom .chart-detail").attr("id", chartId + "-detail");
    $(".modal-custom .chart-detail-mini").attr("id", chartId + "-detail-mini");
}
else
{
    $(".modal-custom .chart-detail-mini").attr("id", chartId + "-detail");
    $(".modal-custom .chart-detail").attr("id", chartId + "-detail-mini");
}
    //var item = $("#sample-last").clone();


 //$("#chart-container").append($(item).html());
              

    // $('.modal-custom').modal({
    //     "backdrop": false
    // });

    makeChart(data, chartId + "-detail", 1, line_color, "");

 lastestChart(data, chartId + "-detail-mini" , 2018, line_color);

    $("body").addClass("detail-opened");



}

function swap_charts()
{
    show_detail
    // var mini = $(".chart-detail-mini").html();

    // $(".chart-detail-mini").html("").append($(".chart-detail").html()) 
    // $(".chart-detail").html("").append(mini) 
}

// $('#detail-modal').on('hidden.bs.modal', function () {

// })

/* //////  Search & Filter  ////// */


//Category checkbox checking

$(document).on("click", ".check-category-all", function () {

    $('input.check-category:checkbox').prop('checked', this.checked);
    filterItems();

});


$(document).on("keyup", ".input-thin", function () {

    this.value = this.value.replace(/[^0-9\.]/g, '');

    filterItems();

});


$(document).on("click", ".check-category", function () {

    filterItems();
});

//Trend checkbox checking

$(document).on("click", ".check-trend-all", function () {

    $('input.check-trend:checkbox').prop('checked', this.checked);
    filterItems();

});

$(document).on("click", ".check-trend", function () {

    filterItems();
});

//Comparison checkbox checking

$(document).on("click", ".check-diff", function () {

    filterItems();
});



function filterCategory(val) {
    $("#chart-container .chart-cont:visible").filter(function () {
        $(this).toggle($(this).find("span.item-cat").text().indexOf(val) > -1)
    });
}


function filterItems() {

    var filterArr = [];


    //set all items visible
    $("#chart-container .chart-cont").show();

    var search_term = $("#input_search").val().toLowerCase();

    $("#chart-container .chart-cont:visible").filter(function () {
        $(this).toggle($(this).text().toLowerCase().indexOf(search_term) > -1)
    });


    $('input.check-category:checkbox:checked').each(function () {
        filterArr.push($(this).val());
    });



    $("#chart-container .chart-cont:visible").filter(function () {
        $(this).toggle(jQuery.inArray($(this).find("span.item-cat").text(), filterArr) > -1)
    });



    // filter trend
    filterArr = [];

    $('input.check-trend:checkbox:checked').each(function () {
        filterArr.push($(this).val());
    });

    // var min_trend
    // var max_trend

    // if (filterArr.includes("-10")) max_trend = -10;
    // if (filterArr.includes("-")) max_trend = 0;
    // if (filterArr.includes("+")) max_trend = 100000000000;
    // if (filterArr.includes("+10")) max_trend = 10000000000;

    // if (filterArr.includes("+10")) min_trend = 10;
    // if (filterArr.includes("+")) min_trend = 0;
    // if (filterArr.includes("-")) min_trend = -100000000000;
    // if (filterArr.includes("-10")) min_trend = -10000000000;

    if (filterArr.includes("+")) {
        var val = $("#input-increase").val();

        $("#chart-container .chart-cont:visible").filter(function () {
            $(this).toggle(Number($(this).find("span.item-trend").text()) >= val)
        });
    }

    if (filterArr.includes("-")) {
        var val = $("#input-decrease").val();

        $("#chart-container .chart-cont:visible").filter(function () {
            $(this).toggle(Number($(this).find("span.item-trend").text()) <= val)
        });

    }

    // $("#chart-container .chart-cont:visible").filter(function () {
    //     $(this).toggle(Number($(this).find("span.item-trend").text()).between(min_trend, max_trend))
    // });




    // filter difference
    filterArr = [];

    $('input.check-diff:checkbox:checked').each(function () {
        filterArr.push($(this).val());
        //console.log($(this).val());
    });


    // console.log(filterArr);

    var min_diff
    var max_diff



    if (filterArr.includes("-5")) {

        max_diff = -5;

        $("#chart-container .chart-cont:visible").filter(function () {
            $(this).toggle(Number($(this).find("span.item-diff").text()).between(-5, 5))
        });

    }

    if (filterArr.includes("5-10")) {

        max_diff = -5;

        $("#chart-container .chart-cont:visible").filter(function () {
            $(this).toggle(Number($(this).find("span.item-diff").text()).between(5, 10))
        });

        // $("#chart-container .chart-cont:visible").filter(function () {
        //     $(this).toggle(Number($(this).find("span.item-diff").text()).between(-5, -10))
        // });
    }


    if (filterArr.includes("10-20")) {

        max_diff = -5;

        $("#chart-container .chart-cont:visible").filter(function () {
            $(this).toggle(Number($(this).find("span.item-diff").text()).between(10, 20))
        });

        // $("#chart-container .chart-cont:visible").filter(function () {
        //     $(this).toggle(Number($(this).find("span.item-diff").text()).between(10, 20))
        // });
    }


    if (filterArr.includes("+20")) {

        max_diff = -5;

        $("#chart-container .chart-cont:visible").filter(function () {
            $(this).toggle(Number($(this).find("span.item-diff").text()) > 20)
        });

        // $("#chart-container .chart-cont:visible").filter(function () {
        //     $(this).toggle(Number($(this).find("span.item-diff").text()) < -20)
        // });
    }




    if (filterArr.includes("surpassed")) {

        $("#chart-container .chart-cont:visible").filter(function () {
            $(this).toggle($(this).find("span.item-surpassed").text().indexOf('1') > -1)
        });
    }

    if (filterArr.includes("below")) {

        $("#chart-container .chart-cont:visible").filter(function () {
            $(this).toggle($(this).find("span.item-below").text().indexOf('1') > -1)
        });
    }



}

$(document).ready(function () {


    $(".modal-custom .close").click(function () {
        $("body").removeClass("detail-opened");
        $(".detail-pop").removeClass("active");
    });

    $("#input_search").on("keyup", function () {

        console.log("search");
        filterItems();
    });


    /* //////  filter year range slider   ////// */
    $("#date-range").ionRangeSlider({
        type: "round",
        grid: false,
        values: [2008, 2009, 2010, 2011, 2012, 2012, 2013, 2014, 2015, 2016, 2017, 2018],
        prettify: function (n) {
            return Number(n);
        },
        onFinish: function (data) {

            fromYear = Number(data.from_value);
            toYear = Number(data.to_value);

            $("#chart-container").empty();
            readCsvFile(Number(data.from_value), Number(data.to_value), chartType);

        }
    });

    $(".sidebar").niceScroll('.auto-height', {
        cursorwidth: "7px",
        cursorcolor: "#b6b6b6",
        autohidemode: false
    });

});

function loadFilter() {

    $('#filter-categories').empty();

    $('#filter-categories')
        .append('<li><label class="checkbox " title="All"><input type="checkbox" checked class="check-category-all" value="All"> All</label></li>');


    $.each(categories, function (index, value) {

        $('#filter-categories')
            .append('<li><label class="checkbox" title="' + value + '"><input type="checkbox" checked class="check-category" value="' + value + '"> ' + value + '</label></li>');
    });




    Number.prototype.between = function (a, b) {
        var min = Math.min.apply(Math, [a, b]),
            max = Math.max.apply(Math, [a, b]);
        return this > min && this < max;
    };



}

$(document).on('click', '.navbar-menu', function (e) {
    $("body").toggleClass("closed");

    setTimeout(function () {
        $(".sidebar").getNiceScroll().resize();
    }, 500);

});

$(document).on('click', '.sidebar a', function (e) {
    if ($("body").hasClass("closed")) $("body").removeClass("closed");

    setTimeout(function () {
        $(".sidebar").getNiceScroll().resize();
    }, 500);

});

$(document).on('click', '.top-menu-btn', function (e) {
    $(".top-menu-dropdown").toggleClass("d-none");
});
// $(document).on('click', '.reset-filter', function (e) {

//     $('input:checkbox').prop('checked', false);

//     $('input.check-category-all:checkbox').prop('checked', true);
//     $('input.check-category:checkbox').prop('checked', true);
//     // $('input.check-trend-all:checkbox').prop('checked', true);
//     // $('input.check-trend:checkbox').prop('checked', true);

//     // var instance = $("#date-range").data("ionRangeSlider");
//     // instance.update({
//     //     from: Number(2008),
//     //     to: Number(2018)

//     // });
// });

// Clearable input, for search textbox 

Array.prototype.forEach.call(document.querySelectorAll('.clearable-input'), function (el) {
    var input = el.querySelector('input');

    conditionallyHideClearIcon();
    input.addEventListener('input', conditionallyHideClearIcon);
    el.querySelector('[data-clear-input]').addEventListener('click', function (e) {
        input.value = '';
        conditionallyHideClearIcon();
    });

    function conditionallyHideClearIcon(e) {
        var target = (e && e.target) || input;
        target.nextElementSibling.style.display = target.value ? 'block' : 'none';
    }
});


/* //////  Switch Button   ////// */
$(document).on('change', '#inp_switcher', function (e) {


    if ($(this).prop('checked')) {

        chartType = 1;
        $("#chart-container").empty();
        readCsvFile(fromYear, toYear, chartType);

    } else {

        chartType = 0;
        $("#chart-container").empty();
        readCsvFile(fromYear, toYear, chartType);

    }

    $("#trend-cont").toggleClass("d-none");
    $("#outliers-cont").toggleClass("d-none");
    $("#time-cont").toggleClass("d-none");
});