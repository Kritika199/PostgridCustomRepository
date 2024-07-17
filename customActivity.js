define(["postmonger"], function(Postmonger) {
    "use strict";

    var connection = new Postmonger.Session();
    var payload = {};
    var steps = [
        { label: "Connect your PostGrid account", key: "firstForm" },
        { label: "Message Type", key: "secondForm" },
        { label: "HTML", key: "thirdForm" }
    ];
    var currentStep = steps[0].key;

    connection.on("initActivity", initialize);
    connection.on("requestedTokens", onGetTokens);
    connection.on("requestedEndpoints", onGetEndpoints);
    connection.on("clickedNext", onClickedNext);
    connection.on("clickedBack", onClickedBack);
    connection.on("gotoStep", onGotoStep);

    $(onRender);

    function onRender() {
        connection.trigger("ready");
        connection.trigger("requestTokens");
        connection.trigger("requestEndpoints");
    }

    function initialize(data) {
        if (data) {
            payload = data;
        }

        var hasInArguments = Boolean(
            payload.arguments &&
            payload.arguments.execute &&
            payload.arguments.execute.inArguments &&
            payload.arguments.execute.inArguments.length > 0
        );

        var inArguments = hasInArguments ? payload.arguments.execute.inArguments : {};

        $.each(inArguments, function(index, inArgument) {
            $.each(inArgument, function(key, val) {
                if (key === "message") {
                    // Handle initialization if needed
                }
            });
        });

        showStep(null, 1);
    }

    function onGetTokens(tokens) {
        // console.log(tokens);
    }

    function onGetEndpoints(endpoints) {
        // console.log(endpoints);
    }

    function onClickedNext() {
        if (currentStep === "thirdForm") {
            save();
        } else {
            connection.trigger("nextStep");
        }
    }

    function onClickedBack() {
        connection.trigger("prevStep");
    }

    function onGotoStep(step) {
        showStep(step);
        connection.trigger("ready");
    }

    function showStep(step, stepIndex) {
        if (stepIndex && !step) {
            step = steps[stepIndex - 1];
        }

        currentStep = step.key;

        $(".modal").hide();
        $("#" + currentStep).show();

        switch (currentStep) {
            case "firstForm":
                connection.trigger("updateButton", { button: "next", enabled: true });
                connection.trigger("updateButton", { button: "back", visible: false });
                break;
            case "secondForm":
                connection.trigger("updateButton", { button: "back", visible: true });
                connection.trigger("updateButton", { button: "next", text: "Next", visible: true });
                break;
            case "thirdForm":
                connection.trigger("updateButton", {
                    button: "back",
                    visible: true
                });
                connection.trigger("updateButton", {
                    button: "next",
                    text: "Done",
                    visible: true
                });
                break;
        }
    }

    function save() {
        payload.arguments.execute.inArguments = [
            { message: "This is the payload message" }
        ];

        payload.metaData.isConfigured = true;

        connection.trigger("updateActivity", payload);
    }
});
