/**
 * @Package: Complete Admin Responsive Theme
 * @Since: Complete Admin 1.0
 * This file is part of Complete Admin Responsive Theme.
 */


jQuery(function($) {

    'use strict';

    var CMPLTADMIN_SETTINGS = window.CMPLTADMIN_SETTINGS || {};




    /*--------------------------------
         Window Based Layout
     --------------------------------*/
    CMPLTADMIN_SETTINGS.dashboardEcharts = function() {


        /*------------- Chart 1 ----------------*/
if($("#browser_type").length){
      // Initialize after dom ready
       var myChart = echarts.init(document.getElementById('browser_type')); 
        
        var option = {

                // Setup grid
                grid: {
                    zlevel: 0,
                    x: 20,
                    x2: 20,
                    y: 20,
                    y2: 20,
                    borderWidth: 0,
                    backgroundColor: 'rgba(0,0,0,0)',
                    borderColor: 'rgba(0,0,0,0)',
                },

                // Add tooltip
                tooltip: {
                    trigger: 'axis',
                    axisPointer: { 
                        type: 'shadow', // line|shadow
                        lineStyle:{color: 'rgba(0,0,0,.5)', width: 1},
                        shadowStyle:{color: 'rgba(0,0,0,.1)'}
                      }
                },

                // Add legend
                legend: {
                    data: []
                },
                toolbox: {
                    right: 10,
                  orient: 'horizontal',
                    show : true,
                    showTitle: true,
                    iconStyle : { 
                        color : ['#bdbdbd','#bdbdbd','#bdbdbd','#bdbdbd'],
                        opacity: 0.5,
                    },
                    feature : {
                        mark : {show: false},
                        dataZoom : {
                            show : true,
                            title : {
                                zoom : 'Data Zoom',
                                back : 'Reset Zoom'
                            },
                            iconStyle: {
                                borderColor: "#bdbdbd"
                            }
                        },
                        dataView : {show: false, readOnly: true},
                        magicType : {
                          show: true, 
                          title : {
                              line : 'Area',
                              bar : 'Bar'
                          },
                          type: ['line', 'bar'],
                            iconStyle: {
                                borderColor: "#bdbdbd"
                            }
                        },
                        restore : {show: false},
                        saveAsImage : {show: true,title:'Save as Image',
                            iconStyle: {
                                borderColor: "#bdbdbd"
                            }}
                    }
                },

                // Enable drag recalculate
                calculable: true,

                // Horizontal axis
                xAxis: [{
                    type: 'category',
                    boundaryGap: false,
                    data: ['Chrome','Firefox','Safari','Opera','IE'],
                    axisLine: {
                        show: true,
                        onZero: true,
                        lineStyle: {
                            color: '#bdbdbd',
                            type: 'solid',
                            width: '2',
                            shadowColor: 'rgba(0,0,0,0)',
                            shadowBlur: 5,
                            shadowOffsetX: 3,
                            shadowOffsetY: 3,
                        },
                    },                    
                    axisTick: {
                        show: false,
                    },
                    splitLine: {
                          show: false,
                          lineStyle: {
                              color: '#fff',
                              type: 'solid',
                              width: 0,
                              shadowColor: 'rgba(0,0,0,0)',
                        },
                    },
                }],

                // Vertical axis
                yAxis: [{
                    type: 'value',
                    splitLine: {
                          show: false,
                          lineStyle: {
                              color: 'fff',
                              type: 'solid',
                              width: 0,
                              shadowColor: 'rgba(0,0,0,0)',
                        },
                    },
                    axisLabel: {
                        show: false,
                    },                    
                    axisTick: {
                        show: false,
                    },                    
                    axisLine: {
                        show: false,
                        onZero: true,
                        lineStyle: {
                            color: '#ff0000',
                            type: 'solid',
                            width: '0',
                            shadowColor: 'rgba(0,0,0,0)',
                            shadowBlur: 5,
                            shadowOffsetX: 3,
                            shadowOffsetY: 3,
                        },
                    },


                }],

                // Add series
                series: [
                    {
                        name: 'Total Visits',
                        type: 'line',
                        smooth: true,
                        symbol:'none',
                        symbolSize:2,
                        showAllSymbol: true,
                        itemStyle: {
                          normal: {
                            color:'#9575CD', 
                            borderWidth:4, borderColor:'#9575CD', 
                            areaStyle: {color:'#9575CD', type: 'default'}
                          }
                        },

                        data: [500,200,322,212,99]
                    }]
            };

        // Load data into the ECharts instance 
        myChart.setOption(option); 

}

        /*------------- Chart 1 ----------------*/
if($("#browser_type_line").length){
      // Initialize after dom ready
       var myChart = echarts.init(document.getElementById('browser_type_line')); 
        
        var option = {

                // Setup grid
                grid: {
                    zlevel: 0,
                    x: 20,
                    x2: 20,
                    y: 20,
                    y2: 20,
                    borderWidth: 0,
                    backgroundColor: 'rgba(0,0,0,0)',
                    borderColor: 'rgba(0,0,0,0)',
                },

                // Add tooltip
                tooltip: {
                    trigger: 'axis',
                    axisPointer: { 
                        type: 'shadow', // line|shadow
                        lineStyle:{color: 'rgba(0,0,0,.5)', width: 1},
                        shadowStyle:{color: 'rgba(0,0,0,.1)'}
                      }
                },

                // Add legend
                legend: {
                    data: []
                },
                toolbox: {
                    right: 10,
                  orient: 'horizontal',
                    show : true,
                    showTitle: true,
                    iconStyle : { 
                        color : ['#bdbdbd','#bdbdbd','#bdbdbd','#bdbdbd'],
                        opacity: 0.5,
                    },
                    feature : {
                        mark : {show: false},
                        dataZoom : {
                            show : true,
                            title : {
                                zoom : 'Data Zoom',
                                back : 'Reset Zoom'
                            },
                            iconStyle: {
                                borderColor: "#bdbdbd"
                            }
                        },
                        dataView : {show: false, readOnly: true},
                        magicType : {
                          show: true, 
                          title : {
                              line : 'Area',
                              bar : 'Bar'
                          },
                          type: ['line', 'bar'],
                            iconStyle: {
                                borderColor: "#bdbdbd"
                            }
                        },
                        restore : {show: false},
                        saveAsImage : {show: true,title:'Save as Image',
                            iconStyle: {
                                borderColor: "#bdbdbd"
                            }}
                    }
                },

                // Enable drag recalculate
                calculable: true,

                // Horizontal axis
                xAxis: [{
                    type: 'category',
                    boundaryGap: false,
                    data: ['Chrome','Firefox','Safari','Opera','IE'],
                    axisLine: {
                        show: true,
                        onZero: true,
                        lineStyle: {
                            color: '#bdbdbd',
                            type: 'solid',
                            width: '2',
                            shadowColor: 'rgba(0,0,0,0)',
                            shadowBlur: 5,
                            shadowOffsetX: 3,
                            shadowOffsetY: 3,
                        },
                    },                    
                    axisTick: {
                        show: false,
                    },
                    splitLine: {
                          show: false,
                          lineStyle: {
                              color: '#fff',
                              type: 'solid',
                              width: 0,
                              shadowColor: 'rgba(0,0,0,0)',
                        },
                    },
                }],

                // Vertical axis
                yAxis: [{
                    type: 'value',
                    splitLine: {
                          show: false,
                          lineStyle: {
                              color: 'fff',
                              type: 'solid',
                              width: 0,
                              shadowColor: 'rgba(0,0,0,0)',
                        },
                    },
                    axisLabel: {
                        show: false,
                    },                    
                    axisTick: {
                        show: false,
                    },                    
                    axisLine: {
                        show: false,
                        onZero: true,
                        lineStyle: {
                            color: '#ff0000',
                            type: 'solid',
                            width: '0',
                            shadowColor: 'rgba(0,0,0,0)',
                            shadowBlur: 5,
                            shadowOffsetX: 3,
                            shadowOffsetY: 3,
                        },
                    },


                }],

                // Add series
                series: [
                    {
                        name: 'Total Visits',
                        type: 'line',
                        smooth: true,
                        symbol:'none',
                        symbolSize:2,
                        showAllSymbol: true,
                        itemStyle: {
                          normal: {
                            color:'#9575CD', 
                            borderWidth:4, borderColor:'#9575CD', 
                            areaStyle: {color:'rgba(63,81,181,0)', type: 'default'}
                          }
                        },

                        data: [500,200,322,212,99]
                    }]
            };

        // Load data into the ECharts instance 
        myChart.setOption(option); 

}



        /*-------------- Chart 2 ---------------*/
if($("#user_type").length){
// Initialize after dom ready
        var myChart = echarts.init(document.getElementById('user_type')); 
        
        var option = {

                // Setup grid
                grid: {
                    zlevel: 0,
                    x: 20,
                    x2: 20,
                    y: 20,
                    y2: 20,
                    borderWidth: 0,
                    backgroundColor: 'rgba(0,0,0,0)',
                    borderColor: 'rgba(0,0,0,0)',
                },

                // Add tooltip
                tooltip: {
                    trigger: 'axis',
                    axisPointer: { 
                        type: 'shadow', // line|shadow
                        lineStyle:{color: 'rgba(0,0,0,.5)', width: 1},
                        shadowStyle:{color: 'rgba(0,0,0,.1)'}
                      }
                },

                // Add legend
                legend: {
                    data: []
                },
                toolbox: {
                    right: 10,
                  orient: 'horizontal',
                    show : true,
                    showTitle: true,
                    iconStyle : { 
                        color : ['#bdbdbd','#bdbdbd','#bdbdbd','#bdbdbd'],
                        opacity: 0.5,
                    },
                    feature : {
                        mark : {show: false},
                        dataZoom : {
                            show : true,
                            title : {
                                zoom : 'Data Zoom',
                                back : 'Reset Zoom'
                            },
                            iconStyle: {
                                borderColor: "#bdbdbd"
                            }
                        },
                        dataView : {show: false, readOnly: true},
                        magicType : {
                          show: true, 
                          title : {
                              line : 'Area',
                              bar : 'Bar',
                              stack : 'Stacked Bar',
                              tiled: 'Tiled Bar'
                          },
                          type: ['line', 'bar','stack','tiled'],
                            iconStyle: {
                                borderColor: "#bdbdbd"
                            }
                        },
                        restore : {show: false},
                        saveAsImage : {show: true,title:'Save as Image',
                            iconStyle: {
                                borderColor: "#bdbdbd"
                            }}
                    }
                },

                // Enable drag recalculate
                calculable: true,

                // Horizontal axis
                xAxis: [{
                    type: 'category',
                    boundaryGap: false,
                    data: ['2016-06-01','2016-05-01','2016-04-01','2016-03-01','2016-02-01'],
                    axisLine: {
                        show: true,
                        onZero: true,
                        lineStyle: {
                            color: '#bdbdbd',
                            type: 'solid',
                            width: '2',
                            shadowColor: 'rgba(0,0,0,0)',
                            shadowBlur: 5,
                            shadowOffsetX: 3,
                            shadowOffsetY: 3,
                        },
                    },                    
                    axisTick: {
                        show: false,
                    },
                    splitLine: {
                          show: false,
                          lineStyle: {
                              color: '#fff',
                              type: 'solid',
                              width: 0,
                              shadowColor: 'rgba(0,0,0,0)',
                        },
                    },
                }],

                // Vertical axis
                yAxis: [{
                    type: 'value',
                    splitLine: {
                          show: false,
                          lineStyle: {
                              color: 'fff',
                              type: 'solid',
                              width: 0,
                              shadowColor: 'rgba(0,0,0,0)',
                        },
                    },
                    axisLabel: {
                        show: false,
                    },                    
                    axisTick: {
                        show: false,
                    },                    
                    axisLine: {
                        show: false,
                        onZero: true,
                        lineStyle: {
                            color: '#80CBC4',
                            type: 'solid',
                            width: '0',
                            shadowColor: 'rgba(0,0,0,0)',
                            shadowBlur: 5,
                            shadowOffsetX: 3,
                            shadowOffsetY: 3,
                        },
                    },


                }],

                // Add series
                series: [
                    {
                        name: 'Registered Users',
                        type: 'line',
                        smooth: true,
                        symbol:'none',
                        symbolSize:2,
                        showAllSymbol: true,
                        barWidth:15,
                        barGap:'10%',
                        itemStyle: {
                          normal: {
                            color:'#9575CD', 
                            borderWidth:2, borderColor:'#9575CD', 
                            areaStyle: {color:'#9575CD', type: 'default'}
                          }
                        },

                        data: [2323,2144,4534,1989,3232,2323,2144,4534,1989,3232,2323,2144,4534,1989,3232]
                    },
                    {
                        name: 'Guest Visitors',
                        type: 'line',
                        smooth: true,
                        symbol:'none',
                        symbolSize:2,
                        showAllSymbol: true,
                        barWidth:15,
                        barGap:'10%',
                        itemStyle: {
                          normal: {
                            color:'#80CBC4', 
                            borderWidth:2, borderColor:'#80CBC4', 
                            areaStyle: {color:'#80CBC4', type: 'default'}
                          }
                        },

                        data: [5656,6567,7675,3423,4343,5656,6567,7675,3423,4343,5656,6567,7675,3423,4343]
                    },
                ]
            };

        // Load data into the ECharts instance 
        myChart.setOption(option); 

}


        /*-------------- Chart 2 ---------------*/
if($("#user_type_line").length){
// Initialize after dom ready
        var myChart = echarts.init(document.getElementById('user_type_line')); 
        
        var option = {

                // Setup grid
                grid: {
                    zlevel: 0,
                    x: 20,
                    x2: 20,
                    y: 20,
                    y2: 20,
                    borderWidth: 0,
                    backgroundColor: 'rgba(0,0,0,0)',
                    borderColor: 'rgba(0,0,0,0)',
                },

                // Add tooltip
                tooltip: {
                    trigger: 'axis',
                    axisPointer: { 
                        type: 'shadow', // line|shadow
                        lineStyle:{color: 'rgba(0,0,0,.5)', width: 1},
                        shadowStyle:{color: 'rgba(0,0,0,.1)'}
                      }
                },

                // Add legend
                legend: {
                    data: []
                },
                toolbox: {
                    right: 10,
                  orient: 'horizontal',
                    show : true,
                    showTitle: true,
                    iconStyle : { 
                        color : ['#bdbdbd','#bdbdbd','#bdbdbd','#bdbdbd'],
                        opacity: 0.5,
                    },
                    feature : {
                        mark : {show: false},
                        dataZoom : {
                            show : true,
                            title : {
                                zoom : 'Data Zoom',
                                back : 'Reset Zoom'
                            },
                            iconStyle: {
                                borderColor: "#bdbdbd"
                            }
                        },
                        dataView : {show: false, readOnly: true},
                        magicType : {
                          show: true, 
                          title : {
                              line : 'Area',
                              bar : 'Bar',
                              stack : 'Stacked Bar',
                              tiled: 'Tiled Bar'
                          },
                          type: ['line', 'bar','stack','tiled'],
                            iconStyle: {
                                borderColor: "#bdbdbd"
                            }
                        },
                        restore : {show: false},
                        saveAsImage : {show: true,title:'Save as Image',
                            iconStyle: {
                                borderColor: "#bdbdbd"
                            }}
                    }
                },

                // Enable drag recalculate
                calculable: true,

                // Horizontal axis
                xAxis: [{
                    type: 'category',
                    boundaryGap: false,
                    data: ['2016-06-01','2016-05-01','2016-04-01','2016-03-01','2016-02-01'],
                    axisLine: {
                        show: true,
                        onZero: true,
                        lineStyle: {
                            color: '#bdbdbd',
                            type: 'solid',
                            width: '2',
                            shadowColor: 'rgba(0,0,0,0)',
                            shadowBlur: 5,
                            shadowOffsetX: 3,
                            shadowOffsetY: 3,
                        },
                    },                    
                    axisTick: {
                        show: false,
                    },
                    splitLine: {
                          show: false,
                          lineStyle: {
                              color: '#fff',
                              type: 'solid',
                              width: 0,
                              shadowColor: 'rgba(0,0,0,0)',
                        },
                    },
                }],

                // Vertical axis
                yAxis: [{
                    type: 'value',
                    splitLine: {
                          show: false,
                          lineStyle: {
                              color: 'fff',
                              type: 'solid',
                              width: 0,
                              shadowColor: 'rgba(0,0,0,0)',
                        },
                    },
                    axisLabel: {
                        show: false,
                    },                    
                    axisTick: {
                        show: false,
                    },                    
                    axisLine: {
                        show: false,
                        onZero: true,
                        lineStyle: {
                            color: '#80CBC4',
                            type: 'solid',
                            width: '0',
                            shadowColor: 'rgba(0,0,0,0)',
                            shadowBlur: 5,
                            shadowOffsetX: 3,
                            shadowOffsetY: 3,
                        },
                    },


                }],

                // Add series
                series: [
                    {
                        name: 'Registered Users',
                        type: 'line',
                        smooth: true,
                        symbol:'none',
                        symbolSize:2,
                        showAllSymbol: true,
                        barWidth:15,
                        barGap:'10%',
                        itemStyle: {
                          normal: {
                            color:'#9575CD', 
                            borderWidth:2, borderColor:'#9575CD', 
                            areaStyle: {color:'rgba(63,81,181,0)', type: 'default'}
                          }
                        },

                        data: [2323,2144,4534,1989,3232,2323,2144,4534,1989,3232,2323,2144,4534,1989,3232]
                    },
                    {
                        name: 'Guest Visitors',
                        type: 'line',
                        smooth: true,
                        symbol:'none',
                        symbolSize:2,
                        showAllSymbol: true,
                        barWidth:15,
                        barGap:'10%',
                        itemStyle: {
                          normal: {
                            color:'#80CBC4', 
                            borderWidth:2, borderColor:'#80CBC4', 
                            areaStyle: {color:'rgba(63,81,181,0)', type: 'default'}
                          }
                        },

                        data: [5656,6567,7675,3423,4343,5656,6567,7675,3423,4343,5656,6567,7675,3423,4343]
                    },
                ]
            };

        // Load data into the ECharts instance 
        myChart.setOption(option); 

}

        /*--------------- Chart 3 -------------*/
if($("#platform_type_dates").length){
var myChart = echarts.init(document.getElementById('platform_type_dates')); 

var idx = 1;
var option_dt = {

    timeline : {
        show: false,
        data : ['06-16','05-16','04-16'],
        label : {
            formatter : function(s) {
                return s; //s.slice(0, 5);
            }
        },
        x:10,
        y:null,
        x2:10,
        y2:0,
        width:250,
        height:50,
        backgroundColor:"rgba(0,0,0,0)",
        borderColor:"#eaeaea",
        borderWidth:0,
        padding:5,
        controlPosition:"left",
        autoPlay:true,
        loop:true,
        playInterval:1200,
        lineStyle:{
            width:1,
            color:"#bdbdbd",
            type:""
        },

    },

    options : [
        {
            color: ['#9575CD','#81C784','#0097A7','#FF8A65','#7986CB','#F06292'],
            title : {
                text: '',
                subtext: ''
            },
            tooltip : {
                trigger: 'item',
                formatter: "{a} <br/>{b} : {c} ({d}%)"
            },
            legend: {
                show: false,
                x: 'left',
                orient:'vertical',
                padding: 0,
                data:['Apple','Windows','Linux','Android','Others']
            },
            toolbox: {
                show : false,
                iconStyle : { 
                        color : ['#bdbdbd','#bdbdbd','#bdbdbd','#bdbdbd'],
                        opacity: 0.5,
                    },
                feature : {
                    mark : {show: false},
                    dataView : {show: false, readOnly: true},
                    magicType : {
                        show: true, 
                        type: ['pie', 'funnel'],
                        option: {
                            funnel: {
                                x: '10%',
                                width: '80%',
                                funnelAlign: 'center',
                                max: 50
                            },
                            pie: {
                                roseType : 'none',
                            }
                        }
                    },
                    restore : {show: false},
                    saveAsImage : {show: true}
                }
            },


                            series : [
                                {
                                    name:'06-16',
                                    type:'pie',
                                    radius : [20, '80%'],
                                    roseType : 'radius',
                                    center: ['50%', '45%'],
                                    width: '50%',       // for funnel
                                    itemStyle : {
                                        normal : { label : { show : true }, labelLine : { show : true } },
                                        emphasis : { label : { show : false }, labelLine : {show : false} }
                                    },
                                    data:[{value: 35,  name:'Apple'}, {value: 16,  name:'Windows'}, {value: 27,  name:'Linux'}, {value: 29,  name:'Android'}, {value: 12,  name:'Others'}]
                                }
                            ]
                    }, 
                {
                    series : [
                        {
                            name:'05-16',
                            type:'pie',
                            data:[{value: 42,  name:'Apple'}, {value: 51,  name:'Windows'}, {value: 39,  name:'Linux'}, {value: 25,  name:'Android'}, {value: 9,  name:'Others'}]
                        }
                    ]
                },
                {
                    series : [
                        {
                            name:'04-16',
                            type:'pie',
                            data:[{value: 29,  name:'Apple'}, {value: 16,  name:'Windows'}, {value: 24,  name:'Linux'}, {value: 19,  name:'Android'}, {value: 5,  name:'Others'}]
                        }
                    ]
                },

    ] // end options object
};

myChart.setOption(option_dt);        


}





            /*----------------- Chart 4 ------------------*/
if($("#page_views_today").length){

// Initialize after dom ready
        var myChart = echarts.init(document.getElementById('page_views_today')); 
        
        var option = {

                // Setup grid
                grid: {
                    zlevel: 0,
                    x: 20,
                    x2: 20,
                    y: 20,
                    y2: 20,
                    borderWidth: 0,
                    backgroundColor: 'rgba(0,0,0,0)',
                    borderColor: 'rgba(0,0,0,0)',
                },

                // Add tooltip
                tooltip: {
                    trigger: 'axis',
                    axisPointer: { 
                        type: 'shadow', // line|shadow
                        lineStyle:{color: 'rgba(0,0,0,.5)', width: 1},
                        shadowStyle:{color: 'rgba(0,0,0,.1)'}
                      }
                },

                // Add legend
                legend: {
                    data: []
                },
                toolbox: {
                    right: 10,
                  orient: 'horizontal',
                    show : true,
                    showTitle: true,
                    iconStyle : { 
                        color : ['#bdbdbd','#bdbdbd','#bdbdbd','#bdbdbd'],
                        opacity: 0.5,
                    },
                    feature : {
                        mark : {show: false},
                        dataZoom : {
                            show : true,
                            title : {
                                zoom : 'Data Zoom',
                                back : 'Reset Zoom'
                            },
                            iconStyle: {
                                borderColor: "#bdbdbd"
                            }
                        },
                        dataView : {show: false, readOnly: true},
                        magicType : {
                          show: true, 
                          title : {
                              line : 'Line',
                              bar : 'Bar',
                          },
                          type: ['line', 'bar'],
                          option: {
                            /*line: {
                                itemStyle: {
                                  normal: {
                                    color:'rgba(3,1,1,1.0)', 
                                  }
                                },
                                data: [1,2,3,4,5,6,7,8,9,10,11,12]
                            }*/
                          },
                            iconStyle: {
                                borderColor: "#bdbdbd"
                            }
                        },
                        restore : {show: false},
                        saveAsImage : {show: true,title:'Save as Image',
                            iconStyle: {
                                borderColor: "#bdbdbd"
                            }}
                    }
                },

                // Enable drag recalculate
                calculable: true,

                // Horizontal axis
                xAxis: [{
                    type: 'category',
                    boundaryGap: false,
                    data: [
                        '0h-2h', '2h-4h', '4h-6h', '6h-8h', '8h-10h', '10h-12h', '12h-14h', '14h-16h', '16h-18h', '18h-20h', '20h-22h', '22h-24h'
                    ],
                    axisLine: {
                        show: true,
                        onZero: true,
                        lineStyle: {
                            color: '#bdbdbd',
                            type: 'solid',
                            width: '2',
                            shadowColor: 'rgba(0,0,0,0)',
                            shadowBlur: 5,
                            shadowOffsetX: 3,
                            shadowOffsetY: 3,
                        },
                    },                    
                    axisTick: {
                        show: false,
                    },
                    splitLine: {
                          show: false,
                          lineStyle: {
                              color: '#fff',
                              type: 'solid',
                              width: 0,
                              shadowColor: 'rgba(0,0,0,0)',
                        },
                    },
                }],

                // Vertical axis
                yAxis: [{
                    type: 'value',
                    splitLine: {
                          show: false,
                          lineStyle: {
                              color: 'fff',
                              type: 'solid',
                              width: 0,
                              shadowColor: 'rgba(0,0,0,0)',
                        },
                    },
                    axisLabel: {
                        show: false,
                    },                    
                    axisTick: {
                        show: false,
                    },                    
                    axisLine: {
                        show: false,
                        onZero: true,
                        lineStyle: {
                            color: '#ff0000',
                            type: 'solid',
                            width: '0',
                            shadowColor: 'rgba(0,0,0,0)',
                            shadowBlur: 5,
                            shadowOffsetX: 3,
                            shadowOffsetY: 3,
                        },
                    },


                }],

                // Add series
                series: [
                    {
                        name: 'Page Views',
                        type: 'line',
                        smooth: true,
                        symbol:'none',
                        symbolSize:2,
                        showAllSymbol: true,
                        barWidth:10,
                        itemStyle: {
                          normal: {
                            color:'#9575CD', 
                            borderWidth:2, borderColor:'#9575CD', 
                            areaStyle: {color:'rgba(63,81,181,0)', type: 'default'}
                          }
                        },

                        data: [1545,1343,1445,2675,2878,1789,1745,2343,2445,1675,1878,2789,1545,1343,1445,2675,2878,1789,1745,2343,2445,1675,1878,2789]
                    }
                ]
            };

        // Load data into the ECharts instance 
        myChart.setOption(option); 

}









            /*----------------- Chart 5 ------------------*/

if($("#scatter_chart").length){
// Initialize after dom ready
        var myChart = echarts.init(document.getElementById('scatter_chart')); 
        
        var option = {
            color: ['#9575CD','#80CBC4'],
    title : {
       // text: '',
       // subtext: ''
    },

                // Setup grid
                grid: {
                    zlevel: 0,
                    x: 20,
                    x2: 20,
                    y: 20,
                    y2: 20,
                    borderWidth: 0,
                    backgroundColor: 'rgba(0,0,0,0)',
                    borderColor: 'rgba(0,0,0,0)',
                },
    tooltip : {
        trigger: 'axis',
        showDelay : 0,
        formatter : function (params) {
            if (params.value.length > 1) {
                return params.seriesName + '<br/>'
                   + params.value[0] + ' : Social Media<br/>' 
                   + params.value[1] + ' : Advertisement';
            }
            else {
                return params.seriesName + ' :<br/>'
                   + params.name + ' : '
                   + params.value + 'Advertisement';
            }
        },  
        axisPointer:{
            show: false,
            type : 'none',
            lineStyle: {
                type : 'dashed',
                width : 0
            }
        }
    },
    legend: {
        data:['2016','2015']
    },
    toolbox: {
        show : true,
        feature : {
            mark : {show: false},
            dataZoom : {show: true},
            dataView : {show: false, readOnly: false},
            restore : {show: false},
            saveAsImage : {show: true}
        }
    },
    xAxis : [
        {
            type : 'value',
                    axisLine: {
                        show: true,
                        onZero: true,
                        lineStyle: {
                            color: '#bdbdbd',
                            type: 'solid',
                            width: '2',
                            shadowColor: 'rgba(0,0,0,0)',
                            shadowBlur: 5,
                            shadowOffsetX: 3,
                            shadowOffsetY: 3,
                        },
                    },                    
                    axisTick: {
                        show: false,
                    },
                    splitLine: {
                          show: false,
                          lineStyle: {
                              color: '#fff',
                              type: 'solid',
                              width: 0,
                              shadowColor: 'rgba(0,0,0,0)',
                        },
                    },
            scale:true,
            axisLabel : {
                formatter: '{value}'
            }
        }
    ],
    yAxis : [
        {
            show:false,
            type : 'value',
                    axisLine: {
                        show: true,
                        onZero: true,
                        lineStyle: {
                            color: '#bdbdbd',
                            type: 'solid',
                            width: '2',
                            shadowColor: 'rgba(0,0,0,0)',
                            shadowBlur: 5,
                            shadowOffsetX: 3,
                            shadowOffsetY: 3,
                        },
                    },                    
                    axisTick: {
                        show: false,
                    },
                    splitLine: {
                          show: false,
                          lineStyle: {
                              color: '#fff',
                              type: 'solid',
                              width: 0,
                              shadowColor: 'rgba(0,0,0,0)',
                        },
                    },
            scale:true,
            axisLabel : {
                formatter: '{value}'
            }
        }
    ],
    series : [
        {
            name:'2016',
            type:'scatter',
            data: [[161, 51], [167, 59], [159, 49], [157, 63], [155, 53],
                [170, 59], [159, 47], [166, 69], [176, 66], [160, 75],
                [172, 55], [170, 54], [172, 62], [153, 42], [160, 50],
                [147, 49], [168, 49], [175, 73], [157, 47], [167, 68]

            ],
            markPoint : {
                show:false,
                data : [
                    {type : 'max', name: ''},
                    {type : 'min', name: ''}
                ]
            },
            /*markLine : {
                show:false,
                data : [
                    {type : '', name: ''}
                ]
            }*/
        },
        {
            name:'2015',
            type:'scatter',
            data: [[174, 65], [175, 71], [193, 80], [186, 72], [187, 78],
                [181, 74], [184, 86], [184, 78], [175, 62], [184, 81],
                [180, 76], [177, 83], [192, 90], [176, 74], [174, 71],
                [184, 79], [192, 93], [171, 70], [173, 72], [176, 85]
                
            ],
            markPoint : {
                show:false,
                data : [
                    {type : 'max', name: ''},
                    {type : 'min', name: ''}
                ]
            },
            /*markLine : {
                show:false,
                data : [
                    {type : 'average', name: ''}
                ]
            }*/
        }
    ]
};
                    

        // Load data into the ECharts instance 
        myChart.setOption(option); 

}



            /*----------------- Chart 6 ------------------*/
if($("#gauge_chart").length){

// Initialize after dom ready
        var myChart = echarts.init(document.getElementById('gauge_chart')); 
        
        var option = {
                        
                tooltip : {
                    formatter: "{b} : {c}%"
                },
                toolbox: {
                    show : false,
                    feature : {
                        mark : {show: false},
                        restore : {show: false},
                        saveAsImage : {show: true}
                    }
                },
                series : [
                    {
                        name:'Server Load',
                        type:'gauge',
                        center: ['50%', '50%'],
                        axisLine: {
                            show: true,
                            lineStyle: {
                                color: [
                                    [0.2, '#FF8A65'],
                                    [0.8, '#9575CD'],
                                    [1, '#0097A7']
                                ],
                                width: 10
                            }
                        }  ,
                        title: {
                            show : false,
                            offsetCenter: [0, '120%'],
                            textStyle: {
                                color: '#333',
                                fontSize : 15
                            }
                        }  ,
                        detail: {
                            show : true,
                            backgroundColor: 'rgba(0,0,0,0)',
                            borderWidth: 0,
                            borderColor: '#ccc',
                            width: 100,
                            height: 40,
                            offsetCenter: [0, '40%'],
                            formatter:'{value}%',
                            textStyle: {
                                color: 'auto',
                                fontSize : 20
                            }
                        },
                       
                        data:[{value: 50, name: 'Server Load (MB)'}]
                    }
             ]
};

//myChart.setOption(option);
gauge_load_chart(option);
var timeTicket = setInterval(function (){
    gauge_load_chart(option);
},1500);

function gauge_load_chart(option){
    option.series[0].data[0].value = (Math.random()*100).toFixed(2) - 0;
    myChart.setOption(option,true);
}


//clearInterval(timeTicket);


}








            /*----------------- Chart 4 ------------------*/
if($("#page_views_today_bar").length){

// Initialize after dom ready
        var myChart = echarts.init(document.getElementById('page_views_today_bar')); 
        
        var option = {

                // Setup grid
                grid: {
                    zlevel: 0,
                    x: 30,
                    x2: 30,
                    y: 20,
                    y2: 20,
                    borderWidth: 0,
                    backgroundColor: 'rgba(0,0,0,0)',
                    borderColor: 'rgba(0,0,0,0)',
                },

                // Add tooltip
                tooltip: {
                    trigger: 'axis',
                    axisPointer: { 
                        type: 'shadow', // line|shadow
                        lineStyle:{color: 'rgba(0,0,0,.5)', width: 1},
                        shadowStyle:{color: 'rgba(0,0,0,.1)'}
                      }
                },

                // Add legend
                legend: {
                    data: []
                },
                toolbox: {
                    right: 10,
                  orient: 'horizontal',
                    show : true,
                    showTitle: true,
                    iconStyle : { 
                        color : ['#bdbdbd','#bdbdbd','#bdbdbd','#bdbdbd'],
                        opacity: 0.5,
                    },
                    feature : {
                        mark : {show: false},
                        dataZoom : {
                            show : true,
                            title : {
                                zoom : 'Data Zoom',
                                back : 'Reset Zoom'
                            },
                            iconStyle: {
                                borderColor: "#bdbdbd"
                            }
                        },
                        dataView : {show: false, readOnly: true},
                        magicType : {
                          show: true, 
                          title : {
                              line : 'Line',
                              bar : 'Bar',
                          },
                          type: ['line', 'bar'],
                          option: {
                            /*line: {
                                itemStyle: {
                                  normal: {
                                    color:'rgba(3,1,1,1.0)', 
                                  }
                                },
                                data: [1,2,3,4,5,6,7,8,9,10,11,12]
                            }*/
                          },
                            iconStyle: {
                                borderColor: "#bdbdbd"
                            }
                        },
                        restore : {show: false},
                        saveAsImage : {show: true,title:'Save as Image',
                            iconStyle: {
                                borderColor: "#bdbdbd"
                            }}
                    }
                },

                // Enable drag recalculate
                calculable: true,

                // Horizontal axis
                xAxis: [{
                    type: 'category',
                    boundaryGap: false,
                    data: [
                        '0h-2h', '2h-4h', '4h-6h', '6h-8h', '8h-10h', '10h-12h', '12h-14h', '14h-16h', '16h-18h', '18h-20h', '20h-22h', '22h-24h'
                    ],
                    axisLine: {
                        show: true,
                        onZero: true,
                        lineStyle: {
                            color: '#bdbdbd',
                            type: 'solid',
                            width: '2',
                            shadowColor: 'rgba(0,0,0,0)',
                            shadowBlur: 5,
                            shadowOffsetX: 3,
                            shadowOffsetY: 3,
                        },
                    },                    
                    axisTick: {
                        show: false,
                    },
                    splitLine: {
                          show: false,
                          lineStyle: {
                              color: '#fff',
                              type: 'solid',
                              width: 0,
                              shadowColor: 'rgba(0,0,0,0)',
                        },
                    },
                }],

                // Vertical axis
                yAxis: [{
                    type: 'value',
                    splitLine: {
                          show: false,
                          lineStyle: {
                              color: 'fff',
                              type: 'solid',
                              width: 0,
                              shadowColor: 'rgba(0,0,0,0)',
                        },
                    },
                    axisLabel: {
                        show: false,
                    },                    
                    axisTick: {
                        show: false,
                    },                    
                    axisLine: {
                        show: false,
                        onZero: true,
                        lineStyle: {
                            color: '#ff0000',
                            type: 'solid',
                            width: '0',
                            shadowColor: 'rgba(0,0,0,0)',
                            shadowBlur: 5,
                            shadowOffsetX: 3,
                            shadowOffsetY: 3,
                        },
                    },


                }],

                // Add series
                series: [
                    {
                        name: 'Page Views',
                        type: 'bar',
                        smooth: true,
                        symbol:'none',
                        symbolSize:2,
                        showAllSymbol: true,
                        barWidth:5,
                        itemStyle: {
                          normal: {
                            color:'#9575CD', 
                            borderWidth:0, borderColor:'#9575CD', 
                            areaStyle: {color:'rgba(63,81,181,0)', type: 'default'}
                          }
                        },

                        data: [1545,1343,1445,2675,2878,1789,1745,2343,2445,1675,1878,2789,1545,1343,1445,2675,2878,1789,1745,2343,2445,1675,1878,2789]
                    }
                ]
            };

        // Load data into the ECharts instance 
        myChart.setOption(option); 

}




        /*------------- Chart 1 ----------------*/
if($("#browser_type_bar").length){
      // Initialize after dom ready
       var myChart = echarts.init(document.getElementById('browser_type_bar')); 
        
        var option = {

                // Setup grid
                grid: {
                    zlevel: 0,
                    x: 50,
                    x2: 50,
                    y: 20,
                    y2: 20,
                    borderWidth: 0,
                    backgroundColor: 'rgba(0,0,0,0)',
                    borderColor: 'rgba(0,0,0,0)',
                },

                // Add tooltip
                tooltip: {
                    trigger: 'axis',
                    axisPointer: { 
                        type: 'shadow', // line|shadow
                        lineStyle:{color: 'rgba(0,0,0,.5)', width: 1},
                        shadowStyle:{color: 'rgba(0,0,0,.1)'}
                      }
                },

                // Add legend
                legend: {
                    data: []
                },
                toolbox: {
                    right: 10,
                  orient: 'horizontal',
                    show : true,
                    showTitle: true,
                    iconStyle : { 
                        color : ['#bdbdbd','#bdbdbd','#bdbdbd','#bdbdbd'],
                        opacity: 0.5,
                    },
                    feature : {
                        mark : {show: false},
                        dataZoom : {
                            show : true,
                            title : {
                                zoom : 'Data Zoom',
                                back : 'Reset Zoom'
                            },
                            iconStyle: {
                                borderColor: "#bdbdbd"
                              }
                        },
                        dataView : {show: false, readOnly: true},
                        magicType : {
                          show: true, 
                          title : {
                              line : 'Area',
                              bar : 'Bar'
                          },
                          type: ['line', 'bar'],
                          iconStyle: {
                            borderColor: "#bdbdbd"
                          }
                        },
                        restore : {show: false},
                        saveAsImage : {show: true,title:'Save as Image',
                        iconStyle: {
                                borderColor: "#bdbdbd"
                              }
                      }
                    }
                },

                // Enable drag recalculate
                calculable: true,

                // Horizontal axis
                xAxis: [{
                    type: 'category',
                    boundaryGap: false,
                    data: ['Chrome','Firefox','Safari','Opera','IE'],
                    axisLine: {
                        show: true,
                        onZero: true,
                        lineStyle: {
                            color: '#bdbdbd',
                            type: 'solid',
                            width: '2',
                            shadowColor: 'rgba(0,0,0,0)',
                            shadowBlur: 5,
                            shadowOffsetX: 3,
                            shadowOffsetY: 3,
                        },
                    },                    
                    axisTick: {
                        show: false,
                    },
                    splitLine: {
                          show: false,
                          lineStyle: {
                              color: '#fff',
                              type: 'solid',
                              width: 0,
                              shadowColor: 'rgba(0,0,0,0)',
                        },
                    },
                }],

                // Vertical axis
                yAxis: [{
                    type: 'value',
                    splitLine: {
                          show: false,
                          lineStyle: {
                              color: 'fff',
                              type: 'solid',
                              width: 0,
                              shadowColor: 'rgba(0,0,0,0)',
                        },
                    },
                    axisLabel: {
                        show: false,
                    },                    
                    axisTick: {
                        show: false,
                    },                    
                    axisLine: {
                        show: false,
                        onZero: true,
                        lineStyle: {
                            color: '#ff0000',
                            type: 'solid',
                            width: '0',
                            shadowColor: 'rgba(0,0,0,0)',
                            shadowBlur: 5,
                            shadowOffsetX: 3,
                            shadowOffsetY: 3,
                        },
                    },


                }],

                // Add series
                series: [
                    {
                        name: 'Total Visits',
                        type: 'bar',
                        smooth: true,
                        symbol:'none',
                        symbolSize:2,
                        showAllSymbol: true,
                        itemStyle: {
                          normal: {
                            color:'#9575CD', 
                            borderWidth:4, borderColor:'#9575CD', 
                            areaStyle: {color:'#9575CD', type: 'default'}
                          }
                        },

                        data: [500,200,322,212,99]
                    }]
            };

        // Load data into the ECharts instance 
        myChart.setOption(option); 

}



        /*-------------- Chart 2 ---------------*/
if($("#user_type_bar").length){
// Initialize after dom ready
        var myChart = echarts.init(document.getElementById('user_type_bar')); 
        
        var option = {

                // Setup grid
                grid: {
                    zlevel: 0,
                    x: 50,
                    x2: 50,
                    y: 20,
                    y2: 20,
                    borderWidth: 0,
                    backgroundColor: 'rgba(0,0,0,0)',
                    borderColor: 'rgba(0,0,0,0)',
                },

                // Add tooltip
                tooltip: {
                    trigger: 'axis',
                    axisPointer: { 
                        type: 'shadow', // line|shadow
                        lineStyle:{color: 'rgba(0,0,0,.5)', width: 1},
                        shadowStyle:{color: 'rgba(0,0,0,.1)'}
                      }
                },

                // Add legend
                legend: {
                    data: []
                },
                toolbox: {
                    right: 10,
                    height: 200,
                    top: 0,
                  orient: 'horizontal',
                    show : true,
                    showTitle: true,
                    iconStyle : { 
                        color : ['#bdbdbd','#bdbdbd','#bdbdbd','#bdbdbd'],
                        opacity: 0.5,
                    },
                    feature : {
                        mark : {show: false},
                        dataZoom : {
                            show : true,
                            title : {
                                zoom : 'Data Zoom',
                                back : 'Reset Zoom'
                            },
                            iconStyle: {
                                borderColor: "#bdbdbd"
                            }
                        },
                        dataView : {show: false, readOnly: true},
                        magicType : {
                          show: true, 
                          title : {
                              line : 'Area',
                              bar : 'Bar',
                              stack : 'Stacked Bar',
                              tiled: 'Tiled Bar'
                          },
                          type: ['line', 'bar','stack','tiled'],
                            iconStyle: {
                                borderColor: "#bdbdbd"
                            }
                        },
                        restore : {show: false},
                        saveAsImage : {show: true,title:'Save as Image',
                            iconStyle: {
                                borderColor: "#bdbdbd"
                            }
                        }
                    }
                },

                // Enable drag recalculate
                calculable: true,

                // Horizontal axis
                xAxis: [{
                    type: 'category',
                    boundaryGap: false,
                    data: ['2016-06-01','2016-05-01','2016-04-01','2016-03-01','2016-02-01','2016-01-01','2015-12-01','2015-11-01','2015-10-01','2015-09-01'],
                    axisLine: {
                        show: true,
                        onZero: true,
                        lineStyle: {
                            color: '#bdbdbd',
                            type: 'solid',
                            width: '2',
                            shadowColor: 'rgba(0,0,0,0)',
                            shadowBlur: 5,
                            shadowOffsetX: 3,
                            shadowOffsetY: 3,
                        },
                    },                    
                    axisTick: {
                        show: false,
                    },
                    splitLine: {
                          show: false,
                          lineStyle: {
                              color: '#fff',
                              type: 'solid',
                              width: 0,
                              shadowColor: 'rgba(0,0,0,0)',
                        },
                    },
                }],

                // Vertical axis
                yAxis: [{
                    type: 'value',
                    splitLine: {
                          show: false,
                          lineStyle: {
                              color: 'fff',
                              type: 'solid',
                              width: 0,
                              shadowColor: 'rgba(0,0,0,0)',
                        },
                    },
                    axisLabel: {
                        show: false,
                    },                    
                    axisTick: {
                        show: false,
                    },                    
                    axisLine: {
                        show: false,
                        onZero: true,
                        lineStyle: {
                            color: '#80CBC4',
                            type: 'solid',
                            width: '0',
                            shadowColor: 'rgba(0,0,0,0)',
                            shadowBlur: 5,
                            shadowOffsetX: 3,
                            shadowOffsetY: 3,
                        },
                    },


                }],

                // Add series
                series: [
                    {
                        name: 'Registered Users',
                        type: 'bar',
                        smooth: true,
                        symbol:'none',
                        symbolSize:2,
                        showAllSymbol: true,
                        barWidth:8,
                        barGap:'10%',
                        itemStyle: {
                          normal: {
                            color:'#9575CD', 
                            borderWidth:1, borderColor:'#9575CD', 
                            areaStyle: {color:'#9575CD', type: 'default'}
                          }
                        },

                        data: [2323,2144,4534,1989,3232,2323,2144,4534,1989,3232,2323,2144,4534,1989,3232,2323,2144,4534,1989,3232,2323,2144,4534,1989,3232,2323,2144,4534,1989,3232]
                    },
                    {
                        name: 'Guest Visitors',
                        type: 'bar',
                        smooth: true,
                        symbol:'none',
                        symbolSize:2,
                        showAllSymbol: true,
                        barWidth:8,
                        barGap:'10%',
                        itemStyle: {
                          normal: {
                            color:'#80CBC4', 
                            borderWidth:1, borderColor:'#80CBC4', 
                            areaStyle: {color:'#80CBC4', type: 'default'}
                          }
                        },

                        data: [5656,6567,7675,3423,4343,5656,6567,7675,3423,4343,5656,6567,7675,3423,4343,5656,6567,7675,3423,4343,5656,6567,7675,3423,4343,5656,6567,7675,3423,4343]
                    },
                ]
            };

        // Load data into the ECharts instance 
        myChart.setOption(option); 

}





            /*----------------- Chart 5 ------------------*/

if($("#scatter_chart_inside").length){
// Initialize after dom ready
        var myChart = echarts.init(document.getElementById('scatter_chart_inside')); 
        
        var option = {
            color: ['#9575CD','#80CBC4'],
    title : {
       // text: '',
       // subtext: ''
    },

                // Setup grid
                grid: {
                    zlevel: 0,
                    x: 20,
                    x2: 20,
                    y: 20,
                    y2: 20,
                    borderWidth: 0,
                    backgroundColor: 'rgba(0,0,0,0)',
                    borderColor: 'rgba(0,0,0,0)',
                },
    tooltip : {
        trigger: 'axis',
        showDelay : 0,
        formatter : function (params) {
            /*if (params.value.length > 1) {
                return params.seriesName + '<br/>'
                   + params.value[0] + ' : Social Media<br/>' 
                   + params.value[1] + ' : Advertisement';
            }*/
           // else {
            //console.log(params);
                return params[0].seriesName + ' : '
                   + params[0].value + '';
            //}
        },  
        axisPointer:{
            show: false,
            type : 'none',
            lineStyle: {
                type : 'dashed',
                width : 0
            }
        }
    },
    legend: {
        data:['2016','2015']
    },
    toolbox: {
                    right: 10,
                  orient: 'horizontal',
                    show : true,
                    showTitle: true,
                    iconStyle : { 
                        color : ['#bdbdbd','#bdbdbd','#bdbdbd','#bdbdbd'],
                        opacity: 0.5,
                    },
                    feature : {
                        mark : {show: false},
                        dataZoom : {
                            show : true,
                            title : {
                                zoom : 'Data Zoom',
                                back : 'Reset Zoom'
                            },
                            iconStyle: {
                                borderColor: "#bdbdbd"
                            }
                        },
                        dataView : {show: false, readOnly: true},
                       
                        restore : {show: false},
                        saveAsImage : {show: true,title:'Save as Image',
                            iconStyle: {
                                borderColor: "#bdbdbd"
                            }}
                    }
    },
    xAxis : [
        {
            type : 'value',
                    axisLine: {
                        show: true,
                        onZero: true,
                        lineStyle: {
                            color: '#bdbdbd',
                            type: 'solid',
                            width: '2',
                            shadowColor: 'rgba(0,0,0,0)',
                            shadowBlur: 5,
                            shadowOffsetX: 3,
                            shadowOffsetY: 3,
                        },
                    },                    
                    axisTick: {
                        show: false,
                    },
                    splitLine: {
                          show: false,
                          lineStyle: {
                              color: '#fff',
                              type: 'solid',
                              width: 0,
                              shadowColor: 'rgba(0,0,0,0)',
                        },
                    },
            scale:true,
            axisLabel : {
                formatter: '{value}'
            }
        }
    ],
    yAxis : [
        {
            show:false,
            type : 'value',
                    axisLine: {
                        show: true,
                        onZero: true,
                        lineStyle: {
                            color: '#bdbdbd',
                            type: 'solid',
                            width: '2',
                            shadowColor: 'rgba(0,0,0,0)',
                            shadowBlur: 5,
                            shadowOffsetX: 3,
                            shadowOffsetY: 3,
                        },
                    },                    
                    axisTick: {
                        show: false,
                    },
                    splitLine: {
                          show: false,
                          lineStyle: {
                              color: '#fff',
                              type: 'solid',
                              width: 0,
                              shadowColor: 'rgba(0,0,0,0)',
                        },
                    },
            scale:true,
            axisLabel : {
                formatter: '{value}'
            }
        }
    ],
    series : [
        {
            name:'2018',
            type:'scatter',
            data: [[161.2, 51.6], [167.5, 59.0], [159.5, 49.2], [157.0, 63.0], [155.8, 53.6],
                [170.0, 59.0], [159.1, 47.6], [166.0, 69.8], [176.2, 66.8], [160.2, 75.2],
                [172.5, 55.2], [170.9, 54.2], [172.9, 62.5], [153.4, 42.0], [160.0, 50.0],
                [147.2, 49.8], [168.2, 49.2], [175.0, 73.2], [157.0, 47.8], [167.6, 68.8],
                [159.5, 50.6], [175.0, 82.5], [166.8, 57.2], [176.5, 87.8], [170.2, 72.8],
                [174.0, 54.5], [173.0, 59.8], [179.9, 67.3], [170.5, 67.8], [160.0, 47.0],
                [154.4, 46.2], [162.0, 55.0], [176.5, 83.0], [160.0, 54.4], [152.0, 45.8],
                [162.1, 53.6], [170.0, 73.2], [160.2, 52.1], [161.3, 67.9], [166.4, 56.6],
                [168.9, 62.3], [163.8, 58.5], [167.6, 54.5], [160.0, 50.2], [161.3, 60.3],
                [167.6, 58.3], [165.1, 56.2], [160.0, 50.2], [170.0, 72.9], [157.5, 59.8],
                [167.6, 61.0], [160.7, 69.1], [163.2, 55.9], [152.4, 46.5], [157.5, 54.3],
                [168.3, 54.8], [180.3, 60.7], [165.5, 60.0], [165.0, 62.0], [164.5, 60.3],
                [156.0, 52.7], [160.0, 74.3], [163.0, 62.0], [165.7, 73.1], [161.0, 80.0],
                [162.0, 54.7], [166.0, 53.2], [174.0, 75.7], [172.7, 61.1], [167.6, 55.7],
                [151.1, 48.7], [164.5, 52.3], [163.5, 50.0], [152.0, 59.3], [169.0, 62.5],
                [164.0, 55.7], [161.2, 54.8], [155.0, 45.9], [170.0, 70.6], [176.2, 67.2],
                [170.0, 69.4], [162.5, 58.2], [170.3, 64.8], [164.1, 71.6], [169.5, 52.8],
                [176.5, 71.8], [164.4, 55.5], [160.7, 48.6], [174.0, 66.4], [163.8, 67.3]
            ],
            markPoint : {
                show:false,
                data : [
                    {type : 'max', name: ''},
                    {type : 'min', name: ''}
                ]
            },
            /*markLine : {
                show:false,
                data : [
                    {type : '', name: ''}
                ]
            }*/
        },
        {
            name:'2017',
            type:'scatter',
            data: [[174.0, 65.6], [175.3, 71.8], [193.5, 80.7], [186.5, 72.6], [187.2, 78.8],
                [181.5, 74.8], [184.0, 86.4], [184.5, 78.4], [175.0, 62.0], [184.0, 81.6],
                [180.0, 76.6], [177.8, 83.6], [192.0, 90.0], [176.0, 74.6], [174.0, 71.0],
                [184.0, 79.6], [192.7, 93.8], [171.5, 70.0], [173.0, 72.4], [176.0, 85.9],
                [176.0, 78.8], [180.5, 77.8], [172.7, 66.2], [176.0, 86.4], [173.5, 81.8],
                [178.0, 89.6], [180.3, 82.8], [180.3, 76.4], [164.5, 63.2], [173.0, 60.9],
                [183.5, 74.8], [175.5, 70.0], [188.0, 72.4], [189.2, 84.1], [172.8, 69.1],
                [170.0, 59.5], [182.0, 67.2], [170.0, 61.3], [177.8, 68.6], [184.2, 80.1],
                [186.7, 87.8], [171.4, 84.7], [172.7, 73.4], [175.3, 72.1], [180.3, 82.6],
                [182.9, 88.7], [188.0, 84.1], [177.2, 94.1], [172.1, 74.9], [167.0, 59.1],
                [169.5, 75.6], [174.0, 86.2], [172.7, 75.3], [182.2, 87.1], [164.1, 55.2],
                [163.0, 57.0], [171.5, 61.4], [184.2, 76.8], [174.0, 86.8], [174.0, 72.2],
                [177.0, 71.6], [186.0, 84.8], [167.0, 68.2], [171.8, 66.1], [182.0, 72.0],
                [190.5, 108.6], [177.8, 86.4], [190.5, 80.9], [177.8, 87.7], [184.2, 94.5],
                [180.3, 83.2], [180.3, 83.2]
            ],
            markPoint : {
                show:false,
                data : [
                    {type : 'max', name: ''},
                    {type : 'min', name: ''}
                ]
            },
            /*markLine : {
                show:false,
                data : [
                    {type : 'average', name: ''}
                ]
            }*/
        }
    ]
};
                    

        // Load data into the ECharts instance 
        myChart.setOption(option); 

}



        /*--------------- Chart 3 -------------*/
if($("#platform_type_dates_pie").length){
var myChart = echarts.init(document.getElementById('platform_type_dates_pie')); 

var idx = 1;
var option_dt = {

    timeline : {
        show: false,
        data : ['06-16','05-16','04-16'],
        label : {
            formatter : function(s) {
                return s; // s.slice(0, 5);
            }
        },
        x:10,
        y:null,
        x2:10,
        y2:0,
        width:250,
        height:50,
        backgroundColor:"rgba(0,0,0,0)",
        borderColor:"#eaeaea",
        borderWidth:0,
        padding:5,
        controlPosition:"left",
        autoPlay:true,
        loop:true,
        playInterval:1200,
        lineStyle:{
            width:1,
            color:"#bdbdbd",
            type:""
        },

    },

    options : [
        {
            color: ['#9575CD','#81C784','#0097A7','#FF8A65','#7986CB','#F06292'],
            title : {
                text: '',
                subtext: ''
            },
            tooltip : {
                trigger: 'item',
                formatter: "{a} <br/>{b} : {c} ({d}%)"
            },
            legend: {
                show: false,
                x: 'left',
                orient:'vertical',
                padding: 0,
                data:['Apple','Windows','Linux','Android','Others']
            },
            toolbox: {
                show : false,
                iconStyle : { 
                        color : ['#bdbdbd','#bdbdbd','#bdbdbd','#bdbdbd'],
                        opacity: 0.5,
                    },
                feature : {
                    mark : {show: false},
                    dataView : {show: false, readOnly: true},
                    magicType : {
                        show: true, 
                        type: ['pie', 'funnel'],
                        option: {
                            funnel: {
                                x: '10%',
                                width: '80%',
                                funnelAlign: 'center',
                                max: 50
                            },
                            pie: {
                                roseType : 'none',
                            }
                        }
                    },
                    restore : {show: false},
                    saveAsImage : {show: true}
                }
            },


                            series : [
                                {
                                    name:'06-16',
                                    type:'pie',
                                    radius : 100,
                                    roseType : 'none',
                                    center: ['50%', '45%'],
                                    width: '50%',       // for funnel
                                    itemStyle : {
                                        normal : { label : { show : true }, labelLine : { show : true } },
                                        emphasis : { label : { show : false }, labelLine : {show : false} }
                                    },
                                    data:[{value: 35,  name:'Apple'}, {value: 16,  name:'Windows'}, {value: 27,  name:'Linux'}, {value: 29,  name:'Android'}, {value: 12,  name:'Others'}]
                                }
                            ]
                    }, 
                {
                    series : [
                        {
                            name:'05-16',
                            type:'pie',
                            data:[{value: 42,  name:'Apple'}, {value: 51,  name:'Windows'}, {value: 39,  name:'Linux'}, {value: 25,  name:'Android'}, {value: 9,  name:'Others'}]
                        }
                    ]
                },
                {
                    series : [
                        {
                            name:'04-16',
                            type:'pie',
                            data:[{value: 29,  name:'Apple'}, {value: 16,  name:'Windows'}, {value: 24,  name:'Linux'}, {value: 19,  name:'Android'}, {value: 5,  name:'Others'}]
                        }
                    ]
                },

    ] // end options object
};

myChart.setOption(option_dt);        


}




        /*--------------- Chart 3 -------------*/
if($("#platform_type_dates_donut").length){
var myChart = echarts.init(document.getElementById('platform_type_dates_donut')); 

var idx = 1;
var option_dt = {

    timeline : {
        show: false,
        data : ['06-16','05-16','04-16'],
        label : {
            formatter : function(s) {
                return s; // s.slice(0, 5);
            }
        },
        x:10,
        y:null,
        x2:10,
        y2:0,
        width:250,
        height:50,
        backgroundColor:"rgba(0,0,0,0)",
        borderColor:"#eaeaea",
        borderWidth:0,
        padding:5,
        controlPosition:"left",
        autoPlay:true,
        loop:true,
        playInterval:1200,
        lineStyle:{
            width:1,
            color:"#bdbdbd",
            type:""
        },

    },

    options : [
        {
            color: ['#9575CD','#81C784','#0097A7','#FF8A65','#7986CB','#F06292'],
            title : {
                text: '',
                subtext: ''
            },
            tooltip : {
                trigger: 'item',
                formatter: "{a} <br/>{b} : {c} ({d}%)"
            },
            legend: {
                show: false,
                x: 'left',
                orient:'vertical',
                padding: 0,
                data:['Apple','Windows','Linux','Android','Others']
            },
            toolbox: {
                show : false,
                iconStyle : { 
                        color : ['#bdbdbd','#bdbdbd','#bdbdbd','#bdbdbd'],
                        opacity: 0.5,
                    },
                feature : {
                    mark : {show: false},
                    dataView : {show: false, readOnly: true},
                    magicType : {
                        show: true, 
                        type: ['pie', 'funnel'],
                        option: {
                            funnel: {
                                x: '10%',
                                width: '80%',
                                funnelAlign: 'center',
                                max: 50
                            },
                            pie: {
                                roseType : 'none',
                            }
                        }
                    },
                    restore : {show: false},
                    saveAsImage : {show: true}
                }
            },


                            series : [
                                {
                                    name:'06-16',
                                    type:'pie',
                                    radius : [20, '80%'],
                                    roseType : 'none',
                                    center: ['50%', '45%'],
                                    width: '50%',       // for funnel
                                    itemStyle : {
                                        normal : { label : { show : true }, labelLine : { show : true } },
                                        emphasis : { label : { show : false }, labelLine : {show : false} }
                                    },
                                    data:[{value: 35,  name:'Apple'}, {value: 16,  name:'Windows'}, {value: 27,  name:'Linux'}, {value: 29,  name:'Android'}, {value: 12,  name:'Others'}]
                                }
                            ]
                    }, 
                {
                    series : [
                        {
                            name:'05-16',
                            type:'pie',
                            data:[{value: 42,  name:'Apple'}, {value: 51,  name:'Windows'}, {value: 39,  name:'Linux'}, {value: 25,  name:'Android'}, {value: 9,  name:'Others'}]
                        }
                    ]
                },
                {
                    series : [
                        {
                            name:'04-16',
                            type:'pie',
                            data:[{value: 29,  name:'Apple'}, {value: 16,  name:'Windows'}, {value: 24,  name:'Linux'}, {value: 19,  name:'Android'}, {value: 5,  name:'Others'}]
                        }
                    ]
                },

    ] // end options object
};

myChart.setOption(option_dt);        


}





        /*--------------- Chart 3 -------------*/
if($("#platform_type_dates_funnel").length){
var myChart = echarts.init(document.getElementById('platform_type_dates_funnel')); 

var idx = 1;
var option_dt = {

    timeline : {
        show: false,
        data : ['06-16','05-16','04-16'],
        label : {
            formatter : function(s) {
                return s; // s.slice(0, 5);
            }
        },
        x:10,
        y:null,
        x2:10,
        y2:0,
        width:250,
        height:50,
        backgroundColor:"rgba(0,0,0,0)",
        borderColor:"#eaeaea",
        borderWidth:0,
        padding:5,
        controlPosition:"left",
        autoPlay:true,
        loop:true,
        playInterval:1200,
        lineStyle:{
            width:1,
            color:"#bdbdbd",
            type:""
        },

    },

    options : [
        {
            color: ['#9575CD','#81C784','#0097A7','#FF8A65','#7986CB','#F06292'],
            title : {
                text: '',
                subtext: ''
            },
            tooltip : {
                trigger: 'item',
                formatter: "{a} <br/>{b} : {c} ({d}%)"
            },
            legend: {
                show: false,
                x: 'left',
                orient:'vertical',
                padding: 0,
                data:['Apple','Windows','Linux','Android','Others']
            },
            toolbox: {
                show : false,
                iconStyle : { 
                        color : ['#bdbdbd','#bdbdbd','#bdbdbd','#bdbdbd'],
                        opacity: 0.5,
                    },
                feature : {
                    mark : {show: false},
                    dataView : {show: false, readOnly: true},
                    magicType : {
                        show: true, 
                        type: ['pie', 'funnel'],
                        option: {
                            funnel: {
                                x: '10%',
                                width: '80%',
                                funnelAlign: 'center',
                                max: 50
                            },
                            pie: {
                                roseType : 'none',
                            }
                        }
                    },
                    restore : {show: false},
                    saveAsImage : {show: true}
                }
            },


                            series : [
                                {
                                    name:'06-16',
                                    type:'funnel',
                                    radius : [20, '80%'],
                                    roseType : 'none',
                                    center: ['50%', '45%'],
                                    width: '50%',       // for funnel
                                    itemStyle : {
                                        normal : { label : { show : true }, labelLine : { show : true } },
                                        emphasis : { label : { show : false }, labelLine : {show : false} }
                                    },
                                    data:[{value: 35,  name:'Apple'}, {value: 16,  name:'Windows'}, {value: 27,  name:'Linux'}, {value: 29,  name:'Android'}, {value: 12,  name:'Others'}]
                                }
                            ]
                    }, 
                {
                    series : [
                        {
                            name:'05-16',
                            type:'funnel',
                            data:[{value: 42,  name:'Apple'}, {value: 51,  name:'Windows'}, {value: 39,  name:'Linux'}, {value: 25,  name:'Android'}, {value: 9,  name:'Others'}]
                        }
                    ]
                },
                {
                    series : [
                        {
                            name:'04-16',
                            type:'funnel',
                            data:[{value: 29,  name:'Apple'}, {value: 16,  name:'Windows'}, {value: 24,  name:'Linux'}, {value: 19,  name:'Android'}, {value: 5,  name:'Others'}]
                        }
                    ]
                },

    ] // end options object
};

myChart.setOption(option_dt);        


}










            /*----------------- Chart 6 ------------------*/
if($("#gauge_chart_filled").length){

// Initialize after dom ready
        var myChart = echarts.init(document.getElementById('gauge_chart_filled')); 
        
var option = {
    tooltip : {
        formatter: "{a} <br/>{b} : {c}%"
    },
    toolbox: {
        show : true,
        feature : {
            mark : {show: true},
            restore : {show: true},
            saveAsImage : {show: true}
        }
    },
    series : [
        {
            name:'',
            type:'gauge',
            startAngle: 180,
            endAngle: 0,
            center : ['50%', '90%'], 
            radius : 200,
            /*axisLine: {     
                lineStyle: {      
                    width: 200
                }
            },*/
            axisLine: {
                            show: true,
                            lineStyle: {
                                color: [
                                    [0.2, '#536DFE'],
                                    [0.8, '#9575CD'],
                                    [1, '#80CBC4']
                                ],
                                width:150
                            }
                        }  ,
            axisTick: {           
                splitNumber: 10,   
                length :12,       
            },
            axisLabel: {           
                formatter: function(v){
                    switch (v+''){
                        case '10': return 'Low';
                        case '50': return 'Medium';
                        case '90': return 'High';
                        default: return '';
                    }
                },
                textStyle: {       
                    color: '#fff',
                    fontSize: 15,
                    fontWeight: 'bolder'
                }
            },
            pointer: {
                width:50,
                length: '90%',
                color: 'rgba(255, 255, 255, 0.8)'
            },
            title : {
                show : true,
                offsetCenter: [0, '-60%'],      
                textStyle: {      
                    color: '#fff',
                    fontSize: 30
                }
            },
            detail : {
                show : true,
                backgroundColor: 'rgba(0,0,0,0)',
                borderWidth: 0,
                borderColor: '#ccc',
                width: 100,
                height: 40,
                offsetCenter: [0, -40],       
                formatter:'{value}%',
                textStyle: {      
                    fontSize : 30
                }
            },
            data:[{value: 50, name: ''}]
        }
    ]


        /*var option = {
                        
                tooltip : {
                    formatter: "{b} : {c}%"
                },
                toolbox: {
                    show : false,
                    feature : {
                        mark : {show: false},
                        restore : {show: false},
                        saveAsImage : {show: true}
                    }
                },
                series : [
                    {
                        name:'Server Load',
                        type:'gauge',
                        center: ['50%', '50%'],
                        radius: ['0%', '100%'],
                        axisLine: {
                            show: true,
                            lineStyle: {
                                color: [
                                    [0.2, '#536DFE'],
                                    [0.8, '#9575CD'],
                                    [1, '#80CBC4']
                                ],
                                width: 10
                            }
                        }  ,
                        title: {
                            show : false,
                            offsetCenter: [0, '120%'],
                            textStyle: {
                                color: '#333',
                                fontSize : 15
                            }
                        }  ,
                        detail: {
                            show : true,
                            backgroundColor: 'rgba(0,0,0,0)',
                            borderWidth: 0,
                            borderColor: '#ccc',
                            width: 100,
                            height: 40,
                            offsetCenter: [0, '40%'],
                            formatter:'{value}%',
                            textStyle: {
                                color: 'auto',
                                fontSize : 20
                            }
                        },
                       
                        data:[{value: 50, name: 'Server Load (MB)'}]
                    }
             ]*/
};

//myChart.setOption(option);
gauge_load_chart_filled(option);
var timeTicket_filled = setInterval(function (){
    gauge_load_chart_filled(option);
},1500);

function gauge_load_chart_filled(option){
    option.series[0].data[0].value = (Math.random()*100).toFixed(2) - 0;
    myChart.setOption(option,true);
}


//clearInterval(timeTicket_filled);


}




    }



    /******************************
     initialize respective scripts 
     *****************************/
    $(document).ready(function() {
        CMPLTADMIN_SETTINGS.dashboardEcharts();
    });

    $(window).resize(function() {
        CMPLTADMIN_SETTINGS.dashboardEcharts();
    });

    $(window).load(function() {});

});
