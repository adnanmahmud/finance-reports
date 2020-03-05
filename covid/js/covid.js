function draw_chart(my_data,div_id) {
    //draw svg and chart
    draw_svg(div_id);
    draw_line_chart(my_data,div_id);
};

function draw_line_chart(my_data,div_id){

    //draw chart
    var svg = d3.select("." + div_id + "_svg");
    var width = +svg.attr("width");
    var height = +svg.attr("height");
    var margins = 100;

    var my_chart = line_chart().width(width - (margins*3))
        .height(height - (margins*2))
        .start_x(margins)
        .start_y(margins)
        .my_class("covid_line_chart")
        .my_data(my_data)


    my_chart(svg);
};


function draw_svg(div_id){

    //draw svg - responsive to container div.
    var chart_div = document.getElementById(div_id);
    var width = chart_div.clientWidth;
    var height = chart_div.clientHeight;

    if(d3.select("." + div_id + "_svg")._groups[0][0] === null){
        var svg = d3.select("#" + div_id)
            .append("svg")
            .attr("class",div_id + "_svg")
            .attr("width",width)
            .attr("height",height);

    } else {
        var svg = d3.select("." + div_id + "_svg");
    }
    return svg;
}
