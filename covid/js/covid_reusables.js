function line_chart() {
    //REUSABLE line chart

    var width=0,
        height=0,
        start_x=0,
        start_y=0,
        my_data = [],
    my_class="";


    function my(svg) {

        //set scales
        var x_scale_extent = d3.extent(my_data[0].deaths, d => new Date(d.date));
        var x_scale = d3.scaleTime().domain(x_scale_extent).range([0,width]);
        var y_scale_max = d3.max(my_data, d => d3.max(d.confirmed_cases, m => m.count));
        var y_scale = d3.scaleLinear().domain([0,y_scale_max]).range([height-start_y,0]);
        var area_types = ["deaths","recovered","remainder"];

        //set non-data dependent items
        if(d3.select(".search_icon" + my_class)._groups[0][0] === null) {
            svg.append("text").attr("class","search_item fa search_icon" + my_class);
            svg.append("text").attr("class","breadcrumb_text" + my_class);
            svg.append("g").attr("class",'axis x_axis' + my_class);
            svg.append("g").attr("class",'axis y_axis' + my_class);
            svg.append("foreignObject").attr("class","search_item foreignobj").append("xhtml:body")
                .attr("class","input_div input_div" + my_class);
            svg.append("text").attr("class","area_legend area_text explanation");
            for(a in area_types){
                svg.append("text").attr("class","area_legend area_text area_text" + area_types[a]);
                svg.append("rect").attr("class","area_legend area_rect area_rect" + area_types[a]);
            }
        };

        d3.select(".explanation")
            .attr("visibility","hidden")
            .attr("x", - width)
            .attr("y",height + (start_y*2)-30)
            .text("");

        //first area legend
        var area_x = 0;
        for(a in area_types){
            d3.select(".area_rect" + area_types[a])
                .attr("visibility","hidden")
                .attr("x",area_x)
                .attr("y",start_y - 45)
                .attr("width",15)
                .attr("height",10)
                .attr("fill",covid.area_colours[area_types[a]]);

            d3.select(".area_text" + area_types[a])
                .attr("visibility","hidden")
                .attr("id","t_" + area_types[a])
                .attr("x",area_x + 20)
                .attr("y",start_y - 35)
                .text(area_types[a]);

            var my_text = document.getElementById("t_" + area_types[a]).getBoundingClientRect();
            area_x = my_text.right + 5;
        }
        d3.selectAll(".area_legend")
            .attr("transform","translate(" + (width-area_x + (start_x*3)-15) + ",0)")

        //then breadcrumb text
        d3.select(".breadcrumb_text" + my_class)
            .attr("x",start_x)
            .attr("y", start_y - 37)
            .text("Home")
            .on("mouseover",function(d){
                var my_text = d3.select(this).text().split(" > ");
                if(my_text.length > 1){
                   d3.select(this).attr("cursor","pointer");
                }
            })
            .on("mouseout",function(d){
                d3.select(this).attr("cursor","default");
            })
            .on("click",function(d){
                unhighlight_line();
                covid.search_results = false;
                d3.select("#search_country").node().value = "";
                //resets text and redraws line (if zooming)
                var my_text = d3.select(this).text().split(" > ");
                if(my_text.length === 1){
                    //nothing to do
                } else {
                    if(my_text.length === 2){
                        covid.previous_data = my_data;
                        covid.previous_type = "all";
                        d3.selectAll(".search_item").attr("visibility","hidden");
                    }
                    my_text.splice(my_text.length-1,1);
                    d3.select(this).text(my_text.join(" > "));
                    draw_line(covid.previous_data,covid.previous_type);
                    draw_area(covid.previous_data,covid.previous_type);
                }
            })

        //then search input
        d3.select(".search_icon" + my_class)
            .attr("visibility","hidden")
            .attr("font-size","20px")
            .text("\uf002")
            .attr("transform","translate(" + (start_x + (width/2)-27) + "," + (start_y-35)  + ")");

        d3.select(".input_div" + my_class)
            .attr("y",-40)
            .html("<input type=text id=search_country placeholder='Type a Location' />")
            .on("input", function(d, i){
                var my_val = d3.select("#search_country").node().value.toLowerCase();
                if(my_val.length > 1){
                    var matching = covid.current_data.filter(d => d.region.toLowerCase().includes(my_val)
                        || d.state.toLowerCase().includes(my_val));
                        if(matching.length > 0){
                            covid.search_results = true;
                            unhighlight_line();
                            d3.selectAll(".country_line")
                                .transition()
                                .duration(1000)
                                .attr("visibility","hidden");

                            d3.selectAll(".country_label")
                                .transition()
                                .duration(1000)
                                .attr("visibility","hidden");
                        for(m in matching){
                            highlight_line(matching[m],"","",covid.line_colours.search_results,matching.length);
                        }
                    } else {
                        covid.search_results = false;
                        unhighlight_line();
                    }
                } else {
                    covid.search_results = false;
                    unhighlight_line();
                }
                //now do something..
            });

        d3.select(".foreignobj")
            .attr("visibility","hidden")
            .attr("x",start_x + (width/2))
            .attr("y",start_y-53)
            .attr("width",160)
            .attr("height",28)

        //then x axis.
        d3.select(".x_axis" + my_class)
            .call(d3.axisBottom(x_scale).tickSizeOuter(0).ticks(d3.timeMonday).tickFormat(d3.timeFormat("%b %d")))
            .attr("transform","translate(" + start_x + "," + (height) + ")");

        //now define line and areas
        var line = d3.line()
            .defined(d => +d.count > 0)
            .x(d => x_scale(new Date(d.date)))
            .y(d => y_scale(d.count));

        var area_deaths = d3.area()
            .x(d => x_scale(new Date(d.date)))
            .y0(d => y_scale(d.deaths))
            .y1(d => y_scale(0));

        var area_recovered = d3.area()
            .x(d => x_scale(new Date(d.date)))
            .y0(d => y_scale(d.recovered + d.deaths))
            .y1(d => y_scale(0));

        var area_remainder = d3.area()
            .x(d => x_scale(new Date(d.date)))
            .y0(d => y_scale(d.confirmed))
            .y1(d => y_scale(0));

        //set previous data and draw line and areas
        covid.previous_data = my_data;
        covid.previous_type = "all";
        //draw initial line
        draw_line(my_data,"all");
        draw_area(my_data,"all");

        function draw_line(line_data,line_type){
            covid.current_data = line_data;
            //set y scales and redraw y axis
            y_scale_max = d3.max(line_data, d => d3.max(d.confirmed_cases, m => m.count));
            y_scale.domain([0,y_scale_max]);

            d3.select(".y_axis" + my_class)
                .call(d3.axisLeft(y_scale).tickSizeOuter(0).ticks("4",".0s"))
                .attr("transform","translate(" + start_x + "," + start_y  + ")");

            //define line group
            var my_group = svg.selectAll(".line_group" + my_class)
                .data(line_data, (d,i) => i + line_type);
            //exit remove
            my_group.exit().remove();
            //enter
            var enter = my_group.enter()
                .append("g")
                .attr("id", d => "group_" + d.region.toLowerCase().replace(/ /g,''))
                .attr("class","line_group" + my_class);
            //append
            enter.append("path").attr("class","country_line");
            enter.append("path").attr("class","mouseover_line");
            enter.append("text").attr("class","country_label");

            //merge
            my_group = my_group.merge(enter);

            //mouseover line
            my_group.select(".mouseover_line")
                .attr("d",d => line(d.confirmed_cases))
                .attr("stroke-width",4)
                .attr("stroke","transparent")
                .attr("transform","translate(" + start_x + "," + start_y  + ")")
                .on("mouseover",function(d,i,paths){
                    //highlight if search isn't activated
                    if(covid.search_results === false){
                        highlight_line(d,i,paths);
                    }
                })
                .on("mouseout",function(d,i,paths){
                    //unhighlight if search isn't activated
                    if(covid.search_results === false){
                        unhighlight_line(d,i,paths);
                    }
                })
                .on("click",function(d){
                    //click action if search isn't activated
                    if(d.children !== undefined  && covid.search_results === false){
                        d3.selectAll(".search_item").attr("visibility","visible");
                        var breadcrumb =   d3.select(".breadcrumb_text" + my_class).text();
                        //reset breadcrumb, previous data and draw line and area
                        covid.previous_data = line_data;
                        covid.previous_type = line_type;
                        d3.select(".breadcrumb_text" + my_class)
                            .text(breadcrumb + " > " + d.region);
                        draw_line(d.children,d.region.replace(/ /g,''));
                        draw_area(d.children,d.region.replace(/ /g,''));
                    }
                });

            my_group.select(".country_line")
                .attr("id",d => "country_line" + get_id(d))
                .attr("d",d => line(d.confirmed_cases))
                .attr("stroke-width",d => d.children === undefined ? 1 : 2)
                .attr("stroke",get_line_stroke)
                .attr("transform","translate(" + start_x + "," + start_y  + ")");

            my_group.select(".country_label")
                .attr("visibility",d => d.show_label === false ? "hidden" : "visible")
                .attr("id",d => "country_label" + get_id(d))
                .attr("x",x_scale.range()[1] + 5)
                .attr("y", d => y_scale(d.confirmed_cases[d.confirmed_cases.length-1].count))
                .text(d => d.state !== "" ? d.state + " , " + d.region.replace("Mainland ","")
                    : d.region.replace("Mainland ",""))
                .attr("transform","translate(" + start_x + "," + start_y  + ")")
                .on("mouseover",function(d,i,paths){
                    if(covid.search_results === false){
                        highlight_line(d,i,paths);
                    }
                })
                .on("mouseout",function(d,i,paths){
                    if(covid.search_results === false){
                        unhighlight_line(d,i,paths);
                    }
                })

            //raise us line..
            d3.select("#group_us").raise();

        }

        function draw_area(area_data, line_type){
            
            //define line group
            var my_group = svg.selectAll(".area_group" + my_class)
                .data(area_data, (d,i) => i + line_type);
            //exit remove
            my_group.exit().remove();
            //enter
            var enter = my_group.enter()
                .append("g")
                .attr("class","area_group" + my_class);
            //append
            enter.append("path").attr("class","country_area country_recovered");
            enter.append("path").attr("class","country_area country_remainder");
            enter.append("path").attr("class","country_area country_deaths");

            //merge
            my_group = my_group.merge(enter);

            //mouseover line
            my_group.select(".country_deaths")
                .attr("pointer-events","none")
                .attr("id",d => "deaths_" + get_id(d))
                .attr("visibility","hidden")
                .attr("d",d => area_deaths(d.area_data))
                .attr("stroke","transparent")
                .attr("fill",covid.area_colours.deaths)
                .attr("transform","translate(" + start_x + "," + start_y  + ")");

            my_group.select(".country_recovered")
                .attr("pointer-events","none")
                .attr("id",d => "deaths_" + get_id(d))
                .attr("visibility","hidden")
                .attr("d",d => area_recovered(d.area_data))
                .attr("stroke","transparent")
                .attr("fill",covid.area_colours.recovered)
                .attr("fill-opacity",0.3)
                .attr("transform","translate(" + start_x + "," + start_y  + ")");

            my_group.select(".country_remainder")
                .attr("pointer-events","none")
                .attr("id",d => "deaths_" + get_id(d))
                .attr("visibility","hidden")
                .attr("d",d => area_remainder(d.area_data))
                .attr("stroke","transparent")
                .attr("fill",covid.area_colours.remainder)
                .attr("fill-opacity",0.3)
                .attr("transform","translate(" + start_x + "," + start_y  + ")");
        }


        function get_line_stroke(d){
            return  d.children === undefined ? covid.line_colours.leaf :
                (d.region === "Rest of China" ? covid.line_colours.zoomable2 : covid.line_colours.zoomable)

        }
        function highlight_line(d,i,objects,my_stroke,match_count){


            if(my_stroke === undefined  || match_count === 1){
                //only hide lines and show area if there is one or standard highlight
                d3.select(objects[i]).attr("cursor","pointer");

                d3.selectAll(".country_line")
                    .transition()
                    .duration(1000)
                    .attr("visibility","hidden");

                d3.selectAll(".country_label")
                    .transition()
                    .duration(1000)
                    .attr("visibility","hidden");

                d3.selectAll("#deaths_" + get_id(d))
                    .transition()
                    .duration(1000)
                    .attr("visibility","visible");

                d3.selectAll(".area_legend")
                    .transition()
                    .duration(1000)
                    .attr("visibility","visible");

                draw_panels(d);
            }

            d3.select("#country_line" + get_id(d))
                .transition()
                .duration(1000)
                .attr("stroke", my_stroke === undefined ? get_line_stroke(d) : my_stroke)
                .attr("visibility","visible")
                .attr("stroke-width",4);

            d3.selectAll("#country_label" + get_id(d))
                .transition()
                .duration(500)
                .attr("visibility","visible");
        }

        function get_id(d){

            //id for each line and label - spaces and certain characters not allowed by browser removed
            return remove_characters(d.state) + "_" +
                remove_characters(d.region);

            function remove_characters(my_str){
                my_str = my_str.toLowerCase();
                my_str = my_str.replace(/ /g, '');
                my_str = my_str.replace(/,/g, '');
                my_str = my_str.replace('(', '');
                my_str = my_str.replace(')', '');
                return my_str;
            }
        }

        function unhighlight_line(d,i,objects){
            if(d !== undefined){
                d3.select(objects[i]).attr("cursor","default");
            }

            d3.selectAll(".country_line")
                .attr("stroke",get_line_stroke)
                .attr("stroke-width",d => d.children === undefined ? 1 : 2)
                .transition().duration(500)
                .attr("visibility","visible");

            d3.selectAll(".country_label").transition().duration(500).attr("visibility",d => d.show_label === false ? "hidden" : "visible")
            d3.selectAll(".country_area").transition().duration(500).attr("visibility","hidden");
            d3.selectAll(".area_legend").transition().duration(500).attr("visibility","hidden");
        }

        function draw_panels(d,my_index){

            //on mouseover, resets panel data and draws..
            d3.selectAll(".panel_group" + my_class);

            var panel_width = (width - 40)/5;
            var panel_data = [
                {"id":0, "label": "total confirmed cases","value":d3.max(d.confirmed_cases, m => m.count), "format":","},
                {"id":1, "label": "total recovered cases","value":d3.max(d.recovered, m => m.count),"format":","},
                {"id":2, "label": "total deaths","value":d3.max(d.deaths, m => m.count),"format":","},
                {"id":3, "label": "(last 7 days) new case every","value":get_newcase_value(d),"format":"none"},
                {"id":4, "label": "recovery rate","value":d3.max(d.recovered, m => m.count)/d3.max(d.confirmed_cases, m => m.count),"format":".1%"}
            ]

            function get_newcase_value(d){
                var seven_days_ago = d3.timeDay.offset(x_scale.domain()[1],-7);

                var seven_days_ago_count = d.confirmed_cases.find(f => String(new Date(f.date)) === String(seven_days_ago));
                var total_cases = d3.max(d.confirmed_cases, s => +s.count);
                var my_val = 7/(total_cases - seven_days_ago_count.count);
                var my_format = d3.format(".1f");
                if(my_val < 0.04){
                    return my_format(my_val * 24 * 60) + " minutes";
                } else if (my_val < 1){
                    return my_format(my_val * 24) + " hours";
                } else {
                    return my_format(my_val) + " days";
                }

            }
            var my_group = svg.selectAll(".panel_group" + my_class)
                .data(panel_data, d => d.id + my_index);
            //exit remove
            my_group.exit().remove();
            //enter
            var enter = my_group.enter()
                .append("g")
                .attr("class","panel_group" + my_class)
                .attr("transform","translate(" + start_x + "," + ((start_y/2)+height) + ")");
            //append
            enter.append("rect").attr("class","panel_item background_rect");
            enter.append("rect").attr("class","panel_item label_rect");
            enter.append("text").attr("class","panel_item panel_label");
            enter.append("text").attr("class","panel_item panel_result");

            //merge
            my_group = my_group.merge(enter);

            d3.selectAll(".panel_item")
                .attr("opacity","0")
                .transition()
                .delay(200)
                .duration(1000)
                .attr("opacity","1");

            my_group.select(".background_rect")
                .attr("fill",covid.panel_colours.background)
                .attr("x", (d,i) => (panel_width+10) * (+i))
                .attr("y", 10)
                .attr("width",panel_width)
                .attr("height",50);

            my_group.select(".label_rect")
                .attr("fill",covid.panel_colours.label_background)
                .attr("x", (d,i) => (panel_width+10) * (+i))
                .attr("y", 10)
                .attr("width",panel_width)
                .attr("height",20);

            my_group.select(".panel_label")
                .attr("fill",covid.panel_colours.value_text)
                .attr("x", (d,i) => ((panel_width+10) * (+i)) + panel_width/2)
                .attr("y", 25)
                .text(d => d.label)

            my_group.select(".panel_result")
                .attr("x", (d,i) => ((panel_width+10) * (+i)) + panel_width/2)
                .attr("y", 50)
                .text(d => d.format === "none" ? d.value : d3.format(d.format)(d.value))


        };
    };


    my.width = function(value) {
        if (!arguments.length) return width;
        width = value;
        return my;
    };

    my.height = function(value) {
        if (!arguments.length) return height;
        height = value;
        return my;
    };

    my.start_x = function(value) {
        if (!arguments.length) return start_x;
        start_x = value;
        return my;
    };

    my.start_y = function(value) {
        if (!arguments.length) return start_y;
        start_y = value;
        return my;
    };

    my.my_data = function(value) {
        if (!arguments.length) return my_data;
        my_data = value;
        return my;
    };

    my.my_class = function(value) {
        if (!arguments.length) return my_class;
        my_class = value;
        return my;
    };
    return my;
}
