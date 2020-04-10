(function(){
  const MONTHS = ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'İyun', 'İyul', 'Avqust', 'Sentyabr', 'Oktyabr', 'Noyabr', 'Dekabr'];

  function showBanner() {
    var message = 'Contribute on GitHub: https://github.com/codeforvision/covid19-az',
        style   = 'background: #040f0f; color: #2ba84a';
    console.log(`%c ${message}`, style);
  }
  showBanner();

  function drawTrendChart(data) {
    var cols = {
      date: ['date'],
      confirmed: ['confirmed'],
      deaths: ['deaths'],
      recovered: ['recovered'],
      active: ['active']
    };

    var colors = {
      active: '#ff9f1c',
      deaths: '#011627',
      confirmed: '#a4adc0',
      recovered: '#41ead4'
    };

    data.forEach(({ date, confirmed, recovered, deaths }) => {
      if (confirmed === 0) { return; }
      cols.date.push(date);
      cols.confirmed.push(confirmed);
      cols.deaths.push(deaths);
      cols.recovered.push(recovered);
      cols.active.push(confirmed - recovered - deaths);
    });

    var trendChart = c3.generate({
      bindto: '#trend-chart',
      data: {
        x: 'date',
        xFormat: '%Y-%m-%d',
        columns: [
          cols.date,
          cols.confirmed,
          cols.active,
          cols.recovered,
          cols.deaths
        ],
        names: {
          date: 'Tarix',
          confirmed: 'Yoluxma',
          deaths: 'Ölüm',
          recovered: 'Sağalma',
          active: 'Aktiv'
        }
      },
      color: {
        pattern: [colors.confirmed, colors.active, colors.recovered, colors.deaths]
      },
      point: {
        r: 3
      },
      axis: {
        x: {
          type: 'timeseries',
          tick: {
            format: function (x) {
              var xDate = new Date(x);
              return MONTHS[xDate.getMonth()] + ' ' + xDate.getDate();
            },
            count: 7
          }
        },
        y: {
          padding: {
            bottom: 4
          },
          tick: {
            values: [0, 100, 200, 300, 400, 500, 600, 700, 800, 900, 100, 1100, 1200]
          }
        }
      },
      tooltip: {
        format: {
          value: function (value, ratio, id, index) {
            if (index && cols[id][index]) {
              var diff = parseInt(value, 10) - cols[id][index];
              return `${value} (${(diff >= 0 ? '+' : '') + diff})`;
            } else {
              return value;
            }
          }
        }
      },
      grid: {
        x: {
          show: true,
        },
        y: {
          show: true,
        }
      }
    });
  }

  function drawDailyChart(data) {
    var cols = {
      date: [],
      confirmed: [],
      dailyDiff: ['dailyDiff']
    };
    var confirmedYesterday;

    data.forEach(({ date, confirmed }) => {
      if (confirmed === 0) { return; }
      cols.date.push(date);
      cols.confirmed.push(confirmed);
      confirmedYesterday = cols.confirmed[cols.confirmed.length - 2];
      cols.dailyDiff.push(confirmed - confirmedYesterday);
    });

    var dailyChart = c3.generate({
      bindto: '#daily-chart',
      data: {
        columns: [
          cols.dailyDiff
        ],
        names: {
          dailyDiff: 'Yoluxma artımı'
        },
        type: 'bar',
        color: function(color, d) {
          return '#a4adc0';
        }
      },
      bar: {
        width: {
          ratio: 0.8
        }
      },
      axis: {
        x: {
          tick: {
            format: function (x) {
              var xDate = new Date(cols.date[x]);
              return MONTHS[xDate.getMonth()] + ' ' + xDate.getDate();
            }
          }
        },
        y: {
          tick: {
            values: [0, 25, 50, 75, 100, 125, 150, 175, 200, 225, 250, 275, 300]
          }
        }
      },
      legend: {
        hide: true
      },
      grid: {
        x: {
          show: true,
        },
        y: {
          show: true,
        }
      }
    });
  }

  function drawCharts(data) {
    drawTrendChart(data);
    drawDailyChart(data);
  }

  function parseJSON(response) {
    return response.json();
  }

  fetch('/data/timeseries.json')
    .then(parseJSON)
    .then(drawCharts)
    .catch(function(err) {
      gtag('event', 'exception', {
        'description': `request_failed: ${err}`,
        'fatal': true
      });
    });
})();