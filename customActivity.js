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

        showStep(null, 1); // Show the first form step initially
    }

    function onGetTokens(tokens) {
        // Handle received tokens if needed
    }

    function onGetEndpoints(endpoints) {
        // Handle received endpoints if needed
    }

    function onClickedNext() {
        if (currentStep === "thirdForm") {
            save(); // Save data when on the last form step
        } else {
            connection.trigger("nextStep"); // Move to the next step
        }
    }

    function onClickedBack() {
        connection.trigger("prevStep"); // Move to the previous step
    }

    function onGotoStep(step) {
        showStep(step); // Show the specified step
        connection.trigger("ready");
    }

    function showStep(step, stepIndex) {
        if (stepIndex && !step) {
            step = steps[stepIndex - 1];
        }

        currentStep = step.key;

        $(".modal").hide(); // Hide all modals
        $("#" + currentStep).show(); // Show the current step's modal

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
                connection.trigger("updateButton", { button: "back", visible: true });
                connection.trigger("updateButton", { button: "next", text: "Done", visible: true });
                break;
        }
    }

    function save() {
        // Prepare data to save
        payload.arguments.execute.inArguments = [
            { message: "This is the payload message" }
        ];

        payload.metaData.isConfigured = true;

        connection.trigger("updateActivity", payload); // Update activity with saved data
    }
});
