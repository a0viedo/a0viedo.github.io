/* global d3, document, window */
document.addEventListener('DOMContentLoaded', documentReady, false);

var PIE_CHART_COLORS = ['#5E2971', '#5A9E9B', '#A50C00', '#FFAD2E', '#FBDEE1', '#195E08', '#586AFC', '#7B4833', '#BFBBB6', '#D19469'];
var DEFAULT_WIDTH = 640;
var DEFAULT_HEIGHT = 450;

// non-random way to intercale 2 small elements for each big one
function pseudoShuffle(array) {
  var copiedArray = array.slice(0, array.length);
  var i = 0,
    firstHalf,
    secondHalf,
    result = [];

  copiedArray.reverse();

  firstHalf = copiedArray.slice(0, Math.ceil(copiedArray.length/2));
  secondHalf = copiedArray.slice(Math.ceil(copiedArray.length/2), copiedArray.length);

  while(firstHalf.length || secondHalf.length) {
    if((i % 2 === 0 || firstHalf.length === 0) && secondHalf.length) {
      result.push(secondHalf.pop());
    } else {
      result.push(firstHalf.pop());
      if(firstHalf.length !== 0) {
        result.push(firstHalf.pop());
      }
    }
    i++;
  }

  return result;
}

function drawGraphsWithFilter(parsedRows, fieldMap, domElement) {
  var result = generateGraphData(parsedRows, fieldMap);

  graphPieChart(pseudoShuffle(result.profesionData), domElement, {
    width: 720,
    height: DEFAULT_HEIGHT,
    title: 'Profesiones',
    // margins: {
    //   bottom: 20,
    //   left: 100,
    //   right: 60
    // },
    tip: {
      offset: [30, 0]
    },
    id: 'pieChartProfesiones',
    display: true,
    padding: 100,
    xOffset: 40
  });

  // ///////////////// salario ///////////////////
  graphHistogram(result.salaryData, domElement, {
    width: DEFAULT_WIDTH,
    height: DEFAULT_HEIGHT,
    padding: 100,
    margins: {
      top: 20,
      right: 20,
      bottom: 60,
      left: 20
    },
    bins: 30,
    xAxis: {
      text: 'Salario',
      domain: [5000, 100000]
    },
    id: 'histogramaSalarios',
    display: true,
    barTextSize: '13px'
  });

  // ///////////////// edades ////////////////////
  graphHistogram(result.ageData, domElement, {
    width: 550,
    height: DEFAULT_HEIGHT,
    padding: 100,
    margins: {
      top: 20,
      right: 20,
      bottom: 60,
      left: 20
    },
    bins: 12,
    xAxis: {
      text: 'Edades',
      domain: [15, 50]
    },
    display: true,
    id: 'histogramaEdades'
  });

  // ///////////////////////////// sexos //////////////////////////////
  graphPieChart(result.sexData.sort(sortObjDecreasing), domElement, {
    width: DEFAULT_WIDTH,
    height: DEFAULT_HEIGHT,
    tip: {
      offset: [10, 20]
    },
    title: 'Sexos',
    id: 'pieChartSexos',
    display: true
  });

  // //////////////// horario de respuesta ////////////////
  graphHistogram(result.responseHourData, domElement, {
    width: DEFAULT_WIDTH,
    height: DEFAULT_HEIGHT,
    padding: 0,
    margins: {
      top: 20,
      right: 20,
      bottom: 100,
      left: 60
    },
    bins: 30,
    xAxis: {
      text: 'Hora de respuesta',
      domain: [0, 24]
    },
    id: 'histogramaHoraDeRespuesta',
    display: true,
    barTextSize: '13px'
  });
}

function drawGeneralGraphs(parsedRows, fieldMap, domElement) {
  var provincesInfo = getSalaryAvgPerProvince(parsedRows, fieldMap);
  var totalAverages = getTotalAvgSalary(parsedRows, fieldMap);

  var provinceSalaryAggregation = [];
  var provinceExperienceAggregation = [];
  var provinceConformityAggregation = [];

  Object.keys(provincesInfo).forEach(function(e) {
    push(provinceSalaryAggregation, e, 'avgSalary');
    push(provinceExperienceAggregation, e, 'avgExperience');
    push(provinceConformityAggregation, e, 'avgConformity');
  });

  function push(arr, e, property) {
    arr.push({ name: e, value: provincesInfo[e][property], count: provincesInfo[e].count});
  }

  provinceSalaryAggregation.sort(sortObjDecreasing);
  provinceExperienceAggregation.sort(sortObjDecreasing);
  provinceConformityAggregation.sort(sortObjDecreasing);

  graphBarChart(provinceSalaryAggregation, domElement, {
    xAxis: {
      text: 'Provincia',
      transform: 'rotate(-45)',
      domain: pick('name')
    },
    yAxis: {
      text: 'Salario promedio',
      domain: [8000, 24000]
    },
    tips: {
      parse: Math.round.bind()
    },
    width: DEFAULT_WIDTH,
    height: DEFAULT_HEIGHT,
    margins: {
      top: 20,
      bottom: 80,
      left: 10,
      right: 0
    },
    padding: 80,
    textLabel: 'Salario promedio total: ' + Math.round(totalAverages.salary)
  });

  graphBarChart(provinceExperienceAggregation, domElement, {
    xAxis: {
      text: 'Provincia',
      transform: 'rotate(-45)',
      domain: pick('name')
    },
    yAxis: {
      text: 'Años de experiencia promedio',
      domain: [3.5, 5.7]
    },
    tips: {
      parse: function(n) {
        return n.toFixed(2);
      }
    },
    margins: {
      top: 20,
      bottom: 80,
      left: 10,
      right: 0
    },
    width: DEFAULT_WIDTH,
    height: DEFAULT_HEIGHT,
    padding: 60,
    textLabel: 'Años de experiencia total: ' + totalAverages.experience.toFixed(2)
  });

  // /////////////////// conformidad ///////////////////
  graphBarChart(provinceConformityAggregation, domElement, {
    xAxis: {
      text: 'Provincia',
      transform: 'rotate(-45)',
      domain: pick('name')
    },
    yAxis: {
      text: 'Conformidad promedio',
      domain: [2, 3.6]
    },
    tips: {
      parse: function(n) {
        return n.toFixed(2);
      }
    },
    width: DEFAULT_WIDTH,
    height: DEFAULT_HEIGHT,
    margins: {
      top: 20,
      bottom: 80,
      left: 10,
      right: 0
    },
    padding: 60,
    textLabel: 'Conformidad promedio total: ' + totalAverages.conformity.toFixed(2)
  });

  // var experienceSalaryData = parsedRows.map(function(e) {
  //   var xValue;

  //   if(e[fieldMap.experience] === '10+') {
  //     xValue = 10;
  //   } else if(e[fieldMap.experience] === 'Menos de un año') {
  //     xValue = 0.5;
  //   } else {
  //     xValue = getAvgFromFirstAndLast(e[fieldMap.experience]);
  //   }

  //   return {
  //     yValue: e[fieldMap.salary],
  //     xValue: xValue,
  //     label: e[fieldMap.province]
  //   };
  // });

  // graphScatterPlot(experienceSalaryData, domElement, {
  //   xAxis: {
  //     text: 'Experiencia'
  //   },
  //   yAxis: {
  //     text: 'Salario'
  //   },
  //   width: DEFAULT_WIDTH,
  //   height: DEFAULT_HEIGHT,
  //   id: 'scatterPlotExperienceSalary'
  // });

  // // scatterPlot avg conformity vs avg salary
  // var conformityAndSalary = parsedRows.map(function(e) {
  //   return {
  //     xValue: e[fieldMap.conformity],
  //     yValue: e[fieldMap.salary]
  //   };
  // });

  // graphScatterPlot(conformityAndSalary, domElement, {
  //   xAxis: {
  //     text: 'Conformidad',
  //     domain: [0, 5]
  //   },
  //   yAxis: {
  //     text: 'Salario'
  //     // domain: [0,5  ]
  //   },
  //   width: DEFAULT_WIDTH,
  //   height: DEFAULT_HEIGHT,
  //   id: 'scatterPlotConformitySalary'
  // });
}

function applyFilters(data, profesion, province, dedication) {
  return data.parsedRows.filter(function(row) {
    var profesionMatch = true;
    var provinceMatch = true;
    var dedicationMath = true;

    if(profesion !== '*') {
      profesionMatch = row[data.fieldMap.profesion] === profesion;
    }

    if(province !== '*') {
      provinceMatch = row[data.fieldMap.province] === province;
    }

    if(dedication.length !== 3) {
      dedicationMath = dedication.indexOf(row[data.fieldMap.dedication]) !== -1;
    }
    
    return profesionMatch && provinceMatch && dedicationMath;
  });
}

function documentReady() {
  'use strict';

  function getDedication(){
    var dedication = [];
    if(checkBoxFullTime.checked) {
      dedication.push('Full-Time');
    }
    if(checkBoxPartTime.checked) {
      dedication.push('Part-Time');
    }
    if(checkBoxRemote.checked) {
      dedication.push('Remoto');
    }

    return dedication;
  }

  function updateAll() {
    var dedication = getDedication();

    var filteredData = applyFilters(window.analisis, profesionSelect.value, provinceSelect.value, dedication);

    fieldMap = fieldMap || window.analisis.fieldMap;

    var result = generateGraphData(filteredData, fieldMap);

    pieChartProfesiones = pieChartProfesiones || document.querySelector('#pieChartProfesiones');

    updateAllExceptProfesions(result.salaryData, result.responseHourData,
      result.ageData, result.sexData);

    updatePieChart(pieChartProfesiones, result.profesionData);

    updateResponsesText(filteredData.length);
  }

  function updateAllExceptProfesions(salaryData, responseHourData, ageData, sexData) {
    histogramaSalarios = histogramaSalarios || document.querySelector('#histogramaSalarios');
    histogramResponseHour = histogramResponseHour || document.querySelector('#histogramaHoraDeRespuesta');
    histogramAge = histogramAge || document.querySelector('#histogramaEdades');
    pieChartSexos = pieChartSexos || document.querySelector('#pieChartSexos');

    updateHistogram(histogramaSalarios, salaryData);
    updateHistogram(histogramResponseHour, responseHourData);
    updateHistogram(histogramAge, ageData);
    updatePieChart(pieChartSexos, sexData);
  }
  // selects
  var profesionSelect = document.querySelector('#profesionSelect');
  var provinceSelect = document.querySelector('#provinceSelect');
  var checkBoxFullTime = document.querySelector('#checkBoxFullTime');
  var checkBoxPartTime = document.querySelector('#checkBoxPartTime');
  var checkBoxRemote = document.querySelector('#checkBoxRemoto');

  // svgs
  var histogramaSalarios;
  var pieChartSexos;
  var pieChartProfesiones;
  var histogramResponseHour;
  var histogramAge;

  var fieldMap;

  profesionSelect.addEventListener('change', function() {
    var dedication = getDedication();
    var filteredData = applyFilters(window.analisis, profesionSelect.value, provinceSelect.value, dedication);

    fieldMap = fieldMap || window.analisis.fieldMap;

    var result = generateGraphData(filteredData, fieldMap);

    pieChartProfesiones = pieChartProfesiones || document.querySelector('#pieChartProfesiones');

    updateAllExceptProfesions(result.salaryData, result.responseHourData,
      result.ageData, result.sexData);
    pieChartProfesiones.style.display = profesionSelect.value === '*' ? 'inline' : 'none';

    if(profesionSelect.value === '*') {
      updatePieChart(pieChartProfesiones, result.profesionData);
    }

    updateResponsesText(filteredData.length);
  }, false);

  provinceSelect.addEventListener('change', updateAll);

  checkBoxRemote.addEventListener('change', updateAll);
  checkBoxPartTime.addEventListener('change', updateAll);
  checkBoxFullTime.addEventListener('change', updateAll);

  d3.text('/datasets/salarios.csv', function(err, rows) {
    if(err) {
      console.log('Something bad happened Jim');
      return;
    }

    var fieldMap = {
      province: 3,
      salary: 7,
      experience: 4,
      conformity: 8,
      age: 2,
      hour: 0,
      profesion: 5,
      sex: 1,
      dedication: 6
    };

    var parsedRows = d3.csv.parseRows(rows, function(row) {
      row[fieldMap.salary] = +row[fieldMap.salary];
      return row;
    });

    window.analisis = {
      fieldMap: fieldMap,
      parsedRows: parsedRows
    };

    drawGraphsWithFilter(parsedRows, fieldMap, document.querySelector('#dynamicGraphs'));
    updateResponsesText(parsedRows.length);

    drawGeneralGraphs(parsedRows, fieldMap, document.querySelector('#staticGraphs'));
  });
}

function updateResponsesText(number) {
    document.querySelector('#dynamicGraphs h2').innerHTML = 'Cantidad de datos: ' + number;
    document.querySelector('#dynamicGraphs h2').style.display = 'block';
}

function min(data) {
  var actualMin = d3.min(data, pick('value'));

  return actualMin - (actualMin / 100) * 20;
}

function max(data) {
  var actualMax = d3.max(data, pick('value'));

  return actualMax + (actualMax / 100) * 10;
}

function getTotalAvgSalary(data, fieldMap) {
  var sum = 0;
  var experienceSum = 0;
  var conformitySum = 0;

  data.forEach(function(elem) {
    sum += elem[fieldMap.salary];
    conformitySum += +elem[fieldMap.conformity];

    if(elem[fieldMap.experience] === 'Menos de un año') {
      experienceSum += 0.5;
    } else if(elem[fieldMap.experience] === '10+') {
      experienceSum += 10;
    } else {
      experienceSum += (+elem[fieldMap.experience].substr(0, 1) +
      +elem[fieldMap.experience].substr(elem[fieldMap.experience].length -1)) / 2;
    }
  });
  return {
    salary: sum / data.length,
    conformity: conformitySum / data.length,
    experience: experienceSum / data.length
  };
}

function getSalaryAvgPerProvince(data, fieldMap) {
  var res = {};

  data.forEach(function(elem) {
    var province = elem[fieldMap.province];

    if(!res[province]) {
      res[province] = {
        salarySum: 0,
        count: 0,
        experienceMap: {},
        conformitySum: 0
      };
    }

    res[province].salarySum += elem[fieldMap.salary];
    res[province].conformitySum += +elem[fieldMap.conformity];

    if(!res[province].experienceMap[elem[fieldMap.experience]]) {
      res[province].experienceMap[elem[fieldMap.experience]] = 0;
    }
    res[province].experienceMap[elem[fieldMap.experience]]++;
    res[province].count++;
  });

  Object.keys(res).forEach(function(key) {
    var provinceExperienceSum = 0;

    Object.keys(res[key].experienceMap).forEach(function(experienceGap) {
      var avg;

      if(experienceGap === 'Menos de un año') {
        provinceExperienceSum += 0.5 * res[key].experienceMap[experienceGap];
        return;
      }

      if(experienceGap === '10+') {
        provinceExperienceSum += 10 * res[key].experienceMap[experienceGap];
        return;
      }

      avg = (+experienceGap.substr(0, 1) + +experienceGap.substr(experienceGap.length -1)) / 2;
      provinceExperienceSum += avg * res[key].experienceMap[experienceGap];
    });

    res[key].avgExperience = provinceExperienceSum / res[key].count;
    res[key].avgSalary = res[key].salarySum / res[key].count;
    res[key].avgConformity = res[key].conformitySum / res[key].count;
  });

  return res;
}

function graphBarChart(data, parentNode, options) {
  var margins = options.margins || {
      top: 20,
      right: 20,
      bottom: 20,
      left: 20
    },
    width = options.width // - margins.left - margins.right,
    height = options.height - margins.top - margins.bottom,
    padding = options.padding;

  var line;
  var x = d3.scale.ordinal()
    .rangeRoundBands([padding, width - padding], 0.1);

  var y = d3.scale.linear()
    .range([height, 0]);

  var xAxis = d3.svg.axis()
    .scale(x)
    .orient('bottom');

  var yAxis = d3.svg.axis()
    .scale(y)
    .orient('left');

  var svg = d3.select(parentNode).append('svg')
    .attr('width', width)// + margins.left + margins.right)
    .attr('height', height + margins.top + margins.bottom)
    .append('g')
    .attr('transform', 'translate(' + margins.left + ',' + margins.top + ')');

  configureAxesDomains(data, options, x, y);

  var tip = d3.tip()
    .attr('class', 'd3-tip')
    .offset([-10, 0])
    .html(function(d) {
      var fn = typeof options.tips.parse === 'function' ?
        options.tips.parse : Math.round.bind();
      var tip = ': <span style="color:white">' + fn(d.value) + '</span>';

      if(d.count) {
        tip += '<br>Cantidad: <span> ' + d.count + '</span>';
      }
      tip = tip.replace('', options.yAxis.text);
      return tip;
    });

  svg.append('g')
    .attr('class', 'x axis')
    .attr('transform', 'translate(0,' + height + ')')
    .call(xAxis)
    .selectAll('text')
    .style('text-anchor', 'end')
    .attr('transform', function() {
      if(options.xAxis && options.xAxis.transform) {
        d3.select(this).attr('x', -5).attr('y', 5);
        return options.xAxis.transform;
      }
    });

  svg.append('g')
    .attr('class', 'y axis')
    .attr('transform', 'translate('+padding+',0)')
    .call(yAxis)
    .selectAll('text')
    .attr('transform', function() {
      if(options.yAxis && options.yAxis.transform) {
        return options.yAxis.transform;
      }
    });

  svg.selectAll('.bar')
    .data(data)
    .enter().append('rect')
    .attr('class', 'bar')
    .attr('x', compose(x, pick('name')))
    .attr('width', x.rangeBand())
    .attr('y', compose(y, pick('value')))
    .attr('height', function(d) {
      return height - y(d.value);
    })
    .on('mouseover', tip.show)
    .on('mouseout', tip.hide);

  svg.append('text')
      .attr('text-anchor', 'middle')
      .attr('transform', 'translate('+ (padding/3) +','+(height/2)+')rotate(-90)')
      .text(options.yAxis.text);

  svg.append('text')
      .attr('text-anchor', 'middle')
      .attr('transform', 'translate('+ (width/2) +','+(height + margins.top + margins.bottom-(padding/3))+')')
      .text(options.xAxis.text);

  svg.call(tip);

  if(options.textLabel) {
    addText({
      elem: svg,
      x: (width - 80),
      y: (margins.bottom / 2),
      textAnchor: 'end',
      fontSize: '16px',
      text: options.textLabel
    });
  }

  // add interpolation
  if(options.interpolation) {
    line = d3.svg.line()
      .x(function(d, i) {return x(d.name) + i;}) // composing twice is more pure but who cares?
      .y(compose(y, pick('value')))
      .interpolate(options.interpolation);
    svg.append('path')
      .datum(data)
      .attr('class', 'line')
      .attr('d', line);
  }
}

function addText(obj) {
  if(!obj || !obj.elem || typeof obj.elem.append !== 'function') {
    console.log('Invalid call to addText.');
    return;
  }

  obj.elem.append('text')
    .attr('x', obj.x)
    .attr('y', obj.y)
    .attr('text-anchor', obj.textAnchor)
    .style('font-size', obj.fontSize)
    .text(obj.text);
}

function configureAxesDomains(data, options, x, y) {
  function configureAxisDomain(axis, axisFn) {
    if(options && options[axis] && options[axis].domain) {
      if(typeof options[axis].domain === 'function') {
        axisFn.domain(data.map(options[axis].domain));
      } else {
        axisFn.domain(options[axis].domain);
      }
    } else {
      axisFn.domain([min(data), max(data)]);
    }
  }

  x && configureAxisDomain('xAxis', x);
  y && configureAxisDomain('yAxis', y);
}

function graphHistogram(values, parentNode, options) {
  function addBarText(data) {
    bar.append('text')
      .style('cursor', 'default')
      .attr('dy', '.75em')
      .attr('y', 4)
      .attr('x', Math.ceil((x(data[0].dx) - x(0)) / 2))
      .attr('text-anchor', 'middle')
      .style('font-size', options.barTextSize)
      .attr('class', 'histogram-text')
      .text(function(d) {
        if(d.height < 17) {
          d3.select(this)
            .attr('class', null)
            .attr('y', -15);
        }
        return formatCount(d.y);
      });
  }

  var formatCount = d3.format(',.0f');

  var margin = options.margins || {
      top: 20,
      right: 20,
      bottom: 100,
      left: 60
    },
    width = options.width - margin.left - margin.right,
    height = options.height - margin.top - margin.bottom,
    numOfBins = options.bins || 20;

  var x = d3.scale.linear()
      .range([0, width]);

  configureAxesDomains(values, options, x);

  var line;
  var data = d3.layout.histogram()
      .bins(x.ticks(numOfBins))(values);

  var y = d3.scale.linear()
      .domain([0, d3.max(data, pick('y'))])
      .range([height, 0]);

  var xAxis = d3.svg.axis()
      .scale(x)
      .orient('bottom');

  var svg = d3.select(parentNode).append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .attr('id', options.id)
      .style('display', options.display ? '' : 'none')
      .append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

  saveGraphInfo(options.id, {
    height: height,
    width: width,
    options: options,
    addBarText: addBarText,
    configureAxesDomains: configureAxesDomains,
    x: x
  });

  var bar = svg.selectAll('.bar')
      .data(data)
      .enter().append('g')
      .attr('class', 'bar')
      .attr('transform', function(d) {
        return 'translate(' + x(d.x) + ',' + y(d.y) + ')';
      });

  bar.append('rect')
      .attr('x', 1)
      .attr('width', x(data[0].dx) - x(0) - 1)
      .attr('height', function(d) {d.height= height - y(d.y); return height - y(d.y);});

  addBarText(data);

  svg.append('g')
      .attr('class', 'x axis')
      .attr('transform', 'translate(0,' + height + ')')
      .call(xAxis);

  svg.append('text')
      .attr('text-anchor', 'middle')
      .attr('transform', 'translate('+ (width/2) +','+(height + margin.top + (20/100 *margin.bottom))+')')
      .text(options.xAxis.text);

  // add interpolation
  if(options.interpolation) {
    line = d3.svg.line()
      .x(function(d, i) {return x(d[0]) + i;}) // composing twice is more pure but who cares?
      .y(compose(y, pick('value')))
      .interpolate(options.interpolation);
    svg.append('path')
      .datum(data)
      .attr('class', 'line')
      .attr('d', line);
  }
}

function getAvgFromFirstAndLast(str, digits) {
  digits = digits || 1;
  return (+str.substr(0, digits) + +str.substr(str.length - digits)) / 2;
}

function graphPieChart(data, parentNode, options) {
  function addSlices(data, color) {
    var slice = svg.select('.slices').selectAll('path.slice')
      .data(pie(data), key);

    slice.enter()
      .insert('path')
      .attr('fill', compose(color, pick('data.name')))
      .attr('class', 'slice')
      .transition().duration(1000)
      .attrTween('d', arcTween);

    slice.exit().remove();
  }

  function removeSlices() {
    svg.select('.slices').selectAll('path.slice')
      .remove();
  }

  function arcTween(d) {
    var interpolate;

    interpolate = d3.interpolate({startAngle: 0, endAngle: 0}, d);
    return compose(arc, interpolate);
  }

  var margins = options.margins,
    width = options.width,
    height = options.height,
    radius = Math.min(width, height) / 2,
    svg,
    pie,
    arc,
    tip,
    outerArc,
    key,
    color;

  svg = d3.select(parentNode)
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .attr('id', options.id)
    .style('display', options.display ? '' : 'none')
    .append('g');

  svg.append('g')
    .attr('class', 'slices');
  svg.append('g')
    .attr('class', 'labels');
  svg.append('g')
    .attr('class', 'lines');

  pie = d3.layout.pie()
    .sort(null) // this avoids further sorting, we assume data it's already sorted in the right way
    .value(pick('value'));

  arc = d3.svg.arc()
    .outerRadius(radius * 0.8)
    .innerRadius(radius * 0.4);

  tip = d3.tip()
    .attr('class', 'd3-tip')
    .offset(options.tip ? options.tip.offset : [0, 0])
    .html(function(d) {
      return d.data.name + ': ' + d.data.value;
    });

  outerArc = d3.svg.arc()
    .innerRadius(radius * 0.9)
    .outerRadius(radius * 0.9);

  var xOffset = options.xOffset || 0;
  svg.attr('transform', 'translate(' + ((width / 2) + xOffset) + ',' + height / 2 + ')');

  key = pick('data.name');

  color = d3.scale.ordinal()
    .domain(data.map(pick('name')))
    .range(PIE_CHART_COLORS);

    /* ------- PIE SLICES -------*/
  svg.select('.slices').selectAll('path.slice')
    .data(pie(data), key);

  var addLabelsParams = {
    tip: tip,
    outerArc: outerArc,
    key: key,
    options: options,
    pie: pie,
    svg: svg,
    radius: radius,
    arc: arc
  };

  saveGraphInfo(options.id, {
    height: height,
    width: width,
    options: options,
    pie: pie,
    arcTween: arcTween,
    addLabelsParams: addLabelsParams,
    removeSlices: removeSlices,
    addSlices: addSlices,
    arc: arc
  });

  addSlices(data, color);
  addLabelsParams.data = data;
  addPieChartLabels(addLabelsParams);

  if(options.title) {
    addText({
      elem: svg,
      x: 0,
      y: 8,
      textAnchor: 'middle',
      fontSize: '21px',
      text: options.title
    });
  }

  return svg;
}

function addPieChartLabels(params) {
  var svg = params.svg;
  var pie = params.pie;
  var data = params.data;
  var key = params.key;
  var tip = params.tip;
  var outerArc = params.outerArc;
  var radius = params.radius;
  var arc = params.arc;

  var text = svg.select('.labels').selectAll('text')
    .data(pie(data), key);

  text.enter()
    .append('text')
    .attr('dy', '.35em')
    .text(pick('data.name'));
  
  function midAngle(d) {
    return d.startAngle + (d.endAngle - d.startAngle)/2;
  }

  text.transition().duration(1000)
    .attrTween('transform', function(d) {
      var interpolate;

      this._current = this._current || d;
      interpolate = d3.interpolate(this._current, d);
      this._current = interpolate(0);
      return function(t) {
        var d2 = interpolate(t);
        var pos = outerArc.centroid(d2);

        pos[0] = radius * (midAngle(d2) < Math.PI ? 1 : -1);// - 20;
        pos[0] += pos[0] < 0 ? 20 : -20;
        return 'translate('+ pos +')';
      };
    })
    .styleTween('text-anchor', function(d) {
      var interpolate;

      this._current = this._current || d;
      interpolate = d3.interpolate(this._current, d);
      this._current = interpolate(0);
      return function(t) {
        var d2 = interpolate(t);

        return midAngle(d2) < Math.PI ? 'start':'end';
      };
    });

  text.exit()
    .remove();

  /* ------- SLICE TO TEXT POLYLINES -------*/

  var polyline = svg.select('.lines').selectAll('polyline')
    .data(pie(data), key);
  
  polyline.enter()
    .append('polyline');

  polyline.transition().duration(1000)
    .attrTween('points', function(d) {
      var interpolate;

      this._current = this._current || d;
      interpolate = d3.interpolate(this._current, d);
      this._current = interpolate(0);
      return function(t) {
        var d2 = interpolate(t);
        var pos = outerArc.centroid(d2);

        pos[0] = radius * 0.85 * (midAngle(d2) < Math.PI ? 1 : -1);
        return [arc.centroid(d2), outerArc.centroid(d2), pos];
      };
    });
  
  polyline.exit()
    .remove();

  svg.call(tip);
  svg.select('.slices').selectAll('path.slice')
    .on('mouseover', tip.show)
    .on('mouseout', tip.hide);
}

function graphScatterPlot(data, parentNode, options) {
  var margin = options.margins || {top: 20, right: 20, bottom: 40, left: 60},
    width = options.width - margin.left - margin.right,
    height = options.height - margin.top - margin.bottom;

  /*
   * value accessor - returns the value to encode for a given data object.
   * scale - maps value to a visual display encoding, such as a pixel position.
   * map function - maps from data value to display value
   * axis - setsup axis
   */
  // setup x
  var xValue = pick('xValue'), // data -> value
    xScale = d3.scale.linear().range([0, width]), // value -> display
    xMap = compose(xScale, xValue), // data -> display
    xAxis = d3.svg.axis().scale(xScale).orient('bottom');

  // setup y
  var yValue = pick('yValue'), // data -> value
    yScale = d3.scale.linear().range([height, 0]), // value -> display
    yMap = compose(yScale, yValue), // data -> display
    yAxis = d3.svg.axis().scale(yScale).orient('left');

  // add the graph canvas to the body of the webpage
  var svg = d3.select(parentNode).append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
    .append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

  // add the tooltip area to the webpage
  d3.select('body').append('div')
      .attr('class', 'tooltip')
      .style('opacity', 0);

  // don't want dots overlapping axis, so add in buffer to data domain
  if(options.xAxis.domain) {
    xScale.domain(options.xAxis.domain);
  } else {
    xScale.domain([d3.min(data, xValue) -1, d3.max(data, xValue)+1]);
  }
  
  if(options.yAxis.domain) {
    yScale.domain(options.yAxis.domain);
  } else {
    yScale.domain([d3.min(data, yValue)-1, d3.max(data, yValue)+1]);
  }

  // x-axis
  svg.append('g')
    .attr('class', 'x axis')
    .attr('transform', 'translate(0,' + height + ')')
    .call(xAxis)
    .append('text')
    .attr('class', 'label')
    .attr('x', width)
    .attr('y', -6)
    .style('text-anchor', 'end')
    .text(options.xAxis.text);

  // y-axis
  svg.append('g')
    .attr('class', 'y axis')
    .call(yAxis)
    .append('text')
    .attr('class', 'label')
    .attr('transform', 'rotate(-90)')
    .attr('y', 6)
    .attr('dy', '.71em')
    .style('text-anchor', 'end')
    .text(options.yAxis.text);

  // draw dots
  svg.selectAll('.dot')
    .data(data)
    .enter().append('circle')
    .attr('class', 'dot')
    .attr('r', 3.5)
    .attr('cx', xMap)
    .attr('cy', yMap)
    .style('fill', 'black');
}

function saveGraphInfo(id, info) {
  var selector;

  if(!info || !info.options) {
    console.log('Invalid call to saveGraphInfo.');
    return;
  }

  selector = '#' + id;
  if(document.querySelector(selector)) {
    document.querySelector(selector).graph = info;
  } else {
    console.log('Invalid selector:', id);
  }
}

function updateHistogram(domElement, data) {
  var svg,
    width,
    height,
    options,
    histData,
    x,
    y;

  if(!domElement || !data) {
    console.log('Invalid call to updateHistogram.');
    return;
  }
  
  svg = d3.select(domElement);

  width = domElement.graph.width;
  height = domElement.graph.height;
  options = domElement.graph.options;
  x = domElement.graph.x;

  configureAxesDomains(data, options, x);

  if(!data.length) {
    svg
      .append('text')
      .attr('x', width / 2)
      .attr('y', height / 2)
      .attr('class', 'no-data')
      .text('No hay datos');

    svg.selectAll('.bar rect')
      .transition()
      .duration(400)
      .ease('linear')
      .attr('height', 0);

    svg.selectAll('.bar text').remove();
    return;
  }
  
  svg.selectAll('.no-data').remove();

  histData = d3.layout.histogram()
    .bins(x.ticks(options.bins))(data);

  y = d3.scale.linear()
    .domain([0, d3.max(histData, pick('y'))])
    .range([height, 0]);

  svg.selectAll('.bar')
    .data(histData)
    .attr('transform', function(d) {
      return 'translate(' + x(d.x) + ',' + y(d.y) + ')';
    })
    .select('rect')
    .attr('height', 0)
    .transition()
    .duration(400)
    .ease('linear')
    .attr('height', function(d) {d.height= height - y(d.y); return height - y(d.y);});

  svg.selectAll('.bar text').remove();

  domElement.graph.addBarText(histData);
}

function updatePieChart(domElement, data) {
  var svg,
    pie,
    path,
    addLabelsParams,
    allZeros,
    color;

  if(!domElement || !data) {
    console.log(domElement, data);
    console.log('Invalid call to updatePieChart.');
    return;
  }

  svg = d3.select(domElement);

  allZeros = data.filter(function(e) {
    return e.value !== 0;
  }).length === 0;

  if(!data.length || allZeros) {
    domElement.graph.removeSlices();
    svg
      .selectAll('.labels text')
      .transition()
      .duration(700)
      .style('fill', 'white')
      .remove();
    svg
      .selectAll('.lines polyline')
      .transition()
      .duration(700)
      .style('stroke', 'white')
      .remove();

    svg.select('g')
      .append('text')
      .attr('x', 0)
      .attr('y', 20)
      .attr('text-anchor', 'middle')
      .style('font-size', '16px')
      .attr('class', 'no-data')
      .text('(No hay datos)');
    return;
  }

  svg.selectAll('g .no-data').remove();

  data = pseudoShuffle(data);

  pie = domElement.graph.pie;
  path = svg.datum(data).selectAll('path');
  
  path = path.data(pie);

  color = d3.scale.ordinal()
    .domain(data.map(pick('name')))
    .range(PIE_CHART_COLORS);

  domElement.graph.removeSlices();
  domElement.graph.addSlices(data, color);
  addLabelsParams = domElement.graph.addLabelsParams;
  addLabelsParams.data = data;
  addPieChartLabels(addLabelsParams);
}

function sortObjDecreasing(a, b) {
  return b.value - a.value;
}

function pick(prop) {
  if(typeof prop !== 'string' && typeof prop !== 'number') {
    throw Error('Properties should be able to be coersed to string properly.');
  }

  return function(obj) {
    var dots, curObj, curKey;

    if(typeof obj !== 'object') {
      throw Error('Invalid parameter received to partial application, should have type of object');
    }

    dots = (prop + '').split('.');
    curObj = obj;

    while (dots.length) {
      curKey = dots.shift();
      curObj = curObj[curKey];
    }
    return curObj;
  };
}

function compose(x, y) {
  if(typeof x !== 'function' || typeof y !== 'function') {
    throw Error('x and y parameters should be functions');
  }

  if(arguments.length > 2) {
    throw Error('compose(fn1,fn2...fn) not implemented');
  }

  return function() {
    return x(y.apply(null, arguments));
  };
}

function generateGraphData(data, fieldMap) {
  var salaryData = [],
    responseHourData = [],
    ageData = [],
    sexData,
    profesionData;

  var profesionsMap = {};

  var sexMap = {
    m: {
      count: 0,
      salary: 0
    },
    f: {
      count: 0,
      salary: 0
    }
  };

  data.forEach(function(row) {
    sexMap[row[fieldMap.sex]].count++;
    sexMap[row[fieldMap.sex]].salary += row[fieldMap.salary];

    salaryData.push(row[fieldMap.salary]);

    if(row[fieldMap.age] === '50+') {
      ageData.push(50);
    }

    if(row[fieldMap.age] === 'Menos de 18 años') {
      ageData.push(18);
    }

    ageData.push(getAvgFromFirstAndLast(row[fieldMap.age], fieldMap.age));

    responseHourData.push(+row[fieldMap.hour]);

    if(!profesionsMap[row[fieldMap.profesion]]) {
      profesionsMap[row[fieldMap.profesion]] = 0;
    }
    profesionsMap[row[fieldMap.profesion]]++;
  });

  sexData = Object.keys(sexMap).map(function(key) {
    return {
      name: (key === 'm' ? 'Masculino(' : 'Femenino(') + Math.round(sexMap[key].count / data.length * 100) + '%)',
      value: sexMap[key].count,
      percentage: sexMap[key].count / data.length * 100
    };
  });

  profesionData = Object.keys(profesionsMap).map(function(key) {
    return [key, profesionsMap[key]];
  })
  .sort(function(a, b) {
    return b[1] - a[1];
  })
  .slice(0, 10)
  .map(function(e) {
    return { name: e[0], value: e[1] };
  })
  .filter(function(e, i, arr) {
    return arr.length < 3 || e.value !==1;
  });

  return {
    salaryData: salaryData,
    responseHourData: responseHourData,
    ageData: ageData,
    sexData: sexData,
    profesionData: profesionData
  };
}
