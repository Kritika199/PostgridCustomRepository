define(["postmonger"], function(Postmonger) {
    "use strict";

    var connection = new Postmonger.Session();
    var payload = {};
    var eventDefinitionKey = '';
    var deFields = {};

    $(window).ready(function() {
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
        save();
        connection.trigger('nextStep');
    }

    function onClickedBack() {
        connection.trigger('prevStep');
    }

    function onGotoStep(step) {
        showStep(step);
        connection.trigger('ready');
    }

    function showStep(stepId) {
        $('.modal').hide();
        $('#' + stepId).show();
    }

    function requestedInteractionHandler(settings) {
        try {
            eventDefinitionKey = settings.triggers[0].metaData.eventDefinitionKey;

            if (settings.triggers[0].type === 'SalesforceObjectTriggerV2' &&
                settings.triggers[0].configurationArguments &&
                settings.triggers[0].configurationArguments.eventDataConfig) {

                var eventDataConfig = settings.triggers[0].configurationArguments.eventDataConfig;

                if (typeof eventDataConfig === 'string') {
                    eventDataConfig = JSON.parse(eventDataConfig);
                }

                if (eventDataConfig.objects) {
                    eventDataConfig.objects.forEach(function(obj) {
                        obj.fields.forEach(function(field) {
                            deFields[obj.dePrefix + field] = true;
                        });
                    });
                }
            }
        } catch (e) {
            console.error(e);
        }
    }

    function save() {
        var inArguments = [];

        // Retrieve values from your form fields
        var testApiKey = $('#test-api-key').val();
        var liveApiKey = $('#live-api-key').val();
        var testMode = $('#test-mode').is(':checked');
        var messageType = $('input[name=message-type]:checked').val();
        var creationType = $('input[name=creation-type]:checked').val();
        var description = $('#description').val();
        var sendDate = $('#send-date').val();
        var extraService = $('#extra-service').val();
        var mailingClass = $('#mailing-class').val();
        var returnEnvelope = $('#return-envelope').val();
        var envelopeType = $('#envelope-type').val();

        // Example of how to structure inArguments
        inArguments.push({
            'testApiKey': testApiKey,
            'liveApiKey': liveApiKey,
            'testMode': testMode,
            'messageType': messageType,
            'creationType': creationType,
            'description': description,
            'sendDate': sendDate,
            'extraService': extraService,
            'mailingClass': mailingClass,
            'returnEnvelope': returnEnvelope,
            'envelopeType': envelopeType
            // Add other fields as needed
        });

        payload['arguments'] = payload['arguments'] || {};
        payload['arguments'].execute = payload['arguments'].execute || {};
        payload['arguments'].execute.inArguments = inArguments;

        payload['metaData'] = payload['metaData'] || {};
        payload['metaData'].isConfigured = true;

        console.log(JSON.stringify(payload));

        connection.trigger('updateActivity', payload);
    }
});
