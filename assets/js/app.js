var svgWidth = 960;
var svgHeight = 700;

var margin = {
  top: 20,
  right: 40,
  bottom: 120,
  left: 120
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3
  .select("#scatter")
  .classed("chart",true)
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
var chosenXAxis = 'poverty';
var chosenYAxis = 'healthcare';

// function used for updating x-scale var upon click on axis label
function xScale(hData, chosenXAxis) {
  // create scales
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(hData, d => d[chosenXAxis]) * 0.8,
      d3.max(hData, d => d[chosenXAxis]) * 1.2
    ])
    .range([0, width]);

  return xLinearScale;

}
//  function used for updating y-scale 
function yScale(hData, chosenYAxis) {
    // create scales
    var yLinearScale = d3.scaleLinear()
      .domain([d3.min(hData, d => d[chosenYAxis]) * 0.8,
        d3.max(hData, d => d[chosenYAxis]) * 1.2
      ])
      .range([height, 0]);
  
    return yLinearScale;
  
  }


// function used for updating xAxis var upon click on axis label
function renderAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}

// function used for updating yAxis 
function renderYAxes(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);
  
    yAxis.transition()
      .duration(1000)
      .call(leftAxis);
  
    return yAxis;
  }
  
// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newXScale,chosenXAxis,newYScale,chosenYAxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]))
    .attr("cy", d => newYScale(d[chosenYAxis]));


  return circlesGroup;
}

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {
   
  var label;

  if (chosenXAxis === "poverty") {
    label = "Poverty:";
  }
  else if (chosenXAxis === "age"){
    label = "Age:";
  }
  else {
      label = "Household income:"
  }

  var ylabel;

  if (chosenYAxis === "healthcare") {
      ylabel = "Lacks Healthcare:";
  }
  else if (chosenYAxis === "obesity"){
      ylabel = "Obese:";
  }
  else {
      ylabel = "Smokers:"
  }

  var toolTip = d3.tip()
    .attr("class", "d3-tip")
    .offset([80, -60])
    .html(function(d) {
      return (`${d.state}<br>${label} ${d[chosenXAxis]}% <br>${ylabel}${d[chosenYAxis]}%`);
    });

  circlesGroup.call(toolTip);

  circlesGroup.on("mouseover", function(data) {
    toolTip.show(data);
  })
    
    .on("mouseout", function(data, index) {
      toolTip.hide(data);
    });

  return circlesGroup;
}



// Retrieve data from the CSV file and execute everything below
d3.csv("./assets/data/data.csv").then(function(hData, err) {
  
  if (err) throw err;
  
  
  hData.forEach(function(data) {
    data.poverty = +data.poverty;
    data.age = +data.age;
    data.income = +data.income;
    data.healthcare = +data.healthcare;
    data.smokes = +data.smokes;
    data.obesity = +data.obesity
  });

  // xLinearScale function above csv import
  var xLinearScale = xScale(hData, chosenXAxis);
  var yLinearScale = yScale(hData, chosenYAxis);


  // Create initial axis functions
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  // append x axis
  var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

  // append y axis
  var yAxis = chartGroup.append("g")
    .classed("y-axis", true)
    .call(leftAxis);
  
  // append initial circles
  var circlesGroup = chartGroup.selectAll("circle")
    .data(hData)
    .enter()
    .append("circle")
    .classed("stateCircle",true)
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d[chosenYAxis]))
    .attr("r", 15)
    .attr("opacity", ".5");

  // Create group for  3 x- axis labels
  var xlabelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);

  var povertyLabel = xlabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 30)
    .attr("value", "poverty") // value to grab for event listener
    .classed("active", true)
    .classed('aText', true)
    .text("In Poverty(%)");

  var ageLabel = xlabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 50)
    .attr("value", "age") // value to grab for event listener
    .classed("inactive", true)
    .classed('aText', true)
    .text("Age(median)");

  var incomeLabel = xlabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 70)
    .attr("value", "income") // value to grab for event listener
    .classed("inactive", true)
    .classed('aText', true)
    .text("Household Income(Median)");
//////////////////////////////////////////////////////////////

    // Create group for  3 y- axis labels
  var ylabelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${0 - margin.left/2}, ${height / 2})`);

  var healthcareLabel = ylabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 0 - 20)
    .attr("transform", "rotate(-90)")
    .attr('dy', '1em')
    .attr("value", "healthcare") 
    .classed("active", true)
    .classed('aText', true)
    .text("Lacks Healthcare(%)");

  var smokesLabel = ylabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 0 - 40)
    .attr("transform", "rotate(-90)")
    .attr('dy', '1em')
    .attr("value", "smokes") 
    .classed("inactive", true)
    .classed('aText', true)
    .text("Smokers(%)");

  var obesityLabel = ylabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 0 - 60)
    .attr("transform", "rotate(-90)")
    .attr('dy', '1em')
    .attr("value", "obesity") 
    .classed("inactive", true)
    .classed('aText', true)
    .text("Obese(%)");

  // append y axis
//   chartGroup.append("text")
//     .attr("transform", "rotate(-90)")
//     .attr("y", 0 - margin.left)
//     .attr("x", 0 - (height / 2))
//     .attr("dy", "1em")
//     .classed("axis-text", true)
//     .text("Lacks Heathcare()");

  // ****updateToolTip function above csv import
  var circlesGroup = updateToolTip(chosenXAxis,chosenYAxis ,circlesGroup);
  
  // x axis labels event listener
  xlabelsGroup.selectAll("text")
    .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenXAxis) {

        chosenXAxis = value;

        xLinearScale = xScale(hData, chosenXAxis);

        xAxis = renderAxes(xLinearScale, xAxis);

        circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

        // **** updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

        // changes classes to change bold text
        if (chosenXAxis === "age") {
          ageLabel
            .classed("active", true)
            .classed("inactive", false);
          povertyLabel
            .classed("active", false)
            .classed("inactive", true);
          incomeLabel
            .classed("active", false)
            .classed("inactive", true);
             
        }
        else if (chosenXAxis === "income") {
            ageLabel
              .classed("active", false)
              .classed("inactive", true);
            povertyLabel
              .classed("active", false)
              .classed("inactive", true);
            incomeLabel
              .classed("active", true)
              .classed("inactive", false);
               
          }
        else {
          ageLabel
            .classed("active", false)
            .classed("inactive", true);
          povertyLabel
            .classed("active", true)
            .classed("inactive", false);
          incomeLabel
            .classed("active", false)
            .classed("inactive", true);
        }
      }
    });

   
// x axis labels event listener 
 ylabelsGroup.selectAll("text")
    .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenYAxis) {

        chosenYAxis = value;

        yLinearScale = yScale(hData, chosenYAxis);

        yAxis = renderYAxes(yLinearScale, yAxis);

        circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

        // **** updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis,circlesGroup);

        // changes classes to change bold text
        if (chosenYAxis === "smokes") {
          smokesLabel
            .classed("active", true)
            .classed("inactive", false);
          obesityLabel
            .classed("active", false)
            .classed("inactive", true);
          healthcareLabel
            .classed("active", false)
            .classed("inactive", true);
             
        }
        else if (chosenYAxis === "obesity") {
            smokesLabel
              .classed("active", false)
              .classed("inactive", true);
            obesityLabel
              .classed("active", true)
              .classed("inactive", false);
            healthcareLabel
              .classed("active", false)
              .classed("inactive", true);
               
          }
        else {
          smokesLabel
            .classed("active", false)
            .classed("inactive", true);
          obesityLabel
            .classed("active", false)
            .classed("inactive", true);
          healthcareLabel
            .classed("active", true)
            .classed("inactive", false);
        }
      }
    });

}).catch(function(error) {
  console.log(error);
});
