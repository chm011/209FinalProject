// Load preprocessed data
d3.json("preprocessed_demographic_data.json")
    .then(data => {
        console.log("Loaded Preprocessed Data:", data);

        const dropdown = d3.select("#demographic");

        // Initial render
        updateChart(dropdown.property("value"), data);

        // Update chart on dropdown change
        dropdown.on("change", function () {
            updateChart(this.value, data);
        });
    })
    .catch(error => {
        console.error("Error loading data:", error);
    });


const svg = d3.select("svg");
const width = +svg.attr("width");
const height = +svg.attr("height");
const margin = { top: 50, right: 60, bottom:200, left: 100 };

const chartWidth = width - margin.left - margin.right;
const chartHeight = height - margin.top - margin.bottom;

const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

//scales
const xScale = d3.scaleBand().range([0, chartWidth]).padding(0.4);
const yScale = d3.scaleLinear().range([chartHeight, 0]);
const colorScale = d3.scaleOrdinal().domain(["Diabetes", "NonDiabetes"]).range(["#ff6f61", "#69b3a2"]);


//axes
const xAxisGroup = g.append("g").attr("transform", `translate(0,${chartHeight})`);
const yAxisGroup = g.append("g");

// Tooltip
const tooltip = d3.select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);



//update chart
function updateChart(demographic, data) {
    // Filter data
    const filteredData = data.filter(d => d.Demographic === demographic);
    console.log(`Filtered Data for ${demographic}:`, filteredData);

    if (filteredData.length === 0) {
        console.error(`No data found for demographic: ${demographic}`);
        g.selectAll("*").remove(); // Clear the chart
        return;
    }
    /*
    if (demographic === "Income") {
        const incomeOrder = [
            "< $10,000",
            "$10,000 - $15,000",
            "$15,000 - $20,000",
            "$20,000 - $25,000",
            "$25,000 - $35,000",
            "$35,000 - $50,000",
            "$50,000 - $75,000",
            "> $75,000"
        ];
        filteredData.sort((a, b) => incomeOrder.indexOf(a.Category) - incomeOrder.indexOf(b.Category));
    }*/
   
       
    if (demographic === "Education") {
        const EducationOrder = [
            "Never attended school or Kindergarten",
            "Elementary School",
            "Some high school",
            "High school graduate",
            "Some college or technical school",
            "College graduate"
        ];
        filteredData.sort((a, b) => EducationOrder.indexOf(a.Category) - EducationOrder.indexOf(b.Category));
    }
    // Stack data for internal color proportions
    const stackedData = d3.stack()
        .keys(["Diabetes", "NonDiabetes"])
        .value((d, key) => (d[key] / 100) * d.Category_percentage)(filteredData);

    console.log("Stacked Data:", stackedData);

    // Update scales
    xScale.domain(filteredData.map(d => d.Category));
    yScale.domain([0, d3.max(filteredData, d => d.Category_percentage)]);

    console.log("X Scale Domain:", xScale.domain());
    console.log("Y Scale Domain:", yScale.domain());

    // Update axes
    xAxisGroup.transition().call(d3.axisBottom(xScale))
        .selectAll("text")
        .attr("transform", "rotate(-45)")
        .style("text-anchor", "end")
        .style("font-size","11.5px");
    yAxisGroup.transition().call(d3.axisLeft(yScale))
        .selectAll("text")
        .style("font-size","11.5px");

    // Render bars with stackedData
    renderBars(stackedData, filteredData);
}

function renderBars(stackedData, filteredData) {
    // Bind data to groups
    const groups = g.selectAll("g.layer").data(stackedData);

    const groupEnter = groups.enter()
        .append("g")
        .attr("class", "layer")
        .attr("fill", d => colorScale(d.key));

    const bars = groupEnter.merge(groups).selectAll("rect").data(d => d);


    
    bars.enter()
        .append("rect")
        .merge(bars)
        .attr("x", d => xScale(d.data.Category))
        .attr("y", d => yScale(d[1]))
        .attr("height", d => Math.max(0, yScale(d[0]) - yScale(d[1])))
        .attr("width", xScale.bandwidth())
        .on("mouseover", (event, d) => {
            const key = d3.select(event.target.parentNode).datum().key; // 'Diabetes' or 'NonDiabetes'
            const count = key === "Diabetes" ? d.data.Diabetes_binary_count : d.data.NonDiabetes_count; // Access count
            const total = d.data.Subgroup_total; // Total for the category
            const percentage = (count / d.data.Subgroup_total) * 100;// Percentage of diabetes/ nondiabetes within the subgroup

            tooltip.style("opacity", 1)
                .html(`
                    <strong>Total Count in Subgroup:</strong> ${total}<br>
                    <strong>${key === "Diabetes" ? "With Diabetes (Count)" : "Without Diabetes (Count)"}:</strong> ${count}<br>
                    <strong>${key === "Diabetes" ? "% with Diabetes" : "% without Diabetes"}:</strong> ${percentage.toFixed(2)}%
                `)
                .style("left", `${event.pageX + 10}px`)
                .style("top", `${event.pageY - 20}px`);
        })
        .on("mouseout", () => 
            tooltip.style("opacity", 0));


    bars.exit().remove();
    groups.exit().remove();

    console.log("Rendering Complete for Demographic:", demographic);
}

//calculated separetly in python and exported into correlations.json, and copied here
const rawData = {
    Diabetes_binary: 1.0,
    GenHlth: 0.40761159849491824,
    HighBP: 0.3815155489073118,
    BMI: 0.2933727447610357,
    HighChol: 0.2892128070886501,
    Age: 0.2787380662818883,
    DiffWalk: 0.272646006159808,
    PhysHlth: 0.21308101903810314,
    HeartDiseaseorAttack: 0.2115234043602268,
    Stroke: 0.12542678468516733,
    CholCheck: 0.11538161710270889,
    MentHlth: 0.08702877147509414,
    Smoker: 0.0859989642080019,
    Sex: 0.044412858371260674,
    NoDocbcCost: 0.04097657326664351,
    AnyHealthcare: 0.023190748531128236,
    Fruits: -0.0540765562866664,
    Veggies: -0.07929314561269882,
    HvyAlcoholConsump: -0.09485313995926543,
    PhysActivity: -0.1586656048640515,
    Education: -0.17048063498806193,
    Income: -0.22444871496381727
};

// Normalize and scale raw data
const minValue = Math.min(...Object.values(rawData));
const maxValue = Math.max(...Object.values(rawData));

// Create normalized and scaled weights
const prevalenceWeights = Object.fromEntries(
    Object.entries(rawData).map(([key, value]) => [
        key,
        (value - minValue) / (maxValue - minValue) // Normalize to a 0–1 range
    ])
);

console.log("Prevalence Weights:", prevalenceWeights);

console.log("Script loaded!");

let prevalenceData = {};

// Fetch prevalence data
fetch('prevalence_data.json')
    .then(response => {
        console.log("Fetch response received:", response);
        if (!response.ok) {
            console.error("Failed to fetch prevalence data:", response.statusText);
            throw new Error('Failed to fetch prevalence data');
        }
        return response.json();
    })
    .then(data => {
        prevalenceData = data;
        console.log("Prevalence data loaded:", prevalenceData);
        initializeCalculator();
    })
    .catch(error => {
        console.error("Error during fetch:", error);
    });

document.addEventListener("DOMContentLoaded", () => {
    console.log("DOMContentLoaded triggered!");
});

// Initialize 
function initializeCalculator() {
    console.log("Initializing calculator...");

    initializeSliderUpdates();
    attachEventListeners(updateRisk);

    // Perform the initial risk calculation
    updateRisk();
}

function initializeSliderUpdates() {
    const sliders = [
        { id: "age-slider", valueId: "age-value" },
        { id: "bmi-slider", valueId: "bmi-value" },
        { id: "gen-health-slider", valueId: "gen-health-value" },
        { id: "ment-health-slider", valueId: "ment-health-value" },
        { id: "phys-health-slider", valueId: "phys-health-value" },
    ];

    sliders.forEach(({ id, valueId }) => {
        const slider = document.getElementById(id);
        const valueSpan = document.getElementById(valueId);

        console.log(`Slider: ${id}`, slider);
        if (slider && valueSpan) {
            slider.addEventListener("input", () => {
                valueSpan.textContent = slider.value;
            });
        } else {
            console.error(`Missing slider or value span for ${id}`);
        }
    });
}

function attachEventListeners(updateRisk) {
    const inputs = document.querySelectorAll("input[type='range'], select");
    inputs.forEach(input => {
        console.log("Attaching listener to:", input.id);
        input.addEventListener("input", updateRisk);
    });
}

function calculateRisk() {
    console.log("calculateRisk called!");
    console.log("Prevalence Data Debug:", prevalenceData);

    const ageSlider = document.getElementById("age-slider");
    const bmiSlider = document.getElementById("bmi-slider");
    const sexDropdown = document.getElementById("sex-dropdown");
    const smokerDropdown = document.getElementById("smoker-dropdown");
    const highBPDropdown = document.getElementById("high-bp-dropdown");
    const highCholDropdown = document.getElementById("high-chol-dropdown");
    const heartDiseaseDropdown = document.getElementById("heart-disease-dropdown");
    const physActivityDropdown = document.getElementById("phys-activity-dropdown");
    const genHealthSlider = document.getElementById("gen-health-slider");
    const mentHealthSlider = document.getElementById("ment-health-slider");
    const physHealthSlider = document.getElementById("phys-health-slider");
    const diffWalkDropdown = document.getElementById("diff-walk-dropdown");
    const fruitsDropdown = document.getElementById("fruits-dropdown");

    // Map inputs to JSON keys
    const inputs = {
        ageGroup: getAgeGroup(ageSlider.value),
        bmiGroup: getBMIGroup(bmiSlider.value),
        sex: sexDropdown?.value + ".0", // Match JSON key format
        smoker: smokerDropdown?.value + ".0",
        highBP: highBPDropdown?.value + ".0",
        highChol: highCholDropdown?.value + ".0",
        heartDisease: heartDiseaseDropdown?.value + ".0",
        physActivity: physActivityDropdown?.value + ".0",
        genHealth: genHealthSlider?.value + ".0",
        mentHealth: mentHealthSlider?.value + ".0",
        physHealth: physHealthSlider?.value + ".0",
        diffWalk: diffWalkDropdown?.value + ".0",
        fruits: fruitsDropdown?.value + ".0",
    };

    console.log("Input values:", inputs);

    // Fetch prevalence rates for each input
    const prevalenceRates = {
        agePrevalence: prevalenceData.Age?.[inputs.ageGroup] ?? 0,
        bmiPrevalence: prevalenceData.BMI?.[inputs.bmiGroup] ?? 0,
        sexPrevalence: prevalenceData.Sex?.[inputs.sex] ?? 0,
        smokerPrevalence: prevalenceData.Smoker?.[inputs.smoker] ?? 0,
        highBPPrevalence: prevalenceData.HighBP?.[inputs.highBP] ?? 0,
        highCholPrevalence: prevalenceData.HighChol?.[inputs.highChol] ?? 0,
        heartDiseasePrevalence: prevalenceData.HeartDiseaseorAttack?.[inputs.heartDisease] ?? 0,
        physActivityPrevalence: prevalenceData.PhysActivity?.[inputs.physActivity] ?? 0,
        genHlthPrevalence: prevalenceData.GenHlth?.[inputs.genHealth] ?? 0,
        mentHlthPrevalence: prevalenceData.MentHlth?.[inputs.mentHealth] ?? 0,
        physHlthPrevalence: prevalenceData.PhysHlth?.[inputs.physHealth] ?? 0,
        diffWalkPrevalence: prevalenceData.DiffWalk?.[inputs.diffWalk] ?? 0,
        fruitsPrevalence: prevalenceData.Fruits?.[inputs.fruits] ?? 0,
    };

    console.log("Prevalence rates:", prevalenceRates);

    // Convert prevalence rates to weighted risk scores
    const weightedRiskScores = Object.entries(prevalenceRates).map(([key, prevalence]) => {
        const weight = prevalenceWeights[key] ?? 1; // Default weight is 1
        const riskScore = getRiskScore(prevalence);
        const weightedScore = weight * riskScore;
        return { key, prevalence, weight, riskScore, weightedScore };
    });

    console.log("Weighted Risk Scores:", weightedRiskScores);

    // Calculate overall risk percentage
    const overallRiskPercentage = calculateOverallRisk(
        weightedRiskScores.map(({ weightedScore }) => weightedScore)
    );

    // Calculate total risk score
    const totalRiskScore = weightedRiskScores.reduce((sum, { riskScore }) => sum + riskScore, 0);

    return { overallRiskPercentage, totalRiskScore, weightedRiskScores };
}

// overall risk function
function calculateOverallRisk(riskScores) {
    const maxRiskScore = 20; // Maximum possible score per factor in the 20-point scale
    const totalRisk = riskScores.reduce((sum, score) => sum + score, 0); // Sum of all weighted scores
    const averageRisk = totalRisk / riskScores.length; // Average weighted risk score

    // Convert the average risk score to a percentage
    return (averageRisk / maxRiskScore) * 100;
}

const factorNames = {
    agePrevalence: "Age",
    bmiPrevalence: "BMI",
    sexPrevalence: "Sex",
    smokerPrevalence: "Smoker",
    highBPPrevalence: "High Blood Pressure",
    highCholPrevalence: "High Cholesterol",
    heartDiseasePrevalence: "Heart Disease or Attack",
    physActivityPrevalence: "Physical Activity",
    genHlthPrevalence: "General Health",
    mentHlthPrevalence: "Mental Health (Days in Poor Health)",
    physHlthPrevalence: "Physical Health (Days in Poor Health)",
    diffWalkPrevalence: "Difficulty Walking",
    fruitsPrevalence: "Consumes Fruits Daily"
};

function updateRisk() {
    try {
        const { overallRiskPercentage, totalRiskScore, weightedRiskScores } = calculateRisk();

        // Define the maximum possible score (20 points per factor)
        const maxScore = weightedRiskScores.length * 20;

        const riskResult = document.getElementById("risk-result");
        const riskScore = document.getElementById("risk-score");
        riskResult.innerHTML = `<strong>Your estimated diabetes risk is ${overallRiskPercentage.toFixed(2)}%.</strong>`;
        riskScore.innerHTML = `<strong>Overall Risk Score:</strong> ${totalRiskScore} / ${maxScore}`;

        const breakdownList = document.getElementById("breakdown-list");
        breakdownList.innerHTML = ""; // Clear previous entries

        weightedRiskScores.forEach(({ key, prevalence, weight, riskScore, weightedScore }) => {
            const listItem = document.createElement("li");

            const humanReadableKey = factorNames[key] || key; // Fallback to the raw key if not found

            listItem.innerHTML = `
                <strong>${humanReadableKey}:</strong>
                Prevalence: <em>${prevalence.toFixed(2)}%</em>, 
                Weight: <em>${weight.toFixed(2)}</em>, 
                Risk Score: <em>${riskScore}</em>, 
                Weighted Score: <em>${weightedScore.toFixed(2)}</em>
            `;
            breakdownList.appendChild(listItem);
        });

        // Attach toggle button functionality
        const toggleButton = document.getElementById("toggle-breakdown-btn");
        const breakdownContainer = document.getElementById("breakdown-container");

        toggleButton.textContent =
            breakdownContainer.style.display === "none" || breakdownContainer.style.display === ""
                ? "Expand to See More"
                : "Collapse Details";

        toggleButton.onclick = () => {
            const isHidden = breakdownContainer.style.display === "none" || breakdownContainer.style.display === "";
            breakdownContainer.style.display = isHidden ? "block" : "none";
            toggleButton.textContent = isHidden ? "Collapse Details" : "Expand to See More";
        };

        console.log("Risk Updated Successfully!");
    } catch (error) {
        console.error("Error updating risk:", error);
    }
}

//more functions
function getBMIGroup(bmi) {
    if (bmi < 18.5) return "Underweight";
    if (bmi < 25) return "Normal";
    if (bmi < 30) return "Overweight";
    return "Obese";
}

function getAgeGroup(value) {
    if (value <= 24) return "18-24";
    if (value <= 34) return "25-34";
    if (value <= 44) return "35-44";
    if (value <= 54) return "45-54";
    if (value <= 64) return "55-64";
    if (value <= 74) return "65-74";
    if (value <= 84) return "75-84";
    if (value <= 94) return "85-94";
    return "95+";
}

function getRiskScore(prevalence) {
    if (prevalence <= 5) return 1;   // Very Low
    if (prevalence <= 10) return 2;  // Low
    if (prevalence <= 15) return 3;
    if (prevalence <= 20) return 4;
    if (prevalence <= 25) return 5;  // Slightly Moderate
    if (prevalence <= 30) return 6;
    if (prevalence <= 35) return 7;
    if (prevalence <= 40) return 8;  // Moderate
    if (prevalence <= 45) return 9;
    if (prevalence <= 50) return 10; // Slightly High
    if (prevalence <= 55) return 11;
    if (prevalence <= 60) return 12;
    if (prevalence <= 65) return 13; // High
    if (prevalence <= 70) return 14;
    if (prevalence <= 75) return 15; // Very High
    if (prevalence <= 80) return 16;
    if (prevalence <= 85) return 17;
    if (prevalence <= 90) return 18;
    if (prevalence <= 95) return 19;
    return 20; // Extremely High
}
