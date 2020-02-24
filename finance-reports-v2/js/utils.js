function initAnnualChange() {
    var o = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRjdY0QUXVQNaBKemtTE2dZ_4_jHEP0VvbXfamCT3gunQYJZ-xeiSPUEy3EIXo6fgEpzAmlDbGwUu8T/pub?output=csv",
        i = 4,
        t = 6,
        s = 2,
        h = 7,
        c = "Item",
        l = "Trend",
        e = 0,
        r = "Utility Tax Revenue",
        u = "0f0",
        f = "f00",
        n = new URL(window.location.href);
  
    o = n.searchParams.get("f");
    i = n.searchParams.get("c");
    t = n.searchParams.get("p");
    s = n.searchParams.get("i");
    h = n.searchParams.get("d");
    c = n.searchParams.get("itmhd");
    l = n.searchParams.get("trnhd");
    e = n.searchParams.get("catid");
    r = n.searchParams.get("catval");
    u = n.searchParams.get("pdbclr");
    f = n.searchParams.get("ndbclr");

    d3.select("#table thead").html("<tr><th>" + c + "<\/th><th style='width:200px'>" + l + "<\/th><\/tr>");
    d3.csv(o).then(function (n) {

    //d3.csv("https://cors-anywhere.herokuapp.com/" + o, function(n) {
        var l, c, o, a;
        e > 0 && r != null && r != "" && (l = n.columns, n = n.filter(function(t) {
            return t[n.columns[e - 1]] == r
        }), n.columns = l);
        c = [];
        n.forEach(function(r) {
            var u = {
                name: r[n.columns[s - 1]],
                c: parseFloat(r[n.columns[i - 1]].replace(/,/g, "")),
                p: parseFloat(r[n.columns[t - 1]].replace(/,/g, "")),
                change: (r[n.columns[i - 1]].replace(/,/g, "") - r[n.columns[t - 1]].replace(/,/g, "")) * 100 / r[n.columns[t - 1]].replace(/,/g, ""),
                trend: r[n.columns[h - 1]]
            };
            u.change = Math.round(u.change * 10) / 10;
            c.push(u)
        });
        o = d3.select("#table").append("div").attr("class", "tooltip").style("display", "none");
        a = d3.select("#table tbody");
        c.forEach(function(r) {
            var c = a.append("tr"),
                e = "<td>" + r.name + "<\/td>",
                h = !0,
                s;
            isNaN(r.change) ? e += "<td>-<\/td>" : (e += "<td style='width:200px'>", r.trend == "High" && r.change < 0 || r.trend == "Low" && r.change > 0 ? (h = !1, e += "<div>", e += "<div style='width:" + (Math.min(Math.abs(r.change) / 100, 1) * 45 + 5) + "px;background-image:linear-gradient(to right,white,#" + f + ")'><\/div>", e += "<span>" + r.change + "%<\/span>", e += "<\/div>") : e += "<div><\/div>", r.trend == "High" && r.change > 0 || r.trend == "Low" && r.change < 0 ? (h = !0, e += "<div>", e += "<div style='width:" + (Math.min(Math.abs(r.change) / 100, 1) * 45 + 5) + "px;background-image:linear-gradient(to right,#" + u + ",white)'><\/div>", e += "<span>" + r.change + "%<\/span>", e += "<\/div>") : e += "<div><\/div>", e += "<\/td>");
            c.html(e);
            s = "";
            s += "<p>" + r.name + "<\/p>";
            s += "<p>" + n.columns[i - 1] + "<span>$" + r.c.toLocaleString() + "<\/span><\/p>";
            s += "<p>" + n.columns[t - 1] + "<span>$" + r.p.toLocaleString() + "<\/span><\/p>";
            s += "<p style='background:#" + (h ? u : f) + "'>Change<span>$" + (r.c - r.p).toLocaleString() + " (" + r.change + "%)<\/span><\/p>";
            c.on("mouseover", function() {
                o.style("border", "1px solid #" + (h ? u : f));
                o.html(s).style("display", null)
            }).on("mousemove", function() {
                var n = d3.mouse(d3.select("#table").node());
                o.style("left", n[0] + 20 + "px").style("top", n[1] + "px")
            }).on("mouseout", function() {
                o.style("display", "none")
            })
        })
    })
}

function initDetailedMonthly() {
    var s = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRjdY0QUXVQNaBKemtTE2dZ_4_jHEP0VvbXfamCT3gunQYJZ-xeiSPUEy3EIXo6fgEpzAmlDbGwUu8T/pub?output=csv",
        u = 4,
        f = 3,
        e = 6,
        o = 5,
        h = 2,
        t = 1,
        c = "Current",
        l = "Previous",
        i = "00aaff",
        r = "ccffcc",
        a = "default",
        n = new URL(window.location.href);

    s = n.searchParams.get("f");
    u = n.searchParams.get("cma");
    f = n.searchParams.get("cmp");
    e = n.searchParams.get("cma-prev");
    o = n.searchParams.get("cmp-prev");
    h = n.searchParams.get("i");
    t = n.searchParams.get("v");
    c = n.searchParams.get("clbl");
    l = n.searchParams.get("plbl");
    i = n.searchParams.get("bclr");
    r = n.searchParams.get("hclr");
    a = n.searchParams.get("view");

    a == "bar" && (d3.select("#graphDraw").style("width", "100%"), d3.select("#graphDrawLegends").style("width", "100%"), d3.select("#graphNumber").style("display", "none"));
    d3.selectAll("#graphDrawLegends span").each(function(n, t) {
        t == 1 && d3.select(this).style("background", "#" + i)
    });
    d3.csv(s).then(function (n) {
    //d3.csv("https://cors-anywhere.herokuapp.com/" + s, function(n) {
        var s = {
                name: n[t - 1][n.columns[h - 1]],
                cma: parseFloat(n[t - 1][n.columns[u - 1]].replace(/,/g, "")),
                cmp: parseFloat(n[t - 1][n.columns[f - 1]].replace(/,/g, "")),
                cmaPrev: parseFloat(n[t - 1][n.columns[e - 1]].replace(/,/g, "")),
                cmpPrev: parseFloat(n[t - 1][n.columns[o - 1]].replace(/,/g, ""))
            },
            g, a, w, nt, tt;
        s.cm = Math.round(s.cma * 1e3 / s.cmp) / 10;
        s.cmPrev = Math.round(s.cmaPrev * 1e3 / s.cmpPrev) / 10;
        s.change = s.cma - s.cmaPrev;
        s.change2 = Math.round((s.cma - s.cmaPrev) * 1e3 / s.cmaPrev) / 10;
        var b = "",
            k = "";
        b += "<p style='background:#" + r + "'>" + n.columns[f - 1] + ": <span>$" + s.cmp.toLocaleString() + "<\/span><\/p>";
        b += "<p>" + n.columns[u - 1] + ": <span>$" + s.cma.toLocaleString() + "<\/span><\/p>";
        b += "<p>% of Projection achieved: <span>" + s.cm + "%<\/span><\/p>";
        k += "<p style='background:#" + r + "'>" + n.columns[o - 1] + ": <span>$" + s.cmpPrev.toLocaleString() + "<\/span><\/p>";
        k += "<p>" + n.columns[e - 1] + ": <span>$" + s.cmaPrev.toLocaleString() + "<\/span><\/p>";
        k += "<p>% of Projection achieved: <span>" + s.cmPrev + "%<\/span><\/p>";
        d3.select("#graphNumber").html(b + k + "");
        var d = d3.select("#graphDraw"),
            y = d.node().getBoundingClientRect(),
            it = d.append("svg").attr("width", y.width).attr("height", y.height),
            p = it.append("g").attr("transform", "translate(50,20)"),
            v = d3.scaleLinear().range([y.height - 60, 0]);
        v.domain([0, d3.max([s.cma, s.cmp, s.cmaPrev, s.cmpPrev])]).nice();
        p.append("g").call(d3.axisLeft(v).ticks(4, "$s"));
        g = d3.scaleLinear().range([0, y.width - 80]);
        g.domain([0, 1]);
        p.append("g").attr("class", "axis-x").attr("transform", "translate(0," + (y.height - 60) + ")").call(d3.axisBottom(g));
        a = (y.width - 70) / 3;
        p.append("text").attr("class", "axis-x-label").attr("x", a / 3 + a / 2).attr("y", y.height - 60).attr("dy", "1.4em").text(c);
        p.append("text").attr("class", "axis-x-label").attr("x", a * 2 / 3 + a * 3 / 2).attr("y", y.height - 60).attr("dy", "1.4em").text(l);
        w = d.append("div").attr("class", "tooltip").style("border", "1px solid #" + r).style("display", "none");
        s.cma <= s.cmp ? (nt = p.append("rect").attr("class", "rect1").attr("x", a / 3).attr("y", v(s.cmp)).attr("width", a).attr("height", y.height - 60 - v(s.cmp)), p.append("rect").attr("class", "rect2").attr("x", a / 3).attr("y", v(s.cma)).attr("width", a).attr("height", y.height - 60 - v(s.cma)).style("fill", "#" + i).style("stroke-opacity", .4).style("pointer-events", "none")) : (nt = p.append("rect").attr("class", "rect2").attr("x", a / 3).attr("y", v(s.cma)).attr("width", a).attr("height", y.height - 60 - v(s.cma)).style("fill", "#" + i), p.append("rect").attr("class", "rect1").attr("x", a / 3).attr("y", v(s.cmp)).attr("width", a).attr("height", y.height - 60 - v(s.cmp)).style("stroke-opacity", .4).style("pointer-events", "none"));
        nt.on("mouseover", function() {
            w.html(b).style("display", null)
        }).on("mousemove", function() {
            w.style("left", d3.mouse(this)[0] + 60 + "px").style("top", d3.mouse(this)[1] + 20 + "px")
        }).on("mouseout", function() {
            w.style("display", "none")
        });
        s.cmaPrev <= s.cmpPrev ? (tt = p.append("rect").attr("class", "rect1").attr("x", a * 5 / 3).attr("y", v(s.cmpPrev)).attr("width", a).attr("height", y.height - 60 - v(s.cmpPrev)), p.append("rect").attr("class", "rect2").attr("x", a * 5 / 3).attr("y", v(s.cmaPrev)).attr("width", a).attr("height", y.height - 60 - v(s.cmaPrev)).style("fill", "#" + i).style("stroke-opacity", .4).style("pointer-events", "none")) : (tt = p.append("rect").attr("class", "rect2").attr("x", a * 5 / 3).attr("y", v(s.cmaPrev)).attr("width", a).attr("height", y.height - 60 - v(s.cmaPrev)).style("fill", "#" + i), p.append("rect").attr("class", "rect1").attr("x", a * 5 / 3).attr("y", v(s.cmpPrev)).attr("width", a).attr("height", y.height - 60 - v(s.cmpPrev)).style("stroke-opacity", .4).style("pointer-events", "none"));
        tt.on("mouseover", function() {
            w.html(k).style("display", null)
        }).on("mousemove", function() {
            w.style("left", d3.mouse(this)[0] + 60 + "px").style("top", d3.mouse(this)[1] + 20 + "px")
        }).on("mouseout", function() {
            w.style("display", "none")
        })
    })
}

function initOperatingBudget() {
    function r(t, i, r) {
        var u = $("#graphLegends");
        u.html("");
        n.length > 0 && u.append("<p>[Root]<\/p>");
        n.forEach(function(n, t) {
            u.append("<p data-level='" + t + "'>" + n.html + "<\/p>");
            u.append("<div><\/div>");
            u = u.find("div")
        });
        t.forEach(function(f) {
            u.prepend("<p data-level='" + n.length + "'><span style='background:" + r[(i == 0 ? t.length - 1 - f.index : f.index) % r.length] + "'><\/span>" + f.key + "<\/p>")
        })
    }

    function u(t) {
        var u = "<th>Fiscal Year<\/t><th>" + (n.length == 0 ? "Service" : n.length == 1 ? "Department" : n.length == 2 ? "Program" : "Expense Category") + "<\/t><th>Amount<\/t><th>% in Year<\/t>",
            i = "",
            r;
        if (t.stack && t.stackPercent)
            for (r = t.years[0]; r <= t.years[1]; r++) t.keys.forEach(function(n) {
                var u = t.stack.filter(function(t) {
                        return t.key == n
                    })[0][r - t.years[0]].data[n],
                    f = t.stackPercent.filter(function(t) {
                        return t.key == n
                    })[0][r - t.years[0]].data[n];
                u > 0 && (i += "<tr>", i += "<td>" + r + "<\/td>", i += "<td>" + n + "<\/td>", i += "<td>$" + Math.round(u).toLocaleString() + "<\/td>", i += "<td>" + Math.round(f * 100) / 100 + "%<\/td>", i += "<\/tr>")
            });
        else t.pie.forEach(function(n) {
            i += "<tr>";
            i += "<td>" + t.years[0] + "<\/td>";
            i += "<td>" + n.key + "<\/td>";
            i += "<td>$" + Math.round(n.value).toLocaleString() + "<\/td>";
            i += "<td>" + Math.round(n.percent * 100) / 100 + "%<\/td>";
            i += "<\/tr>"
        });
        $("#table thead").html(u);
        $("#table tbody").html(i)
    }

    function o(n, t) {
        var s = d3.select("#graphDraw"),
            a = s.node().getBoundingClientRect(),
            i = {
                top: 20,
                right: 30,
                bottom: 30,
                left: 90
            },
            v = a.width - i.left - i.right,
            h = a.height - i.top - i.bottom;
        s.html("");
        var c = d3.scaleLinear().range([0, v]),
            e = d3.scaleLinear().range([h, 0]),
            f = t == 0 ? n.stack : n.stackPercent;
        c.domain(n.years);
        e.domain([0, d3.max(f[f.length - 1], function(n) {
            return n[1]
        })]).nice();
        var y = d3.area().x(function(n) {
                return c(n.data.year)
            }).y0(function(n) {
                return e(n[0])
            }).y1(function(n) {
                return e(n[1])
            }),
            l = d3.schemeCategory20,
            p = s.append("svg").attr("width", v + i.left + i.right).attr("height", h + i.top + i.bottom),
            o = p.append("g").attr("transform", "translate(" + i.left + "," + i.top + ")").style("opacity", 0);
        o.selectAll(".layer").data(f).enter().append("g").attr("class", "layer").append("path").attr("d", y).style("fill", function(n) {
            return l[(f.length - 1 - n.index) % l.length]
        });
        o.append("g").attr("class", "x axis").attr("transform", "translate(0," + h + ")").call(d3.axisBottom(c).tickValues(d3.range(n.years[0], n.years[1] + 1)).tickFormat(function(n) {
            return n
        }));
        o.append("g").attr("class", "y axis").call(d3.axisLeft(e).ticks(5).tickFormat(function(n) {
            return t == 0 ? "$" + n.toLocaleString() : n + "%"
        }));
        o.transition().duration(500).style("opacity", 1);
        r(f, 0, l);
        u(n)
    }

    function s(n, t) {
        var c = d3.select("#graphDraw"),
            v = c.node().getBoundingClientRect(),
            i = {
                top: 20,
                right: 20,
                bottom: 30,
                left: 90
            },
            y = v.width - i.left - i.right,
            l = v.height - i.top - i.bottom,
            s;
        c.html("");
        var o = d3.scaleBand().range([0, y]).padding(.3),
            f = d3.scaleLinear().range([l, 0]),
            e = t == 0 ? n.stack : n.stackPercent,
            p = [];
        for (s = n.years[0]; s <= n.years[1]; s++) p.push(s);
        o.domain(p);
        f.domain([0, d3.max(e[e.length - 1], function(n) {
            return n[1]
        })]).nice();
        var a = d3.schemeCategory20,
            w = c.append("svg").attr("width", y + i.left + i.right).attr("height", l + i.top + i.bottom),
            h = w.append("g").attr("transform", "translate(" + i.left + "," + i.top + ")").style("opacity", 0),
            b = h.selectAll(".layer").data(e).enter().append("g").attr("class", "layer");
        b.each(function(n) {
            d3.select(this).selectAll("rect").data(n).enter().append("rect").attr("x", function(n) {
                return o(n.data.year)
            }).attr("y", function(n) {
                return f(n[1])
            }).attr("width", o.bandwidth()).attr("height", function(n) {
                return f(n[0]) - f(n[1])
            }).style("fill", a[(e.length - 1 - n.index) % a.length])
        });
        h.append("g").attr("class", "x axis").attr("transform", "translate(0," + l + ")").call(d3.axisBottom(o).tickFormat(function(n) {
            return n
        }));
        h.append("g").attr("class", "y axis").call(d3.axisLeft(f).ticks(5).tickFormat(function(n) {
            return t == 0 ? "$" + n.toLocaleString() : n + "%"
        }));
        h.transition().duration(500).style("opacity", 1);
        r(e, 0, a);
        u(n)
    }

    function h(n, t) {
        var s = d3.select("#graphDraw"),
            l = s.node().getBoundingClientRect(),
            i = {
                top: 20,
                right: 50,
                bottom: 30,
                left: 200
            },
            a = l.width - i.left - i.right,
            h = l.height - i.top - i.bottom,
            f, e;
        s.html("");
        f = d3.scaleBand().range([0, h]).padding(.3);
        e = d3.scaleLinear().range([0, a]);
        f.domain(n.keys);
        e.domain([0, d3.max(n.pie, function(n) {
            return t == 0 ? n.value : n.percent
        })]).nice();
        var c = d3.schemeCategory20,
            v = s.append("svg").attr("width", a + i.left + i.right).attr("height", h + i.top + i.bottom),
            o = v.append("g").attr("transform", "translate(" + i.left + "," + i.top + ")").style("opacity", 0);
        o.selectAll("rect").data(n.pie).enter().append("rect").attr("x", 0).attr("y", function(n) {
            return f(n.key)
        }).attr("width", function(n) {
            return e(t == 0 ? n.value : n.percent)
        }).attr("height", f.bandwidth()).style("fill", function(n) {
            return c[n.index % c.length]
        });
        o.append("g").attr("class", "x axis").call(d3.axisLeft(f));
        o.append("g").attr("class", "y axis").attr("transform", "translate(0," + h + ")").call(d3.axisBottom(e).ticks(5).tickFormat(function(n) {
            return t == 0 ? "$" + n.toLocaleString() : n + "%"
        }));
        o.transition().duration(500).style("opacity", 1);
        r(n.pie, 1, c);
        u(n)
    }

    function c(n) {
        var i = d3.select("#graphDraw"),
            t = i.node().getBoundingClientRect(),
            s = Math.min(t.width / 2, t.height / 2) - 20;
        i.html("");
        var h = d3.arc().innerRadius(0).outerRadius(s),
            f = d3.schemeCategory20,
            c = i.append("svg").attr("width", t.width).attr("height", t.height),
            o = c.append("g").attr("transform", "translate(" + t.width / 2 + "," + t.height / 2 + ")").style("opacity", 0),
            e = 0;
        n.pie.forEach(function(n) {
            var t = n.percent * Math.PI / 50;
            o.append("path").datum(n).attr("d", h({
                startAngle: e,
                endAngle: e + t
            })).style("fill", f[n.index % f.length]);
            e += t
        });
        o.transition().duration(500).style("opacity", 1);
        r(n.pie, 1, f);
        u(n)
    }

    function f() {
        var c = $("#btnChartTypes .active").attr("data-id"),
            f = [parseInt($("#btnChartYears select[data-id=f]").val()), parseInt($("#btnChartYears select[data-id=t]").val())],
            l = c == "p" || f[1] == f[0],
            r, o, i, u, s, h;
        c == "p" && (f[1] = f[0]);
        r = e.filter(function(n) {
            return n["Fiscal Year"] >= f[0] && n["Fiscal Year"] <= f[1]
        });
        o = "Service";
        n.length > 0 && (r = r.filter(function(t) {
            return t.Service == n[0].value
        }), o = "Department");
        n.length > 1 && (r = r.filter(function(t) {
            return t.Department == n[1].value
        }), o = "Program");
        n.length > 2 && (r = r.filter(function(t) {
            return t.Program == n[2].value
        }), o = "Expense Category");
        i = [];
        u = [];
        r.forEach(function(n) {
            var r = n[o],
                f, t;
            r != "" && (i.indexOf(r) < 0 && i.push(r), f = n["Fiscal Year"], t = u.filter(function(n) {
                return n.year == f
            }), t.length == 0 ? (t = {
                year: f,
                total: 0
            }, u.push(t)) : t = t[0], t[r] ? t[r] += n["Approved Amount"] : t[r] = n["Approved Amount"], t.total += n["Approved Amount"])
        });
        i.sort();
        s = [];
        u.forEach(function(n) {
            var t = {
                year: n.year
            };
            s.push(t);
            i.forEach(function(i) {
                n[i] || (n[i] = 0);
                t[i] = n[i] * 100 / n.total
            })
        });
        t = {
            keys: i,
            years: d3.extent(u, function(n) {
                return n.year
            }),
            filters: n
        };
        l ? (t.pie = [], i.forEach(function(n, i) {
            t.pie.push({
                key: n,
                index: i,
                value: u[0][n],
                percent: Math.round(s[0][n] * 100) / 100
            })
        })) : (i.reverse(), h = d3.stack().keys(i).order(d3.stackOrderNone).offset(d3.stackOffsetNone), t.stack = h(u), t.stackPercent = h(s), t.stackPercent.forEach(function(n) {
            n.forEach(function(n) {
                n[0] = Math.round(n[0] * 100) / 100;
                n[1] = Math.round(n[1] * 100) / 100
            })
        }));
        console.log(t)
    }

    function i() {
        var r = $("#btnChartTypes .active").attr("data-id"),
            n = $("#btnChartBase .active").attr("data-id") == "c" ? 0 : 1,
            i;
        r == "a" ? o(t, n) : r == "b" ? (i = [parseInt($("#btnChartYears select[data-id=f]").val()), parseInt($("#btnChartYears select[data-id=t]").val())], i[1] > i[0] ? s(t, n) : h(t, n)) : c(t)
    }
    var e, t, n = [];
    d3.csv("test.csv", function(t) {
        var r, u;
        for (t.forEach(function(n) {
                n["Fiscal Year"] = parseInt(n["Fiscal Year"]);
                n["Approved Amount"] = parseFloat(n["Approved Amount"].replace(/,/g, ""))
            }), e = t.filter(function(n) {
                return n["Approved Amount"] > 0
            }), r = d3.extent(e, function(n) {
                return n["Fiscal Year"]
            }), u = r[0]; u <= r[1]; u++) $("#btnChartYears select").append("<option>" + u + "<\/option>");
        $("#btnChartBase button").click(function() {
            var n = $(this);
            n.hasClass("active") || ($("#btnChartBase .active").removeClass("active"), n.addClass("active"), i())
        });
        $("#btnChartTypes button").click(function() {
            var n = $(this),
                t;
            n.hasClass("active") || (t = $("#btnChartTypes .active").attr("data-id"), $("#btnChartTypes .active").removeClass("active"), n.addClass("active"), n.attr("data-id") == "p" ? ($("#btnChartBase").hide(), $("#btnChartYears select:eq(1)").hide(), $("#btnChartYears span").hide()) : ($("#btnChartBase").show(), $("#btnChartYears select:eq(1)").show(), $("#btnChartYears span").show()), (n.attr("data-id") == "p" || t == "p") && f(), i())
        });
        $("#btnChartYears select").change(function() {
            var n = $(this),
                r = parseInt(n.val()),
                t;
            n.attr("data-id") == "f" && $("#btnChartYears select:eq(1) option").each(function() {
                parseInt($(this).html()) < r ? $(this).attr("disabled", "disabled") : $(this).removeAttr("disabled")
            });
            n.attr("data-id") == "t" && $("#btnChartYears select:eq(0) option").each(function() {
                parseInt($(this).html()) > r ? $(this).attr("disabled", "disabled") : $(this).removeAttr("disabled")
            });
            t = [parseInt($("#btnChartYears select[data-id=f]").val()), parseInt($("#btnChartYears select[data-id=t]").val())];
            t[1] == t[0] && $("#btnChartTypes .active").attr("data-id") == "a" && ($("#btnChartTypes .active").removeClass("active"), $("#btnChartTypes button[data-id=b]").addClass("active"));
            f();
            i()
        });
        $("#graphLegends").on("click", "p", function() {
            var t = $(this),
                r = t.attr("data-level");
            if (!(r >= 3)) {
                if (n = [], r != null)
                    while (t.parent().length > 0) {
                        if (n.unshift({
                                value: t.text(),
                                html: t.html()
                            }), t.parent().attr("id") != null) break;
                        t = t.parent().parent().children("p[data-level]")
                    }
                f();
                i()
            }
        });
        $("#btnChartYears select:eq(1)").val(r[1]);
        f();
        i()
    })
}