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
            console.log('Payload:', payload);
            initializeForm();
        }
    }

    function initializeForm() {
        // Populate the form with existing values from payload if needed
        var inArguments = payload['arguments'] && payload['arguments'].execute && payload['arguments'].execute.inArguments;
        if (inArguments && inArguments.length > 0) {
            var args = inArguments[0];
            $('#firstForm input[name=test-api-key]').val(args.testApiKey);
            $('#firstForm input[name=live-api-key]').val(args.liveApiKey);
            $('#firstForm input[name=test-mode]').prop('checked', args.testMode);
            $('#secondForm input[name=message-type][value=' + args.messageType + ']').prop('checked', true);
            $('#secondForm input[name=creation-type][value=' + args.creationType + ']').prop('checked', true);
            $('#secondForm textarea[name=description]').val(args.description);
            $('#thirdForm input[name=send-date]').val(args.sendDate);
            $('#thirdForm input[name=extra-service]').val(args.extraService);
            $('#thirdForm input[name=mailing-class]').val(args.mailingClass);
            $('#thirdForm input[name=return-envelope]').val(args.returnEnvelope);
            $('#thirdForm input[name=envelope-type]').val(args.envelopeType);
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
        showForm(step); // Use showForm function to display the correct form
        connection.trigger('ready');
    }

    function showForm(formId) {
        const formIds = [
            "firstForm", "secondForm", "thirdForm"
        ];

        formIds.forEach(id => {
            document.getElementById(id).style.display = id === formId ? "block" : "none";
        });
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
        var testApiKey = $('#firstForm input[name=test-api-key]').val();
        var liveApiKey = $('#firstForm input[name=live-api-key]').val();
        var testMode = $('#firstForm input[name=test-mode]').is(':checked');
        var messageType = $('#secondForm input[name=message-type]:checked').val();
        var creationType = $('#secondForm input[name=creation-type]:checked').val();
        var description = $('#secondForm textarea[name=description]').val();
        var sendDate = $('#thirdForm input[name=send-date]').val();
        var extraService = $('#thirdForm input[name=extra-service]').val();
        var mailingClass = $('#thirdForm input[name=mailing-class]').val();
        var returnEnvelope = $('#thirdForm input[name=return-envelope]').val();
        var envelopeType = $('#thirdForm input[name=envelope-type]').val();

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

        console.log('Saving payload:', payload);

        connection.trigger('updateActivity', payload);
    }
});
