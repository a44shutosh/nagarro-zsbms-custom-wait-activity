/* todo:
*   1. remove group btn - issues select next available, add group number issue
*   2. check extend time input valid or not */

$('.select').timezones();

let radioBtnId = 1;

$(document).ready(function () {
    /* add initial tab data on page load */
    // addGroup();

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
    //console.log("length check", getlength);
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
    configureAddGroupButton();
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
    configureAddGroupButton();
});

$(document).on('click', 'button.add-da', function (event) {
    let currentTab = $(this).attr('data-group-pos');
    const dynamicAttribute = getDynamicAttributeHTML(currentTab);
    let currentActionDiv = $(this).parents().eq(1);
    $(dynamicAttribute).insertAfter(currentActionDiv);
    let currentGroup = $(this).parents().eq(2);
    configureRemoveDArow(currentTab, {currentGroup: currentGroup[0], currentGroupParent: currentGroup.parent()[0]});
});

$(document).on('click', 'button.add-layer-da', function (event) {
    let currentTab = $(this).attr('data-group-pos');
    const dynamicAttribute = getDynamicAttributeHTML(currentTab, true);
    let currentActionDiv = $(this).parents().eq(1);
    $(dynamicAttribute).insertAfter(currentActionDiv);
    let currentGroup = $(this).parents().eq(2);
    configureRemoveDArow(currentTab, {currentGroup: currentGroup[0], currentGroupParent: currentGroup.parent()[0]});
});

$(document).on('click', 'button.remove-da', function (event) {
    let currentTab = $(this).attr('data-group-pos');
    let currentGroup = $(this).parents().eq(2);
    let currentGroupParent = currentGroup.parent()[0]
    if (currentGroup && currentGroup.children && [...currentGroup.children()].length < 3) {
        currentGroup.remove();
    } else {
        let currentActionDiv = $(this).parents().eq(1);
        currentActionDiv.remove();
    }

    configureRemoveDArow(currentTab, {currentGroup: currentGroup[0], currentGroupParent});
});

function configureRemoveDArow(tab, currentGroupDetails, isSecondTime) {
    const rows = $(`div.dynamic-attribute-row-${tab}`).length;
    if (!currentGroupDetails) {
        if (rows > 1) {
            $(`.dynamic-attribute-row-${tab} button.remove-da`).css('display', 'inline-block');
        } else {
            $(`.dynamic-attribute-row-${tab} button.remove-da`).css('display', 'none');
        }
        return;
    }

    let logicalOp = 0;
    let dynamicAttributes = 0;
    let logicalOpGroup = 0;
    const currentGroup = currentGroupDetails.currentGroup;
    const currentGroupParent = currentGroupDetails.currentGroupParent;
    [...currentGroup.children].forEach(child => {
        let classes = [...(child.classList || [])];
        if (classes.includes('logical-ops')) {
            /* operator div */
            logicalOp++;
        } else if (classes.includes('dynamic-attribute-row')) {
            dynamicAttributes++;
        } else if (classes.includes('logical-op-group')) {
            /* da group */
            logicalOpGroup++;
        }
    });

    let isRootNode = currentGroupParent ? ([...currentGroupParent.classList] || []).includes('parent-group') : false;
    let displayValue = ((logicalOpGroup > 0 || isRootNode) && dynamicAttributes < 2) ? 'none' : 'inline-block';

    [...currentGroup.children].forEach(child => {
        let classes = [...(child.classList || [])];

        if (classes.includes('dynamic-attribute-row')) {
            // child.children[3].children[2].style.display = displayValue;
            child.children[3].children[2].setAttribute("style", `display:${displayValue}`);
        }
    });

    if (currentGroupParent && !isSecondTime) {
        configureRemoveDArow(tab, {currentGroup: currentGroupParent, currentGroupParent: undefined}, true);
    }
}

function configureAddGroupButton(){
    const totalTabs = $('.nav-link.dynamicgroup').length;
    if (totalTabs >= 19)
        $("#addGroup").css('display', 'none');
    else
        $("#addGroup").css('display', 'block');
}

function configureRemoveGroupBtn() {
    const totalTabs = $('.removeGroup').length;
    if (totalTabs <= 1)
        $(".removeGroup").css('display', 'none');
    else
        $(".removeGroup").css('display', 'block');
}

// function getInsideComponents(){

// }

function addGroup(dynamicAttLength = 1, userConfigValues = []) {
    //console.log("addGroup helper class",dynamicAttLength, userConfigValues);
    const grouplength = $(".dynamicgroup").length + 1;
    let lengthOfInsideHtml = dynamicAttLength;
    const addGroup = ' <button class="nav-link dynamicgroup" id="v-pills-dynamic' + grouplength + '-tab" data-tab="v-pills-dynamic' + grouplength + '" data-bs-toggle="pill" data-bs-target="#v-pills-dynamic' + grouplength + '" type="button" role="tab" aria-controls="v-pills-dynamic' + grouplength + '" data-length="' + grouplength + '" aria-selected="false">Dynamic Group' + grouplength + '</button>';
    
    let dynamicAttributes = '';
    if(userConfigValues.length > 0){
        //console.log("inside add group check userconfig length if");
        dynamicAttributes = getinnerHtmlStructure(userConfigValues);
    }else{
        //console.log("inside add group check userconfig length else");
        dynamicAttributes=  Array(lengthOfInsideHtml)
        .fill(1).map((v, i) => getDynamicAttributeHTML(grouplength, i + 1)).join("");
    }
    
    const addnewTab = '       <div role="tabpanel" id="v-pills-dynamic' + grouplength + '" aria-labelledby="v-pills-dynamic' + grouplength + '-tab" class="fade tab-pane dynamic-tabs1"> ' +
        '<form class="" onsubmit="return false">' +
        ' <div class="container">' +
        '  <div class="row">' +
        '   <div id="dynamicAttribute-' + grouplength + '" class="col-lg-12 col-md col parent-group">' +
        '     <div class="justify-content-md-left row">' +
        '           <div class="col-lg-7 col">' +
        '   <h5 style="font-size: 15px; text-align: left;">Dynamic Attribute</h5>' +
        '  </div>' +
        '  <div class="col-lg-5 col"></div>' +
        '  </div>' +
        dynamicAttributes +
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

    /* remove DA row button functionality */
    configureRemoveDArow(grouplength);
}

function getinnerHtmlStructure(userConfigValues, nameValue= ''){

    let innerHtml= '';

    // if(userConfigValues.length > 0){
    //     lengthOfInsideHtml = userConfigValues && userConfigValues.dynamicAttributes && userConfigValues.dynamicAttributes.length;
    // }

    //let dynamicAttributes =userConfigValues && userConfigValues.dynamicAttributes || [];

    //console.log("getinnerHtmlStructure: innder html here", userConfigValues);
    for(let i=0;i< userConfigValues.length;i++){
        if(userConfigValues[i].logicalOp ){
            //console.log("getinnerHtmlStructure: if condition ");
            innerHtml+= getinnerHtmlStructure(userConfigValues[i].dynamicAttributes,i+nameValue);
            //console.log("getinnerHtmlStructure: if condition output", innerHtml, userConfigValues[i].logicalOp);
        }else{
            console.log("getinnerHtmlStructure: else condition ", i);

            if(i==0){
                //console.log("getinnerHtmlStructure: else if condition ");
                innerHtml+= ' <div class="row logical-op-group">' +
                '   <div class="logical-ops mb-2" style="display: flex">' +
                '   <div class="custom-control custom-radio custom-control-inline" style="margin-right: 10px">' +
                '     <input type="radio" id="customRadioInline1" name="customRadioInline' + nameValue+ i + '" class="custom-control-input" checked="">' +
                '     <label class="custom-control-label active" for="customRadioInline' + nameValue +i + '"">AND</label>' +
                '   </div>' +
                '   <div class="custom-control custom-radio custom-control-inline">' +
                '     <input type="radio" id="customRadioInline2" name="customRadioInline' +nameValue+ i + '"" class="custom-control-input">' +
                '     <label class="custom-control-label" for="customRadioInline' +nameValue+ i + '">OR</label>' +
                '   </div>' +
                '</div>';
                innerHtml += getDynamicAttributeHTML(i, 0, nameValue);
                //console.log("getinnerHtmlStructure: else if condition output", innerHtml);
            }else{
                //console.log("getinnerHtmlStructure: else else condition ");
                innerHtml+= getDynamicAttributeHTML(i, 0, nameValue) ;
                //console.log("getinnerHtmlStructure: else else conditionoutput", innerHtml);    
            }
            
        }
    }
    innerHtml += '   </div>';
        //radioBtnId++;
    //console.log("innder html final", innerHtml);
    return innerHtml;

}


function getDynamicAttributeHTML(tab, group, nameValue= '') {
    //console.log("getDynamicAttributeHTML: tab, group", tab, group);
    let logicalOp = '';
    let logicalOpEnd = '';
    if (group) {
        logicalOp = ' <div class="row logical-op-group">' +
            '   <div class="logical-ops mb-2" style="display: flex">' +
            '   <div class="custom-control custom-radio custom-control-inline" style="margin-right: 10px">' +
            '     <input type="radio" id="customRadioInline1" name="customRadioInline' + radioBtnId + '" class="custom-control-input" checked="">' +
            '     <label class="custom-control-label active" for="customRadioInline' + radioBtnId + '"">AND</label>' +
            '   </div>' +
            '   <div class="custom-control custom-radio custom-control-inline">' +
            '     <input type="radio" id="customRadioInline2" name="customRadioInline' + radioBtnId + '"" class="custom-control-input">' +
            '     <label class="custom-control-label" for="customRadioInline' + radioBtnId + '">OR</label>' +
            '   </div>' +
            '</div>';
        logicalOpEnd = '   </div>';
        radioBtnId++;
    }

    
    return logicalOp +
        '<div class="row dynamic-attribute-row dynamic-attribute-row-' + tab + ' mb-3" data-group-pos="' + tab + '">' +
        ' <div class="col-md-3">' +
        ' <select id = "dynamicAtt-prop-' +nameValue+ tab +
        '" aria-label="Dynamic Attribute" class="form-select attribute-select" style="font-size: 12px;">' +
        '   <option>Dynamic Attribute</option>' +
        '   <option value="2">2</option>' +
        '   <option value="3">3</option>' +
        '   <option value="4">4</option>' +
        '  </select>' +
        ' </div>' +
        '  <div class="col-md-3">' +
        '   <select id = "dynamicAtt-op-' +nameValue+ tab +
        '"   aria-label="Dynamic Attribute" class="form-select operator-select" style="font-size: 12px;">' +
        // '  <option>Select Relationship</option>' +
        '       <option value="eq">equals</option>' +
        '       <option value="gt">is after</option>' +
        '       <option value="ge">is on or after </option>' +
        '       <option value="lt">is before</option>' +
        '       <option value="le">is on or before </option>' +
        '       <option value="ew">ends With</option>' +
        '       <option value="sw">start with</option>' +
        '       <option value="eiww">exist in whole word</option>' +
        '       <option value="co">contains</option>' +
        '       <option value="dnco">does not contains</option>' +
        '   </select>' +
        '   </div>' +
        '   <div class="col-md-3">' +
        '        <div class="form-input">' +
        '            <input id = "dynamicAtt-operand-' +nameValue+ tab + '"  type="text" class="form-control operand-input" id="usr">' +
        '        </div>' +
        '   </div>' +
        '   <div class="col-md-3 actions">' +
        '     <button class="btn add-da" data-group-pos="' +nameValue+ tab + '">' +
        '         <i class="fa fa-plus"></i></i>' +
        '     </button>' +
        '     <button class="btn add-layer-da" title="Add a layer" data-group-pos="' + nameValue+tab + '">' +
        '         <img src="images/add-layer.svg" alt="Add layer" style="width: 16px"/>\n' +
        '     </button>' +
        '     <button class="btn remove-da" data-group-pos="' +nameValue+ tab + '">' +
        '         <i class="fa fa-remove"></i></i>' +
        '     </button>' +
        '  </div>' +
        logicalOpEnd +
        ' </div>';
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

function convertDateFormat(inputDate) {
    // Split the input date using '-' as the separator
    const dateParts = inputDate.split('-');

    // Reorder the date parts and join them using '/'
    let outputDate = `${dateParts[0]}/${dateParts[1]}/${dateParts[2]}`;

    return outputDate;
}
