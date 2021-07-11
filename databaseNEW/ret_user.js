var curr_year = new Date().getFullYear(); //curr_year = 2021
var time = []
var money_over_time = []
var goal
var wealth = []
var networth = 0;
var money, income, savings, r1, bad_r1, r2, inf_rate, years, accum_years, distr_years, savings_per_year, bad_savings_per_year;

var selected_stock_options = [];
var stock_selection_values = [];

if (existing_stocks != null) {
    selected_stock_options = existing_stocks.split(",");
}

function netWorth() {
    networth = parseInt(savings);
    if (existing_stock_values != null) {
        var temp_arr_stock = existing_stock_values.split(",");
        for (var i = 0; i < temp_arr_stock.length; ++i) {
            networth += parseInt(temp_arr_stock[i]);
        }
    }
}

//piechart for portfolios
function portfolio_chart() {
    if (portfolio != "null") {
        //var currentWidth = parseInt(d3.select('#pie-chart').style('width'), 10)
        var currentWidth = 1000;
        var width = currentWidth;
        height = 450
        margin = 40

        var radius;
        if (width > height) {
            radius = (height / 2) - 20;
        } else {
            radius = width / 2;
        }

        var svg = d3.select("#pie-chart")
            .append("svg")
            .attr("width", width)
            .attr("height", height)
            .append("g")
            .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

        var data = { "Domestic Large": 1, "International Small": 1, "International Large": 1, "Bonds": 1, "Domestic Small": 1 }
        data['Domestic Large'] = dom_large_percent;
        data['Domestic Small'] = dom_small_percent;
        data['International Large'] = int_large_percent;
        data['International Small'] = int_small_percent;
        data['Bonds'] = bonds_percent;

        var color = d3.scaleOrdinal()
            .domain(["Domestic Large", "International Small", "International Large", "Bonds", "Domestic Small"])
            .range(["#f4c042", "#1a75be", "#709931", "#dc3545", "#fb6340"]);

        var pie = d3.pie()
            .sort(null) // Do not sort group by size
            .value(function (d) { return d.value; })
        var data_ready = pie(d3.entries(data))

        var arc = d3.arc()
            .innerRadius(radius * 0.4)         // This is the size of the donut hole
            .outerRadius(radius * 0.8)

        // Another arc that won't be drawn. Just for labels positioning
        var outerArc = d3.arc()
            .innerRadius(radius * 1.4)
            .outerRadius(radius * 0.4)

        svg
            .selectAll('allPolylines')
            .data(data_ready)
            .enter()
            .append('polyline')
            .attr("stroke", "black")
            .style("fill", "none")
            .attr("stroke-width", 1)
            .attr('points', function (d) {
                var posA = arc.centroid(d); // line insertion in the slice
                var posB = outerArc.centroid(d); // line break: we use the other arc generator that has been built only for that
                var posC = outerArc.centroid(d); // Label position = almost the same as posB
                var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2 // we need the angle to see if the X position will be at the extreme right or extreme left
                posC[0] = radius * 0.95 * (midangle < Math.PI ? 1 : -1); // multiply by 1 or -1 to put it on the right or on the left
                return [posA, posB, posC]
            })

        svg
            .selectAll('allSlices')
            .data(data_ready)
            .enter()
            .append('path')
            .attr('d', arc)
            .attr('fill', function (d) { return (color(d.data.key)) })
            .attr("stroke", "white")
            .style("stroke-width", "2px")

        svg
            .selectAll('allLabels')
            .data(data_ready)
            .enter()
            .append('text')
            .text(function (d) { return d.data.key })
            .attr('transform', function (d) {
                var pos = outerArc.centroid(d);
                var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2
                pos[0] = radius * 0.99 * (midangle < Math.PI ? 1 : -1);
                return 'translate(' + pos + ')';
            })
            .style('text-anchor', function (d) {
                var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2
                return (midangle < Math.PI ? 'start' : 'end')
            })

        svg
            .selectAll('allSlices')
            .data(data_ready)
            .enter()
            .append('text')
            .text(function (d) { return d.data.value + '%' })
            .attr("transform", function (d) { return "translate(" + arc.centroid(d) + ")"; })
            .style("text-anchor", "middle")
            .style("font-size", 14)

        svg.append("g")
            .attr("transform", "translate(" + (0) + "," + (-height / 2 + 25) + ")")
            .append("text")
            .style("font-size", "16px")
            .style("text-decoration", "underline")
            .style("text-anchor", "middle")
            .text("Recommended Portfolio - " + portfolio.toUpperCase())
    } else {
        document.getElementById("portfolio_description").innerText = "Looks like you don't have a portfolio yet. Answer the questions in the \'My Savings\' section."
    }
}

//bargraph for stocks
function bargraph() {
    if (existing_stock_values != null) {
        var dataset1 = existing_stock_values.split(",");

        //var currentWidth = parseInt(d3.select('#boxplot').style('width'), 10)
        var currentWidth = 1000;


        var m = [100, 0.1 * currentWidth, 100, 0.1 * currentWidth]; // margins, m[0], m[2] = top/below, m[1] = right, m[3] = left
        //var w = currentWidth - m[1] - m[3]; // width
        var w = currentWidth / 3;
        var h = 600 - m[0] - m[2]; // height

        var g = d3.select("#barplot")
            .append("svg")
            .attr("width", w + m[1] + m[3])
            .attr("height", 700)//h + m[0] + m[2]
            .append("svg:g")
            .attr("transform", "translate(" + m[3] + "," + m[0] + ")");

        var x = d3.scaleBand()
            .range([0, w])
            .domain(selected_stock_options)
            .padding(0.5);

        var y = d3.scaleLinear()
            .domain([0, Math.max.apply(Math, dataset1)])
            .range([h, 0]);

        g.selectAll()
            .data(dataset1)
            .enter()
            .append("rect")
            .attr("x", function (d, i) { return x(selected_stock_options[i]); })
            .attr("y", function (d) { return y(d); })
            .attr("width", x.bandwidth())
            .attr("height", function (d) { return h - y(d); })
            .attr("fill", "#4e8791")
            .style("opacity", .6);

        g.append("g")
            .attr("transform", "translate(0," + h + ")")
            .call(d3.axisBottom(x))
            .selectAll("text")
            .attr("transform", "translate(-10,0)rotate(-45)")
            .style("font-size", 12)
            .style("text-anchor", "end");

        g.append("g")
            .style("font-size", 12)
            .call(d3.axisLeft(y));

        //title of graph
        g.append("text")
            .attr("x", (w / 2))
            .attr("y", 0 - (m[0] / 2))
            .attr("text-anchor", "middle")
            .style("font-size", "16px")
            .style("text-decoration", "underline")
            .text("Stocks")

        //x-axis label
        g.append("text")
            .attr("transform",
                "translate(" + (w / 2) + " ," +
                (h + m[0]) + ")")
            .style("text-anchor", "middle")
            .text("Stock");

        // text label for the y axis
        g.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - m[0])
            .attr("x", 0 - (h / 2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text("Value");
    }
}

//so that when user opens acct, all of their saved data will show
//everything in this function only happens once (whenever the page is reloaded/opened upon login)
function reset_stock_list() {
    var ul = document.getElementById("stock_option");
    //var li = ul.getElementsByTagName("li");
    var li = ul.getElementsByClassName("li_stock");
    var innertext = "You selected: \n"

    for (var i = 0; i < li.length; ++i) {
        for (var j = 0; j < selected_stock_options.length; ++j) {
            if (li[i].textContent === selected_stock_options[j]) {
                li[i].classList.toggle('checked'); //shows list of what stock options user previously selected
                innertext += selected_stock_options[j] + "\n"
            }
        }
    }
    //shows list of what stock options user previously selected
    document.getElementById("stocks_selection").innerText = innertext;

    var div = document.getElementById('money_in_stocks');
    while (div.firstChild) {
        div.removeChild(div.firstChild);
    }

    //appends appropriate number of input text fields so that user can enter money in each stock
    document.getElementById("money_in_stocks").innerText += "Enter the amount of money you have in each stock: \n"
    for (var i = 0; i < selected_stock_options.length; i++) {
        document.getElementById("money_in_stocks").innerHTML += (selected_stock_options[i] + ": ");
        var input = document.createElement('input');
        input.type = "number";
        input.id = selected_stock_options[i];
        document.getElementById("money_in_stocks").appendChild(input);
        document.getElementById("money_in_stocks").appendChild(document.createElement("br"));
    }
}

//creates list with possible stock options for user to choose from
function showAllStockOptions() {
    var stock_options = ['US large cap', 'US mid cap', 'US small cap',
        'International Small Cap', 'International mid', 'International Large'];
    var list = document.createElement('ul');
    list.className = "stock_option";
    stock_options.forEach(function (option) {
        var li = document.createElement('li');
        li.className = "li_stock";
        li.textContent = option;
        document.getElementById("stock_option").appendChild(li);
    });

    //var list = document.querySelector('ul');
    var list = document.getElementById("stock_option")
    list.addEventListener('click', function (stock) { //this means user has clicked on a list element (stock option)
        if (stock.target.tagName === 'LI') {
            stock.target.classList.toggle('checked');
            showSelection(); //update stocks_selection list
        }
        confirmStocks(); //updates list of input text fields for user to enter money in each stock
    }, false);
    stock_options = [];
}

//shows stock optons selected by user
function showSelection() {
    selected_stock_options = [];
    stock_selection_values = [];
    var ul = document.getElementById("stock_option");
    //var li = ul.getElementsByTagName("li");
    var li = ul.getElementsByClassName("li_stock");
    var innertext = "You selected: \n"
    for (var i = 0; i < li.length; i++) {
        if (li[i].classList.contains("checked")) {
            innertext += li[i].innerHTML + "\n"
            selected_stock_options.push(li[i].innerHTML)
        }
    }
    document.getElementById("stocks_selection").innerText = innertext;
}

//updates number of text fields to take user input (money in each stock)
function confirmStocks() {
    var div = document.getElementById('money_in_stocks');
    while (div.firstChild) {
        div.removeChild(div.firstChild);
    }
    document.getElementById("money_in_stocks").innerText += "Enter the amount of money you have in each stock: \n"

    for (var i = 0; i < selected_stock_options.length; i++) {
        document.getElementById("money_in_stocks").innerHTML += (selected_stock_options[i] + ": ");
        var input = document.createElement('input');
        input.type = "number";
        input.id = selected_stock_options[i];
        document.getElementById("money_in_stocks").appendChild(input);
        document.getElementById("money_in_stocks").appendChild(document.createElement("br"));
    }
}

//called when user confirms the stocks + values (when they click on btn)
//necessary so that we can save the data in our db
function confirmStockValues() {
    networth = parseInt(savings);
    for (var i = 0; i < selected_stock_options.length; i++) {
        if (document.getElementById(selected_stock_options[i]).value == null) {
            stock_selection_values.push(0);
        } else {
            stock_selection_values.push(document.getElementById(selected_stock_options[i]).value);
            networth += parseInt(document.getElementById(selected_stock_options[i]).value);
        }
    }
    var stock = selected_stock_options.join();
    document.Form.stocks_list.value = stock;

    var stock_values = stock_selection_values.join();
    document.Form.stocks_values_list.value = stock_values;

    if (date_arr == null) { //first time entering data
        document.Form.dates_over_time.value = date;
        document.Form.networth_over_time_stocks.value = parseInt(networth);
    } else {
        date_arr = date_arr.split(",");
        networth_time_arr = networth_time_arr.split(",");
        var most_recent = date_arr[date_arr.length - 1];

        if (most_recent == date) { //entering data again on same day
            var dates_over_time = date_arr.join();
            networth_time_arr[networth_time_arr.length - 1] = parseInt(networth);

        } else { //entering data on a diff day
            date_arr.push(date);
            networth_time_arr.push(parseInt(networth));
            var dates_over_time = date_arr.join();
        }
        var networth_over_time = networth_time_arr.join();
        document.Form.dates_over_time.value = dates_over_time;
        document.Form.networth_over_time_stocks.value = networth_over_time;
    }
}

//to display correct stock options when user types into searchbar
function SearchThroughStocks() {
    var input, filter, ul, li, a, i, txtValue;
    input = document.getElementById("searchbar");
    filter = input.value.toUpperCase();
    ul = document.getElementById("stock_option");
    //li = ul.getElementsByTagName("li");
    li = ul.getElementsByClassName("li_stock");
    for (i = 0; i < li.length; i++) {
        txtValue = li[i].textContent;
        if (txtValue.toUpperCase().indexOf(filter) > -1) {
            li[i].style.display = "";
        } else {
            li[i].style.display = "none";
        }
    }
}

//called first - creates list elements with possible stock options
showAllStockOptions();

//called second - updates list with user's chosen stocks (if they have chosen, else this step is skipped)
if (existing_stocks != null && existing_stock_values != null) {
    reset_stock_list();
}

//updates stock value input textfields with previous values user entered (whatever was saved in db)
function updateStockValuesText() {
    for (var i = 0; i < selected_stock_options.length; ++i) {
        if (document.getElementById(selected_stock_options[i]) !== null) {
            document.getElementById(selected_stock_options[i]).value = existing_stock_values.split(",")[i];
        }
    }
}

updateStockValuesText();

//function for graphs
function result() {

    //var currentWidth = parseInt(d3.select('#graph').style('width'), 10)
    /*if (currentWidth > 2000) {
        currentWidth = 2000;
    }*/
    var currentWidth = 1500;

    money = document.getElementById('money').value;
    income = document.getElementById('income').value;
    savings = document.getElementById('savings').value;
    r1 = 0.07;
    bad_r1 = 0.06;
    r2 = 0.04;
    inf_rate = 0.03; //inflation rate
    years = life - curr_age; //years left in life
    accum_years = ret_age - curr_age; //accumulation years
    distr_years = life - ret_age; //distribution years

    netWorth();
    console.log("networth " + networth);
    console.log(networth_time_arr);

    d3.selectAll("svg").remove();
    bargraph(); // barplot showing user's stocks
    portfolio_chart(); //piechart showing user's portfolio

    savings_req_over_time(); //graph showing savings req over time
    networth_over_time_graph(); //graph showing networth over time

    money_over_time = [] //inflation adjusted M per year
    time = []
    wealth = [] //wealth per year

    //inflation adjusted M per year
    for (let i = 1; i <= years + 1; i++) {
        var adjusted_money = money * Math.pow(1 + inf_rate, i - 1)
        money_over_time.push(adjusted_money)
        time.push(i)
    }

    //goal money before retirement
    goal = money_over_time[accum_years + 1] * ((1 / (parseFloat(r2) - inf_rate)) - (Math.pow((1 + inf_rate), distr_years) / ((parseFloat(r2) - inf_rate) * Math.pow((1 + parseFloat(r2)), distr_years))))
    wealth.push(savings);

    var PV_goal = goal / Math.pow((1 + parseFloat(r1)), accum_years)
    var gap = PV_goal - savings
    savings_per_year = gap / ((1 / parseFloat(r1)) - (1 / (parseFloat(r1) * Math.pow(1 + parseFloat(r1), accum_years))))

    bad_savings_per_year = goal / Math.pow((1 + parseFloat(bad_r1)), accum_years);
    var bad_gap = bad_savings_per_year - savings;
    bad_savings_per_year = bad_gap / ((1 / parseFloat(bad_r1)) - (1 / (parseFloat(bad_r1) * Math.pow(1 + parseFloat(bad_r1), accum_years))));

    //wealth per year in accumulation years
    for (let i = 2; i < accum_years + 1; i++) {
        var total_wealth = (wealth[i - 2] * (1 + parseFloat(r1))) + savings_per_year;
        wealth.push(total_wealth)
    }
    wealth.push(goal)

    //wealth per year in distribution years
    for (let i = accum_years + 2; i <= life; i++) {
        var total_wealth = (wealth[i - 2] * (1 + parseFloat(r2))) - money_over_time[i - 1];
        if (total_wealth >= 0) {
            wealth.push(total_wealth)
        } else {
            wealth.push(0)
            break;
        }
    }

    var m = [50, 150, 100, 150]; // margins, m[0], m[2] = top/below, m[1] = right, m[3] = left
    var w = currentWidth * 0.7; // width
    var h = 400 - m[0] - m[2]; // height

    //graph for inflation adjusted M
    var graph = d3.select("#graph")
        .append("svg")
        .attr("width", w + m[1] + m[3])
        .attr("height", h + m[0] + m[2])
        .append("svg:g")
        .attr("transform", "translate(" + m[3] + "," + m[0] + ")");

    var x = d3.scaleLinear().domain([1, money_over_time.length]).range([0, w]);
    var y = d3.scaleLinear().domain([0, Math.max.apply(Math, money_over_time)]).range([h, 0]);
    //d3.max(money_over_time)

    var xAxis = d3.axisBottom(x).tickSize(-h).tickFormat(function (d) { return (d + curr_year - 1); });//.tickSubdivide(true)

    graph.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + h + ")")
        .style("font-size", 12)
        .call(xAxis);

    graph.append("text")
        .attr("transform",
            "translate(" + (w / 2) + " ," +
            (h + m[0]) + ")")
        .style("text-anchor", "middle")
        .text("Year");

    // text label for the y axis
    graph.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - m[1])
        .attr("x", 0 - (h / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("M");

    var yAxisLeft = d3.axisLeft(y).ticks(4)

    graph.append("g")
        .attr("class", "y axis")
        .attr("transform", "translate(-25,0)")
        .style("font-size", 12)
        .call(yAxisLeft);

    graph
        .append("text")
        .attr("x", (w / 2))
        .attr("y", 0 - (m[0] / 2))
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .style("text-decoration", "underline")
        .text("Inflation adjusted M vs Year")

    //shading for graph 1 (inflation adjusted M)
    var area = d3.area()
        .x(function (d, i) {
            return x(i + 1);
        })
        .y1(function (d) {
            return y(d);
        })
        .y0(y(0))

    //shading
    graph
        .datum(money_over_time)
        .append("path")
        .attr("d", area)
        .style("stroke-width", 2)
        .style("fill", "blue")
        .style("stroke", "blue")
        .style("opacity", .6)

    //highlight retirement year in graph 1 (inflation adjusted M)
    graph
        .append("circle")
        .attr("cx", x(accum_years + 1))
        .attr("cy", y(money_over_time[accum_years]))
        .attr("r", 5)
        .attr("fill", "red")

    //splitting graph 2 into accumulation and distr years
    var wealth1 = wealth.slice(0, accum_years + 1)
    var wealth2 = wealth.slice(accum_years, wealth.length)

    //graph for wealth per year
    var graph2 = d3.select("#graph2")
        .append("svg")
        .attr("width", w + m[1] + m[3])
        .attr("height", h + m[0] + m[2])
        .append("svg:g")
        .attr("transform", "translate(" + m[3] + "," + m[0] + ")");

    graph2.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + h + ")")
        .style("font-size", 12)
        .call(xAxis);

    graph2.append("text")
        .attr("transform",
            "translate(" + (w / 2) + " ," +
            (h + m[0]) + ")")
        .style("text-anchor", "middle")
        .text("Year");

    graph2.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - m[1])
        .attr("x", 0 - (h / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Wealth");

    var y2 = d3.scaleLinear().domain([0, Math.max.apply(Math, wealth)]).range([h, 0]);
    //d3.max(wealth)
    var yAxisLeft2 = d3.axisLeft(y2).ticks(4)

    graph2.append("g")
        .attr("class", "y axis")
        .attr("transform", "translate(-25,0)")
        .style("font-size", 12)
        .call(yAxisLeft2);

    graph2
        .append("text")
        .attr("x", (w / 2))
        .attr("y", 0 - (m[0] / 2))
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .style("text-decoration", "underline")
        .text("Wealth vs Year")

    // area graphs - y1 sets top, y0 sets the lowest y value
    var area2 = d3.area()
        .x(function (d, i) {
            return x(i + 1);
        })
        .y1(function (d) {
            return y2(d);
        })
        .y0(y2(0));

    var areaRetire = d3.area()
        .x(function (d, i) {
            return x(i + 1 + accum_years);
        })
        .y1(function (d) {
            return y2(d);
        })
        .y0(y2(0));


    graph2 //before retirement
        .datum(wealth1)
        .append("path")
        .attr("d", area2)
        .style("stroke-width", 2)
        .style("fill", "orange")
        .style("stroke", "orange")
        .style("opacity", .6)

    graph2 // after retirement graph
        .datum(wealth2)
        .append("path")
        .attr("d", areaRetire)
        .style("stroke-width", 2)
        .style("fill", "purple")
        .style("stroke", "purple")
        .style("opacity", .6)

    graph2 // vertical line of apex 
        .append("line")
        .attr("x1", x(accum_years + 1))
        .attr("y1", 0)
        .attr("x2", x(accum_years + 1))
        .attr("y2", h)
        .style("stroke-dasharray", ("4, 4"))
        .style("stroke", "red")

    //circle moving along line for graph 1 (inflation adjusted M)
    var focus = graph
        .append('g')
        .append('circle')
        .style("fill", "none")
        .attr("stroke", "black")
        .attr('r', 8.5)
        .style("opacity", 0)

    var focusText = graph
        .append('g')
        .append('text')
        .style("opacity", 0)
        .attr("text-anchor", "left")
        .attr("alignment-baseline", "middle")

    graph
        .append('rect')
        .style("fill", "none")
        .style("pointer-events", "all")
        .attr('width', w)
        .attr('height', h)
        .on('mouseover', mouseover)
        .on('mousemove', mousemove)
        .on('mouseout', mouseout);

    function mouseover() {
        focus.style("opacity", 1)
        focusText.style("opacity", 1)
    }

    function mousemove() {
        var x0 = x.invert(d3.mouse(this)[0]);
        var i = d3.bisect(time, x0);
        selectedData = money_over_time[i - 1]
        focus
            .attr("cx", x(i))
            .attr("cy", y(selectedData))
        focusText
            .html("Year:" + (curr_year + i - 1) + "  ,  " + "M:" + parseInt(selectedData))
            .attr("x", x(i) + 15)
            .attr("y", y(selectedData) - 35)
    }
    function mouseout() {
        focus.style("opacity", 0)
        focusText.style("opacity", 0)
    }

    //circle moving along line for graph 2 (wealth vs year)
    var focus2 = graph2
        .append('g')
        .append('circle')
        .style("fill", "none")
        .attr("stroke", "black")
        .attr('r', 8.5)
        .style("opacity", 0)

    var focusText2 = graph2
        .append('g')
        .append('text')
        .style("opacity", 0)
        .attr("text-anchor", "left")
        .attr("alignment-baseline", "middle")

    graph2
        .append('rect')
        .style("fill", "none")
        .style("pointer-events", "all")
        .attr('width', w)
        .attr('height', h)
        .on('mouseover', mouseover2)
        .on('mousemove', mousemove2)
        .on('mouseout', mouseout2);

    function mouseover2() {
        focus2.style("opacity", 1)
        focusText2.style("opacity", 1)
    }

    function mousemove2() {
        var x0 = x.invert(d3.mouse(this)[0]);
        var i = d3.bisect(time, x0);
        selectedData = wealth[i - 1]
        focus2
            .attr("cx", x(i))
            .attr("cy", y2(selectedData))
        focusText2
            .html("Year:" + (curr_year + i - 1) + "  ,  " + "M:" + parseInt(selectedData))
            .attr("x", x(i) + 15)
            .attr("y", y2(selectedData) - 35)
    }
    function mouseout2() {
        focus2.style("opacity", 0)
        focusText2.style("opacity", 0)
    }

    //summary portion
    var text = "";
    text += "Retirement Year = " + (curr_year + accum_years) + "\n"
    text += "Years in Retirement = " + (distr_years) + "\n"
    text += "Annual Income = " + (income) + "\n"
    text += "Money you need per year = " + (money) + "\n"
    text += "Portfolio Growth Rate (Accumulation Years) = " + parseInt(r1 * 100) + "%\n"
    text += "Portfolio Growth Rate (Distribution Years) = " + parseInt(r2 * 100) + "%\n"
    if (savings_per_year > 0) {
        text += "Savings required each year: $" + parseInt(savings_per_year)
    } else {
        text += "You have enough savings to live comfortably during retirement";
    }

    document.getElementById('summary').innerText = text
}

//date over time
function updateOverTime() {
    if (date_arr == null) { //first time entering data
        document.Formnum1.dates_over_time.value = date;
        document.Formnum1.savings_req_over_time.value = parseInt(savings_per_year);
        document.Formnum1.savings_req_over_time_bad.value = parseInt(bad_savings_per_year);

        netWorth();
        document.Formnum1.networth_over_time.value = parseInt(networth);
    } else {
        date_arr = date_arr.split(",");
        savings_req_arr = savings_req_arr.split(",");
        savings_req_arr_bad = savings_req_arr_bad.split(",");
        networth_time_arr = networth_time_arr.split(",");
        var most_recent = date_arr[date_arr.length - 1];

        if (most_recent == date) { //entering data again on same day
            var dates_over_time = date_arr.join();
            savings_req_arr[savings_req_arr.length - 1] = parseInt(savings_per_year);
            savings_req_arr_bad[savings_req_arr_bad.length - 1] = parseInt(bad_savings_per_year);
            netWorth();
            networth_time_arr[networth_time_arr.length - 1] = parseInt(networth);

        } else { //entering data on a diff day
            date_arr.push(date);
            savings_req_arr_bad.push(parseInt(bad_savings_per_year));
            savings_req_arr.push(parseInt(savings_per_year));
            netWorth();
            networth_time_arr.push(parseInt(networth));
            var dates_over_time = date_arr.join();
        }
        var savings_over_time = savings_req_arr.join();
        var savings_over_time_bad = savings_req_arr_bad.join();
        var networth_over_time = networth_time_arr.join();
        document.Formnum1.dates_over_time.value = dates_over_time;
        document.Formnum1.savings_req_over_time.value = savings_over_time;
        document.Formnum1.savings_req_over_time_bad.value = savings_over_time_bad;
        document.Formnum1.networth_over_time.value = networth_over_time;
    }
}

function networth_over_time_graph() {
    if (date_arr == null || date_arr.split(",").length == 1) {
        document.getElementById("trackData_description").innerText = "You don't have any data to show right now."
        // console.log("no graph today");
    } else {
        //console.log("yep we r gonna graph this shit");
        data_date = date_arr.split(",");
        data_networth = networth_time_arr.split(",");

        /*var currentWidth = parseInt(d3.select('#savings_req_time').style('width'), 10)
        if (currentWidth > 2000) {
            currentWidth = 2000;
        }*/
        var currentWidth = 1500;
        var m = [50, 150, 100, 150]; // margins, m[0], m[2] = top/below, m[1] = right, m[3] = left
        var w = currentWidth * 0.7; // width
        var h = 400 - m[0] - m[2]; // height

        //graph for savings req over time
        var graph = d3.select("#networth_time")
            .append("svg")
            .attr("width", w + m[1] + m[3])
            .attr("height", h + m[0] + m[2])
            .append("svg:g")
            .attr("transform", "translate(" + m[3] + "," + m[0] + ")");


        var x = d3.scaleTime().rangeRound([0, w]);
        var xAxis = d3.axisBottom(x).tickSize(-h).tickFormat(d3.timeFormat("%m-%d-%Y"));;
        var parseTime = d3.timeParse("%m/%d/%Y");
        x.domain(d3.extent(data_date, function (d, i) { console.log(data_date[i]); return parseTime(data_date[i]); }));

        var y = d3.scaleLinear().domain([0, Math.max.apply(Math, data_networth)]).range([h, 0]);

        graph.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + h + ")")
            .style("font-size", 12)
            .call(xAxis)

        graph.append("text")
            .attr("transform",
                "translate(" + (w / 2) + " ," +
                (h + m[0]) + ")")
            .style("text-anchor", "middle")
            .text("Date");

        // text label for the y axis
        graph.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - m[1])
            .attr("x", 0 - (h / 2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text("Networth");

        var yAxisLeft = d3.axisLeft(y).ticks(4)

        graph.append("g")
            .attr("class", "y axis")
            .attr("transform", "translate(-25,0)")
            .style("font-size", 12)
            .call(yAxisLeft);

        graph
            .append("text")
            .attr("x", (w / 2))
            .attr("y", 0 - (m[0] / 2))
            .attr("text-anchor", "middle")
            .style("font-size", "16px")
            .style("text-decoration", "underline")
            .text("Your networth over time")

        //shading
        var area = d3.area()
            .x(function (d, i) { return x(parseTime(data_date[i])); })
            .y1(function (d) {
                return y(d);
            })
            .y0(y(0))

        //shading
        graph
            .datum(data_networth)
            .append("path")
            .attr("d", area)
            .style("stroke-width", 2)
            .style("fill", "green")
            .style("stroke", "green")
            .style("opacity", .6)
    }

}

function savings_req_over_time() {
    if (date_arr == null || date_arr.split(",").length == 1) {
        // console.log("no graph today");
    } else {
        //console.log("yep we r gonna graph this shit");
        data_date = date_arr.split(",");
        data_savings = savings_req_arr.split(",");
        data_savings_bad = savings_req_arr_bad.split(",");

        /*var currentWidth = parseInt(d3.select('#savings_req_time').style('width'), 10)
        if (currentWidth > 2000) {
            currentWidth = 2000;
        }*/
        var currentWidth = 1500;
        var m = [50, 150, 100, 150]; // margins, m[0], m[2] = top/below, m[1] = right, m[3] = left
        var w = currentWidth * 0.7; // width
        var h = 400 - m[0] - m[2]; // height

        //graph for savings req over time
        var graph = d3.select("#savings_req_time")
            .append("svg")
            .attr("width", w + m[1] + m[3])
            .attr("height", h + m[0] + m[2])
            .append("svg:g")
            .attr("transform", "translate(" + m[3] + "," + m[0] + ")");


        var x = d3.scaleTime().rangeRound([0, w]);
        var xAxis = d3.axisBottom(x).tickSize(-h).tickFormat(d3.timeFormat("%m-%d-%Y"));;
        var parseTime = d3.timeParse("%m/%d/%Y");
        x.domain(d3.extent(data_date, function (d, i) { console.log(data_date[i]); return parseTime(data_date[i]); }));

        var y = d3.scaleLinear().domain([0, Math.max.apply(Math, data_savings)]).range([h, 0]);

        graph.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + h + ")")
            .style("font-size", 12)
            .call(xAxis)

        graph.append("text")
            .attr("transform",
                "translate(" + (w / 2) + " ," +
                (h + m[0]) + ")")
            .style("text-anchor", "middle")
            .text("Date");

        // text label for the y axis
        graph.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - m[1])
            .attr("x", 0 - (h / 2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text("Savings Required");

        var yAxisLeft = d3.axisLeft(y).ticks(4)

        graph.append("g")
            .attr("class", "y axis")
            .attr("transform", "translate(-25,0)")
            .style("font-size", 12)
            .call(yAxisLeft);

        graph
            .append("text")
            .attr("x", (w / 2))
            .attr("y", 0 - (m[0] / 2))
            .attr("text-anchor", "middle")
            .style("font-size", "16px")
            .style("text-decoration", "underline")
            .text("Savings required over time")

        // define the 1st line
        var valueline = d3.line()
            .x(function (d, i) { return x(parseTime(data_date[i])); })
            .y(function (d) { return y(d); });

        // define the 2nd line
        var valueline2 = d3.line()
            .x(function (d, i) { return x(parseTime(data_date[i])); })
            .y(function (d) { return y(d); });

        graph.append("path")
            .data([data_savings])
            .attr("class", "line-7")
            .attr("d", valueline);

        graph.append("path")
            .data([data_savings_bad])
            .attr("class", "line-6")
            .attr("d", valueline2);
    }
}

result()

window.addEventListener('resize', result); //to make graphs responsive
