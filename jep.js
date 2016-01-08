var currentGame;
var showNest;

function pickRandomGame(data){
	var randInt = Math.round((Math.random()*data.length)-1);
	return data[randInt];
}

function updateGameInfo(gameData){
	$(".round").text("Round: "+gameData[" Round"]);
	$(".number").text("Show Number: "+gameData["Show Number"]);
	$(".air-date").text("Air Date: "+gameData[" Air Date"]);
}

function fetchAnswer(question){
	for(var i=0; i<currentGame.values.length; i++){
		if (question === currentGame.values[i][" Question"]){
			return currentGame.values[i][" Answer"];
		}
	}

	return "Error Couldnt Compare Strings For Some Reason";
	//return d3.nest().key(function(d){return d[" Category"];}).entries(currentGame.values);
}

function fetchQuestion(answer){
	for(var i=0; i<currentGame.values.length; i++){
		if (answer === currentGame.values[i][" Answer"]){
			return currentGame.values[i][" Question"];
		}
	}

	return "Error Couldnt Compare Strings For Some Reason";
}

function showAnswer(element){
	var answer = fetchAnswer(element[0][0].innerHTML);
	element
		.transition().duration(200)
		.style("background-color","steelblue")
		.style("color","white");

	element[0][0].innerHTML = answer;
}

function hideAnswer(element){
	var question = fetchQuestion(element[0][0].innerHTML);
	element
		.transition().duration(200)
		.style("background-color","white")
		.style("color","gray");

	element[0][0].innerHTML = question;
}

function clickedCell(){
	console.log(d3.select(this).style("background-color"));
	//Hackey, this should be changed
	if(d3.select(this).style("background-color")!=="rgb(255, 255, 255)"){
		hideAnswer(d3.select(this));
	}
	else{
		showAnswer(d3.select(this));
	}
}

function buildBoard(gameData){
	updateGameInfo(gameData.values[0]);
	var categoryNest = d3.nest()
							.key(function(d){return d[" Category"];})
							.entries(gameData.values);

	// var priceNest = d3.nest()
	// 					.key(function(d){return d[" Value"]})
	// 					entries(gameData.values);
	
	//console.log(categoryNest);

	var headers  =[];
    categoryNest.forEach(function(d){
    	headers.push(d.key);
    });

	var table = d3.select(".jep-board");
    var thead = table.append("thead").attr("class","thead");
    var tbody = table.append("tbody").attr("class","tbody");

    // append the header row
    thead.append("tr")
        .selectAll("th")
        .data(headers)
        .enter()
        .append("th")
        .html(function(column) { return column;});

    var rows = table.selectAll(".row")
    					.data(categoryNest)
    					.enter().append("tr")
    					.attr("class", "row");

    var cells = rows.selectAll("td")
    	   			.data(function(row) {
            			return categoryNest.map(function(column) {
            				//console.log(column);
                			return {column: column.key, value: column.values};
            			});
        			})
        			.enter()
        			.append("td")
        			.attr("class","cell")
        			.html(function(d,i){
        				if(d.value.length>0){return d.value.pop()[" Question"];}
        				else{d3.select(this).remove();}
        			})
        			.on("click",clickedCell);
}

function clearBoard(){
	d3.select(".jep-board").remove();
	d3.select("body").append("table").attr("class","jep-board");
}

function loadGame(){
	clearBoard();
	var gameData = pickRandomGame(showNest);
 	currentGame = gameData.values[Math.round(Math.random()*1)];

  	currentGame.values.forEach(function(d){
  	//& is screwing up string omparision
  	//TODO research global && stripping
  		d[" Answer"] = d[" Answer"].replace("&","and");
  		d[" Question"] = d[" Question"].replace("&","and");
  	});
  	//0 === Jep, 1 === double jes, 3 === final jep
  	buildBoard(currentGame);
}

d3.csv("questions.csv", function(data) {
  //console.log("Raw Data",data);

  showNest = d3.nest()
                .key(function(d){return d["Show Number"];})
                .key(function(d){return d[" Round"];})
                .entries(data);

  loadGame();
});