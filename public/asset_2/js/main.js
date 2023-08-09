(function ($) {
    "use strict";

    // Spinner
    var spinner = function () {
        setTimeout(function () {
            if ($('#spinner').length > 0) {
                $('#spinner').removeClass('show');
            }
        }, 1);
    };
    spinner();
    
    
    // Back to top button
    $(window).scroll(function () {
        if ($(this).scrollTop() > 300) {
            $('.back-to-top').fadeIn('slow');
        } else {
            $('.back-to-top').fadeOut('slow');
        }
    });
    $('.back-to-top').click(function () {
        $('html, body').animate({scrollTop: 0}, 1500, 'easeInOutExpo');
        return false;
    });


    // Sidebar Toggler
    $('.sidebar-toggler').click(function () {
        $('.sidebar, .content').toggleClass("open");
        return false;
    });


    // Progress Bar
    $('.pg-bar').waypoint(function () {
        $('.progress .progress-bar').each(function () {
            $(this).css("width", $(this).attr("aria-valuenow") + '%');
        });
    }, {offset: '80%'});


    // Calender
    $('#calender').datetimepicker({
        inline: true,
        format: 'L'
    });


    // Testimonials carousel
    $(".testimonial-carousel").owlCarousel({
        autoplay: true,
        smartSpeed: 1000,
        items: 1,
        dots: true,
        loop: true,
        nav : false
    });


    // Chart Global Color
    Chart.defaults.color = "#6C7293";
    Chart.defaults.borderColor = "#000000";


    // // Worldwide Sales Chart
    // var ctx1 = $("#worldwide-sales").get(0).getContext("2d");
    // var myChart1 = new Chart(ctx1, {
    //     type: "bar",
    //     data: {
    //         labels: ["2016", "2017", "2018", "2019", "2020", "2021", "2022"],
    //         datasets: [{
    //                 label: "USA",
    //                 data: [15, 30, 55, 65, 60, 80, 95],
    //                 backgroundColor: "rgba(235, 22, 22, .7)"
    //             },
    //             {
    //                 label: "UK",
    //                 data: [8, 35, 40, 60, 70, 55, 75],
    //                 backgroundColor: "rgba(235, 22, 22, .5)"
    //             },
    //             {
    //                 label: "AU",
    //                 data: [12, 25, 45, 55, 65, 70, 60],
    //                 backgroundColor: "rgba(235, 22, 22, .3)"
    //             }
    //         ]
    //         },
    //     options: {
    //         responsive: true
    //     }
    // });


    // // Salse & Revenue Chart
    // var ctx2 = $("#salse-revenue").get(0).getContext("2d");
    // var myChart2 = new Chart(ctx2, {
    //     type: "line",
    //     data: {
    //         labels: ["2016", "2017", "2018", "2019", "2020", "2021", "2022"],
    //         datasets: [{
    //                 label: "Salse",
    //                 data: [15, 30, 55, 45, 70, 65, 85],
    //                 backgroundColor: "rgba(235, 22, 22, .7)",
    //                 fill: true
    //             },
    //             {
    //                 label: "Revenue",
    //                 data: [99, 135, 170, 130, 190, 180, 270],
    //                 backgroundColor: "rgba(235, 22, 22, .5)",
    //                 fill: true
    //             }
    //         ]
    //         },
    //     options: {
    //         responsive: true
    //     }
    // });
    var salesCountByMonth = JSON.parse(document.getElementById('monthlysales').textContent);
    const salesCountByMonthObj = {
        Jan: 0,
        Feb: 0,
        March: 0,
        April: 0,
        May: 0,
        June: 0
      };
      
      
      salesCountByMonth.forEach((monthData) => {
        const { month, count } = monthData;
        switch (month) {
          case 1:
            salesCountByMonthObj.Jan = count;
            break;
          case 2:
            salesCountByMonthObj.Feb = count;
            break;
          case 3:
            salesCountByMonthObj.March = count;
            break;
          case 4:
            salesCountByMonthObj.April = count;
            break;
          case 5:
            salesCountByMonthObj.May = count;
            break;
          case 6:
            salesCountByMonthObj.June = count;
            break;
          default:
            break;
        }
      });
      
      
      const salesCountJan = salesCountByMonthObj.Jan;
      const salesCountFeb = salesCountByMonthObj.Feb;
      const salesCountMarch = salesCountByMonthObj.March;
      const salesCountApril = salesCountByMonthObj.April;
      const salesCountMay = salesCountByMonthObj.May;
      const salesCountJune = salesCountByMonthObj.June;
    


    // Single Line Chart
    var ctx3 = $("#line-chart").get(0).getContext("2d");
    var myChart3 = new Chart(ctx3, {
        type: "line",
        data: {
            labels: ["jan","feb","march","april","may","june"],
            datasets: [{
                label: "Sales",
                fill: false,
                backgroundColor: "rgba(235, 22, 22, .7)",
                data:[ salesCountJan,salesCountFeb,salesCountMarch,salesCountApril,salesCountMay,salesCountJune]
            }]
        },
        options: {
            responsive: true
        }
    });


    // // Single Bar Chart
    // var ctx4 = $("#bar-chart").get(0).getContext("2d");
    // var myChart4 = new Chart(ctx4, {
    //     type: "bar",
    //     data: {
    //         labels: ["Italy", "France", "Spain", "USA", "Argentina"],
    //         datasets: [{
    //             backgroundColor: [
    //                 "rgba(235, 22, 22, .7)",
    //                 "rgba(235, 22, 22, .6)",
    //                 "rgba(235, 22, 22, .5)",
    //                 "rgba(235, 22, 22, .4)",
    //                 "rgba(235, 22, 22, .3)"
    //             ],
    //             data: [55, 49, 44, 24, 15]
    //         }]
    //     },
    //     options: {
    //         responsive: true
    //     }
    // });

    let totalsales=Number(document.getElementById('totalsales').innerHTML)
    let ordershipped=Number(document.getElementById('ordershipped').innerHTML)
    let orderprocessing=Number(document.getElementById('orderprocessing').innerHTML)
    let orderpending=Number(document.getElementById('orderpending').innerHTML)
    let ordercancelled=Number(document.getElementById('ordercancelled').innerHTML)
    console.log(totalsales, ordershipped, orderprocessing, orderpending, ordercancelled)
    // Pie Chart
    var ctx5 = $("#pie-chart").get(0).getContext("2d");
    var myChart5 = new Chart(ctx5, {
        type: "pie",
        data: {
            labels: ['Orders Delivered', 'Orders Shipped', 'Orders Processing', 'Orders Pending', 'Orders Cancelled'],
            datasets: [{
                backgroundColor: [
                    "rgba(149, 46, 49, 0.7)", 
                    "rgba(40, 85, 103, 0.7)", 
                    "rgba(126, 100, 48, 0.7)", 
                    "rgba(37, 91, 76, 0.7)",
                    "rgba(76, 42, 98, 0.7)" 
                ],
                data: [totalsales, ordershipped, orderprocessing, orderpending, ordercancelled]
            }]
        },
        options: {
            responsive: true
        }
    });
    


    // Doughnut Chart
    var ctx6 = $("#doughnut-chart").get(0).getContext("2d");
    var myChart6 = new Chart(ctx6, {
        type: "doughnut",
        data: {
            labels: ["Italy", "France", "Spain", "USA", "Argentina"],
            datasets: [{
                backgroundColor: [
                    "rgba(235, 22, 22, .7)",
                    "rgba(235, 22, 22, .6)",
                    "rgba(235, 22, 22, .5)",
                    "rgba(235, 22, 22, .4)",
                    "rgba(235, 22, 22, .3)"
                ],
                data: [55, 49, 44, 24, 15]
            }]
        },
        options: {
            responsive: true
        }
    });

    
})(jQuery);

