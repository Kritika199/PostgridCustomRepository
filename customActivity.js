function showForm(formId) {
    const formIds = [
        "firstForm", "secondForm", "thirdForm"
    ];

    formIds.forEach(id => {
        document.getElementById(id).style.display = id === formId ? "block" : "none";
    });
}

function showFirstForm() {
    showForm("firstForm");
}

function showSecondForm() {
    showForm("secondForm");
}

function showThirdForm() {
    showForm("thirdForm");
}
