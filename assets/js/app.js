// Code to append the scatter chart
// Set up the chart dimensions
const svgWidth = 960
const svgHeight = 600

let margin = {
    top: 20,
    right: 40,
    bottom: 80,
    left: 100
}

let width = svgWidth - margin.left - margin.right
let height = svgHeight - margin.top - margin.bottom

// Create the actual canvas for the graph

let svg = d3
  .select("#scatter")
  .attr("align","right")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight)

let chartGroup = svg
  .append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`)

// View selection - changing this triggers transition
let currentSelection = "poverty" 
let ycurrentSelection = "healthcare" 

/**
 * Returns a updated scale based on the current selection.
 **/
function xScale(data, currentSelection) {
  let xLinearScale = d3
    .scaleLinear()
    .domain([
            d3.min(data.map(d => parseInt(d[currentSelection]))) * 0.8,
            d3.max(data.map(d => parseInt(d[currentSelection]))) * 1.2
            ])
    .range([0, width])
  return xLinearScale
}

/**
 * Returns a updated scale based on the ycurrent selection.
 **/
function yScale(data, ycurrentSelection) {
  let yLinearScale = d3
    .scaleLinear()
    .domain([
      d3.min(data.map(d => parseInt(d[ycurrentSelection]))) * 0.8,
      d3.max(data.map(d => parseInt(d[ycurrentSelection]))) * 1.2
            ])
    .range([height, 0])
  return yLinearScale
}

/**
 * Returns and appends an updated x-axis based on a scale.
 **/
function renderAxes(newXScale, xAxis) {
  let bottomAxis = d3.axisBottom(newXScale)
  xAxis
    .transition()
    .duration(1000)
    .call(bottomAxis)
  return xAxis
}

/**
 * Returns and appends an updated x-axis based on a scale.
 **/
function renderYAxes(newYScale, yAxis) {
  let leftAxis = d3.axisLeft(newYScale)
  yAxis
    .transition()
    .duration(1000)
    .call(leftAxis)
  return yAxis
}

/**
 * Returns and appends an updated circles group based on a new scale and the currect selection.
 **/
function renderCircles(circlesGroup, newXScale, currentSelection, newYScale, ycurrentSelection, textGroup) {
  circlesGroup
    .transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[currentSelection]))
    .attr("cy", d => newYScale(d[ycurrentSelection]))
  
  textGroup.transition().duration(1000)
    .attr("x", d => newXScale(d[currentSelection]))
    .attr("y", d => newYScale(d[ycurrentSelection]))

  return circlesGroup
}

;(function() {
  // Import the .csv file
  d3.csv("assets/data/data.csv").then(data => {
    console.log(data)

  let xLinearScale = xScale(data, currentSelection)
  let yLinearScale = yScale(data, ycurrentSelection)
      
  let bottomAxis = d3.axisBottom(xLinearScale)
  console.log(bottomAxis)
    
let leftAxis = d3.axisLeft(yLinearScale)
let xAxis = chartGroup
  .append("g")
  .classed("x-axis", true)
  .attr("transform", `translate(0, ${height})`)
  .call(bottomAxis)

let yAxis = chartGroup
  .append("g")
  .classed("y-axis", true)
  .attr("transform", `translate(0,${width})`)
  .call(bottomAxis)
    
chartGroup.append("g").call(leftAxis)
    
let circlesGroup = chartGroup
  .selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d[currentSelection]))
    .attr("cy", d => yLinearScale(d[ycurrentSelection]))
    .attr("r", 10)
    // .attr("value", d => d.state)
    .attr("fill", "blue")
    .attr("opacity", ".5")
    
let textGroup = 
  // svgappend("g")
      chartGroup
    .selectAll("text")
    .data(data)
    // .data(new Array(50))
    .enter()
    .append("text")
    .style("font", "12px Helvetica, Arial, sans-serif")
    .style("fill", "black")
    .attr("x", d => xLinearScale(d[currentSelection]))
    .attr("y",d => yLinearScale(d[ycurrentSelection]))
    // .text(function(data){return data.abbr})
    .attr("text-anchor", "middle")
    .text(data => data.abbr)
    // .text('PK')
    

  let labelsGroup = chartGroup
    .append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`)
    
    labelsGroup
     .append("text")
      .attr("x", 0)
      .attr("y", 20)
      .attr("value", "poverty")
      .classed("active", true)
      .text("Poverty(%)")
    labelsGroup
      .append("text")
      .attr("x", 0)
      .attr("y", 40)
      .attr("value", "age")
      .classed("inactive", true)
      .text("Age in years(Median)")
    labelsGroup
      .append("text")
      .attr("x", 0)
      .attr("y", 60)
      .attr("value", "income")
      .classed("inactive", true)
      .text("Household Income($)")
  
  let ylabelsGroup = chartGroup
    .append("g")
    .attr("transform", "rotate(-90)")

    ylabelsGroup
      .append("text")
      .attr("y", -30)
      .attr("x", -200)
      .attr("value", "healthcare")
      .classed("active", true)
      .text("Lacks Healthcare(%)")
    ylabelsGroup
      .append("text")
      .attr("y", -50)
      .attr("x", -200)
      .attr("value", "obesity")
      .classed("inactive", true)
      .text("Obesity(%)")  

    ylabelsGroup
      .append("text")
      .attr("y", -70)
      .attr("x", -200)
      .attr("value", "smokes")
      .classed("inactive", true)
      .text("Smoke(%)")    
    
     // Crate an event listener to call the update functions when a label is clicked
     labelsGroup.selectAll("text").on("click", function() {
      labelsGroup.selectAll("text").classed("active",false)
      labelsGroup.selectAll("text").classed("inactive",true)


      let value = d3.select(this).attr("value")

      d3.select(this).classed("active", true)
      d3.select(this).classed("inactive", false)
      if (value !== currentSelection) {
        currentSelection = value
        xLinearScale = xScale(data, currentSelection)
        xAxis = renderAxes(xLinearScale, xAxis)
        circlesGroup = renderCircles(
          circlesGroup,
          xLinearScale,
          currentSelection, yLinearScale, ycurrentSelection, textGroup
        ) } })
      
    // Create an event listener to call the update functions when a label is clicked
    ylabelsGroup.selectAll("text").on("click", function() {

      console.log("Text group: "+textGroup)

      ylabelsGroup.selectAll("text").classed("active",false)
      ylabelsGroup.selectAll("text").classed("inactive",true)

      let value = d3.select(this).attr("value")
      console.log('value is: '+value)
      d3.select(this).classed("active", true)
      d3.select(this).classed("inactive", false)

      if (value !== ycurrentSelection) {
        ycurrentSelection = value
        yLinearScale = yScale(data, ycurrentSelection)
        yAxis = renderYAxes(yLinearScale, yAxis)
        circlesGroup = renderCircles(
          circlesGroup, xLinearScale, currentSelection,
          yLinearScale,
          ycurrentSelection , textGroup
        )
      }
    }
    )
  }
  )
})()
    
