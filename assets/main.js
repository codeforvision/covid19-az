!function(){const e=["Yanvar","Fevral","Mart","Aprel","May","İyun","İyul","Avqust","Sentyabr","Oktyabr","Noyabr","Dekabr"];console.log("%c Contribute on GitHub: https://github.com/codeforvision/covid19-az","background: #040f0f; color: #2ba84a"),fetch("/covid19-az/data/timeseries.json").then((function(e){return e.json()})).then((function(t){!function(t){var a={date:["date"],confirmed:["confirmed"],deaths:["deaths"],recovered:["recovered"],active:["active"]},r="#ff9f1c",o="#011627",i="#a4adc0",n="#41ead4";t.forEach((({date:e,confirmed:t,recovered:r,deaths:o})=>{0!==t&&(a.date.push(e),a.confirmed.push(t),a.deaths.push(o),a.recovered.push(r),a.active.push(t-r-o))})),c3.generate({bindto:"#trend-chart",data:{x:"date",xFormat:"%Y-%m-%d",columns:[a.date,a.confirmed,a.active,a.recovered,a.deaths],names:{date:"Tarix",confirmed:"Yoluxma",deaths:"Ölüm",recovered:"Sağalma",active:"Aktiv"}},color:{pattern:[i,r,n,o]},point:{r:3},axis:{x:{type:"timeseries",tick:{format:function(t){var a=new Date(t);return e[a.getMonth()]+" "+a.getDate()},count:7}},y:{padding:{bottom:4},tick:{values:Array(21).fill().map(((e,t)=>15e3*t))}}},tooltip:{format:{value:function(e,t,r,o){if(o&&a[r][o]){var i=parseInt(e,10)-a[r][o];return`${e} (${(i>=0?"+":"")+i})`}return e}}},grid:{x:{show:!0},y:{show:!0}}})}(t),function(t){var a,r,o={date:[],confirmed:[],dailyDiff:["dailyDiff"]};t.forEach((({date:e,confirmed:t})=>{0!==t&&(o.confirmed.push(t),a=o.confirmed[o.confirmed.length-2],(r=t-a)>0&&(o.date.push(e),o.dailyDiff.push(r)))})),c3.generate({bindto:"#daily-chart",data:{columns:[o.dailyDiff],names:{dailyDiff:"Yoluxma artımı"},type:"bar",color:function(e,t){return"#a4adc0"}},bar:{width:{ratio:.8}},axis:{x:{tick:{format:function(t){var a=new Date(o.date[t]);return e[a.getMonth()]+" "+a.getDate()}}},y:{tick:{values:Array(25).fill().map(((e,t)=>300*t))}}},legend:{hide:!0},grid:{x:{show:!0},y:{show:!0}}})}(t)})).catch((function(e){gtag("event","exception",{description:`request_failed: ${e}`,fatal:!0})}))}();