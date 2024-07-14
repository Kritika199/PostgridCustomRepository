

// Functions to show and hide forms
function showSecondForm() {
    document.getElementById('firstForm').style.display = 'none';
    document.getElementById('secondForm').style.display = 'block';
}

function showFirstForm() {
    document.getElementById('firstForm').style.display = 'block';
    document.getElementById('secondForm').style.display = 'none';
}

function showThirdForm() {
    document.getElementById('secondForm').style.display = 'none';
    document.getElementById('thirdForm').style.display = 'block';
}
