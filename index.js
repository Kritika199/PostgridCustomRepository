define(["postmonger"], function (Postmonger) {
    "use strict";

    var connection = new Postmonger.Session();
    var payload = {};
    var eventDefinitionKey = '';
    var deFields = [];

    var steps = [
        {
            id: 'step1',
            title: 'Connect your PostGrid account',
            fields: [
                {
                    id: 'test-api-key',
                    type: 'text',
                    label: 'Test API Key',
                    placeholder: 'Enter your test API key',
                    required: true
                },
                {
                    id: 'live-api-key',
                    type: 'text',
                    label: 'Live API Key',
                    placeholder: 'Enter your live API key',
                    required: true
                }
            ]
        },
        {
            id: 'step2',
            title: 'Choose message settings',
            fields: [
                {
                    id: 'test-mode',
                    type: 'checkbox',
                    label: 'Test Mode',
                    default: false
                },
                {
                    id: 'message-type',
                    type: 'radio',
                    label: 'Message Type',
                    options: [
                        { value: 'letters', label: 'Letters', checked: true },
                        { value: 'postcards', label: 'Postcards', checked: false }
                    ]
                },
                {
                    id: 'creation-type',
                    type: 'radio',
                    label: 'Creation Type',
                    options: [
                        { value: 'html', label: 'HTML', checked: true },
                        { value: 'pdf-upload', label: 'PDF Upload', checked: false },
                        { value: 'existing-template', label: 'Existing Template', checked: false },
                        { value: 'new-template', label: 'New Template', checked: false }
                    ]
                }
            ]
        }
    ];

    var currentStep = steps[0].id; // Initialize currentStep with the first step ID

    $(window).ready(function () {
        connection.trigger('ready');
        connection.trigger('requestInteraction');
    });

    connection.on('initActivity', initialize);
    connection.on('clickedNext', onClickedNext);
    connection.on('clickedBack', onClickedBack);
    connection.on('gotoStep', onGotoStep);
    connection.on('requestedInteraction', requestedInteractionHandler);

    function initialize(data) {
        if (data) {
            payload = data;
        }
    }

    function onClickedNext() {
        if (currentStep === 'step1') {
            saveStep1(); // Save data from step 1
            connection.trigger('nextStep'); // Move to step 2
        } else if (currentStep === 'step2') {
            saveStep2(); // Save data from step 2
            // Additional logic for proceeding to next step or completing activity
            // Example:
            // connection.trigger('nextStep');
        }
    }

    function onClickedBack() {
        connection.trigger('prevStep');
    }

    function onGotoStep(step) {
        showStep(step);
        connection.trigger('ready');
    }

    function showStep(stepId) {
        currentStep = stepId;

        $('.step').hide();
        $('#' + currentStep).show();
    }

    function requestedInteractionHandler(settings) {
        try {
            eventDefinitionKey = settings.triggers[0].metaData.eventDefinitionKey;
            $('#select-entryevent-defkey').val(eventDefinitionKey);

            if (settings.triggers[0].type === 'SalesforceObjectTriggerV2' &&
                settings.triggers[0].configurationArguments &&
                settings.triggers[0].configurationArguments.eventDataConfig) {

                if (typeof settings.triggers[0].configurationArguments.eventDataConfig === 'string' ||
                    !settings.triggers[0].configurationArguments.eventDataConfig.objects) {
                    settings.triggers[0].configurationArguments.eventDataConfig = JSON.parse(settings.triggers[0].configurationArguments.eventDataConfig);
                }

                settings.triggers[0].configurationArguments.eventDataConfig.objects.forEach(function (obj) {
                    deFields = deFields.concat(obj.fields.map(function (fieldName) {
                        return obj.dePrefix + fieldName;
                    }));
                });

                deFields.forEach(function (option) {
                    $('#select-id-dropdown').append($('<option>', {
                        value: option,
                        text: option
                    }));
                });

                $('#select-id').hide();
                $('#select-id-dropdown').show();
            } else {
                $('#select-id-dropdown').hide();
                $('#select-id').show();
            }
        } catch (e) {
            console.error(e);
            $('#select-id-dropdown').hide();
            $('#select-id').show();
        }
    }

    function saveStep1() {
        payload['arguments'] = payload['arguments'] || {};
        payload['arguments'].execute = payload['arguments'].execute || {};

        payload['arguments'].execute.inArguments = [{
            'testApiKey': $('#test-api-key').val(),
            'liveApiKey': $('#live-api-key').val()
        }];

        payload['metaData'] = payload['metaData'] || {};
        payload['metaData'].isConfigured = true;

        console.log(JSON.stringify(payload));

        connection.trigger('updateActivity', payload);
    }

    function saveStep2() {
        payload['arguments'] = payload['arguments'] || {};
        payload['arguments'].execute = payload['arguments'].execute || {};

        payload['arguments'].execute.inArguments = [{
            'testMode': $('#test-mode').is(':checked'),
            'messageType': $('input[name=message-type]:checked').val(),
            'creationType': $('input[name=creation-type]:checked').val()
        }];

        payload['metaData'] = payload['metaData'] || {};
        payload['metaData'].isConfigured = true;

        console.log(JSON.stringify(payload));

        connection.trigger('updateActivity', payload);
    }

    // Functions to show and hide forms (if applicable)
    // These can be used if you have specific HTML elements for forms
    window.showSecondForm = function () {
        showStep('step2'); // Example if you want to directly show step 2
    };

    window.showFirstForm = function () {
        showStep('step1'); // Example if you want to directly show step 1
    };
});
