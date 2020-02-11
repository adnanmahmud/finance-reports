(function() {
  const colors = ["#119eb9", "#fc8d62", "#66c2a5", "#e78ac3", "#e5c494"];

  const tooltip = initTooltip();
  //// Process data
  Promise.all([
    d3.csv("data/MA Hospital  FY14-18 Indicators.csv"),
    d3.csv("data/MA top 15 Discharges Final.csv"),
    d3.csv("data/MA FY18 Discharges by Location.csv")
  ])
    .then(([financialData, drgData, locationData]) => {
      // All hospitals in the data
      const allHospitals = [...new Set(financialData.map(d => d.Name))];

      // Financial data
      // Filter out margin indicators
      financialData = financialData.filter(
        d => !d.Indicator.endsWith("Margin")
      );
      financialData.forEach(d => (d.Value = +d.Value));
      const allYears = [
        ...new Set(financialData.map(d => d["Fiscal Year"]))
      ].sort();
      const financialDataByHospitalByIndicator = d3.group(
        financialData,
        d => d.Name,
        d => d.Indicator
      );
      for (let financialDataByIndicator of financialDataByHospitalByIndicator.values()) {
        for (let data of financialDataByIndicator.values()) {
          const baseValue = data.find(d => d["Fiscal Year"] === allYears[0])
            .Value;
          data.forEach(d => (d.Change = (d.Value - baseValue) / baseValue));
        }
      }

      // DRG data
      drgData.forEach(d => (d["DRG Discharges"] = +d["DRG Discharges"]));
      drgData = drgData.filter(d => d["DRG Discharges"] > 0);
      const drgDataByDRG = d3.group(drgData, d => d["DRG Name"]);
      for (let [drg, data] of drgDataByDRG) {
        const sorted = data.sort((a, b) =>
          d3.descending(a["DRG Discharges"], b["DRG Discharges"])
        );
        sorted.forEach((d, i) => (d.Rank = i + 1));
        drgDataByDRG.set(drg, sorted);
      }
      const drgByHospital = d3.rollup(
        drgData,
        v => v.map(d => d["DRG Name"]).sort(),
        d => d.Name
      );

      // Location data
      locationData.forEach(
        d =>
          (d[
            "Hospital Specific Discharges From a ZIP Code                     (A)"
          ] = +d[
            "Hospital Specific Discharges From a ZIP Code                     (A)"
          ])
      );
      const locationDataBy = {};
      const locationByHospital = {};
      processLocationData("Zip Code", "Zip Code");
      processLocationData("City", "Full City and State");
      processLocationData("County", "County");
      function processLocationData(key, columnName) {
        locationDataBy[key] = d3.rollup(
          locationData,
          v => {
            const locationDataByKey = d3.rollup(
              v,
              w =>
                d3.sum(
                  w,
                  e =>
                    e[
                      "Hospital Specific Discharges From a ZIP Code                     (A)"
                    ]
                ),
              v => v.Hospital
            );
            const sorted = [];
            for (let [hospital, value] of locationDataByKey) {
              sorted.push({
                Name: hospital,
                Discharges: value
              });
            }
            sorted.sort((a, b) => d3.descending(a.Discharges, b.Discharges));
            sorted.forEach((d, i) => (d.Rank = i + 1));
            return sorted;
          },
          d => d[columnName]
        );

        locationByHospital[key] = d3.rollup(
          locationData,
          v => [...new Set(v.map(d => d[columnName]))].sort(),
          d => d.Hospital
        );
      }

      $(".menu .item").tab();
      $("#target-hospital-select").dropdown({
        values: allHospitals.map(d => ({ name: d, value: d })),
        placeholder: "Select one",
        onChange: value => {
          if (!value) return;
          if (d3.select(".bottom-container").style("display") === "none") {
            d3.select(".bottom-container").style("display", "block");
          }
          $("#target-hospital-select input").blur();
          updateFinancialPerformanceTab(
            value,
            financialDataByHospitalByIndicator,
            allHospitals,
            allYears
          );
          updateDRGAnalysisTab(value, drgDataByDRG, drgByHospital);
          updateLocationAnalysisTab(value, locationDataBy, locationByHospital);
        }
      });
    })
    .catch(error => {
      console.error(error);
    });

  //// Financial performance
  function updateFinancialPerformanceTab(
    targetHospital,
    data,
    allHospitals,
    allYears
  ) {
    // Setup
    let selected = new Set();
    const allIndicators = [...data.get(targetHospital).keys()];
    let svgWidth, width;
    const svgHeight = 240;
    const margin = {
      top: 10,
      right: 60,
      bottom: 20,
      left: 60
    };
    const height = svgHeight - margin.top - margin.bottom;
    const strokeWidth = 3;

    const x = d3.scalePoint().domain(allYears);
    const y = d3.local();
    const color = d3.scaleOrdinal().range(colors);
    const line = d3.local();

    // Init
    const tab = d3.select("#financial-performance");
    updateDimension();
    tab.html(`
      <div class="ui form">
        <div class="inline field">
          <label>Compare hospitals</label>
          <div class="ui search multiple selection dropdown">
            <div class="text"></div>
            <i class="dropdown icon"></i>
          </div>
        </div>
      </div>
      <div class="chart-section"></div>
    `);

    tab
      .select(".chart-section")
      .selectAll(".chart")
      .data(allIndicators)
      .join("div")
      .attr("class", "chart")
      .call(chart =>
        chart
          .append("h3")
          .attr("class", "chart-title ui header")
          .text(d => `Change in ${d}`)
      )
      .call(chart =>
        chart
          .append("svg")
          .attr("class", "chart-svg")
          .attr("width", svgWidth)
          .attr("height", svgHeight)
          .append("g")
          .attr("transform", `translate(${margin.left},${margin.top})`)
          .call(g => g.append("g").attr("class", "x axis"))
          .call(g => g.append("g").attr("class", "y axis"))
          .call(g => g.append("g").attr("class", "lines"))
          .call(g => g.append("g").attr("class", "labels"))
          .call(g => g.append("g").attr("class", "focus"))
      );

    $("#financial-performance .dropdown")
      .dropdown({
        values: allHospitals.map(d => ({ name: d, value: d })),
        maxSelections: 5,
        onAdd: value => {
          if (!selected.has(value)) {
            selected.add(value);
            updateChart();
          }
        },
        onRemove: value => {
          if (selected.has(value)) {
            selected.delete(value);
            updateChart();
          }
        }
      })
      .dropdown("set selected", targetHospital);

    // Update chart
    function updateChart() {
      let selectedYear;

      tab.selectAll(".chart-svg").each(function(indicator) {
        const lineData = [];
        for (let hospital of selected) {
          const hospitalData = data.get(hospital);
          if (hospitalData.has(indicator)) {
            lineData.push({
              key: hospital,
              value: hospitalData.get(indicator)
            });
          }
        }
        lineData.reverse();

        color.domain([...selected]);
        tab
          .selectAll(".multiple.dropdown .ui.label")
          .data(color.domain())
          .style("background", d => color(d));

        const yMin = d3.min(lineData, d => d3.min(d.value, d => d.Change));
        const yMax = d3.max(lineData, d => d3.max(d.value, d => d.Change));
        const ty = y.set(
          this,
          d3
            .scaleLinear()
            .domain([yMin, yMax])
            .range([height, 0])
        );
        const tline = line.set(
          this,
          d3
            .line()
            .x(d => x(d["Fiscal Year"]))
            .y(d => ty(d.Change))
            .curve(d3.curveCatmullRom)
        );

        const svg = d3
          .select(this)
          .on("mousemove", function() {
            const mx = d3.mouse(this)[0];
            const bisect = d3.bisector(d => x(d)).left;
            const i = bisect(allYears, mx, 1);
            const a = allYears[i - 1];
            const b = allYears[i];
            const year = mx - x(a) > x(b) - mx ? b : a;
            if (year !== selectedYear) {
              selectedYear = year;
              const tooltipData = lineData
                .reduce((tooltipData, d) => {
                  const yearData = d.value.find(e => e["Fiscal Year"] === year);
                  if (yearData) {
                    tooltipData.push(yearData);
                  }
                  return tooltipData;
                }, [])
                .sort((a, b) => d3.descending(a.Change, b.Change))
                .map(d => ({
                  hospital: d.Name,
                  value: d.Value,
                  change: d.Change
                }));
              svg
                .select(".focus")
                .style("display", "inline")
                .selectAll(".focus-circle")
                .style("display", d =>
                  d.value.find(e => e["Fiscal Year"] === year)
                    ? "inline"
                    : "none"
                )
                .attr("cx", d => {
                  const e = d.value.find(e => e["Fiscal Year"] === year);
                  return e ? x(e["Fiscal Year"]) : 0;
                })
                .attr("cy", d => {
                  const e = d.value.find(e => e["Fiscal Year"] === year);
                  return e ? ty(e.Change) : 0;
                });

              let content = "<table><tbody>";
              tooltipData.forEach(d => {
                content += `
                  <tr style="color: ${color(d.hospital)}">
                    <td colspan="2">${d.hospital}</td>
                  </tr>
                  <tr style="color: ${color(d.hospital)}">
                    <td>${year}</td>
                    <td style="text-align:right">${d3.format("$,.2s")(
                      d.value
                    )}</td>
                  </tr>
                  <tr style="color: ${color(d.hospital)}">
                    <td>Since ${allYears[0]}</td>
                    <td style="text-align:right">${d3.format("+,.0%")(
                      d.change
                    )}</td>
                  </tr>
                `;
              });
              content += "</tbody></table>";

              svg
                .select(".focus")
                .selectAll(".focus-circle")
                .filter(d => d.key === tooltipData[0].hospital)
                .each(function() {
                  const { x, y, width, height } = this.getBoundingClientRect();
                  tooltip.show(content, x + width / 2, y + height / 2);
                });
            }
          })
          .on("mouseleave", () => {
            selectedYear = null;
            svg.select(".focus").style("display", "none");
            tooltip.hide();
          });
        svg
          .select(".x.axis")
          .attr("transform", `translate(0,${ty(0)})`)
          .call(d3.axisBottom(x).tickSizeOuter(0));
        svg.select(".y.axis").call(
          d3
            .axisLeft(ty)
            .ticks(4, ",%")
            .tickSizeOuter(0)
            .tickPadding(9)
        );
        svg
          .select(".lines")
          .selectAll(".line")
          .data(lineData, d => d.key)
          .join("path")
          .attr("class", "line")
          .attr("fill", "none")
          .attr("stroke", d => color(d.key))
          .attr("stroke-width", strokeWidth)
          .attr("d", d => tline(d.value));
        svg
          .select(".labels")
          .selectAll("text")
          .data(lineData, d => d.key)
          .join("text")
          .attr("dy", "0.31em")
          .attr("x", d => x(d.value[d.value.length - 1]["Fiscal Year"]) + 12)
          .attr("y", d => ty(d.value[d.value.length - 1].Change))
          .attr("fill", d => color(d.key))
          .text(d => d3.format("+,.0%")(d.value[d.value.length - 1].Change));
        svg
          .select(".focus")
          .style("display", "none")
          .selectAll(".focus-circle")
          .data(lineData, d => d.key)
          .join("circle")
          .attr("class", "focus-circle")
          .attr("fill", "#fff")
          .attr("stroke", d => color(d.key))
          .attr("stroke-width", strokeWidth)
          .attr("r", strokeWidth * 2);
      });
    }

    // Resize
    function updateDimension() {
      svgWidth = d3.select("#tab-menu").node().clientWidth;
      width = svgWidth - margin.left - margin.right;
      x.range([0, width]);
    }

    window.addEventListener("resize", function() {
      updateDimension();
      tab.selectAll(".chart-svg").each(function() {
        const tline = line.get(this);
        const svg = d3.select(this).attr("width", svgWidth);
        svg.select(".x.axis").call(d3.axisBottom(x).tickSizeOuter(0));
        svg
          .select(".lines")
          .selectAll(".line")
          .attr("d", d => tline(d.value));
        svg
          .select(".labels")
          .selectAll("text")
          .attr("x", d => x(d.value[d.value.length - 1]["Fiscal Year"]) + 12);
      });
    });
  }

  //// DRG Analysis
  function updateDRGAnalysisTab(targetHospital, data, drgByHospital) {
    // Setup
    let selected = new Set();
    const allDRGs = drgByHospital.get(targetHospital);
    const tab = d3.select("#drg-analysis");
    if (!allDRGs) {
      tab.selectAll("*").remove();
      return;
    }
    const allHospitals = [
      ...allDRGs.reduce((hospitalSet, drg) => {
        data
          .get(drg)
          .map(d => d.Name)
          .forEach(hospital => hospitalSet.add(hospital));
        return hospitalSet;
      }, new Set())
    ].sort();

    let svgWidth, width;
    const radius = 8;
    const margin = {
      top: 25,
      right: 10,
      bottom: 20,
      left: 10
    };
    const height = (radius + 4) * 2;
    const svgHeight = height + margin.top + margin.bottom;

    const x = d3.local();
    const color = d3
      .scaleOrdinal()
      .range(colors)
      .unknown("#000");

    // Init
    updateDimension();
    tab.html(`
      <div class="ui form">
        <div class="inline field">
          <label>Compare hospitals</label>
          <div class="ui search multiple selection dropdown">
            <div class="text"></div>
            <i class="dropdown icon"></i>
          </div>
        </div>
      </div>
      <div class="chart-section"></div>
    `);

    tab
      .select(".chart-section")
      .selectAll(".chart")
      .data(allDRGs)
      .join("div")
      .attr("class", "chart")
      .call(chart =>
        chart
          .append("h3")
          .attr("class", "chart-title ui header")
          .text(d => d)
      )
      .call(chart =>
        chart
          .append("svg")
          .attr("class", "chart-svg")
          .attr("width", svgWidth)
          .attr("height", svgHeight)
          .append("g")
          .attr("transform", `translate(${margin.left},${margin.top})`)
          .call(g => g.append("g").attr("class", "x axis"))
          .call(g => g.append("g").attr("class", "circles"))
          .call(g => g.append("g").attr("class", "ranks"))
      );

    $("#drg-analysis .dropdown")
      .dropdown({
        values: allHospitals.map(d => ({ name: d, value: d })),
        maxSelections: 5,
        onAdd: value => {
          if (!selected.has(value)) {
            selected.add(value);
            updateChart();
          }
        },
        onRemove: value => {
          if (selected.has(value)) {
            selected.delete(value);
            updateChart();
          }
        }
      })
      .dropdown("set selected", targetHospital);

    // Update chart
    function updateChart() {
      tab.selectAll(".chart-svg").each(function(drg) {
        const circleData = data.get(drg);
        const circleOrder = [
          circleData.map(d => d.Name).filter(d => !selected.has(d))
        ].concat([...selected].reverse());

        color.domain([...selected]);
        tab
          .selectAll(".multiple.dropdown .ui.label")
          .data(color.domain())
          .style("background", d => color(d));

        const xMin = d3.min(circleData, d => d["DRG Discharges"]);
        const xMax = d3.max(circleData, d => d["DRG Discharges"]);
        const tx = x.set(
          this,
          d3
            .scaleLinear()
            .domain([xMin, xMax])
            .range([0, width])
        );

        const svg = d3.select(this);
        svg
          .select(".x.axis")
          .attr("transform", `translate(0,${height / 2})`)
          .call(
            d3
              .axisBottom(tx)
              .tickSizeOuter(0)
              .tickPadding(height / 2)
              .ticks(5)
          );
        svg
          .select(".circles")
          .selectAll(".circle")
          .data(circleData, d => d.Name)
          .join("circle")
          .attr("class", "circle")
          .attr("fill", d => color(d.Name))
          .attr("fill-opacity", d => (selected.has(d.Name) ? 1 : 0.1))
          .attr("r", radius)
          .attr("cx", d => tx(d["DRG Discharges"]))
          .attr("cy", height / 2)
          .sort((a, b) =>
            d3.ascending(
              circleOrder.indexOf(a.Name),
              circleOrder.indexOf(b.Name)
            )
          )
          .on("mouseenter", function(d) {
            const content = `
              <div style="color:${color(d.Name)}">
                <div>${d.Name}</div>
                <div>${d3.format(",")(d["DRG Discharges"])}</div>
                <div>${d.Rank}<sup>${getOrdinal(d.Rank)}</sup></div>
              </div>
            `;
            const { x, y, width, height } = this.getBoundingClientRect();
            tooltip.show(content, x + width / 2, y + height / 2);
          })
          .on("mouseleave", tooltip.hide);
        svg
          .select(".ranks")
          .selectAll("text")
          .data(circleData.filter(d => d.Name === targetHospital))
          .join(enter =>
            enter
              .append("text")
              .attr("text-anchor", "middle")
              .attr("y", -6)
              .attr("fill", color(targetHospital))
              .call(text =>
                text.append("tspan").attr("class", "rank-value-base")
              )
              .call(text =>
                text
                  .append("tspan")
                  .attr("class", "rank-value-super")
                  .attr("baseline-shift", "super")
              )
          )
          .attr("x", d => tx(d["DRG Discharges"]))
          .call(text => text.select(".rank-value-base").text(d => d.Rank))
          .call(text =>
            text.select(".rank-value-super").text(d => getOrdinal(d.Rank))
          );
      });
    }

    // Resize
    function updateDimension() {
      svgWidth = d3.select("#tab-menu").node().clientWidth;
      width = svgWidth - margin.left - margin.right;
    }

    window.addEventListener("resize", function() {
      updateDimension();
      tab.selectAll(".chart-svg").each(function() {
        const tx = x.get(this).range([0, width]);
        const svg = d3.select(this).attr("width", svgWidth);
        svg.select(".x.axis").call(
          d3
            .axisBottom(tx)
            .tickSizeOuter(0)
            .tickPadding(height / 2)
            .ticks(5)
        );
        svg
          .select(".circles")
          .selectAll(".circle")
          .attr("cx", d => tx(d["DRG Discharges"]));
        svg
          .select(".ranks")
          .selectAll("text")
          .attr("x", d => tx(d["DRG Discharges"]));
      });
    });
  }

  //// Location Analysis
  function updateLocationAnalysisTab(targetHospital, data, locationByHospital) {
    // Setup
    let selected = new Set();
    let selectedLocationType;
    const tab = d3.select("#location-analysis");
    tab.html(`
      <div class="ui form">
        <div class="inline fields" id="location-radio-checkbox">
          <div class="field">
            <div class="ui radio checkbox">
              <input type="radio" name="location-type" tabindex="0" class="hidden" value="Zip Code" checked>
              <label>Zip Code</label>
            </div>
          </div>
          <div class="field">
            <div class="ui radio checkbox">
              <input type="radio" name="location-type" tabindex="0" class="hidden" value="City">
              <label>City</label>
            </div>
          </div>
          <div class="field">
            <div class="ui radio checkbox">
              <input type="radio" name="location-type" tabindex="0" class="hidden" value="County">
              <label>County</label>
            </div>
          </div>
        </div>
        <div class="inline field hospital-select">
          <label>Compare hospitals</label>
          <div class="ui search multiple selection dropdown">
            <div class="text"></div>
            <i class="dropdown icon"></i>
          </div>
        </div>
      </div>
      <div class="chart-section"></div>
    `);

    let svgWidth, width;
    const radius = 8;
    const margin = {
      top: 25,
      right: 10,
      bottom: 20,
      left: 10
    };
    const height = (radius + 4) * 2;
    const svgHeight = height + margin.top + margin.bottom;

    const x = d3.local();
    const color = d3
      .scaleOrdinal()
      .range(colors)
      .unknown("#000");
    updateDimension();

    $("#location-radio-checkbox .ui.radio.checkbox").checkbox({
      fireOnInit: true,
      onChange: function() {
        const checked = $(
          "input[name=location-type]:checked",
          "#location-radio-checkbox"
        ).val();
        if (checked === selectedLocationType) return;
        selectedLocationType = checked;

        const allLocations = locationByHospital[selectedLocationType].get(
          targetHospital
        );
        tab
          .select(".chart-section")
          .selectAll("*")
          .remove();
        if (!allLocations) {
          tab.select(".hospital-select").style("display", "none");
          return;
        } else {
          tab.select(".hospital-select").style("display", "flex");
          const allHospitals = [
            ...allLocations.reduce((hospitalSet, location) => {
              data[selectedLocationType]
                .get(location)
                .map(d => d.Name)
                .forEach(hospital => hospitalSet.add(hospital));
              return hospitalSet;
            }, new Set())
          ].sort();
          init(allLocations, allHospitals);
        }
      }
    });

    // Init
    function init(allLocations, allHospitals) {
      tab
        .select(".chart-section")
        .selectAll(".chart")
        .data(allLocations)
        .join("div")
        .attr("class", "chart")
        .call(chart =>
          chart
            .append("h3")
            .attr("class", "chart-title ui header")
            .text(d => d)
        )
        .call(chart =>
          chart
            .append("svg")
            .attr("class", "chart-svg")
            .attr("width", svgWidth)
            .attr("height", svgHeight)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`)
            .call(g => g.append("g").attr("class", "x axis"))
            .call(g => g.append("g").attr("class", "circles"))
            .call(g => g.append("g").attr("class", "ranks"))
        );

      // Remove hospitals that are selected but no longer in the new location type
      for (let hospital of selected) {
        if (!allHospitals.includes(hospital)) {
          selected.delete(hospital);
        }
      }
      if (selected.size === 0) {
        $("#location-analysis .dropdown")
          .dropdown({
            values: allHospitals.map(d => ({ name: d, value: d })),
            maxSelections: 5,
            onAdd: value => {
              if (!selected.has(value)) {
                selected.add(value);
                updateChart();
              }
            },
            onRemove: value => {
              if (selected.has(value)) {
                selected.delete(value);
                updateChart();
              }
            }
          })
          .dropdown("set selected", targetHospital);
      } else {
        $("#location-analysis .dropdown").dropdown("setup menu", {
          values: allHospitals.map(d => ({ name: d, value: d }))
        });
        $("#location-analysis .dropdown").dropdown("set exactly", [
          ...selected
        ]);
      }
    }

    // Update chart
    function updateChart() {
      tab.selectAll(".chart-svg").each(function(location) {
        const circleData = data[selectedLocationType].get(location);
        const circleOrder = [
          circleData.map(d => d.Name).filter(d => !selected.has(d))
        ].concat([...selected].reverse());

        color.domain([...selected]);
        tab
          .selectAll(".multiple.dropdown .ui.label")
          .data(color.domain())
          .style("background", d => color(d));

        const xMin = d3.min(circleData, d => d.Discharges);
        const xMax = d3.max(circleData, d => d.Discharges);
        const tx = x.set(
          this,
          d3
            .scaleLinear()
            .domain([xMin, xMax])
            .range([0, width])
        );

        const svg = d3.select(this);
        svg
          .select(".x.axis")
          .attr("transform", `translate(0,${height / 2})`)
          .call(
            d3
              .axisBottom(tx)
              .tickSizeOuter(0)
              .tickPadding(height / 2)
              .ticks(5)
          );
        svg
          .select(".circles")
          .selectAll(".circle")
          .data(circleData, d => d.Name)
          .join("circle")
          .attr("class", "circle")
          .attr("fill", d => color(d.Name))
          .attr("fill-opacity", d => (selected.has(d.Name) ? 1 : 0.1))
          .attr("r", radius)
          .attr("cx", d => tx(d.Discharges))
          .attr("cy", height / 2)
          .sort((a, b) =>
            d3.ascending(
              circleOrder.indexOf(a.Name),
              circleOrder.indexOf(b.Name)
            )
          )
          .on("mouseenter", function(d) {
            const content = `
              <div style="color:${color(d.Name)}">
                <div>${d.Name}</div>
                <div>${d3.format(",")(d.Discharges)}</div>
                <div>${d.Rank}<sup>${getOrdinal(d.Rank)}</sup></div>
              </div>
            `;
            const { x, y, width, height } = this.getBoundingClientRect();
            tooltip.show(content, x + width / 2, y + height / 2);
          })
          .on("mouseleave", tooltip.hide);
        svg
          .select(".ranks")
          .selectAll("text")
          .data(circleData.filter(d => d.Name === targetHospital))
          .join(enter =>
            enter
              .append("text")
              .attr("text-anchor", "middle")
              .attr("y", -6)
              .attr("fill", color(targetHospital))
              .call(text =>
                text.append("tspan").attr("class", "rank-value-base")
              )
              .call(text =>
                text
                  .append("tspan")
                  .attr("class", "rank-value-super")
                  .attr("baseline-shift", "super")
              )
          )
          .attr("x", d => tx(d.Discharges))
          .call(text => text.select(".rank-value-base").text(d => d.Rank))
          .call(text =>
            text.select(".rank-value-super").text(d => getOrdinal(d.Rank))
          );
      });
    }

    // Resize
    function updateDimension() {
      svgWidth = d3.select("#tab-menu").node().clientWidth;
      width = svgWidth - margin.left - margin.right;
    }

    window.addEventListener("resize", function() {
      updateDimension();
      tab.selectAll(".chart-svg").each(function() {
        const tx = x.get(this).range([0, width]);
        const svg = d3.select(this).attr("width", svgWidth);
        svg.select(".x.axis").call(
          d3
            .axisBottom(tx)
            .tickSizeOuter(0)
            .tickPadding(height / 2)
            .ticks(5)
        );
        svg
          .select(".circles")
          .selectAll(".circle")
          .attr("cx", d => tx(d.Discharges));
        svg
          .select(".ranks")
          .selectAll("text")
          .attr("x", d => tx(d.Discharges));
      });
    });
  }

  //// Tooltip
  function initTooltip() {
    const tooltip = d3
      .select("body")
      .append("div")
      .attr("class", "chart-tooltip")
      .style("display", "none");
    let tooltipBox;

    function show(content, x, y) {
      tooltip.html(content).style("display", "block");
      tooltipBox = tooltip.node().getBoundingClientRect();
      if (x || y) {
        move(x, y);
      }
    }

    function hide() {
      tooltip.style("display", "none");
    }

    function move(x, y) {
      const padding = 8;
      let left = x + padding;
      if (left + tooltipBox.width > window.innerWidth) {
        left = x - padding - tooltipBox.width;
      }
      if (left < 0) {
        left = 0;
      }
      let top = y + padding;
      if (top + tooltipBox.height > window.innerHeight) {
        top = window.innerHeight - tooltipBox.height;
      }
      tooltip.style("transform", `translate(${left}px,${top}px)`);
    }

    return {
      show,
      hide,
      move
    };
  }

  // Utilities
  // https://stackoverflow.com/a/39466341
  function getOrdinal(n) {
    return [, "st", "nd", "rd"][(n % 100 >> 3) ^ 1 && n % 10] || "th";
  }
})();
