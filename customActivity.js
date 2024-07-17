define(["postmonger"], function(Postmonger) {
  "use strict";

  var connection = new Postmonger.Session();
  var payload = {};
  var lastStepEnabled = false;
  var steps = [
    { label: "Connect your PostGrid account", key: "firstForm" },
    { label: "Message Type", key: "secondForm" },
    { label: "HTML", key: "thirdForm" },
    { label: "Step 4", key: "step4", active: false }
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

    $("#select1").change(function() {
      var message = getMessage();
      connection.trigger("updateButton", {
        button: "next",
        enabled: Boolean(message)
      });
      $("#message").html(message);
    });

    $("#toggleLastStep").click(function() {
      lastStepEnabled = !lastStepEnabled;
      steps[3].active = !steps[3].active;
      connection.trigger("updateSteps", steps);
    });
  }

  function initialize(data) {
    if (data) {
      payload = data;
    }

    var message;
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
          message = val;
        }
      });
    });

    if (!message) {
      showStep(null, 1);
      connection.trigger("updateButton", { button: "next", enabled: false });
    } else {
      $("#select1").find("option[value='" + message + "']").attr("selected", "selected");
      $("#message").html(message);
      showStep(null, 3);
    }
  }

  function onGetTokens(tokens) {
    // Handle tokens if needed
  }

  function onGetEndpoints(endpoints) {
    // Handle endpoints if needed
  }

  function onClickedNext() {
    if ((currentStep === "thirdForm" && !lastStepEnabled) || currentStep === "step4") {
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

    switch (currentStep) {
      case "firstForm":
        $("#firstForm").show();
        connection.trigger("updateButton", { button: "next", enabled: Boolean(getMessage()) });
        connection.trigger("updateButton", { button: "back", visible: false });
        break;
      case "secondForm":
        $("#secondForm").show();
        connection.trigger("updateButton", { button: "back", visible: true });
        connection.trigger("updateButton", { button: "next", text: "Next", visible: true });
        break;
      case "thirdForm":
        $("#thirdForm").show();
        connection.trigger("updateButton", {
          button: "back",
          visible: true
        });
        if (lastStepEnabled) {
          connection.trigger("updateButton", {
            button: "next",
            text: "Next",
            visible: true
          });
        } else {
          connection.trigger("updateButton", {
            button: "next",
            text: "Done",
            visible: true
          });
        }
        break;
      case "step4":
        $("#step4").show();
        break;
    }
  }

  function save() {
    var name = $("#select1").find("option:selected").html();
    var value = getMessage();

    payload.name = name;

    payload.arguments.execute.inArguments = [{ message: value }];

    payload.metaData.isConfigured = true;

    connection.trigger("updateActivity", payload);
  }

  function getMessage() {
    return $("#select1").find("option:selected").attr("value").trim();
  }
});
