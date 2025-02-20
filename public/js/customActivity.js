define([
        'postmonger'
    ], function (
        Postmonger
    ) {
        'use strict';

        var connection = new Postmonger.Session();
        var authTokens = {};
        var payload = {};
        var lastStepEnabled = false;
        var steps = [{"label": "Configure Postcard", "key": "step1"}];
        var schemadata = {};
        var journeyName;
        var eventDefinitionKey;
        var dataExtensionId;
        var dataExtensionName;
        var dataExtensionPrimaryKey;
        var activityInstanceId;
        var waitTimeColumnName;

        var currentStep = steps[0].key;


        $(window).ready(onRender);

        connection.on('requestedSchema', handleSchema)
        connection.on('initActivity', initialize);
        connection.on('requestedTokens', onGetTokens);
        connection.on('requestedEndpoints', onGetEndpoints);
        connection.on('requestedTriggerEventDefinition', onRequestedTriggerEventDefinition);
        connection.on('clickedNext', save);
        //connection.on('requestedInteraction', onRequestedInteraction);
        //connection.on('requestedDataSources', onRequestedDataSources);


        let useDEColumnForWaitTime = false;

        /* for local data mocking */
        let local;
        const isLocal = (location.hostname === "localhost" || location.hostname === "127.0.0.1");
        //console.log({isLocal});

        if (isLocal) {
            preLocalSetup();
            postLocalSetup();
            handleSchema(local.schema);
        }

        /* local: ends */

        function onRender() {
            // JB will respond the first time 'ready' is called with 'initActivity'
           // console.log('On render events:');

            connection.trigger('ready');
            connection.trigger('requestTokens');
            connection.trigger('requestEndpoints');
            connection.trigger('requestSchema');
            connection.trigger('requestTriggerEventDefinition');

            //connection.trigger('requestInteraction');
            //connection.trigger('requestTriggerEventDefinition');
            //connection.trigger('requestDataSources');

        }

        function onRequestedDataSources(dataSources) {
            // console.log('*** requestedDataSources ***');
            // console.log(dataSources);
        }

        async function checkAndCreateDECol() {

        }

        function handleSchema(schema) {
            // console.log("####Schema without strignify#####", schema);
            // console.log('*** Schema ***', JSON.stringify(schema))
            schemadata = schema;
            parsePrimary();

            // var getattributes = [];
            reloadUserConfig(function(){setValuesInHTML()});
            //changeOperatorOptionsForDateType(schemadata);
        }

      
        function parsePrimary() {
            const schema = schemadata.schema;
            const primaryKeyObj = ((schema || []).filter(s => s.isPrimaryKey))[0];
            if (primaryKeyObj) {
                dataExtensionPrimaryKey = primaryKeyObj.name;
            }
        }

        function onRequestedInteraction(interaction) {
            // console.log('*** requestedInteraction ***');
            // console.log(interaction);
        }

        // used by sfmc we use using to mock sfmc call(local testing of initalizer tmethos of smfc)
        function initialize(data) {
           //console.log('initialize started: ', data);
            if (data) {
                payload = data;
            }


            connection.trigger('updateButton', {
                button: 'next',
                text: 'done',
                visible: true
            });
        }

        function onGetTokens(tokens) {
            //console.log(tokens);
            authTokens = tokens;
        }

        function onGetEndpoints(endpoints) {
            //console.log(endpoints);
        }

        function validateDynamicAtts(dynamicAttributes) {
            for (const da of (dynamicAttributes || [])) {
                if (da.logicalOp) {
                    if (!validateDynamicAtts(da.dynamicAttributes))
                        return false;
                } else {
                    if (!da.operand) {
                        return false;
                    }
                }
            }
            return true;
        }

        function validateConfig(config, group) {
            const res = {
                valid: true,
                errorMsgs: []
            };

            /* validate the operand */
            if (!validateDynamicAtts(config.dynamicAttributes.dynamicAttributes)) {
                res.valid = false;
                res.errorMsgs.push(`Dynamic attribute value cannot be empty`);
            }

            if (!res.valid) {
                $('#modalTitle').text(`Invalid configuration (Group ${group})`);
                let errorMsgHtml = res.errorMsgs.map(e => `<li>${e}</li>`).join("");
                $('#modalBody').html(`<p>Following are the errors:</p><ul>${errorMsgHtml}</ul>`);
                $('#infoModal').modal('show');
            }
            return res.valid;
        }

        // used in parse user config ( parsing config and validation)
        function getDynamicAttributes(dynamicAttGroup) {
            //console.log("getDynamicAttributes: dynamicAttGroup", dynamicAttGroup);
            if (!dynamicAttGroup) {
                return;
            }
            const children = dynamicAttGroup.children;
            let logicalOp;
            let logicalOpGroup;
            let dynamicAttributes = [];

            for (let child of children) {
                //console.log(child);
                let classes = [...(child.classList || [])];
                //console.log("getDynamicAttributes: classes included", JSON.stringify(classes));
                if (classes.includes('logical-ops')) {
                    /* operator div */
                    //console.log("getDynamicAttributes: logical-ops entry", JSON.stringify(child.children[0].children[0].checked ? 'and' : 'or'));
                    logicalOp = child.children[0].children[0].checked ? 'and' : 'or';
                } else if (classes.includes('dynamic-attribute-row')) {

                    //console.log("child.children[2].children[0].children[0].value", child.children[2].children[0].children[0].value);
                    /* da row */
                    child.children[1].children[0].value;
                    dynamicAttributes.push({
                        property: child.children[0].children[0].value,
                        operator: child.children[1].children[0].value,
                        operand: child.children[2].children[0].children[0].value
                    });
                    // console.log("getDynamicAttributes: dynamic-attribute-row entry", JSON.stringify({
                    //     property: child.children[0].children[0].value,
                    //     operator: child.children[1].children[0].value,
                    //     operand: child.children[2].children[0].children[0].value
                    // }));
                } else if (classes.includes('logical-op-group')) {
                    /* da group */
                    logicalOpGroup = getDynamicAttributes(child);
                    dynamicAttributes.push(logicalOpGroup);
                    //console.log("getDynamicAttributes: logical-op-group entry", JSON.stringify(logicalOpGroup));
                }
            }
            
            //console.log("getDynamicAttributes: {logicalOp, dynamicAttributes}",JSON.stringify({logicalOp, dynamicAttributes}));
            return {logicalOp, dynamicAttributes};
        }

        function parseUserConfig() {
            const userConfigs = [];
            const totalTabs = $('.removeGroup').length;

            for (let i = 1; i <= totalTabs; i++) {
                /* Read UI values */
                let dynamicAttGroup = $(`#dynamicAttribute-${i} .row.logical-op-group`);
                console.log("dynamicAttGroup values while saving", JSON.stringify(dynamicAttGroup));
                if (!(dynamicAttGroup && dynamicAttGroup.length)) {
                    continue;
                }
                const dynamicAttributes = getDynamicAttributes(dynamicAttGroup[0]);
                console.log('Final da group: ', JSON.stringify(dynamicAttributes),JSON.stringify(dynamicAttGroup[0]) );

                let dateAttProp = $(`#dateAtt-prop-${i}`).val();
                let dateAttDuration = $(`#dateAtt-duration-${i}`).val();
                let dateAttUnit = $(`#dateAtt-unit-${i}`).val();
                let dateAttTimeline = $(`#dateAtt-timeline-${i}`).val();
                let dateAttTz = $(`#dateAtt-tz-${i}`).val();
                let dateAttExtendWait = $(`#dateAtt-extend-${i}`).is(":checked");
                let dateAttExtendTime = $(`#dateAtt-extend-time-${i}`).val();

                /* Add to array of configs */
                /* TODO: logical op is hardcoded for now */
                /* TODO: trim the input values */
                let userConfig = {
                    dynamicAttributes: dynamicAttributes,
                    dateAttribute: {
                        property: dateAttProp,
                        duration: dateAttDuration,
                        unit: dateAttUnit,
                        timeline: dateAttTimeline,
                        timeZone: dateAttTz,
                        extendWait: dateAttExtendWait,
                        extendTime: dateAttExtendTime
                    }
                };

                console.log("useConfig after values addition",JSON.stringify( userConfig));

                if (!validateConfig(userConfig, i)) {
                    break;
                }
                userConfigs.push(userConfig);
            }
            console.log("user config at last parseUserConfig",JSON.stringify({userConfigs}));

            return userConfigs;
        }
//old logic fn
        async function createWaitTimeDECol() {
            //console.log('Creating column from client side... ')
            const currentTime = moment(new Date()).format('YYYYMMDDHHmmss');
            let fieldName = `wait_time_${currentTime}`;
            const response = await fetch('https://zs-bms-custom-wait.onrender.com/journeybuilder/create-column', {
                method: 'POST',
                body: JSON.stringify({fieldName: fieldName, deName: dataExtensionName}), // string or object
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            try {
                const myJson = await response; //extract JSON from the http response
                waitTimeColumnName = fieldName;
                localStorage.setItem(waitTimeColumnName, waitTimeColumnName);
            } catch (err) {
                //console.log('Error when calling create DE column API.', err);
            }
            // do something with myJson
        }

        function reloadUserConfig(callback) {
            const hasInArguments = Boolean(
                payload['arguments'] &&
                payload['arguments'].execute &&
                payload['arguments'].execute.inArguments &&
                payload['arguments'].execute.inArguments.length > 0
            );
            const inArguments = hasInArguments ? payload['arguments'].execute.inArguments : [];
            console.log("reloadUserConfig: inArguments", JSON.stringify(inArguments));
            // error line
            const hasUserConfig =inArguments.length > 0 ? inArguments[0].userConfig && inArguments[0].userConfig.length: false;
            //console.log("reloadUserConfig: userConfig", JSON.stringify(inArguments[0].userConfig));
            //console.log("reloadUserConfig: hasUserConfig", hasUserConfig);
            if (useDEColumnForWaitTime) {
                if (!hasInArguments || !(inArguments[0].activityInfo && inArguments[0].activityInfo.waitTimeColumnName)) {
                    $('#wait-time-col').css('display', 'none');
                    createWaitTimeDECol().then(res => {
                        $('#wait-time-col').css('display', 'inline');
                        $('#wait-time-col').attr('title', waitTimeColumnName);
                    });
                } else {
                    waitTimeColumnName = inArguments[0].activityInfo.waitTimeColumnName;
                    $('#wait-time-col').css('display', 'inline');
                    $('#wait-time-col').attr('title', waitTimeColumnName);
                }
            } else {
                $('#wait-time-col').css('display', 'none');
            }

            if (!hasInArguments || !hasUserConfig) {
                addGroup();
                updateUIDropdownsWithSchema();
                return;
            }


            $.each(inArguments, function (index, inArgument) {
                
                const userConfigs = inArgument.userConfig || [];
                //console.log("reloadUserConfig: userConfigs for loop", userConfigs);
                $.each(userConfigs, function (index, userConfig) {
                    //console.log("reloadUserConfig: userConfig for loop", userConfig,userConfig.dynamicAttributes);
                    const dynamicAttLength = (userConfig.dynamicAttributes || []).length || 1;
                    addGroup(dynamicAttLength,userConfig.dynamicAttributes.dynamicAttributes);
                })
            });

            /* update UI dropdowns from schema */
            updateUIDropdownsWithSchema();

            callback();

            /* based on the payload config, repopulate the UI */
            // $.each(inArguments, function (index, inArgument) {
            //     const userConfigs = inArgument.userConfig || [];
            
            //     console.log("userConfig values reload", userConfigs);
            //     $.each(userConfigs, function (index, userConfig) {
            //         console.log({ index, userConfig });
            //         let pos = index + 1;
                    
            //         /* populate the values */
            //         console.log("userConfig.dynamicAttributes", userConfig.dynamicAttributes);
            //         let dynamicAttributes = userConfig.dynamicAttributes.dynamicAttributes || [];
            //         console.log("userConfig.dynamicAttributes.dynamicAttributes", userConfig.dynamicAttributes.dynamicAttributes);
            
            //         configureValuesToHTML(userConfig.dynamicAttributes);
            //         // for (let [i, dynamicAttribute] of dynamicAttributes.entries()) {
            //         //     let pos_dynamic = i + 1;
            //         //     console.log("i", i, "dynamicAttribute", dynamicAttribute, "pos_dynamic", pos_dynamic);
            
            //         //     // Update the IDs to be unique for each dynamic attribute
            //         //     $(`#dynamicAttribute-${pos}-row-${pos_dynamic} .attribute-select`).val(dynamicAttribute.property);
            //         //     $(`#dynamicAttribute-${pos}-row-${pos_dynamic} .operator-select`).val(dynamicAttribute.operator);
            //         //     $(`#dynamicAttribute-${pos}-row-${pos_dynamic} .operand-input`).val(dynamicAttribute.operand);
            //         // }
            
            //         $(`#dateAtt-prop-${pos}`).val(userConfig.dateAttribute.property);
            //         $(`#dateAtt-duration-${pos}`).val(userConfig.dateAttribute.duration);
            //         $(`#dateAtt-unit-${pos}`).val(userConfig.dateAttribute.unit);
            //         $(`#dateAtt-timeline-${pos}`).val(userConfig.dateAttribute.timeline);
            //         $(`#dateAtt-tz-${pos}`).val(userConfig.dateAttribute.timeZone);
            //         $(`#dateAtt-extend-${pos}`).prop('checked', userConfig.dateAttribute.extendWait).change();
            //         $(`#dateAtt-extend-time-${pos}`).val(userConfig.dateAttribute.extendTime);
            
            //         /* to activate tab1 */
            //         $(".dynamic-tabs1").css('display', 'none');
            //         $(".dynamic-tabs1").removeClass('active');
            //         $(".dynamicgroup").removeClass('active');
            //         $("#v-pills-dynamic1-tab").addClass('active');
            //         $("#v-pills-dynamic1").addClass('show active');
            //         $("#v-pills-dynamic1").css('display', 'block');
            //     });
            // });
            
        }

        function setValuesInHTML(callback){
            const hasInArguments = Boolean(
                payload['arguments'] &&
                payload['arguments'].execute &&
                payload['arguments'].execute.inArguments &&
                payload['arguments'].execute.inArguments.length > 0
            );
            const inArguments = hasInArguments ? payload['arguments'].execute.inArguments : [];
            $.each(inArguments, function (index, inArgument) {
                const userConfigs = inArgument.userConfig || [];
            
                //console.log("userConfig values reload", userConfigs);
                $.each(userConfigs, function (index, userConfig) {
                    //console.log({ index, userConfig });
                    let pos = index + 1;
                    
                    /* populate the values */
                    //console.log("userConfig.dynamicAttributes", userConfig.dynamicAttributes);
                    let dynamicAttributes = userConfig.dynamicAttributes.dynamicAttributes || [];
                    //console.log("userConfig.dynamicAttributes.dynamicAttributes", userConfig.dynamicAttributes.dynamicAttributes);
            
                    configureValuesToHTML(userConfig.dynamicAttributes);
                    // for (let [i, dynamicAttribute] of dynamicAttributes.entries()) {
                    //     let pos_dynamic = i + 1;
                    //     console.log("i", i, "dynamicAttribute", dynamicAttribute, "pos_dynamic", pos_dynamic);
            
                    //     // Update the IDs to be unique for each dynamic attribute
                    //     $(`#dynamicAttribute-${pos}-row-${pos_dynamic} .attribute-select`).val(dynamicAttribute.property);
                    //     $(`#dynamicAttribute-${pos}-row-${pos_dynamic} .operator-select`).val(dynamicAttribute.operator);
                    //     $(`#dynamicAttribute-${pos}-row-${pos_dynamic} .operand-input`).val(dynamicAttribute.operand);
                    // }
            
                    $(`#dateAtt-prop-${pos}`).val(userConfig.dateAttribute.property);
                    $(`#dateAtt-duration-${pos}`).val(userConfig.dateAttribute.duration);
                    $(`#dateAtt-unit-${pos}`).val(userConfig.dateAttribute.unit);
                    $(`#dateAtt-timeline-${pos}`).val(userConfig.dateAttribute.timeline);
                    $(`#dateAtt-tz-${pos}`).val(userConfig.dateAttribute.timeZone);
                    $(`#dateAtt-extend-${pos}`).prop('checked', userConfig.dateAttribute.extendWait).change();
                    $(`#dateAtt-extend-time-${pos}`).val(userConfig.dateAttribute.extendTime);
            
                    /* to activate tab1 */
                    $(".dynamic-tabs1").css('display', 'none');
                    $(".dynamic-tabs1").removeClass('active');
                    $(".dynamicgroup").removeClass('active');
                    $("#v-pills-dynamic1-tab").addClass('active');
                    $("#v-pills-dynamic1").addClass('show active');
                    $("#v-pills-dynamic1").css('display', 'block');
                });
            });
            $('.attribute-select').each(function(index, element) {
                // Check if the value is of type "Date"
                console.log("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa", element);
                let schemas = schemadata.schema;
                for (let i = 0; i < schemas.length; i++) {
                    console.log("schemas[i].type !== 'Date'", schemas[i].type === 'Date', $(element).val());
                if ($(element).val() === schemas[i].name && schemas[i].type === 'Date') {
                    // Modify the options of the select element
                    var correspondingSecondDropDown = $(this).closest('.dynamic-attribute-row').find('.operator-select')
                    $(correspondingSecondDropDown).html('       <option value="eq">equals</option>' +    
                    '       <option value="gt">is after</option>' +
                    '       <option value="ge">is on or after </option>' +
                    '       <option value="lt">is before</option>' +
                    '       <option value="le">is on or before </option>' );
                    
                    // Optionally, you can log a message indicating the modification
                    console.log(`Options modified for select element at index ${index}`);
                }
            }
            });
            //callback();
        }

        function configureValuesToHTML(data, nameValue= ''){
            let dynamicValues = data.dynamicAttributes;
            let schemas = schemadata.schema;
            console.log("configureValuesToHTML: ", JSON.stringify(dynamicValues));
            for (let i=0;i< dynamicValues.length;i++) {
                        
                    if(dynamicValues[i].logicalOp){
                        configureValuesToHTML(dynamicValues[i],i+nameValue);
                    } else{
                        for (let j = 0; j < schemas.length; j++) {
                            if (dynamicValues[i].property === schemas[j].name && schemas[j].type === 'Date') {
                                console.log("schema values", schemas[i])
                                $(`#dynamicAtt-operand-${nameValue}${i}`).prop('type', 'date');
                            }else if(dynamicValues[i].property === schemas[i].name && schemas[i].type !== 'Date'){
                                $(`#dynamicAtt-operand-${nameValue}${i}`).prop('type', 'text');
                    } 
                        $(`#dynamicAtt-prop-${nameValue}${i}`).val(dynamicValues[i].property);
                        $(`#dynamicAtt-op-${nameValue}${i}`).val(dynamicValues[i].operator);
                        $(`#dynamicAtt-operand-${nameValue}${i}`).val(dynamicValues[i].operand);
                    }

        }
    }
    }

    function userConfigArgsFunction(values) {
        console.log("222222222222222222");
        const inArgsUc = [];
        const stack = [...values]; // Use a stack to simulate recursion
    
        while (stack.length > 0) {
            const current = stack.pop();
            inArgsUc.push(current.property);
    
            if (current.logicalOp) {
                stack.push(...current.dynamicAttributes.reverse());
            }
        }

        console.log("33333333333333", inArgsUc);
        return inArgsUc;
    }
    
    function getInArgFromConfig(userConfigs) {
        const inArgs = [];
        const inArgsObj = {};

        for(let i=0;i<userConfigs.length;i++ ){
            const uc = userConfigs[i];
            console.log("1111111111111111");
            const userConfigArgsValue =  userConfigArgsFunction(uc.dynamicAttributes.dynamicAttributes);
            console.log("44444444444444444", userConfigArgsValue);
            const userConfigArgsValueFiltered= userConfigArgsValue.filter(value => value );
            console.log("userConfigArgsValueFiltered", userConfigArgsValueFiltered);
            inArgs.push(...userConfigArgsValueFiltered);
            console.log("555555555555555555", inArgs);
            inArgs.push(uc.dateAttribute.property);

            
        }
        
        inArgs.forEach(ia => {
            inArgsObj[ia] = `{{Event.${eventDefinitionKey}.${ia}}}`;
        });
        console.log("inArgs final", inArgs);
        console.log("inArgsObj", inArgsObj);
        return inArgsObj;
    }
    

        function save() {
            const userConfig = parseUserConfig();
            console.log("userConfig save function", JSON.stringify(userConfig));
            const activityInfo = {
                journeyName,
                eventDefinitionKey,
                dataExtensionId,
                dataExtensionPrimaryKey,
                dataExtensionName,
                waitTimeColumnName,
                activityInstanceId
            };
            
            const inArgs = getInArgFromConfig(userConfig);
            console.log("inArgs here", inArgs);
            console.log("inArgs: save function", JSON.stringify(inArgs));
            payload['arguments'].execute.inArguments = [{
                tokens: authTokens,
                userConfig,
                activityInfo,
                ...inArgs,
            }];
            console.log("metadata payload", payload['metaData']);

            payload['metaData'].isConfigured = true;

            console.log('Save done: ',JSON.stringify( {payload}));
            connection.trigger('updateActivity', payload);
        }

        // update bug with this method drop down one
        function updateUIDropdownsWithSchema() {
            $(".attribute-select").html('');
            $(".attibute-date").html('');
            console.log("updateUIDropdownsWithSchema: schemadata", JSON.stringify(schemadata));
            for (let i = 0; i < schemadata.schema.length; i++) {
                //  getattributes.push(schema.schema[i].name);
                if(!schemadata.schema[i].name)
                    continue;

                $(".attribute-select").append('<option value="' + schemadata.schema[i].name + '">' + schemadata.schema[i].name + '</option>');
                if (schemadata.schema[i].type === 'Date') {
                    $(".attibute-date").append('<option value="' + schemadata.schema[i].name + '">' + schemadata.schema[i].name + '</option>');
                }
            }
        }
        function addUpdateUIDropdownsWithSchema(row) {

            let attributeSelectDropdown = row
            console.log("asasasasas", attributeSelectDropdown);
        
            attributeSelectDropdown.empty();
            attributeDateDropdown.empty();
        
            console.log("updateUIDropdownsWithSchema: schemadata", JSON.stringify(schemadata));
        
            for (let i = 0; i < schemadata.schema.length; i++) {
                if (!schemadata.schema[i].name)
                    continue;
        
                attributeSelectDropdown.append('<option value="' + schemadata.schema[i].name + '">' + schemadata.schema[i].name + '</option>');
                if (schemadata.schema[i].type === 'Date') {
                    attributeDateDropdown.append('<option value="' + schemadata.schema[i].name + '">' + schemadata.schema[i].name + '</option>');
                }
            }
        }

        function onRequestedTriggerEventDefinition(eventDefinitionModel) {
            if (eventDefinitionModel) {
                journeyName = eventDefinitionModel.name;
                eventDefinitionKey = eventDefinitionModel.eventDefinitionKey;
                dataExtensionId = eventDefinitionModel.dataExtensionId;
                dataExtensionName = eventDefinitionModel.dataExtensionName;
                //console.log(">>>Event Definition Key " + eventDefinitionKey);
                /*If you want to see all*/
                // console.log('>>>Request Trigger',
                //     JSON.stringify(eventDefinitionModel));
            }

        }

         // Callback function to handle dropdown change
         function handleDropdownChange(value, textbox, secondDropdown) {
            // Check the selected value and update the textbox type accordingly
            console.log("aaaaaaaaaaaaaa",JSON.stringify(schemadata));
            secondDropdown.empty();
            let schemas = schemadata.schema;
            for (let i = 0; i < schemas.length; i++) {
                console.log("schemas[i].type !== 'Date'", schemas[i].type !== 'Date', value);
            if (value === schemas[i].name && schemas[i].type === 'Date') {
                console.log("schema values", schemas[i])
                textbox.prop('type', 'date');
                secondDropdown.append('       <option value="eq">equals</option>' +    
                '       <option value="gt">is after</option>' +
                '       <option value="ge">is on or after </option>' +
                '       <option value="lt">is before</option>' +
                '       <option value="le">is on or before </option>' );
            }else if(value === schemas[i].name && schemas[i].type !== 'Date'){
                textbox.prop('type', 'text');
                secondDropdown.append(
                    '       <option value="eq">equals</option>' +    
                    '       <option value="ew">ends With</option>' +
                    '       <option value="sw">start with</option>' +
                    '       <option value="eiww">exist in whole word</option>' +
                    '       <option value="co">contains</option>' +
                    '       <option value="dnco">does not contains</option>');
        
            } 
        }
        
            // Set the value of the textbox
            //textbox.val(value);
        }

        $(document).on('click', '#addGroup', function (event) {

            //console.log("Work inside");
            //console.log("Schema data", schemadata);
            updateUIDropdownsWithSchema();
            /*
            $(".attribute-select").html('');
            $(".attibute-date").html('');
            for (var i = 0; i < schemadata.schema.length; i++) {
                $(".attribute-select").append('<option value="' + schemadata.schema[i].name + '">' + schemadata.schema[i].name + '</option>');
                if (schemadata.schema[i].type == 'Date') {
                    $(".attibute-date").append('<option value="' + schemadata.schema[i].name + '">' + schemadata.schema[i].name + '</option>');
                }
            }*/
        });

        $(document).on('click', 'button.add-da', function (event) {
            let currentTab = $(this).attr('data-group-pos');
            console.log("currentTab", currentTab);
        
            const dynamicAttribute = getDynamicAttributeHTML(currentTab);
            let currentActionDiv = $(this).parents().eq(1);
        
            $(dynamicAttribute).insertAfter(currentActionDiv);
            let currentGroup = $(this).parents().eq(2);
            configureRemoveDArow(currentTab, { currentGroup: currentGroup[0], currentGroupParent: currentGroup.parent()[0] });
        
            console.log("qqqqqqqqqqqqqqqqqqqqq", currentActionDiv, "aaaaaaaaaa", dynamicAttribute);
        
            const attributeSelectDropdownArr = $('.attribute-select');
            const attributeSelectDropdown = attributeSelectDropdownArr.last(); // Use .last() instead of [length - 1]
            attributeSelectDropdown.empty();
            console.log("attributeSelectDropdown", attributeSelectDropdown, "schemadata", schemadata);
        
            for (let i = 0; i < schemadata.schema.length; i++) {
                if (!schemadata.schema[i].name)
                    continue;
        
                console.log("qqqqqq");
                attributeSelectDropdown.append('<option value="' + schemadata.schema[i].name + '">' + schemadata.schema[i].name + '</option>');
            }
        
            console.log("attributeSelectDropdown final", attributeSelectDropdown);
        });
        

        $(document).on('click', 'button.add-layer-da',  function (event) {

            //console.log("Work inside");
            //console.log("Schema data", schemadata);
            updateUIDropdownsWithSchema();
            /*
            $(".attribute-select").html('');
            $(".attibute-date").html('');
            for (var i = 0; i < schemadata.schema.length; i++) {
                $(".attribute-select").append('<option value="' + schemadata.schema[i].name + '">' + schemadata.schema[i].name + '</option>');
                if (schemadata.schema[i].type == 'Date') {
                    $(".attibute-date").append('<option value="' + schemadata.schema[i].name + '">' + schemadata.schema[i].name + '</option>');
                }
            }*/
        });

        $('#btn-preview').click(function () {
            $('#postcard-preview-text').html($('#postcard-text').val());
            $('.postcard-preview-content').css('background-image', "url('" + $('#postcard-url').val() + "')");
        });

        $('select.timeline-select').on('change', function (e) {
            const optionSelected = $("option:selected", this);
            const value = optionSelected.val();

            /* for on timeline, disable duration and unit inputs */
            const selectId = this.id;
            const currentTabId = selectId.split('dateAtt-timeline-')[1];
            const dateDurationId = `dateAtt-duration-${currentTabId}`;
            const dateUnitId = `dateAtt-unit-${currentTabId}`;
            if (value === 'On') {
                $(`#${dateDurationId}`).prop('disabled', true);
                $(`#${dateUnitId}`).prop('disabled', true);
            } else {
                $(`#${dateDurationId}`).prop('disabled', false);
                $(`#${dateUnitId}`).prop('disabled', false);
            }
            //console.log({optionSelected});
        });

        $('.tab-content').on('change', 'select.attribute-select', function (e) {
            console.log("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa");
            // Get the selected value from the dropdown
            const optionSelected = $("option:selected", this);
            var selectedValue = optionSelected.val();
            console.log("print selected value", selectedValue);
        
            // Find the corresponding textbox within the same row
            var correspondingTextbox = $(this).closest('.dynamic-attribute-row').find('.operand-input');
            var correspondingSecondDropDown = $(this).closest('.dynamic-attribute-row').find('.operator-select');
        
            // Call the callback function with the selected value and corresponding textbox
            handleDropdownChange(selectedValue, correspondingTextbox, correspondingSecondDropDown);
        });

        $('input.duration-input').on('change', function (e) {
            const value = this.value;
            const numVal = Number(value) || 1;
            if (numVal > 999) {
                this.value = 999;
            }
            //console.log({value});
        });

        
        function preLocalSetup() {
            local = {};
            local.schema = {
                "schema": [{
                    "key": "Event.DEAudience-a0c615e0-764a-73a0-bdd4-e697a16ff4c1.EmailAddress",
                    "name": "EmailAddress",
                    "type": "EmailAddress",
                    "length": 254,
                    "default": null,
                    "isNullable": true,
                    "isPrimaryKey": null
                }, {
                    "key": "Event.DEAudience-a0c615e0-764a-73a0-bdd4-e697a16ff4c1.FirstName",
                    "name": "FirstName",
                    "type": "Text",
                    "length": 50,
                    "default": null,
                    "isNullable": true,
                    "isPrimaryKey": null
                }, {
                    "key": "Event.DEAudience-a0c615e0-764a-73a0-bdd4-e697a16ff4c1.LastName",
                    "name": "LastName",
                    "type": "Text",
                    "length": 50,
                    "default": null,
                    "isNullable": true,
                    "isPrimaryKey": null
                }, {
                    "key": "Event.DEAudience-a0c615e0-764a-73a0-bdd4-e697a16ff4c1.PurchaseDate",
                    "name": "PurchaseDate",
                    "type": "Date",
                    "length": null,
                    "default": null,
                    "isNullable": true,
                    "isPrimaryKey": null
                }, {
                    "key": "Event.DEAudience-a0c615e0-764a-73a0-bdd4-e697a16ff4c1.LoginDate",
                    "name": "LoginDate",
                    "type": "Date",
                    "length": null,
                    "default": null,
                    "isNullable": true,
                    "isPrimaryKey": null
                }, {
                    "key": "Event.DEAudience-a0c615e0-764a-73a0-bdd4-e697a16ff4c1.LogoutDate",
                    "name": "LogoutDate",
                    "type": "Date",
                    "length": null,
                    "default": null,
                    "isNullable": true,
                    "isPrimaryKey": null
                }]
            };

            /* this is for local test */
            $(document).on('click', '#done', function (event) {
                save();
                parseUserConfig();
            });


        }

        function postLocalSetup() {
            initialize({
                    arguments: {
                        execute: {
                            inArguments: [
                                {
                                    userConfig: [],
                                    empty: [{
                                        "dynamicAttributes": [{
                                            "property": "FirstName",
                                            "operator": "lt",
                                            "operand": "Mocking"
                                        }, {
                                            "property": "LastName",
                                            "operator": "gt",
                                            "operand": "Henry"
                                        }, {
                                            "property": "LastName",
                                            "operator": "gt",
                                            "operand": "Henry"
                                        }],
                                        "dateAttribute": {
                                            "property": "LoginDate",
                                            "duration": "2",
                                            "unit": "weeks",
                                            "timeline": "On",
                                            "timeZone": "Indian/Maldives",
                                            "extendWait": true,
                                            "extendTime": "03:30 AM"
                                        }
                                    },
                                        {
                                            "dynamicAttributes": [{
                                                "property": "FirstName",
                                                "operator": "le",
                                                "operand": "Johny"
                                            }],
                                            "dateAttribute": {
                                                "property": "LogoutDate",
                                                "duration": "4",
                                                "unit": "months",
                                                "timeline": "After",
                                                "timeZone": "Asia/Calcutta",
                                                "extendWait": false,
                                                "extendTime": ""
                                            }
                                        },
                                        {
                                            "dynamicAttributes": [{
                                                "property": "FirstName",
                                                "operator": "eq",
                                                "operand": "Pro"
                                            }],
                                            "dateAttribute": {
                                                "property": "LogoutDate",
                                                "duration": "4",
                                                "unit": "months",
                                                "timeline": "Before",
                                                "timeZone": "Australia/Melbourne",
                                                "extendWait": true,
                                                "extendTime": "04:45 PM"
                                            }
                                        }
                                    ]
                                }
                            ]
                        }
                    }
                }
            );
        }
    }
)
;