$('.select').timezones();

$(document).ready(function () {
    /* add initial tab data on page load */
    addGroup();

    $("#dynamicSetting,#close").on("click", function () {
        $("#customDiv").toggle();
    });

    // $('.select').timezones();
});

$(document).on('click', '.select', function () {
    // $('.select').timezones();
});

$(document).on('click', '.dynamicgroup', function (event) {
    var getlength = $(this).attr('data-length');
    console.log("length check", getlength);
    if ($(this).attr('data-tab') != undefined) {
        $(".dynamic-tabs1").css('display', 'none');
        $("#" + $(this).attr('data-tab')).css('display', 'block');
        // $('.select').timezones();
    }
    $(".dynamic-tabs1").css('display', 'none');
    $(".dynamic-tabs1").removeClass('active');
    $(".dynamicgroup").removeClass('active');
    $("#v-pills-dynamic" + getlength + "-tab").addClass('active');
    $("#v-pills-dynamic" + getlength).addClass('show active');
    $("#v-pills-dynamic" + getlength).css('display', 'block');
});

$(document).on('click', '#addGroup', function (event) {
    addGroup();
});

$(document).on('click', '.removeGroup', function (event) {
    var removeId = $(this).attr('data-id');
    var lengthid = $(this).attr('data-length') - 1;

    $("#" + removeId).remove();
    $("#" + removeId + '-tab').remove();
    $(".dynamic-tabs1").removeClass('active');
    $(".dynamicgroup").removeClass('active');

    $("#v-pills-dynamic" + lengthid + "-tab").addClass('active');
    $("#v-pills-dynamic" + lengthid).addClass('show active');
    $("#v-pills-dynamic" + lengthid).css('display', 'block');

    configureRemoveGroupBtn();
});

function configureRemoveGroupBtn() {
    const totalTabs = $('.removeGroup').length;
    if (totalTabs <= 1)
        $(".removeGroup").css('display', 'none');
    else
        $(".removeGroup").css('display', 'block');
}

function addGroup() {
    var grouplength = $(".dynamicgroup").length + 1;

    var addGroup = ' <button class="nav-link dynamicgroup" id="v-pills-dynamic' + grouplength + '-tab" data-tab="v-pills-dynamic' + grouplength + '" data-bs-toggle="pill" data-bs-target="#v-pills-dynamic' + grouplength + '" type="button" role="tab" aria-controls="v-pills-dynamic' + grouplength + '" data-length="' + grouplength + '" aria-selected="false">Dynamic Group' + grouplength + '</button>';

    var addnewTab = '       <div role="tabpanel" id="v-pills-dynamic' + grouplength + '" aria-labelledby="v-pills-dynamic' + grouplength + '-tab" class="fade tab-pane dynamic-tabs1"> ' +
        '<form class="" onsubmit="return false">' +
        ' <div class="container">' +
        '  <div class="row">' +
        '<div class="col-lg-12 col-md col">' +
        '  <div class="justify-content-md-left row">' +
        '  <div class="col-lg-7 col">' +
        '   <h5 style="font-size: 15px; text-align: left;">Dynamic Attribute</h5>' +
        '  </div>' +
        '  <div class="col-lg-5 col"></div>' +
        '  </div>' +
        ' <div class="row">' +
        ' <div class="col-md-4">' +
        ' <select id = "dynamicAtt-prop-' + grouplength +
        '" aria-label="Dynamic Attribute" class="form-select attribute-select " style="font-size: 12px;">' +
        '   <option>Dynamic Attribute</option>' +
        '   <option value="2">2</option>' +
        '   <option value="3">3</option>' +
        '   <option value="4">4</option>' +
        '  </select>' +
        ' </div>' +
        '  <div class="col-md-4">' +
        ' <select id = "dynamicAtt-op-' + grouplength +
        '"   aria-label="Dynamic Attribute" class="form-select " style="font-size: 12px;">' +
        // '  <option>Select Relationship</option>' +
        '  <option value="eq">equals</option>' +
        '  <option value="gt">greater than</option>' +
        '  <option value="ge">greater than equals</option>' +
        '  <option value="lt">lesser than </option>' +
        '  <option value="le">lesser than equals</option>' +
        '  </select>' +
        '  </div>' +
        '    <div class="col-md-4">' +

        '  <div class="form-input">' +
        '   <input id = "dynamicAtt-operand-' + grouplength + '"  type="text" class="form-control" id="usr">' +
        '  </div>' +
        ' </div>' +
        ' </div>' +
        ' </div>' +
        '  <div class="col-lg-12 col-md col mt-3">' +
        ' <div class="justify-content-md-left justify-content-lg-left row">' +
        ' <div class="col-lg-7 col">' +
        '  <h5 style="font-size: 15px; text-align: left;">Date Attribute</h5>' +
        ' </div>' +
        '  <div class="col-lg-5 col"></div>' +
        ' </div>' +
        ' <div class="row ">' +
        ' <div class="col"> ' +
        '<select id = "dateAtt-prop-' + grouplength + '" aria-label="Dynamic Attribute" class="attibute-date form-select w-75" style="font-size: 12px;">' +
        '    <option>Date Attribute</option>' +
        '   <option value="2">2</option>' +
        '    <option value="3">3</option>' +
        '    <option value="4">4</option>' +
        '   </select>' +
        ' </div>' +
        '</div>' +
        '</div>' +
        '</div>' +

        '<div class="mt-2 row">' +
        '<div class="col-lg-4 col-md col">' +
        '  <label class="form-label" style="font-size: 12px;">Duration</label>' +
        ' <input id = "dateAtt-duration-' + grouplength + '" type="number" min="1"  max="999" class="form-control duration-input"/>' +
        ' </div>' +
        '<div class="col-lg-4 col-md col">' +
        '  <label class="form-label">&nbsp;</label>' +
        '  <select id = "dateAtt-unit-' + grouplength + '" aria-label="Days" class="form-select" style="font-size: 12px;">' +
        ' <option value="minutes">Minutes</option>' +
        ' <option value="hours">Hours</option>' +
        ' <option value="days">Days</option>' +
        ' <option value="weeks">Weeks</option>' +
        ' <option value="months">Months</option>' +
        // ' <option value="years">Years</option>' +
        '   </select>' +
        ' </div>' +
        ' <div class="col-lg-4 col-md col">' +
        '  <label class="form-label">&nbsp;</label>' +
        '  <select id = "dateAtt-timeline-' + grouplength + '" aria-label="After" class="form-select timeline-select" style="font-size: 12px;">' +
        '   <option value="Before">Before</option>' +
        '  <option value="After">After</option>' +
        '    <option value="On">On</option>' +

        '   </select>' +
        '   </div>' +
        ' </div>' +
        '<div class="col-lg-12 col-md col mt-3">' +

        ' <div class="row ">' +
        '  <label class="form-label text-center" style="font-size: 12px;">Timezone</label>' +
        '<div class="col"> ' +
        '<select id = "dateAtt-tz-' + grouplength + '" name="timezone" id="timezone" aria-label="Dynamic Attribute" class="form-select select" ' + 'style="font-size: 12px;">' +
        '  <option data-offset="+5:30" value="Asia/Calcutta">(GMT +5:30) Asia/Calcutta</option>' +
        ' </select>' +
        ' </div>' +

        ' </div>' +
        ' </div>' +
        '<div class="mt-2 row">' +
        ' <div class="col-lg-10 col-md col">' +
        ' <div class="checkbox text-center" style="font-size: 12px;">' +
        '  <input id = "dateAtt-extend-' + grouplength + '" type="checkbox" value="1"> Extend wait duration untill specific time' +
        ' </div>' +
        ' <div id="extend-time-list-' + grouplength + '" style="width: 50%"> ' +
        '  <label class="form-label" style="font-size: 12px;">Time</label>' +
        '  <input id="dateAtt-extend-time-' + grouplength + '" type="text" list="times" class="form-select" style="font-size: 12px;"/>' +
        '   <datalist id="times"></datalist>' +
        ' </div>' +
        ' </div>' +
        ' </div>' +
        ' <div class="row">' +
        '<div class="col-lg-4 col-md col">' +
        '<button  id="remove" data-id="v-pills-dynamic' + grouplength + '" data-length="' + grouplength + '"  class="removeGroup btn btn-danger btn-sm" style="text-decoration: none; margin-top: 100px;">Remove group</button>' +
        '</div>' +
        /*'<div class="col-lg-4 col-md col">'+
          '<button id="close" class="btn btn-warning btn-sm" style="text-decoration: none; margin-top: 100px;">Close</button>'+
        '</div>'+*/

        '<div class="col-lg-4 col-md col">' +
        '<button id="done" class="btn btn-primary btn-sm" style="text-decoration: none; margin-top: 100px;">Done</button>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '</form></div>';

    // $('.select').timezones();

    /*
    * #v-pills-tab - all tab parent
    * #v-pills-dynamic1-tab - tab button
    * #v-pills-dynamic1 - tab content
    * .dynamicgroup - each tab
    * .dynamic-tabs1 - each tab content
    * */
    $("#v-pills-tab").append(addGroup);
    $("#v-pills-tabContent").append(addnewTab);

    $(".dynamic-tabs1").css('display', 'none');
    $(".dynamic-tabs1").removeClass('active');
    $(".dynamicgroup").removeClass('active');
    $("#v-pills-dynamic" + grouplength + "-tab").addClass('active');
    // $('#v-pills-dynamic' + grouplength).addClass('active');
    $("#v-pills-dynamic" + grouplength).addClass('show active');
    $("#v-pills-dynamic" + grouplength).css('display', 'block');

    $('#extend-time-list-' + grouplength).css('display', 'none');


    /* check box change event */
    $('#dateAtt-extend-' + grouplength).change(function () {
        if (this.checked) {
            $('#extend-time-list-' + grouplength).css('display', 'block');
        } else {
            $('#extend-time-list-' + grouplength).css('display', 'none');
        }
        // $('#textbox1').val(this.checked);
    });

    /* add timezones */
    $('.select').timezones();

    /* add time values to the data list */
    configureTimesDataList();

    /* remove button functionality */
    configureRemoveGroupBtn();
}

function configureTimesDataList() {
    const start = new Date();
    start.setHours(0, 0, 0); //8 AM
    const end = new Date();
    end.setHours(23, 59, 0); //5 PM

    let html = '';
    while (start <= end) {
        let time = start.toLocaleString('en-US', {hour: '2-digit', minute: '2-digit'});
        html += `<option>${time}</option>`;
        start.setMinutes(start.getMinutes() + 30);
    }

    $('#times').html(html);
}
