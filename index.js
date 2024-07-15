define(["postmonger"], function (Postmonger) {
  "use strict";

  var connection = new Postmonger.Session();
    var payload = {};
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
        if (currentStep === 'idselection') {
            save();
        } else {
            connection.trigger('nextStep');
        }
    }

    function onClickedBack() {
        connection.trigger('prevStep');
    }

    function onGotoStep(step) {
        showStep(step);
        connection.trigger('ready');
    }

    function showStep(step) {
        currentStep = step;

        $('.step').hide();

        switch (currentStep.key) {
            case 'eventdefinitionkey':
                $('#step1').show();
                $('#step1 input').focus();
                break;
            case 'idselection':
                $('#step2').show();
                $('#step2 input').focus();
                break;
        }
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

    function save() {
        payload['arguments'] = payload['arguments'] || {};
        payload['arguments'].execute = payload['arguments'].execute || {};

        var idField = deFields.length > 0 ? $('#select-id-dropdown').val() : $('#select-id').val();

        payload['arguments'].execute.inArguments = [{
            'serviceCloudId': '{{Event.' + eventDefinitionKey + '.\"' + idField + '\"}}'
        }];

        payload['metaData'] = payload['metaData'] || {};
        payload['metaData'].isConfigured = true;

        console.log(JSON.stringify(payload));

        connection.trigger('updateActivity', payload);
    }

    // Functions to show and hide forms
    window.showSecondForm = function () {
        document.getElementById('firstForm').style.display = 'none';
        document.getElementById('secondForm').style.display = 'block';
    };

    window.showFirstForm = function () {
        document.getElementById('firstForm').style.display = 'block';
        document.getElementById('secondForm').style.display = 'none';
    };

    window.showThirdForm = function () {
        document.getElementById('secondForm').style.display = 'none';
        document.getElementById('thirdForm').style.display = 'block';
    };
});
